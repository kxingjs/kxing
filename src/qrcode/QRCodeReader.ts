import {Reader} from "../Reader";
import QRDecoder from "./decode/QRDecoder";
import Result from "../Result";
import QRDetector from "./detector/QRDetector";
import BitMatrix from "../common/BitMatrix";
import {BarcodeFormat} from "../BarcodeFormat";

export default class QRCodeReader implements Reader {

    /**
     * Locates and decodes a QR code in an image.
     */
    public decode(image:ImageData):Result {
        const detector = new QRDetector(image);
        const detectedCode: BitMatrix = detector.detect();

        const decoder = new QRDecoder();
        const decoderResult = decoder.decode(detectedCode);

        return new Result(decoderResult.text, decoderResult.rawBytes, BarcodeFormat.QR_CODE);
    }
}
