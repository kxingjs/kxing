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

export * from './Result';
export * from './BarcodeFormat';

export * from "./Reader";
export * from "./qrcode/QRCodeReader";

export * from "./multi/MultipleBarcodeReader";
export * from "./multi/qrcode/MultiQRCodeReader";
