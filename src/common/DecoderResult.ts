import { ErrorCorrectionLevel } from "../qrcode/format/ErrorCorrectionLevel";

/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/common/DecoderResult.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class DecoderResult {
  private _rawBytes: number[];
  private _numBits: number;
  private _text: string;
  private _byteSegments: number[][];
  private _ecLevel: ErrorCorrectionLevel;
  private _errorsCorrected: number;
  private _erasures: number;
  private _other: any;
  private _structuredAppendParity: number;
  private _structuredAppendSequenceNumber: number;

  public constructor(
    rawBytes: number[],
    text: string,
    byteSegments: number[][],
    ecLevel: ErrorCorrectionLevel,
    saSequence?: number,
    saParity?: number
  ) {
    this._rawBytes = rawBytes;
    this._numBits = rawBytes == null ? 0 : 8 * rawBytes.length;
    this._text = text;
    this._byteSegments = byteSegments;
    this._ecLevel = ecLevel;
    this._structuredAppendParity = saParity ? saParity : -1;
    this._structuredAppendSequenceNumber = saSequence ? saSequence : -1;
  }

  /**
   * @return raw bytes representing the result, or {@code null} if not applicable
   */
  public get rawBytes(): number[] {
    return this._rawBytes;
  }

  /**
   * @return how many bits of {@link #getRawBytes()} are valid; typically 8 times its length
   * @since 3.3.0
   */
  public get numBits(): number {
    return this._numBits;
  }

  /**
   * @param numBits overrides the number of bits that are valid in {@link #getRawBytes()}
   * @since 3.3.0
   */
  public set numBits(numBits: number) {
    this._numBits = numBits;
  }

  /**
   * @return text representation of the result
   */
  public get text(): string {
    return this._text;
  }

  /**
   * @return list of byte segments in the result, or {@code null} if not applicable
   */
  public get byteSegments(): number[][] {
    return this._byteSegments;
  }

  /**
   * @return name of error correction level used, or {@code null} if not applicable
   */
  public get ecLevel(): ErrorCorrectionLevel {
    return this._ecLevel;
  }

  /**
   * @return number of errors corrected, or {@code null} if not applicable
   */
  public get errorsCorrected(): number {
    return this._errorsCorrected;
  }

  public set errorsCorrected(errorsCorrected: number) {
    this._errorsCorrected = errorsCorrected;
  }

  /**
   * @return number of erasures corrected, or {@code null} if not applicable
   */
  public get erasures(): number {
    return this._erasures;
  }

  public set erasures(erasures: number) {
    this._erasures = erasures;
  }

  /**
   * @return arbitrary additional metadata
   */
  public get other(): any {
    return this._other;
  }

  public set other(other: any) {
    this._other = other;
  }

  public hasStructuredAppend(): boolean {
    return (
      this._structuredAppendParity >= 0 &&
      this._structuredAppendSequenceNumber >= 0
    );
  }

  public get structuredAppendParity(): number {
    return this._structuredAppendParity;
  }

  public get structuredAppendSequenceNumber(): number {
    return this._structuredAppendSequenceNumber;
  }
}
