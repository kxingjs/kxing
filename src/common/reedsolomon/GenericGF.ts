import GenericGFPoly from "./GenericGFPoly";
import IllegalArgumentError from "../../error/IllegalArgumentError";

/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/common/reedsolomon/GenericGF.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class GenericGF {
  private _expTable = [];
  private _logTable = [];
  private _zero: GenericGFPoly;
  private _one: GenericGFPoly;
  private _size: number;
  private _generatorBase: number;

  /**
   * Create a representation of GF(size) using the given primitive polynomial.
   *
   * @param primitive irreducible polynomial whose coefficients are represented by
   *  the bits of an int, where the least-significant bit represents the constant
   *  coefficient
   * @param size the size of the field
   * @param b the factor b in the generator polynomial can be 0- or 1-based
   *  (g(x) = (x+a^b)(x+a^(b+1))...(x+a^(b+2t-1))).
   *  In most cases it should be 1, but for QR code it is 0.
   */
  constructor(primitive: number, size?: number, b?: number) {
    this._size = size;
    this._generatorBase = b;

    let x = 1;
    for (let i = 0; i < size; i++) {
      this._expTable[i] = x;
      x *= 2;
      if (x >= size) {
        x ^= primitive;
        x &= size - 1;
      }
    }
    for (let i = 0; i < size - 1; i++) {
      this._logTable[this._expTable[i]] = i;
    }
    this._zero = new GenericGFPoly(this, [0]);
    this._one = new GenericGFPoly(this, [1]);
  }

  get zero() {
    return this._zero;
  }

  get one() {
    return this._one;
  }

  get generatorBase(): number {
    return this._generatorBase;
  }

  get size(): number {
    return this._size;
  }

  /**
   * @return the monomial representing coefficient * x^degree
   */
  buildMonomial(degree: number, coefficient: number): GenericGFPoly {
    if (degree < 0) {
      throw new IllegalArgumentError();
    }
    if (coefficient == 0) {
      return this._zero;
    }
    const coefficients = [];
    coefficients[0] = coefficient;
    return new GenericGFPoly(this, coefficients);
  }

  /**
   * Implements both addition and subtraction -- they are the same in GF(size).
   *
   * @return sum/difference of a and b
   */
  static addOrSubtract(a: number, b: number): number {
    return a ^ b;
  }

  /**
   * @return 2 to the power of a in GF(size)
   */
  exp(a: number): number {
    return this._expTable[a];
  }

  /**
   * @return base 2 log of a in GF(size)
   */
  log(a: number): number {
    if (a == 0) {
      throw new IllegalArgumentError();
    }
    return this._logTable[a];
  }

  /**
   * @return multiplicative inverse of a
   */
  inverse(a: number): number {
    if (a == 0) {
      throw new IllegalArgumentError();
    }
    return this._expTable[255 - this._logTable[a]];
  }

  multiply(a: number, b: number): number {
    if (a == 0 || b == 0) {
      return 0;
    }
    return this._expTable[
      (this._logTable[a] + this._logTable[b]) % (this._size - 1)
    ];
  }

  static get QR_CODE_FIELD_256(): GenericGF {
    return new GenericGF(0x011d, 256, 0);
  }
}
