import {ErrorCorrectionLevel} from "../format/ErrorCorrectionLevel";
import Version from "../format/Version";
import BitSource from "../../common/BitSource";
import DecoderResult from "../../common/DecoderResult";
import FormatError from "../../error/FormatError";
import {
    Mode,
    TerminatorMode,
    Fnc1FirstPositionMode,
    Fnc1SecondPositionMode,
    StructuredAppendMode,
    EciMode,
    HanziMode,
    NumericMode,
    AlphaNumericMode,
    ByteMode,
    KanjiMode,
    forBits
} from "../format/Mode";

/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/decoder/DecodedBitStreamParser.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class DecodedBitStreamParser {

    /**
     * See ISO 18004:2006, 6.4.4 Table 5
     */
    private static ALPHANUMERIC_CHARS: string[] = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".split('');

    static decode(bytes: number[],
                  version: Version,
                  ecLevel: ErrorCorrectionLevel): DecoderResult {

        const bits: BitSource = new BitSource(bytes);
        let result: string = '';
        const byteSegments: number[][] = [];


        const symbolSequence: number = -1;
        const parityData: number = -1;


        let fc1InEffect: boolean = false;
        let mode: Mode;
        do {
            // While still another segment to read...
            if (bits.available() < 4) {
                // OK, assume we're done. Really, a TERMINATOR mode should have been recorded here
                mode = new TerminatorMode();
            } else {
                mode = forBits(bits.readBits(4)); // mode is encoded by 4 bits
            }
            switch (mode.bits) {
                case TerminatorMode.BITS:
                case Fnc1FirstPositionMode.BITS:
                case Fnc1SecondPositionMode.BITS:
                case StructuredAppendMode.BITS:
                case EciMode.BITS:
                case HanziMode.BITS:
                    break;

                default:
                    // "Normal" QR code modes:
                    // How many characters will follow, encoded in this mode?
                    const count: number = bits.readBits(mode.getCharacterCountBits(version));
                    switch (mode.bits) {
                        case  NumericMode.BITS:
                            result += DecodedBitStreamParser.decodeNumericSegment(bits, count);
                            break;
                        case  AlphaNumericMode.BITS:
                            result += DecodedBitStreamParser.decodeAlphanumericSegment(bits, count, fc1InEffect);
                            break;
                        case  ByteMode.BITS:
                            result += DecodedBitStreamParser.decodeByteSegment(bits, count, byteSegments);
                            break;
                        case  KanjiMode.BITS:
                            result += DecodedBitStreamParser.decodeKanjiSegment(bits, count);
                            break;
                        default:
                            throw new FormatError();
                    }
                    break;
            }
        } while (mode.bits != TerminatorMode.BITS);

        return new DecoderResult(
            bytes,
            result,
            byteSegments.length == 0 ? null : byteSegments,
            ecLevel,
            symbolSequence,
            parityData);
    }


    private static decodeKanjiSegment(bits: BitSource,
                                      count: number): string {
        let result: string = '';

        // Don't crash trying to read more bits than we have available.
        if (count * 13 > bits.available()) {
            throw new FormatError();
        }

        // Each character will require 2 bytes. Read the characters as 2-byte pairs
        // and decode as Shift_JIS afterwards
        while (count > 0) {
            // Each 13 bits encodes a 2-byte character
            const twoBytes = bits.readBits(13);
            let assembledTwoBytes = ((twoBytes / 0x0C0) << 8) | (twoBytes % 0x0C0);
            if (assembledTwoBytes < 0x01F00) {
                // In the 0x8140 to 0x9FFC range
                assembledTwoBytes += 0x08140;
            } else {
                // In the 0xE040 to 0xEBBF range
                assembledTwoBytes += 0x0C140;
            }
            result += String.fromCharCode(assembledTwoBytes);
            count--;
        }

        return result;
    }

    private static decodeByteSegment(bits: BitSource,
                                     count: number,
                                     byteSegments: number[][]): string {
        let result: string = '';

        // Don't crash trying to read more bits than we have available.
        if (8 * count > bits.available()) {
            throw new FormatError();
        }

        const readBytes: number[] = [];
        for (let i = 0; i < count; i++) {
            readBytes[i] = Math.floor(bits.readBits(8));
            result += String.fromCharCode(readBytes[i]);
        }
        byteSegments.push(readBytes);

        return result;
    }

    private static toAlphaNumericChar(value: number): string {
        if (value >= DecodedBitStreamParser.ALPHANUMERIC_CHARS.length) {
            throw new FormatError();
        }
        return DecodedBitStreamParser.ALPHANUMERIC_CHARS[value];
    }

    private static  decodeAlphanumericSegment(bits: BitSource,
                                              count: number,
                                              fc1InEffect: boolean): string {
        let result: string = '';

        // Read two characters at a time
        const start = result.length;
        while (count > 1) {
            if (bits.available() < 11) {
                throw new FormatError();
            }
            const nextTwoCharsBits = bits.readBits(11);
            result += DecodedBitStreamParser.toAlphaNumericChar(nextTwoCharsBits / 45);
            result += DecodedBitStreamParser.toAlphaNumericChar(nextTwoCharsBits % 45);
            count -= 2;
        }
        if (count == 1) {
            // special case: one character left
            if (bits.available() < 6) {
                throw new FormatError();
            }
            result += DecodedBitStreamParser.toAlphaNumericChar(bits.readBits(6));
        }
        // See section 6.4.8.1, 6.4.8.2
        if (fc1InEffect) {
            // We need to massage the result a bit if in an FNC1 mode:
            for (let i = start; i < result.length; i++) {
                if (result.charAt(i) == '%') {
                    if (i < result.length - 1 && result.charAt(i + 1) == '%') {
                        // %% is rendered as %
                        let firstHalf = result.slice(0, i);
                        let lastHalf = result.slice(i + 2, result.length);
                        result = firstHalf + lastHalf;
                        // result.deleteCharAt(i + 1);
                    } else {
                        // In alpha mode, % should be converted to FNC1 separator 0x1D
                        // result.setCharAt(i, (char)0x1D);
                        let firstHalf = result.slice(0, i - i);
                        let lastHalf = result.slice(i + 1, result.length);
                        result = firstHalf + String.fromCharCode(0x1D) + lastHalf;
                    }
                }
            }
        }
        return result;
    }

    private static decodeNumericSegment(bits: BitSource,
                                        count: number): string {
        let result: string = '';

        // Read three digits at a time
        while (count >= 3) {
            // Each 10 bits encodes three digits
            if (bits.available() < 10) {
                throw new FormatError();
            }
            const threeDigitsBits = bits.readBits(10);
            if (threeDigitsBits >= 1000) {
                throw new FormatError();
            }
            result += DecodedBitStreamParser.toAlphaNumericChar(threeDigitsBits / 100);
            result += DecodedBitStreamParser.toAlphaNumericChar((threeDigitsBits / 10) % 10);
            result += DecodedBitStreamParser.toAlphaNumericChar(threeDigitsBits % 10);
            count -= 3;
        }
        if (count == 2) {
            // Two digits left over to read, encoded in 7 bits
            if (bits.available() < 7) {
                throw new FormatError();
            }
            const twoDigitsBits = bits.readBits(7);
            if (twoDigitsBits >= 100) {
                throw new FormatError();
            }
            result += DecodedBitStreamParser.toAlphaNumericChar(twoDigitsBits / 10);
            result += DecodedBitStreamParser.toAlphaNumericChar(twoDigitsBits % 10);
        } else if (count == 1) {
            // One digit left over to read
            if (bits.available() < 4) {
                throw new FormatError();
            }
            const digitBits = bits.readBits(4);
            if (digitBits >= 10) {
                throw new FormatError();
            }
            result += DecodedBitStreamParser.toAlphaNumericChar(digitBits);
        }

        return result;
    }
}
