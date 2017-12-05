import FinderPatternFinder, {FinderPatternFinderResult} from "../../../qrcode/detector/FinderPatternFinder";
import FinderPattern from "../../../qrcode/format/FinderPattern";

/**
 * Attempts to find finder patterns in a QR Code.
 *
 * @link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/multi/qrcode/detector/MultiFinderPatternFinder.java
 */
class MultiFinderPatternFinder extends FinderPatternFinder {
    // max. legal count of modules per QR code edge (177)
    protected static MAX_MODULE_COUNT_PER_EDGE = 180;

    // min. legal count per modules per QR code edge (11)
    protected static MIN_MODULE_COUNT_PER_EDGE = 9;

    /**
     * More or less arbitrary cutoff point for determining if two finder patterns might belong
     * to the same code if they differ less than DIFF_MODSIZE_CUTOFF_PERCENT percent in their
     * estimated modules sizes.
     */
    protected static DIFF_MODSIZE_CUTOFF_PERCENT = 0.05;

    /**
     * More or less arbitrary cutoff point for determining if two finder patterns might belong
     * to the same code if they differ less than DIFF_MODSIZE_CUTOFF pixels/module in their
     * estimated modules sizes.
     */
    protected static DIFF_MODSIZE_CUTOFF = 0.5;


    /**
     * @return the 3 best {@link FinderPattern}s from our list of candidates. The "best" are
     *         those that have been detected at least {@link #CENTER_QUORUM} times, and whose module
     *         size differs from the average among those patterns the least
     */
    private selectMutipleBestPatterns(): FinderPattern[][] {
        const possibleCenters: FinderPattern[] = this.possibleCenters;
        const size = possibleCenters.length;
        const {
            MAX_MODULE_COUNT_PER_EDGE,
            MIN_MODULE_COUNT_PER_EDGE,
            DIFF_MODSIZE_CUTOFF_PERCENT,
            DIFF_MODSIZE_CUTOFF
        } = MultiFinderPatternFinder;

        if (size < 3) {
            // Nothing found.
            return [[]];
        }

        /*
         * Begin HE modifications to safely detect multiple codes of equal size
         */
        if (size == 3) {
            return [[
                possibleCenters[0],
                possibleCenters[1],
                possibleCenters[2]
            ]];
        }

        // Sort by estimated module size to speed up the upcoming checks
        possibleCenters.sort((center1: FinderPattern, center2: FinderPattern) => {
            const value = center2.estimatedModuleSize - center1.estimatedModuleSize;
            return value < 0.0 ? -1 : value > 0.0 ? 1 : 0;
        });

        /*
         * Now lets start: build a list of tuples of three finder locations that
         *  - feature similar module sizes
         *  - are placed in a distance so the estimated module count is within the QR specification
         *  - have similar distance between upper left/right and left top/bottom finder patterns
         *  - form a triangle with 90° angle (checked by comparing top right/bottom left distance
         *    with pythagoras)
         *
         * Note: we allow each point to be used for more than one code region: this might seem
         * counterintuitive at first, but the performance penalty is not that big. At this point,
         * we cannot make a good quality decision whether the three finders actually represent
         * a QR code, or are just by chance layouted so it looks like there might be a QR code there.
         * So, if the layout seems right, lets have the decoder try to decode.
         */

        const results: FinderPattern[][] = [];

        for (let i1 = 0; i1 < (size - 2); i1++) {
            const p1 = possibleCenters[i1];
            if (p1 == null) {
                continue;
            }

            for (let i2 = i1 + 1; i2 < (size - 1); i2++) {
                const p2 = possibleCenters[i2];
                if (p2 == null) {
                    continue;
                }

                // Compare the expected module sizes; if they are really off, skip
                const vModSize12 = (p1.estimatedModuleSize - p2.estimatedModuleSize) / Math.min(p1.estimatedModuleSize, p2.estimatedModuleSize);
                const vModSize12A = Math.abs(p1.estimatedModuleSize - p2.estimatedModuleSize);

                if (vModSize12A > DIFF_MODSIZE_CUTOFF && vModSize12 >= DIFF_MODSIZE_CUTOFF_PERCENT) {
                    // break, since elements are ordered by the module size deviation there cannot be
                    // any more interesting elements for the given p1.
                    break;
                }

                for (let i3 = i2 + 1; i3 < size; i3++) {
                    const p3 = possibleCenters[i3];
                    if (p3 == null) {
                        continue;
                    }

                    // Compare the expected module sizes; if they are really off, skip
                    const vModSize23 = (p2.estimatedModuleSize - p3.estimatedModuleSize) / Math.min(p2.estimatedModuleSize, p3.estimatedModuleSize);
                    const vModSize23A = Math.abs(p2.estimatedModuleSize - p3.estimatedModuleSize);

                    if (vModSize23A > DIFF_MODSIZE_CUTOFF && vModSize23 >= DIFF_MODSIZE_CUTOFF_PERCENT) {
                        // break, since elements are ordered by the module size deviation there cannot be
                        // any more interesting elements for the given p1.
                        break;
                    }

                    const test: FinderPattern[] = [p1, p2, p3];
                    FinderPatternFinder.orderBestPatterns(test);

                    // Calculate the distances: a = topleft-bottomleft, b=topleft-topright, c = diagonal
                    const info: FinderPatternFinderResult = new FinderPatternFinderResult(test[1], test[2], test[0]);
                    const dA = FinderPatternFinder.distance(info.topLeft, info.bottomLeft);
                    const dC = FinderPatternFinder.distance(info.topRight, info.bottomLeft);
                    const dB = FinderPatternFinder.distance(info.topLeft, info.topRight);

                    // Check the sizes
                    const estimatedModuleCount = (dA + dB) / (p1.estimatedModuleSize * 2.0);
                    if (estimatedModuleCount > MAX_MODULE_COUNT_PER_EDGE ||
                        estimatedModuleCount < MIN_MODULE_COUNT_PER_EDGE) {
                        continue;
                    }

                    // Calculate the difference of the edge lengths in percent
                    const vABBC = Math.abs((dA - dB) / Math.min(dA, dB));
                    if (vABBC >= 0.1) {
                        continue;
                    }

                    // Calculate the diagonal length by assuming a 90° angle at topleft
                    const dCpy = Math.sqrt(dA * dA + dB * dB);
                    // Compare to the real distance in %
                    const vPyC = Math.abs((dC - dCpy) / Math.min(dC, dCpy));

                    if (vPyC >= 0.1) {
                        continue;
                    }

                    // All tests passed!
                    results.push(test);
                } // end iterate p3
            } // end iterate p2
        } // end iterate p1

        return results;
    }

