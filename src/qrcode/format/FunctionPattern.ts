export abstract class FunctionPattern {
  private _x: number;
  private _y: number;
  private _estimatedModuleSize: number;
  private _count = 1;

  constructor(x: number, y: number, estimatedModuleSize: number) {
    this._x = x;
    this._y = y;
    this._estimatedModuleSize = estimatedModuleSize;
  }
  get x(): number {
    return this._x;
  }
  get y(): number {
    return this._y;
  }
  get count(): number {
    return this._count;
  }
  get estimatedModuleSize(): number {
    return this._estimatedModuleSize;
  }

  incrementCount() {
    this._count++;
  }

  aboutEquals(moduleSize, i, j) {
    if (
      Math.abs(i - this._y) <= moduleSize &&
      Math.abs(j - this._x) <= moduleSize
    ) {
      const moduleSizeDiff = Math.abs(moduleSize - this._estimatedModuleSize);
      return (
        moduleSizeDiff <= 1.0 ||
        moduleSizeDiff / this._estimatedModuleSize <= 1.0
      );
    }
    return false;
  }
}
