import FinderPattern from '../format/FinderPattern';
import {distance, crossProductZ} from "../../common/Utils";
import NotFoundError from "../../error/NotFoundError";

const MIN_SKIP = 3;
const MAX_MODULES = 57;
const CENTER_QUORUM = 2;

export class FinderPatternFinderResult {
    private _topLeft: FinderPattern;
    private _topRight: FinderPattern;
    private _bottomLeft: FinderPattern;

    constructor(topLeft: FinderPattern, topRight: FinderPattern, bottomLeft: FinderPattern) {
        this._topLeft = topLeft;
        this._topRight = topRight;
        this._bottomLeft = bottomLeft;
    }

    get topLeft(): FinderPattern {
        return this._topLeft;
    }

    get topRight(): FinderPattern {
        return this._topRight;
    }

    get bottomLeft(): FinderPattern {
        return this._bottomLeft;
    }
}

/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/detector/FinderPatternFinder.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class FinderPatternFinder {
    private _bits: number[];
    private _width: number;
    private _height: number;
    private _possibleCenters: FinderPattern[] = [];
    private _hasSkipped: boolean = false;

    constructor(bits: number[], width: number, height: number) {
        this._bits = bits;
        this._width = width;
        this._height = height;
    }

    public find(): FinderPatternFinderResult {
        const imageHeigth = this._height;
        const imageWidth = this._width;

        let iSkip: number = Math.floor(imageHeigth * 0.25 * (1 / MAX_MODULES) * 3);

        if (iSkip < MIN_SKIP) {
            iSkip = MIN_SKIP;
        }

        let done: boolean = false;
        let stateCount: number[] = [];

        for (let i = iSkip - 1; i < imageHeigth && !done; i += iSkip) {
            // Get a row of black/white values
            stateCount[0] = 0;  // beforeBlackArea
            stateCount[1] = 0;  // beforeWhiteArea
            stateCount[2] = 0;  // centerBlackArea
            stateCount[3] = 0;  // afterWhiteArea
            stateCount[4] = 0;  // afterBlackArea
            let currentState = 0;
            for (let horizontalIndex = 0; horizontalIndex < imageWidth; horizontalIndex++) {
                if (this._bits[horizontalIndex + i * this._width]) {
                    // Black pixel

                    // is white area?
                    if ((currentState & 1) == 1) { // Counting white pixels
                        currentState++;
                    }
                    stateCount[currentState]++;
                } else {
                    // White pixel

                    // is black area?
                    if ((currentState & 1) == 0) { // Counting black pixels

                        // is after black area?
                        if (currentState == 4) {
                            // A winner?
                            if (FinderPatternFinder.foundPatternCross(stateCount)) {
                                // Yes
                                if (this.handlePossibleCenter(stateCount, i, horizontalIndex)) {
                                    // Start examining every other line. Checking each line turned out to be too
                                    // expensive and didn't improve performance.
                                    iSkip = 2;
                                    if (this._hasSkipped) {
                                        done = this.haveMultiplyConfirmedCenters();
                                    } else {
                                        const rowSkip = this.findRowSkip();
                                        if (rowSkip > stateCount[2]) {
                                            // Skip rows between row of lower confirmed center
                                            // and top of presumed third confirmed center
                                            // but back up a bit to get a full chance of detecting
                                            // it, entire width of center of finder pattern

                                            // Skip by rowSkip, but back off by stateCount[2] (size of last center
                                            // of pattern we saw) to be conservative, and also back off by iSkip which
                                            // is about to be re-added
                                            i += rowSkip - stateCount[2] - iSkip;
                                            horizontalIndex = imageWidth - 1;
                                        }
                                    }
                                } else {
                                    stateCount[0] = stateCount[2];
                                    stateCount[1] = stateCount[3];
                                    stateCount[2] = stateCount[4];
                                    stateCount[3] = 1;
                                    stateCount[4] = 0;
                                    currentState = 3;
                                    continue;
                                }
                                // Clear state to start looking again
                                currentState = 0;
                                stateCount[0] = 0;
                                stateCount[1] = 0;
                                stateCount[2] = 0;
                                stateCount[3] = 0;
                                stateCount[4] = 0;
                            } else { // No, shift counts back by two
                                stateCount[0] = stateCount[2];
                                stateCount[1] = stateCount[3];
                                stateCount[2] = stateCount[4];
                                stateCount[3] = 1;
                                stateCount[4] = 0;
                                currentState = 3;
                            }
                        } else {
                            stateCount[++currentState]++;
                        }
                    } else { // Counting white pixels
                        stateCount[currentState]++;
                    }
                }
            }
        }

        const patternInfo: FinderPattern[] = this.selectBestPatterns();
        const bestPatterns: FinderPattern[] = FinderPatternFinder.orderBestPatterns(patternInfo);

        return new FinderPatternFinderResult(bestPatterns[1], bestPatterns[2], bestPatterns[0]);
    };

    /**
     * Given a count of black/white/black/white/black pixels just seen and an end position,
     * figures the location of the center of this run.
     */
    private static centerFromEnd(stateCount, end) {
        return (end - stateCount[4] - stateCount[3]) - stateCount[2] / 2.0;
    }

    /**
     * @param stateCount count of black/white/black/white/black pixels just read
     * @return true iff the proportions of the counts is close enough to the 1/1/3/1/1 ratios
     *         used by finder patterns to be considered a match
     */
    private static foundPatternCross(stateCount: number[]) {
        let totalModuleSize: number = 0;
        for (let i = 0; i < 5; i++) {
            let count = stateCount[i];
            if (count == 0) {
                return false;
            }
            totalModuleSize += count;
        }
        if (totalModuleSize < 7) {
            return false;
        }

        const moduleSize: number = totalModuleSize / 7.0;
        const maxVariance: number = moduleSize / 2;

        // Allow less than 50% variance from 1-1-3-1-1 proportions
        return Math.abs(moduleSize - stateCount[0]) < maxVariance
            && Math.abs(moduleSize - stateCount[1]) < maxVariance
            && Math.abs(3 * moduleSize - stateCount[2]) < 3 * maxVariance
            && Math.abs(moduleSize - stateCount[3]) < maxVariance
            && Math.abs(moduleSize - stateCount[4]) < maxVariance;
    }


    /**
     * <p>After a horizontal scan finds a potential finder pattern, this method
     * "cross-checks" by scanning down vertically through the center of the possible
     * finder pattern to see if the same proportion is detected.</p>
     *
     * @param startI row where a finder pattern was detected
     * @param centerJ center of the section that appears to cross a finder pattern
     * @param maxCount maximum reasonable number of modules that should be
     * observed in any reading state, based on the results of the horizontal scan
     * @param originalStateCountTotal
     * @return vertical center of finder pattern, or {@link NaN} if not found
     */
    private crossCheckVertical(startI: number,
                               centerJ: number,
                               maxCount: number,
                               originalStateCountTotal: number): number {

        const image: number[] = this._bits;
        const imageHeigth: number = this._height;
        const stateCount: number[] = [0, 0, 0, 0, 0];

        // Start counting up from center
        let i: number = startI;
        while (i >= 0 && image[centerJ + i * this._width]) {
            stateCount[2]++;
            i--;
        }
        if (i < 0) {
            return NaN;
        }
        while (i >= 0 && !image[centerJ + i * this._width] && stateCount[1] <= maxCount) {
            stateCount[1]++;
            i--;
        }
        // If already too many modules in this state or ran off the edge:
        if (i < 0 || stateCount[1] > maxCount) {
            return NaN;
        }
        while (i >= 0 && image[centerJ + i * this._width] && stateCount[0] <= maxCount) {
            stateCount[0]++;
            i--;
        }
        if (stateCount[0] > maxCount) {
            return NaN;
        }

        // Now also count down from center
        i = startI + 1;
        while (i < imageHeigth && image[centerJ + i * this._width]) {
            stateCount[2]++;
            i++;
        }
        if (i == imageHeigth) {
            return NaN;
        }
        while (i < imageHeigth && !image[centerJ + i * this._width] && stateCount[3] < maxCount) {
            stateCount[3]++;
            i++;
        }
        if (i == imageHeigth || stateCount[3] >= maxCount) {
            return NaN;
        }
        while (i < imageHeigth && image[centerJ + i * this._width] && stateCount[4] < maxCount) {
            stateCount[4]++;
            i++;
        }
        if (stateCount[4] >= maxCount) {
            return NaN;
        }

        // If we found a finder-pattern-like section, but its size is more than 40% different than
        // the original, assume it's a false positive
        const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] +
            stateCount[4];
        if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
            return NaN;
        }

        return FinderPatternFinder.foundPatternCross(stateCount) ? FinderPatternFinder.centerFromEnd(stateCount, i) : NaN;
    }

    /**
     * <p>Like {@link #crossCheckVertical(int, int, int, int)}, and in fact is basically identical,
     * except it reads horizontally instead of vertically. This is used to cross-cross
     * check a vertical cross check and locate the real center of the alignment pattern.</p>
     */
    private crossCheckHorizontal(startJ: number,
                                 centerI: number,
                                 maxCount: number,
                                 originalStateCountTotal: number): number {

        const image: number[] = this._bits;
        const imageWidth: number = this._width;
        const stateCount: number[] = [0, 0, 0, 0, 0];

        let j = startJ;
        while (j >= 0 && image[j + centerI * this._width]) {
            stateCount[2]++;
            j--;
        }
        if (j < 0) {
            return NaN;
        }
        while (j >= 0 && !image[j + centerI * this._width] && stateCount[1] <= maxCount) {
            stateCount[1]++;
            j--;
        }
        if (j < 0 || stateCount[1] > maxCount) {
            return NaN;
        }
        while (j >= 0 && image[j + centerI * this._width] && stateCount[0] <= maxCount) {
            stateCount[0]++;
            j--;
        }
        if (stateCount[0] > maxCount) {
            return NaN;
        }

        j = startJ + 1;
        while (j < imageWidth && image[j + centerI * this._width]) {
            stateCount[2]++;
            j++;
        }
        if (j == imageWidth) {
            return NaN;
        }
        while (j < imageWidth && !image[j + centerI * this._width] && stateCount[3] < maxCount) {
            stateCount[3]++;
            j++;
        }
        if (j == imageWidth || stateCount[3] >= maxCount) {
            return NaN;
        }
        while (j < imageWidth && image[j + centerI * this._width] && stateCount[4] < maxCount) {
            stateCount[4]++;
            j++;
        }
        if (stateCount[4] >= maxCount) {
            return NaN;
        }

        // If we found a finder-pattern-like section, but its size is significantly different than
        // the original, assume it's a false positive
        const stateCountTotal: number = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] +
            stateCount[4];
        if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal) {
            return NaN;
        }

        return FinderPatternFinder.foundPatternCross(stateCount) ? FinderPatternFinder.centerFromEnd(stateCount, j) : NaN;
    }


    /**
     * <p>This is called when a horizontal scan finds a possible alignment pattern. It will
     * cross check with a vertical scan, and if successful, will, ah, cross-cross-check
     * with another horizontal scan. This is needed primarily to locate the real horizontal
     * center of the pattern in cases of extreme skew.
     * And then we cross-cross-cross check with another diagonal scan.</p>
     *
     * <p>If that succeeds the finder pattern location is added to a list that tracks
     * the number of times each location has been nearly-matched as a finder pattern.
     * Each additional find is more evidence that the location is in fact a finder
     * pattern center
     *
     * @param stateCount        reading state module counts from horizontal scan
     * @param verticalIndex     row where finder pattern may be found
     * @param horizontalIndex   end of possible finder pattern in row
     * @return true if a finder pattern candidate was found this time
     */
    private handlePossibleCenter(stateCount: number[], verticalIndex: number, horizontalIndex: number) {
        const stateCountTotal: number = stateCount.reduce(function (previousValue, currentValue) {
            return previousValue + currentValue;
        });
        let centerHorizontalIndex: number = (horizontalIndex - stateCount[4] - stateCount[3]) - stateCount[2] / 2.0;
        let centerVerticalIndex: number = this.crossCheckVertical(verticalIndex, Math.floor(centerHorizontalIndex), stateCount[2], stateCountTotal);

        if (!isNaN(centerVerticalIndex)) {
            // Re-cross check
            centerHorizontalIndex = this.crossCheckHorizontal(Math.floor(centerHorizontalIndex), Math.floor(centerVerticalIndex), stateCount[2], stateCountTotal);
            if (!isNaN(centerHorizontalIndex)) {
                const estimatedModuleSize = stateCountTotal / 7.0;
                let found: boolean = this._possibleCenters.some(function (center) {
                    return center.aboutEquals(estimatedModuleSize, centerVerticalIndex, centerHorizontalIndex);
                });

                for (let index = 0; index < this._possibleCenters.length; index++) {
                    const center: FinderPattern = this._possibleCenters[index];
                    // Look for about the same center and module size:
                    if (center.aboutEquals(estimatedModuleSize, centerVerticalIndex, centerHorizontalIndex)) {
                        center.incrementCount();
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    this._possibleCenters.push(new FinderPattern(centerHorizontalIndex, centerVerticalIndex, estimatedModuleSize));
                }
                return true;
            }
        }
        return false;
    }

    /**
     * @return true iff we have found at least 3 finder patterns that have been detected
     *         at least {@link #CENTER_QUORUM} times each, and, the estimated module size of the
     *         candidates is "pretty similar"
     */
    private haveMultiplyConfirmedCenters(): boolean {
        let confirmedCount: number = 0;
        let totalModuleSize: number = 0.0;
        this._possibleCenters.forEach(function (possibleCenter: FinderPattern) {
            if (possibleCenter.count >= CENTER_QUORUM) {
                confirmedCount++;
                totalModuleSize += possibleCenter.estimatedModuleSize;
            }
        });

        if (confirmedCount < 3) {
            return false;
        }

        // OK, we have at least 3 confirmed centers, but, it's possible that one is a "false positive"
        // and that we need to keep looking. We detect this by asking if the estimated module sizes
        // vary too much. We arbitrarily say that when the total deviation from average exceeds
        // 5% of the total module size estimates, it's too much.
        const max = this._possibleCenters.length;
        const average = totalModuleSize / max;
        let totalDeviation = 0.0;
        this._possibleCenters.forEach(function (possibleCenter: FinderPattern) {
            totalDeviation += Math.abs(possibleCenter.estimatedModuleSize - average);
        });

        return totalDeviation <= 0.05 * totalModuleSize;
    }

    /**
     * @return the 3 best {@link FinderPattern}s from our list of candidates. The "best" are
     *         those that have been detected at least {@link #CENTER_QUORUM} times, and whose module
     *         size differs from the average among those patterns the least
     * @throws NotFoundException if 3 such finder patterns do not exist
     */
    private selectBestPatterns(): FinderPattern[] {

        const startSize = this._possibleCenters.length;
        if (startSize < 3) {
            throw new NotFoundError("Couldn't find enough finder patterns.");
        }

        // Filter outlier possibilities whose module size is too different
        if (startSize > 3) {
            // But we can only afford to do so if we have at least 4 possibilities to choose from
            let totalModuleSize = 0.0;
            let square = 0.0;
            this._possibleCenters.forEach(function (center: FinderPattern) {
                const size = center.estimatedModuleSize;
                totalModuleSize += size;
                square += size * size;
            });

            const average = totalModuleSize / startSize;
            const stdDev = Math.sqrt(square / startSize - average * average);

            this._possibleCenters.sort(function (center1: FinderPattern, center2: FinderPattern) {
                const dA = Math.abs(center2.estimatedModuleSize - average);
                const dB = Math.abs(center1.estimatedModuleSize - average);
                return dA < dB ? -1 : dA > dB ? 1 : 0;
            });
            const limit = Math.max(0.2 * average, stdDev);

            for (let i = 0; i < this._possibleCenters.length && this._possibleCenters.length > 3; i++) {
                const pattern = this._possibleCenters[i];
                if (Math.abs(pattern.estimatedModuleSize - average) > limit) {
                    this._possibleCenters.splice(i, 1);
                    i--;
                }
            }
        }

        if (this._possibleCenters.length > 3) {
            // Throw away all but those first size candidate points we found.

            let totalModuleSize = 0.0;
            this._possibleCenters.forEach(function (center: FinderPattern) {
                totalModuleSize += center.estimatedModuleSize;
            });

            const average = totalModuleSize / this._possibleCenters.length;

            this._possibleCenters.sort(function (center1: FinderPattern, center2: FinderPattern) {
                if (center2.count == center1.count) {
                    const dA = Math.abs(center2.estimatedModuleSize - average);
                    const dB = Math.abs(center1.estimatedModuleSize - average);
                    return dA < dB ? 1 : dA > dB ? -1 : 0;
                } else {
                    return center2.count - center1.count;
                }
            });
        }

        return [this._possibleCenters[0], this._possibleCenters[1], this._possibleCenters[2]];
    }

    /**
     * @return number of rows we could safely skip during scanning, based on the first
     *         two finder patterns that have been located. In some cases their position will
     *         allow us to infer that the third pattern must lie below a certain point farther
     *         down in the image.
     */
    private findRowSkip() {
        const max: number = this._possibleCenters.length;
        if (max <= 1) {
            return 0;
        }
        let firstConfirmedCenter: FinderPattern = null;
        this._possibleCenters.forEach((center: FinderPattern) => {
            if (center.count >= CENTER_QUORUM) {
                if (firstConfirmedCenter == null) {
                    firstConfirmedCenter = center;
                } else {
                    // We have two confirmed centers
                    // How far down can we skip before resuming looking for the next
                    // pattern? In the worst case, only the difference between the
                    // difference in the x / y coordinates of the two centers.
                    // This is the case where you find top left last.
                    this._hasSkipped = true;
                    return Math.floor((Math.abs(firstConfirmedCenter.x - center.x) - Math.abs(firstConfirmedCenter.y - center.y)) / 2);
                }
            }
        });
        return 0;
    }


    /**
     * Orders an array of three ResultPoints in an order [A,B,C] such that AB is less than AC
     * and BC is less than AC, and the angle between BC and BA is less than 180 degrees.
     *
     * @param patterns array of three {@code ResultPoint} to order
     */
    private static orderBestPatterns(patterns: FinderPattern[]): FinderPattern[] {

        // Find distances between pattern centers
        const zeroOneDistance = distance(patterns[0], patterns[1]);
        const oneTwoDistance = distance(patterns[1], patterns[2]);
        const zeroTwoDistance = distance(patterns[0], patterns[2]);

        let pointA: FinderPattern;
        let pointB: FinderPattern;
        let pointC: FinderPattern;

        // Assume one closest to other two is B; A and C will just be guesses at first
        if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
            pointB = patterns[0];
            pointA = patterns[1];
            pointC = patterns[2];
        } else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance) {
            pointB = patterns[1];
            pointA = patterns[0];
            pointC = patterns[2];
        } else {
            pointB = patterns[2];
            pointA = patterns[0];
            pointC = patterns[1];
        }

        // Use cross product to figure out whether A and C are correct or flipped.
        // This asks whether BC x BA has a positive z component, which is the arrangement
        // we want for A, B, C. If it's negative, then we've got it flipped around and
        // should swap A and C.
        if (crossProductZ(pointA, pointB, pointC) < 0.0) {
            const temp: FinderPattern = pointA;
            pointA = pointC;
            pointC = temp;
        }

        patterns[0] = pointA;
        patterns[1] = pointB;
        patterns[2] = pointC;

        return [pointA, pointB, pointC]
    }
}
