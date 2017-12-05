/**
 * @fileOverview Entry point of KXing.
 */
import Reader from "./Reader";
import QRCodeReader from "./qrcode/QRCodeReader";

/**
 * Get {@code QRCodeReader} instance.
 *
 * @return {Reader}
 * @see QRCodeReader
 * @deprecated
 */
export function getReader(): Reader {
    return new QRCodeReader();
}

export {default as Reader} from "./Reader";
export {default as QRCodeReader} from "./qrcode/QRCodeReader";
export {default as MultiQRCodeReader} from "./multi/qrcode/MultiQRCodeReader";
