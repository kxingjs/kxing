import IllegalArgumentError from "../error/IllegalArgumentError";

/**
 * Porting form {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/common/BitMatrix.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class BitMatrix {
  private _width: number = 0;
  private _height: number = 0;
  private _rowSize: number = 0;
  private _bits: number[] = [];

  constructor(width: number, height?: number) {
    this._width = width;
    this._height = height ? height : width;
    if (width < 1 || height < 1) {
      throw new IllegalArgumentError("Both dimensions must be greater than 0");
    }

    this._rowSize = Math.floor((width + 31) / 32);
  }

  get width(): number {
    return this._width;
  }
  get height(): number {
    return this._height;
  }
  get rowSize(): number {
    return this._rowSize;
  }
  get bits(): number[] {
    return this._bits;
  }

  set bits(bits: number[]) {
    this._bits = bits;
  }

  /**
   * <p>Gets the requested bit, where true means black.</p>
   *
   * @param x The horizontal component (i.e. which column)
   * @param y The vertical component (i.e. which row)
   * @return value of given bit in matrix
   */
  getBit(x: number, y: number): boolean {
    const offset = Math.floor(y * this._rowSize + x / 32);
    return ((this._bits[offset] >>> (x & 0x1f)) & 1) != 0;
  }

  /**
   * <p>Sets the given bit to true.</p>
   *
   * @param x The horizontal component (i.e. which column)
   * @param y The vertical component (i.e. which row)
   */
  setBit(x: number, y: number): void {
    const offset = Math.floor(y * this._rowSize + x / 32);
    this._bits[offset] |= 1 << (x & 0x1f);
  }

  /**
   * <p>Flips the given bit.</p>
   *
   * @param x The horizontal component (i.e. which column)
   * @param y The vertical component (i.e. which row)
   */
  flip(x: number, y: number): void {
    const offset = Math.floor(y * this._rowSize + x / 32);
    this._bits[offset] ^= 1 << (x & 0x1f);
  }

  /**
   * <p>Sets a square region of the bit matrix to true.</p>
   *
   * @param left The horizontal position to begin at (inclusive)
   * @param top The vertical position to begin at (inclusive)
   * @param width The width of the region
   * @param height The height of the region
   */
  setRegion(left: number, top: number, width: number, height: number): void {
    if (top < 0 || left < 0) {
      throw new IllegalArgumentError("Left and top must be nonnegative");
    }
    if (height < 1 || width < 1) {
      throw new IllegalArgumentError("Height and width must be at least 1");
    }
    const right = left + width;
    const bottom = top + height;
    if (bottom > this._height || right > this._width) {
      throw new IllegalArgumentError("The region must fit inside the matrix");
    }
    for (let y = top; y < bottom; y++) {
      const offset = y * this._rowSize;
      for (let x = left; x < right; x++) {
        this._bits[Math.floor(offset + x / 32)] |= 1 << (x & 0x1f);
      }
    }
  }
}
