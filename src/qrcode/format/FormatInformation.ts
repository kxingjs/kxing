/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/decoder/FormatInformation.java}
 *
 * @author Tatsuya Yamamoto
 */
import {ErrorCorrectionLevel, forBits} from "./ErrorCorrectionLevel";
import {DataMask} from "./DataMask";
import {bitCount} from "../../common/Utils";

const FORMAT_INFO_MASK_QR = 0x5412;
const FORMAT_INFO_DECODE_LOOKUP:number[][] = [
    [0x5412, 0x00],
    [0x5125, 0x01],
    [0x5E7C, 0x02],
    [0x5B4B, 0x03],
    [0x45F9, 0x04],
    [0x40CE, 0x05],
    [0x4F97, 0x06],
    [0x4AA0, 0x07],
    [0x77C4, 0x08],
    [0x72F3, 0x09],
    [0x7DAA, 0x0A],
    [0x789D, 0x0B],
    [0x662F, 0x0C],
    [0x6318, 0x0D],
    [0x6C41, 0x0E],
    [0x6976, 0x0F],
    [0x1689, 0x10],
    [0x13BE, 0x11],
    [0x1CE7, 0x12],
    [0x19D0, 0x13],
    [0x0762, 0x14],
    [0x0255, 0x15],
    [0x0D0C, 0x16],
    [0x083B, 0x17],
    [0x355F, 0x18],
    [0x3068, 0x19],
    [0x3F31, 0x1A],
    [0x3A06, 0x1B],
    [0x24B4, 0x1C],
    [0x2183, 0x1D],
    [0x2EDA, 0x1E],
    [0x2BED, 0x1F]
];

const INTEGER_MAX_VALUE: number = 2147483647;

export default class FormatInformation {
    private _errorCorrectionLevel: ErrorCorrectionLevel;
    private _dataMask: DataMask;

    constructor(formatInfo) {
        this._errorCorrectionLevel = forBits((formatInfo >> 3) & 0x03);
        this._dataMask = DataMask.values()[formatInfo & 0x07];
    }

    get errorCorrectionLevel(): ErrorCorrectionLevel {
        return this._errorCorrectionLevel;
    }

    get dataMask(): DataMask {
        return this._dataMask;
    }

    static numBitsDiffering(a, b) {
        return bitCount(a ^ b);
    }

    static decodeFormatInformation(maskedFormatInfo1: number, maskedFormatInfo2?: number): FormatInformation {
        const formatInfo = FormatInformation.doDecodeFormatInformation(maskedFormatInfo1, maskedFormatInfo2);
        if (formatInfo != null) {
            return formatInfo;
        }
        return FormatInformation.doDecodeFormatInformation(
            maskedFormatInfo1 ^ FORMAT_INFO_MASK_QR,
            maskedFormatInfo2 ^ FORMAT_INFO_MASK_QR);
    }

    static doDecodeFormatInformation(maskedFormatInfo1: number, maskedFormatInfo2?: number): FormatInformation {
        let bestDifference = INTEGER_MAX_VALUE;
        let bestFormatInfo = 0;

        for (let i = 0; i < FORMAT_INFO_DECODE_LOOKUP.length; i++) {
            const decodeInfo = FORMAT_INFO_DECODE_LOOKUP[i];
            const targetInfo = decodeInfo[0];
            if (targetInfo == maskedFormatInfo1 || targetInfo == maskedFormatInfo2) {
                return new FormatInformation(decodeInfo[1]);
            }

            let bitsDifference = FormatInformation.numBitsDiffering(maskedFormatInfo1, targetInfo);

            if (bitsDifference < bestDifference) {
                bestFormatInfo = decodeInfo[1];
                bestDifference = bitsDifference;
            }

            if (maskedFormatInfo1 != maskedFormatInfo2) {
                // also try the other option
                bitsDifference = FormatInformation.numBitsDiffering(maskedFormatInfo2, targetInfo);
                if (bitsDifference < bestDifference) {
                    bestFormatInfo = decodeInfo[1];
                    bestDifference = bitsDifference;
                }
            }
        }

        if (bestDifference <= 3) {
            return new FormatInformation(bestFormatInfo);
        }
        return null;
    }
}
