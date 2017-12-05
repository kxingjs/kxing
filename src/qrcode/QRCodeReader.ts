import {Reader} from "../Reader";
import QRDecoder from "./decode/QRDecoder";
import Result from "../Result";
import QRDetector from "./detector/QRDetector";
import BitMatrix from "../common/BitMatrix";
import {BarcodeFormat} from "../BarcodeFormat";
import DecoderResult from "../common/DecoderResult";

export default class QRCodeReader implements Reader {

    /**
     * Locates and decodes a QR code in an image.
     */
    public decode(image: ImageData): Result {
        const decoderResult = this._decode(this._detect(image));

        return new Result(decoderResult.text, decoderResult.rawBytes, BarcodeFormat.QR_CODE);
    }

    protected _detect(image: ImageData): BitMatrix {
        const detector = new QRDetector(image);
        return detector.detect();
    }

    protected _decode(detected: BitMatrix): DecoderResult {
        const decoder = new QRDecoder();
        return decoder.decode(detected);
    }
}
