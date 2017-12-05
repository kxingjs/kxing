import Result from "../Result";

interface MultipleBarcodeReader {

    decodeMultiple(image: ImageData): Result[];
}

export default MultipleBarcodeReader;
