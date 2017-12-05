import QRCodeReader from "../../qrcode/QRCodeReader";
import MultipleBarcodeReader from "../MultipleBarcodeReader";
import Result from "../../Result";
import {BarcodeFormat} from "../../BarcodeFormat";
import MultiDetector from "./detector/MultiDetector";
import BitMatrix from "../../common/BitMatrix";

/**
 * This implementation can detect and decode multiple QR Codes in an image.
 *
 * @link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/multi/qrcode/QRCodeMultiReader.java
 * TODO: Support StructuredAppend.
 */
class MultiQRCodeReader extends QRCodeReader implements MultipleBarcodeReader {

    /**
     * Decode multiple QRCodes.
     *
     * @param {ImageData} image
     * @return {Result[]}
     * @override
     */
    public decodeMultiple(image: ImageData): Result[] {
        const results: Result[] = [];
        const detector = new MultiDetector(image);
        const detectedCodes: BitMatrix[] = detector.detectMulti();

        detectedCodes.forEach((barcode) => {
            try {
                const decorded = this._decode(barcode);
                results.push(new Result(decorded.text, decorded.rawBytes, BarcodeFormat.QR_CODE));
            } catch (e) {
                // ignore and continue
            }
        });

        return results;
    }
}

export default MultiQRCodeReader;
