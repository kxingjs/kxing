/**
 * @fileOverview Entry point of KXing.
 */
import Reader from "./Reader";
import QRCodeReader from "./qrcode/QRCodeReader";
import MultipleBarcodeReader from "./multi/MultipleBarcodeReader";
import MultiQRCodeReader from "./multi/qrcode/MultiQRCodeReader";

/**
 * Get {@code Reader} instance.
 *
 * @return {Reader}
 * @see QRCodeReader
 */
export function getReader(): Reader {
  return new QRCodeReader();
}

/**
 * Get {@code MultipleBarcodeReader} instance.
 *
 * @return {MultipleBarcodeReader}
 * @see MultiQRCodeReader
 */
export function getMultiReader(): MultipleBarcodeReader {
  return new MultiQRCodeReader();
}

export * from "./Result";
export * from "./BarcodeFormat";

export * from "./Reader";
export * from "./qrcode/QRCodeReader";

export * from "./multi/MultipleBarcodeReader";
export * from "./multi/qrcode/MultiQRCodeReader";
