/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/decoder/FormatInformation.java}
 *
 * @author Tatsuya Yamamoto
 */
import { ErrorCorrectionLevel, forBits } from "./ErrorCorrectionLevel";
import { DataMask } from "./DataMask";
import { bitCount } from "../../common/Utils";

const FORMAT_INFO_MASK_QR = 0x5412;
const FORMAT_INFO_DECODE_LOOKUP: number[][] = [
  [0x5412, 0x00],
  [0x5125, 0x01],
  [0x5e7c, 0x02],
  [0x5b4b, 0x03],
  [0x45f9, 0x04],
  [0x40ce, 0x05],
  [0x4f97, 0x06],
  [0x4aa0, 0x07],
  [0x77c4, 0x08],
  [0x72f3, 0x09],
  [0x7daa, 0x0a],
  [0x789d, 0x0b],
  [0x662f, 0x0c],
  [0x6318, 0x0d],
  [0x6c41, 0x0e],
  [0x6976, 0x0f],
  [0x1689, 0x10],
  [0x13be, 0x11],
  [0x1ce7, 0x12],
  [0x19d0, 0x13],
  [0x0762, 0x14],
  [0x0255, 0x15],
  [0x0d0c, 0x16],
  [0x083b, 0x17],
  [0x355f, 0x18],
  [0x3068, 0x19],
  [0x3f31, 0x1a],
  [0x3a06, 0x1b],
  [0x24b4, 0x1c],
  [0x2183, 0x1d],
  [0x2eda, 0x1e],
  [0x2bed, 0x1f]
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

  static decodeFormatInformation(
    maskedFormatInfo1: number,
    maskedFormatInfo2?: number
  ): FormatInformation {
    const formatInfo = FormatInformation.doDecodeFormatInformation(
      maskedFormatInfo1,
      maskedFormatInfo2
    );
    if (formatInfo != null) {
      return formatInfo;
    }
    return FormatInformation.doDecodeFormatInformation(
      maskedFormatInfo1 ^ FORMAT_INFO_MASK_QR,
      maskedFormatInfo2 ^ FORMAT_INFO_MASK_QR
    );
  }

  static doDecodeFormatInformation(
    maskedFormatInfo1: number,
    maskedFormatInfo2?: number
  ): FormatInformation {
    let bestDifference = INTEGER_MAX_VALUE;
    let bestFormatInfo = 0;

    for (let i = 0; i < FORMAT_INFO_DECODE_LOOKUP.length; i++) {
      const decodeInfo = FORMAT_INFO_DECODE_LOOKUP[i];
      const targetInfo = decodeInfo[0];
      if (targetInfo == maskedFormatInfo1 || targetInfo == maskedFormatInfo2) {
        return new FormatInformation(decodeInfo[1]);
      }

      let bitsDifference = FormatInformation.numBitsDiffering(
        maskedFormatInfo1,
        targetInfo
      );

      if (bitsDifference < bestDifference) {
        bestFormatInfo = decodeInfo[1];
        bestDifference = bitsDifference;
      }

      if (maskedFormatInfo1 != maskedFormatInfo2) {
        // also try the other option
        bitsDifference = FormatInformation.numBitsDiffering(
          maskedFormatInfo2,
          targetInfo
        );
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
