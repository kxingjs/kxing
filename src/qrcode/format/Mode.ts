import Version from "../format/Version";
import IllegalArgumentError from "../../error/IllegalArgumentError";

/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/decoder/Mode.java}
 *
 * @author Tatsuya Yamamoto
 */
export abstract class Mode {
  private _characterCountBitsForVersions: number[];
  private _bits: number;

  constructor(characterCountBitsForVersions: number[], bits: number) {
    this._characterCountBitsForVersions = characterCountBitsForVersions;
    this._bits = bits;
  }

  get characterCountBits(): number[] {
    return this._characterCountBitsForVersions;
  }

  get bits(): number {
    return this._bits;
  }

  /**
   * @param version version in question
   * @return number of bits used, in this QR Code symbol {@link Version}, to encode the
   *         count of characters that will follow encoded in this Mode
   */
  public getCharacterCountBits(version: Version): number {
    const number = version.versionNumber;
    let offset;
    if (number <= 9) {
      offset = 0;
    } else if (number <= 26) {
      offset = 1;
    } else {
      offset = 2;
    }
    return this._characterCountBitsForVersions[offset];
  }
}

export class TerminatorMode extends Mode {
  public static CHARACTER_COUNT_BITS: number[] = [0, 0, 0];
  public static BITS: number = 0x00;

  constructor() {
    super(TerminatorMode.CHARACTER_COUNT_BITS, TerminatorMode.BITS);
  }
}

export class NumericMode extends Mode {
  public static CHARACTER_COUNT_BITS: number[] = [10, 12, 14];
  public static BITS: number = 0x01;

  constructor() {
    super(NumericMode.CHARACTER_COUNT_BITS, NumericMode.BITS);
  }
}

export class AlphaNumericMode extends Mode {
  public static CHARACTER_COUNT_BITS: number[] = [9, 11, 13];
  public static BITS: number = 0x02;

  constructor() {
    super(AlphaNumericMode.CHARACTER_COUNT_BITS, AlphaNumericMode.BITS);
  }
}
export class StructuredAppendMode extends Mode {
  public static CHARACTER_COUNT_BITS: number[] = [0, 0, 0];
  public static BITS: number = 0x03;

  constructor() {
    super(StructuredAppendMode.CHARACTER_COUNT_BITS, StructuredAppendMode.BITS);
  }
}
export class ByteMode extends Mode {
  public static CHARACTER_COUNT_BITS: number[] = [8, 16, 16];
  public static BITS: number = 0x04;

  constructor() {
    super(ByteMode.CHARACTER_COUNT_BITS, ByteMode.BITS);
  }
}
export class EciMode extends Mode {
  public static CHARACTER_COUNT_BITS: number[] = [0, 0, 0];
  public static BITS: number = 0x07;

  constructor() {
    super(EciMode.CHARACTER_COUNT_BITS, EciMode.BITS);
  }
}
export class KanjiMode extends Mode {
  public static CHARACTER_COUNT_BITS: number[] = [8, 10, 12];
  public static BITS: number = 0x08;

  constructor() {
    super(KanjiMode.CHARACTER_COUNT_BITS, KanjiMode.BITS);
  }
}
export class Fnc1FirstPositionMode extends Mode {
  public static CHARACTER_COUNT_BITS: number[] = [0, 0, 0];
  public static BITS: number = 0x05;

  constructor() {
    super(
      Fnc1FirstPositionMode.CHARACTER_COUNT_BITS,
      Fnc1FirstPositionMode.BITS
    );
  }
}
export class Fnc1SecondPositionMode extends Mode {
  public static CHARACTER_COUNT_BITS: number[] = [0, 0, 0];
  public static BITS: number = 0x09;

  constructor() {
    super(
      Fnc1SecondPositionMode.CHARACTER_COUNT_BITS,
      Fnc1SecondPositionMode.BITS
    );
  }
}
export class HanziMode extends Mode {
  public static CHARACTER_COUNT_BITS: number[] = [8, 10, 12];
  public static BITS: number = 0x0d;

  constructor() {
    super(HanziMode.CHARACTER_COUNT_BITS, HanziMode.BITS);
  }
}

/**
 * @param bits four bits encoding a QR Code data mode
 * @return Mode encoded by these bits
 * @throws IllegalArgumentException if bits do not correspond to a known mode
 */
export function forBits(bits: number): Mode {
  switch (bits) {
    case 0x0:
      return new TerminatorMode();
    case 0x1:
      return new NumericMode();
    case 0x2:
      return new AlphaNumericMode();
    case 0x3:
      return new StructuredAppendMode();
    case 0x4:
      return new ByteMode();
    case 0x5:
      return new Fnc1FirstPositionMode();
    case 0x7:
      return new EciMode();
    case 0x8:
      return new KanjiMode();
    case 0x9:
      return new Fnc1SecondPositionMode();
    case 0xd:
      // 0xD is defined in GBT 18284-2000, may not be supported in foreign country
      return new HanziMode();
    default:
      throw new IllegalArgumentError();
  }
}
