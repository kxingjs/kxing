import {Reader} from "./Reader";
import QRCodeReader from "./qrcode/QRCodeReader";

export function getReader(): Reader {
    return new QRCodeReader();
}
