import Reader from "../Reader";
import QRDecoder from "./decode/QRDecoder";
import Result from "../Result";
import QRDetector from "./detector/QRDetector";
import BarcodeFormat from "../BarcodeFormat";
import DecodeHint from "../DecodeHint";

export default class QRCodeReader implements Reader {
  protected decoder = new QRDecoder();

  /**
   * Locates and decodes a QR code in an image.
   */
  public decode(image: ImageData, hints?: Map<DecodeHint, any>): Result {
    const detector = new QRDetector(image);
    const detected = detector.detect(hints);

    const decoded = this.decoder.decode(detected);

    return new Result(decoded.text, decoded.rawBytes, BarcodeFormat.QR_CODE);
  }
}
