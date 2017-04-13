import {Reader} from "./Reader";
import QRCodeReader from "./qrcode/QRCodeReader";

export class KXing {
    static getReader(): Reader {
        return new QRCodeReader();
    }
}
