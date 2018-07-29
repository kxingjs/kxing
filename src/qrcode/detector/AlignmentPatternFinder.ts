import AlignmentPattern from "../format/AlignmentPattern";
import NotFoundError from "../../error/NotFoundError";

/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/detector/AlignmentPatternFinder.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class AlignmentPatternFinder {
  private _bits: number[];
  private possibleCenters = [];
  private _startX;
  private _startY;
  private _width;
  private _height;
  private _moduleSize;
  private _imageWidth;
  private _imageHeight;

  /**
   * <p>Creates a finder that will look in a portion of the whole image.</p>
   *
   * @param bits          image to search
   * @param imageWidth    width of image to search
   * @param imageHeight   height of image to search
   * @param startX        left column from which to start searching
   * @param startY        top row from which to start searching
   * @param width         width of region to search
   * @param height        height of region to search
   * @param moduleSize    estimated module size so far
   */
  constructor(
    bits: number[],
    imageWidth: number,
    imageHeight: number,
    startX: number,
    startY: number,
    width: number,
    height: number,
    moduleSize: number
  ) {
    this._bits = bits;
    this._imageWidth = imageWidth;
    this._imageHeight = imageHeight;

    this._startX = startX;
    this._startY = startY;
    this._width = width;
    this._height = height;
    this._moduleSize = moduleSize;
  }

  /**
   * <p>This method attempts to find the bottom-right alignment pattern in the image. It is a bit messy since
   * it's pretty performance-critical and so is written to be fast foremost.</p>
   *
   * @return {@link AlignmentPattern} if found
   * @throws NotFoundException if not found
   */
  find(): AlignmentPattern {
    const startX = this._startX;
    const height = this._height;
    const maxJ = startX + this._width;
    const middleI = this._startY + (height >> 1);

    // We are looking for black/white/black modules in 1:1:1 ratio;
    // this tracks the number of black/white/black modules seen so far
    const stateCount = [];
    for (let iGen = 0; iGen < height; iGen++) {
      // Search from middle outwards
      stateCount[0] = 0;
      stateCount[1] = 0;
      stateCount[2] = 0;

      const i =
        middleI + ((iGen & 0x01) == 0 ? (iGen + 1) >> 1 : -((iGen + 1) >> 1));
      let j = startX;
      // Burn off leading white pixels before anything else; if we start in the middle of
      // a white run, it doesn't make sense to count its length, since we don't know if the
      // white run continued to the left of the start point
      while (j < maxJ && !this._bits[j + this._imageWidth * i]) {
        j++;
      }
      let currentState = 0;
      while (j < maxJ) {
        if (this._bits[j + i * this._imageWidth]) {
          // Black pixel
          if (currentState == 1) {
            // Counting black pixels
            stateCount[1]++;
          } else {
            // Counting white pixels
            // Counting white pixels
            if (currentState == 2) {
              // A winner?
              if (this.foundPatternCross(stateCount)) {
                // Yes
                const confirmed: AlignmentPattern = this.handlePossibleCenter(
                  stateCount,
                  i,
                  j
                );
                if (confirmed != null) {
                  return confirmed;
                }
              }
              stateCount[0] = stateCount[2];
              stateCount[1] = 1;
              stateCount[2] = 0;
              currentState = 1;
            } else {
              stateCount[++currentState]++;
            }
          }
        } else {
          // White pixel
          if (currentState == 1) {
            // Counting black pixels
            currentState++;
          }
          stateCount[currentState]++;
        }
        j++;
      }
      if (this.foundPatternCross(stateCount)) {
        const confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
        if (confirmed != null) {
          return confirmed;
        }
      }
    }

    // Hmm, nothing we saw was observed and confirmed twice. If we had
    // any guess at all, return it.
    if (this.possibleCenters.length != 0) {
      return this.possibleCenters[0];
    }

    throw new NotFoundError("Cound not find an AlignmentPattern.");
  }

  /**
   * Given a count of black/white/black pixels just seen and an end position,
   * figures the location of the center of this black/white/black run.
   */
  private static centerFromEnd(stateCount: number[], end: number): number {
    return end - stateCount[2] - stateCount[1] / 2.0;
  }

  /**
   * @param stateCount count of black/white/black pixels just read
   * @return true iff the proportions of the counts is close enough to the 1/1/1 ratios
   *         used by alignment patterns to be considered a match
   */
  private foundPatternCross(stateCount: number[]): boolean {
    const moduleSize = this._moduleSize;
    const maxVariance = moduleSize / 2.0;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
        return false;
      }
    }
    return true;
  }

  /**
   * <p>After a horizontal scan finds a potential alignment pattern, this method
   * "cross-checks" by scanning down vertically through the center of the possible
   * alignment pattern to see if the same proportion is detected.</p>
   *
   * @param startI row where an alignment pattern was detected
   * @param centerJ center of the section that appears to cross an alignment pattern
   * @param maxCount maximum reasonable number of modules that should be
   * observed in any reading state, based on the results of the horizontal scan
   * @param originalStateCountTotal
   * @return vertical center of alignment pattern, or {@link NaN} if not found
   */
  crossCheckVertical(
    startI: number,
    centerJ: number,
    maxCount: number,
    originalStateCountTotal: number
  ): number {
    const maxI = this._imageHeight;
    const stateCount = [0, 0, 0];
    stateCount[0] = 0;
    stateCount[1] = 0;
    stateCount[2] = 0;

    // Start counting up from center
    let i = startI;
    while (
      i >= 0 &&
      this._bits[centerJ + i * this._imageWidth] &&
      stateCount[1] <= maxCount
    ) {
      stateCount[1]++;
      i--;
    }
    // If already too many modules in this state or ran off the edge:
    if (i < 0 || stateCount[1] > maxCount) {
      return NaN;
    }
    while (
      i >= 0 &&
      !this._bits[centerJ + i * this._imageWidth] &&
      stateCount[0] <= maxCount
    ) {
      stateCount[0]++;
      i--;
    }
    if (stateCount[0] > maxCount) {
      return NaN;
    }

    // Now also count down from center
    i = startI + 1;
    while (
      i < maxI &&
      this._bits[centerJ + i * this._imageWidth] &&
      stateCount[1] <= maxCount
    ) {
      stateCount[1]++;
      i++;
    }
    if (i == maxI || stateCount[1] > maxCount) {
      return NaN;
    }
    while (
      i < maxI &&
      !this._bits[centerJ + i * this._imageWidth] &&
      stateCount[2] <= maxCount
    ) {
      stateCount[2]++;
      i++;
    }
    if (stateCount[2] > maxCount) {
      return NaN;
    }

    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
    if (
      5 * Math.abs(stateCountTotal - originalStateCountTotal) >=
      2 * originalStateCountTotal
    ) {
      return NaN;
    }

    return this.foundPatternCross(stateCount)
      ? AlignmentPatternFinder.centerFromEnd(stateCount, i)
      : NaN;
  }

  /**
   * <p>This is called when a horizontal scan finds a possible alignment pattern. It will
   * cross check with a vertical scan, and if successful, will see if this pattern had been
   * found on a previous horizontal scan. If so, we consider it confirmed and conclude we have
   * found the alignment pattern.</p>
   *
   * @param stateCount reading state module counts from horizontal scan
   * @param i row where alignment pattern may be found
   * @param j end of possible alignment pattern in row
   * @return {@link AlignmentPattern} if we have found the same pattern twice, or null if not
   */
  handlePossibleCenter(
    stateCount: number[],
    i: number,
    j: number
  ): AlignmentPattern {
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
    const centerJ = AlignmentPatternFinder.centerFromEnd(stateCount, j);
    const centerI = this.crossCheckVertical(
      i,
      Math.floor(centerJ),
      2 * stateCount[1],
      stateCountTotal
    );
    if (!isNaN(centerI)) {
      const estimatedModuleSize =
        (stateCount[0] + stateCount[1] + stateCount[2]) / 3.0;
      this.possibleCenters.forEach(function(center: AlignmentPattern) {
        // Look for about the same center and module size:
        if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
          return center.combineEstimate(centerI, centerJ, estimatedModuleSize);
        }
      });

      // Hadn't found this before; save it
      const point = new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
      this.possibleCenters.push(point);
    }
    return null;
  }
}
