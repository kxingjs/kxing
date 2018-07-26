import { FunctionPattern } from "./FunctionPattern";

export default class AlignmentPattern extends FunctionPattern {
  constructor(x: number, y: number, estimatedModuleSize: number) {
    super(x, y, estimatedModuleSize);
  }

  combineEstimate(
    i: number,
    j: number,
    newModuleSize: number
  ): AlignmentPattern {
    const combinedX = (this.x + j) / 2.0;
    const combinedY = (this.y + i) / 2.0;
    const combinedModuleSize = (this.estimatedModuleSize + newModuleSize) / 2.0;
    return new AlignmentPattern(combinedX, combinedY, combinedModuleSize);
  }
}
