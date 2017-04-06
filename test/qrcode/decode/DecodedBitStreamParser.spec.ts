import {expect} from 'chai';
import DecodedBitStreamParser from "../../../src/qrcode/decode/DecodedBitStreamParser";
import Version from "../../../src/qrcode/format/Version";
import DecoderResult from "../../../src/common/DecoderResult";

describe("DecodedBitStreamParser", function () {
    describe("byte mode", function () {
        it("can decode with byte mode", function () {
            const builder: BitSourceBuilder = new BitSourceBuilder();
            builder.write(0x04, 4); // Byte mode
            builder.write(0x03, 8); // 3 bytes
            builder.write(0xF1, 8);
            builder.write(0xF2, 8);
            builder.write(0xF3, 8);
            const result: DecoderResult = DecodedBitStreamParser.decode(
                builder.toByteArray(),
                Version.getVersionForNumber(1), null);
            expect("\u00f1\u00f2\u00f3").to.be.equal(result.text);
        });
    });
});

class BitSourceBuilder {

    private byteArray: number[] = [];
    private nextByte: number = 0;
    private bitsLeftInNextByte: number = 8;

    public write(value: number, numBits: number): void {
        if (numBits <= this.bitsLeftInNextByte) {
            this.nextByte <<= numBits;
            this.nextByte |= value;
            this.bitsLeftInNextByte -= numBits;
            if (this.bitsLeftInNextByte == 0) {
                this.byteArray.push(this.nextByte);
                this.nextByte = 0;
                this.bitsLeftInNextByte = 8;
            }
        } else {
            const bitsToWriteNow = this.bitsLeftInNextByte;
            const numRestOfBits = numBits - bitsToWriteNow;
            const mask = 0xFF >> (8 - bitsToWriteNow);
            const valueToWriteNow = (value >>> numRestOfBits) & mask;
            this.write(valueToWriteNow, bitsToWriteNow);
            this.write(value, numRestOfBits);
        }
    }

    public  toByteArray(): number[] {
        if (this.bitsLeftInNextByte < 8) {
            this.write(0, this.bitsLeftInNextByte);
        }
        return this.byteArray;
    }
}