import Result from "../Result";

/**
 * Implementation of this interface attempt to read several barcodes from one image.
 *
 * @link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/multi/MultipleBarcodeReader.java
 * TODO: decode multiple barcode with hints.
 */
interface MultipleBarcodeReader {
    /**
     * Decode multiple barcode.
     *
     * @param {ImageData} image target image has several barcode.
     * @return {Result[]}
     */
    decodeMultiple(image: ImageData): Result[];
}

export default MultipleBarcodeReader;