    /**
     * Find multi QRCodes.
     *
     * @return {FinderPatternFinderResult[]}
     */
    public findMulti(): FinderPatternFinderResult[] {
        const imageHeigth = this.height;
        const imageWidth = this.width;

        const {
            MAX_MODULES,
            MIN_SKIP
        } = FinderPatternFinder;


        // We are looking for black/white/black/white/black modules in
        // 1:1:3:1:1 ratio; this tracks the number of such modules seen so far

        // Let's assume that the maximum version QR Code we support takes up 1/4 the height of the
        // image, and then account for the center being 3 modules in size. This gives the smallest
        // number of pixels the center could be, so skip this often. When trying harder, look for all
        // QR versions regardless of how dense they are.
        let iSkip = Math.floor(imageHeigth * 0.25 * (1 / MAX_MODULES) * 3);
        if (iSkip < MIN_SKIP) {
            iSkip = MIN_SKIP;
        }

        const stateCount: number[] = [];
        for (let i = iSkip - 1; i < imageHeigth; i += iSkip) {
            // Get a row of black/white values
            stateCount[0] = 0;
            stateCount[1] = 0;
            stateCount[2] = 0;
            stateCount[3] = 0;
            stateCount[4] = 0;

            let currentState = 0;
            for (let horizontalIndex = 0; horizontalIndex < imageWidth; horizontalIndex++) {
                if (this.bits[horizontalIndex + i * this.width]) {
                    // Black pixel
                    if ((currentState & 1) == 1) { // Counting white pixels
                        currentState++;
                    }
                    stateCount[currentState]++;
                } else { // White pixel
                    if ((currentState & 1) == 0) { // Counting black pixels
                        if (currentState == 4) { // A winner?
                            if (FinderPatternFinder.foundPatternCross(stateCount) && this.handlePossibleCenter(stateCount, i, horizontalIndex)) {
                                // Yes
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
            } // for j=...

            if (FinderPatternFinder.foundPatternCross(stateCount)) {
                this.handlePossibleCenter(stateCount, i, imageWidth);
            } // end if foundPatternCross
        } // for i=iSkip-1 ...

        const patternInfo: FinderPattern[][] = this.selectMutipleBestPatterns();


        const result: FinderPatternFinderResult[] = [];
        patternInfo.forEach((pattern: FinderPattern[]) => {
            FinderPatternFinder.orderBestPatterns(pattern);
            result.push(new FinderPatternFinderResult(pattern[1], pattern[2], pattern[0]));
        });

        return result;
    }
}


export default MultiFinderPatternFinder;
