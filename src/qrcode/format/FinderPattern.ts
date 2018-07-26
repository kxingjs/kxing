import { FunctionPattern } from "./FunctionPattern";

export default class FinderPattern extends FunctionPattern {
  constructor(x: number, y: number, estimatedModuleSize: number) {
    super(x, y, estimatedModuleSize);
  }
}
