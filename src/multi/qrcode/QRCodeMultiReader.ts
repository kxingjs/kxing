import QRCodeReader from "../../qrcode/QRCodeReader";
import MultipleBarcodeReader from "../MultipleBarcodeReader";
import Result from "../../Result";
import {BarcodeFormat} from "../../BarcodeFormat";
import MultiDetector from "./detector/MultiDetector";
import BitMatrix from "../../common/BitMatrix";

/**
 * TODO: Support StructuredAppend.
 */
class QRCodeMultiReader extends QRCodeReader implements MultipleBarcodeReader {

    public decodeMultiple(image: ImageData): Result[] {
        const results: Result[] = [];
        const detector = new MultiDetector(image);
        const detectedCodes: BitMatrix[] = detector.detectMulti();

        detectedCodes.forEach((barcord) => {
            try {
                const decorded = this._decode(barcord);
                results.push(new Result(decorded.text, decorded.rawBytes, BarcodeFormat.QR_CODE));
            } catch (e) {
                // ignore and continue
            }
        });

        return results;
    }
}

export default QRCodeMultiReader;
