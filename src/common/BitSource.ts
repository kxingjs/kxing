import IllegalArgumentError from "../error/IllegalArgumentError";


/**
 * Porting form {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/common/BitSource.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class BitSource {

    private _bytes: number[];
    private _byteOffset: number = 0;
    private _bitOffset: number = 0;

    /**
     * @param bytes bytes from which this will read bits. Bits will be read from the first byte first.
     * Bits are read within a byte from most-significant to least-significant bit.
     */
    constructor(bytes: number[]) {
        this._bytes = bytes;
    }

    /**
     * @return index of next bit in current byte which would be read by the next call to {@link #readBits(int)}.
     */
    public bitOffset(): number {
        return this._bitOffset;
    }

    /**
     * @return index of next byte in input byte array which would be read by the next call to {@link #readBits(int)}.
     */
    public byteOffset(): number {
        return this._byteOffset;
    }

    /**
     * @param numBits number of bits to read
     * @return int representing the bits read. The bits will appear as the least-significant
     *         bits of the int
     * @throws IllegalArgumentException if numBits isn't in [1,32] or more than is available
     */
    public readBits(numBits: number): number {
        if (numBits < 1 || numBits > 32 || numBits > this.available()) {
            throw new IllegalArgumentError();
        }

        let result: number = 0;

        // First, read remainder from current byte
        if (this._bitOffset > 0) {
            const bitsLeft = 8 - this._bitOffset;
            const toRead = numBits < bitsLeft ? numBits : bitsLeft;
            const bitsToNotRead = bitsLeft - toRead;
            const mask = (0xFF >> (8 - toRead)) << bitsToNotRead;
            result = (this._bytes[this._byteOffset] & mask) >> bitsToNotRead;
            numBits -= toRead;
            this._bitOffset += toRead;
            if (this._bitOffset == 8) {
                this._bitOffset = 0;
                this._byteOffset++;
            }
        }

        // Next read whole bytes
        if (numBits > 0) {
            while (numBits >= 8) {
                result = (result << 8) | (this._bytes[this._byteOffset] & 0xFF);
                this._byteOffset++;
                numBits -= 8;
            }

            // Finally read a partial byte
            if (numBits > 0) {
                const bitsToNotRead = 8 - numBits;
                const mask = (0xFF >> bitsToNotRead) << bitsToNotRead;
                result = (result << numBits) | ((this._bytes[this._byteOffset] & mask) >> bitsToNotRead);
                this._bitOffset += numBits;
            }
        }

        return result;
    }

    /**
     * @return number of bits that can be read successfully
     */
    public available(): number {
        return 8 * (this._bytes.length - this._byteOffset) - this._bitOffset;
    }
}
