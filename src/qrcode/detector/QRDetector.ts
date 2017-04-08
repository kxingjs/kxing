import Version from'../format/Version';
import AlignmentPatternFinder from'./AlignmentPatternFinder';
import FinderPatternFinder from'./FinderPatternFinder';
import {FinderPatternFinderResult} from "./FinderPatternFinder";
import AlignmentPattern from "../format/AlignmentPattern";
import FinderPattern from "../format/FinderPattern";
import BitMatrix from "../../common/BitMatrix";
import NotFoundError from "../../error/NotFoundError";
import PerspectiveTransform from "../../common/PerspectiveTransform";
import GridSampler from "../../common/GridSampler";
import {distance, round} from "../../common/Utils";
import {binarize} from "../../common/Binarizer";

/*
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/detector/Detector.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class QRDetector {
    private _bits: number[];
    private _width: number;
    private _height: number;

    constructor(canvasImageData: ImageData) {
        this._bits = binarize(canvasImageData).bits;
        this._width = canvasImageData.width;
        this._height = canvasImageData.height;
    }

    detect(): BitMatrix {
        const finderPatternFinder = new FinderPatternFinder(this._bits, this._width, this._height);
        const finderPatterns: FinderPatternFinderResult = finderPatternFinder.find();

        const topLeft = finderPatterns.topLeft;
        const topRight = finderPatterns.topRight;
        const bottomLeft = finderPatterns.bottomLeft;

        const moduleSize = this.calculateModuleSize(topLeft, topRight, bottomLeft);
        if (moduleSize < 1.0) {
            throw new NotFoundError();
        }

        const dimension: number = QRDetector.computeDimension(topLeft, topRight, bottomLeft, moduleSize);
        const provisionalVersion: Version = Version.getProvisionalVersionForDimension(dimension);
        const modulesBetweenFPCenters: number = provisionalVersion.dimensionForVersion - 7;

        let alignmentPattern: AlignmentPattern = null;
        // Anything above version 1 has an alignment pattern

        if (provisionalVersion.alignmentPatternCenters.length > 0) {

            // Guess where a "bottom right" finder pattern would have been
            const bottomRightX: number = topRight.x - topLeft.x + bottomLeft.x;
            const bottomRightY: number = topRight.y - topLeft.y + bottomLeft.y;

            // Estimate that alignment pattern is closer by 3 modules
            // from "bottom right" to known top left location
            const correctionToTopLeft: number = 1.0 - 3.0 / modulesBetweenFPCenters;
            const estAlignmentX: number = Math.floor(topLeft.x + correctionToTopLeft * (bottomRightX - topLeft.x));
            const estAlignmentY: number = Math.floor(topLeft.y + correctionToTopLeft * (bottomRightY - topLeft.y));

            // Kind of arbitrary -- expand search radius before giving up
            for (let i = 4; i <= 16; i <<= 1) {
                try {
                    alignmentPattern = this.findAlignmentInRegion(moduleSize, estAlignmentX, estAlignmentY, i);
                    break;
                } catch (e) {
                    // try next round
                }
            }
            // If we didn't find alignment pattern... well try anyway without it
        }

        const transform: PerspectiveTransform = QRDetector.createTransform(topLeft, topRight, bottomLeft, alignmentPattern, dimension);

        const sampler: GridSampler = new GridSampler(this._width, this._height);
        return sampler.sampleGrid(this._bits, dimension, dimension, transform);
    };

    private static createTransform(topLeft: FinderPattern,
                                   topRight: FinderPattern,
                                   bottomLeft: FinderPattern,
                                   alignmentPattern: AlignmentPattern,
                                   dimension: number) {

        const dimMinusThree = dimension - 3.5;
        let bottomRightX;
        let bottomRightY;
        let sourceBottomRightX;
        let sourceBottomRightY;
        if (alignmentPattern != null) {
            bottomRightX = alignmentPattern.x;
            bottomRightY = alignmentPattern.y;
            sourceBottomRightX = dimMinusThree - 3.0;
            sourceBottomRightY = sourceBottomRightX;
        } else {
            // Don't have an alignment pattern, just make up the bottom-right point
            bottomRightX = (topRight.x - topLeft.x) + bottomLeft.x;
            bottomRightY = (topRight.y - topLeft.y) + bottomLeft.y;
            sourceBottomRightX = dimMinusThree;
            sourceBottomRightY = dimMinusThree;
        }

        return PerspectiveTransform.quadrilateralToQuadrilateral(
            3.5,
            3.5,
            dimMinusThree,
            3.5,
            sourceBottomRightX,
            sourceBottomRightY,
            3.5,
            dimMinusThree,
            topLeft.x,
            topLeft.y,
            topRight.x,
            topRight.y,
            bottomRightX,
            bottomRightY,
            bottomLeft.x,
            bottomLeft.y);
    };

    /**
     * <p>Computes the dimension (number of modules on a size) of the QR Code based on the position
     * of the finder patterns and estimated module size.</p>
     */
    private static computeDimension(topLeft: FinderPattern,
                                    topRight: FinderPattern,
                                    bottomLeft: FinderPattern,
                                    moduleSize: number): number {

        const tltrCentersDimension = round(distance(topLeft, topRight) / moduleSize);
        const tlblCentersDimension = round(distance(topLeft, bottomLeft) / moduleSize);

        let dimension: number = ((tltrCentersDimension + tlblCentersDimension) / 2) + 7;
        switch (dimension & 0x03) {

            // mod 4
            case 0:
                dimension++;
                break;
            // 1? do nothing

            case 2:
                dimension--;
                break;

            case 3:
                throw new NotFoundError();
        }
        return dimension;
    };


    /**
     * <p>Computes an average estimated module size based on estimated derived from the positions
     * of the three finder patterns.</p>
     *
     * @param topLeft detected top-left finder pattern center
     * @param topRight detected top-right finder pattern center
     * @param bottomLeft detected bottom-left finder pattern center
     * @return estimated module size
     */
    private calculateModuleSize(topLeft: FinderPattern,
                                topRight: FinderPattern,
                                bottomLeft: FinderPattern): number {
        // Take the average
        return (
                this.calculateModuleSizeOneWay(topLeft, topRight) +
                this.calculateModuleSizeOneWay(topLeft, bottomLeft)
            ) / 2.0;
    };

    /**
     * <p>Estimates module size based on two finder patterns -- it uses
     * {@link #sizeOfBlackWhiteBlackRunBothWays(int, int, int, int)} to figure the
     * width of each, measuring along the axis between their centers.</p>
     */
    private calculateModuleSizeOneWay(pattern: FinderPattern, otherPattern: FinderPattern): number {
        const moduleSizeEst1 = this.sizeOfBlackWhiteBlackRunBothWays(
            Math.floor(pattern.x),
            Math.floor(pattern.y),
            Math.floor(otherPattern.x),
            Math.floor(otherPattern.y));

        const moduleSizeEst2 = this.sizeOfBlackWhiteBlackRunBothWays(
            Math.floor(otherPattern.x),
            Math.floor(otherPattern.y),
            Math.floor(pattern.x),
            Math.floor(pattern.y));

        if (isNaN(moduleSizeEst1)) {
            return moduleSizeEst2 / 7.0;
        }
        if (isNaN(moduleSizeEst2)) {
            return moduleSizeEst1 / 7.0;
        }
        // Average them, and divide by 7 since we've counted the width of 3 black modules,
        // and 1 white and 1 black module on either side. Ergo, divide sum by 14.
        return (moduleSizeEst1 + moduleSizeEst2) / 14.0;
    };

    /**
     * See {@link #sizeOfBlackWhiteBlackRun(int, int, int, int)}; computes the total width of
     * a finder pattern by looking for a black-white-black run from the center in the direction
     * of another point (another finder pattern center), and in the opposite direction too.
     */
    private sizeOfBlackWhiteBlackRunBothWays(fromX: number, fromY: number, toX: number, toY: number): number {

        let result = this.sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);

        // Now count other way -- don't run off image though of course
        let scale = 1.0;
        let otherToX = fromX - (toX - fromX);

        if (otherToX < 0) {
            scale = fromX / (fromX - otherToX);
            otherToX = 0;
        } else if (otherToX >= this._width) {
            scale = (this._width - 1 - fromX) / (otherToX - fromX);
            otherToX = this._width - 1;
        }
        let otherToY = Math.floor(fromY - (toY - fromY) * scale);

        scale = 1.0;
        if (otherToY < 0) {
            scale = fromY / (fromY - otherToY);
            otherToY = 0;
        } else if (otherToY >= this._height) {
            scale = (this._height - 1 - fromY) / (otherToY - fromY);
            otherToY = this._height - 1;
        }
        otherToX = Math.floor(fromX + (otherToX - fromX) * scale);

        result += this.sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);

        // Middle pixel is double-counted this way; subtract 1
        return result - 1.0;
    };

    /**
     * <p>This method traces a line from a point in the image, in the direction towards another point.
     * It begins in a black region, and keeps going until it finds white, then black, then white again.
     * It reports the distance from the start to this point.</p>
     *
     * <p>This is used when figuring out how wide a finder pattern is, when the finder pattern
     * may be skewed or rotated.</p>
     */
    private sizeOfBlackWhiteBlackRun(fromX: number, fromY: number, toX: number, toY: number): number {
        // Mild variant of Bresenham's algorithm;
        // see http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
        const steep: boolean = Math.abs(toY - fromY) > Math.abs(toX - fromX);
        if (steep) {
            [fromX, fromY] = [fromY, fromX]; //swap
            [toX, toY] = [toY, toX]; //swap
        }

        const dx: number = Math.abs(toX - fromX);
        const dy: number = Math.abs(toY - fromY);
        let error: number = -dx / 2;
        const xstep: number = fromX < toX ? 1 : -1;
        const ystep: number = fromY < toY ? 1 : -1;

        // In black pixels, looking for white, first or second time.
        let state = 0;
        // Loop up until x == toX, but not beyond
        const xLimit = toX + xstep;

        for (let x = fromX, y = fromY; x != xLimit; x += xstep) {
            const realX = steep ? y : x;
            const realY = steep ? x : y;

            // Does current pixel mean we have moved white to black or vice versa?
            // Scanning black in state 0,2 and white in state 1, so if we find the wrong
            // color, advance to next state or end if we are in state 2 already
            if ((state == 1) == (this._bits[realX + realY * this._width] == 1)) {
                if (state == 2) {
                    return distance({x: x, y: y}, {x: fromX, y: fromY});
                }
                state++;
            }

            error += dy;
            if (error > 0) {
                if (y == toY) {
                    break;
                }
                y += ystep;
                error -= dx;
            }
        }

        // Found black-white-black; give the benefit of the doubt that the next pixel outside the image
        // is "white" so this last point at (toX+xStep,toY) is the right ending. This is really a
        // small approximation; (toX+xStep,toY+yStep) might be really correct. Ignore this.
        if (state == 2) {
            return distance({x: toX + xstep, y: toY}, {x: fromX, y: fromY});
        }
        // else we didn't find even black-white-black; no estimate is really possible
        return NaN;
    };

    /**
     * <p>Attempts to locate an alignment pattern in a limited region of the image, which is
     * guessed to contain it. This method uses {@link AlignmentPattern}.</p>
     *
     * @param overallEstModuleSize estimated module size so far
     * @param estAlignmentX x coordinate of center of area probably containing alignment pattern
     * @param estAlignmentY y coordinate of above
     * @param allowanceFactor number of pixels in all directions to search from the center
     * @return {@link AlignmentPattern} if found, or null otherwise
     * @throws NotFoundException if an unexpected error occurs during detection
     */
    protected findAlignmentInRegion(overallEstModuleSize: number,
                                    estAlignmentX: number,
                                    estAlignmentY: number,
                                    allowanceFactor: number): AlignmentPattern {
        // Look for an alignment pattern (3 modules in size) around where it
        // should be
        const allowance = Math.floor(allowanceFactor * overallEstModuleSize);
        const alignmentAreaLeftX = Math.max(0, estAlignmentX - allowance);
        const alignmentAreaRightX = Math.min(this._width - 1, estAlignmentX + allowance);
        if (alignmentAreaRightX - alignmentAreaLeftX < overallEstModuleSize * 3) {
            throw new NotFoundError();
        }

        const alignmentAreaTopY = Math.max(0, estAlignmentY - allowance);
        const alignmentAreaBottomY = Math.min(this._height - 1, estAlignmentY + allowance);
        if (alignmentAreaBottomY - alignmentAreaTopY < overallEstModuleSize * 3) {
            throw new NotFoundError();
        }

        const alignmentFinder = new AlignmentPatternFinder(
            this._bits,
            this._width,
            this._height,
            alignmentAreaLeftX,
            alignmentAreaTopY,
            alignmentAreaRightX - alignmentAreaLeftX,
            alignmentAreaBottomY - alignmentAreaTopY,
            overallEstModuleSize);

        return alignmentFinder.find();
    };
}
