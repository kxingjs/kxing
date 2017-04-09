import Result from "./Result";

export interface Reader {

    /**
     * Locates and decodes a barcode in some format within an image.
     *
     * @param image image of barcode to decode
     * @return String which the barcode encodes
     * @throws NotFoundException if no potential barcode is found
     * @throws ChecksumException if a potential barcode is found but does not pass its checksum
     * @throws FormatException if a potential barcode is found but format is invalid
     */
    decode(image: ImageData): Result;
}
