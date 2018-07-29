import QRDetector from "../../../qrcode/detector/QRDetector";
import MultiFinderPatternFinder from "./MultiFinderPatternFinder";
import BitMatrix from "../../../common/BitMatrix";

/**
 * <p>Encapsulates logic that can detect one or more QR Codes in an image, even if the QR Code
 * is rotated or skewed, or partially obscured.</p>
 *
 * @see https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/multi/qrcode/detector/MultiDetector.java
 */
class MultiDetector extends QRDetector {
  /**
   * Detects multi QRCodes from image.
   *
   * @return {BitMatrix[]}
   * TODO: replace return value to DetectorResult class.
   */
  public detectMulti(): BitMatrix[] {
    const finderPatternFinder = new MultiFinderPatternFinder(
      this._bits,
      this._width,
      this._height
    );
    const finderPatterns = finderPatternFinder.findMulti();

    const results: BitMatrix[] = [];
    finderPatterns.forEach(pattern => {
      try {
        results.push(this.processFinderPatternInfo(pattern));
      } catch (e) {
        // ignore
      }
    });

    return results;
  }
}

export default MultiDetector;
