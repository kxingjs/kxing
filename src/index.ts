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

export { default as Result } from "./Result";
export { default as BarcodeFormat } from "./BarcodeFormat";

export { default as Reader } from "./Reader";
export { default as QRCodeReader } from "./qrcode/QRCodeReader";

export {
  default as MultipleBarcodeReader
} from "./multi/MultipleBarcodeReader";
export { default as MultiQRCodeReader } from "./multi/qrcode/MultiQRCodeReader";
