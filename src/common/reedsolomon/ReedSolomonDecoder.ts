import GenericGFPoly from "./GenericGFPoly";
import GenericGF from "./GenericGF";
import ReedSolomonError from "../../error/ReedSolomonError";

/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/common/reedsolomon/ReedSolomonDecoder.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class ReedSolomonDecoder {
  private _field: GenericGF;

  constructor(field: GenericGF) {
    this._field = field;
  }

  /**
   * <p>Decodes given set of received codewords, which include both data and error-correction
   * codewords. Really, this means it uses Reed-Solomon to detect and correct errors, in-place,
   * in the input.</p>
   *
   * @param received data and error-correction codewords
   * @param twoS number of error-correction codewords available
   * @throws ReedSolomonException if decoding fails for any reason
   */
  decode(received: number[], twoS: number): void {
    const poly: GenericGFPoly = new GenericGFPoly(this._field, received);
    const syndromeCoefficients: number[] = [];
    let noError: boolean = true;
    for (let i = 0; i < twoS; i++) {
      const evaluate = poly.evaluateAt(
        this._field.exp(i + this._field.generatorBase)
      );
      syndromeCoefficients[syndromeCoefficients.length - 1 - i] = evaluate;
      if (evaluate != 0) {
        noError = false;
      }
    }
    if (noError) {
      return;
    }

    const syndrome: GenericGFPoly = new GenericGFPoly(
      this._field,
      syndromeCoefficients
    );
    const sigmaOmega: GenericGFPoly[] = this.runEuclideanAlgorithm(
      this._field.buildMonomial(twoS, 1),
      syndrome,
      twoS
    );
    const sigma: GenericGFPoly = sigmaOmega[0];
    const omega: GenericGFPoly = sigmaOmega[1];
    const errorLocations: number[] = this.findErrorLocations(sigma);
    const errorMagnitudes: number[] = this.findErrorMagnitudes(
      omega,
      errorLocations
    );
    for (let i = 0; i < errorLocations.length; i++) {
      const position = received.length - 1 - this._field.log(errorLocations[i]);
      if (position < 0) {
        throw new ReedSolomonError("Bad error location");
      }
      received[position] = GenericGF.addOrSubtract(
        received[position],
        errorMagnitudes[i]
      );
    }
  }

  private runEuclideanAlgorithm(
    a: GenericGFPoly,
    b: GenericGFPoly,
    R: number
  ): GenericGFPoly[] {
    if (a.degree < b.degree) {
      const temp: GenericGFPoly = a;
      a = b;
      b = temp;
    }

    let rLast: GenericGFPoly = a;
    let r: GenericGFPoly = b;
    let tLast: GenericGFPoly = this._field.zero;
    let t: GenericGFPoly = this._field.one;

    while (r.degree >= R / 2) {
      const rLastLast: GenericGFPoly = rLast;
      const tLastLast: GenericGFPoly = tLast;
      rLast = r;
      tLast = t;

      if (rLast.isZero()) {
        throw new ReedSolomonError("r_{i-1} was zero");
      }
      r = rLastLast;
      let q: GenericGFPoly = this._field.zero;
      const denominatorLeadingTerm: number = rLast.getCoefficient(rLast.degree);
      const dltInverse: number = this._field.inverse(denominatorLeadingTerm);
      while (r.degree >= rLast.degree && !r.isZero()) {
        const degreeDiff: number = r.degree - rLast.degree;
        const scale: number = this._field.multiply(
          r.getCoefficient(r.degree),
          dltInverse
        );
        q = q.addOrSubtract(this._field.buildMonomial(degreeDiff, scale));
        r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
      }

      t = q.multiply(tLast).addOrSubtract(tLastLast);

      if (r.degree >= rLast.degree) {
        throw new Error("Division algorithm failed to reduce polynomial?");
      }
    }

    const sigmaTildeAtZero: number = t.getCoefficient(0);
    if (sigmaTildeAtZero == 0) {
      throw new ReedSolomonError("sigmaTilde(0) was zero");
    }

    const inverse: number = this._field.inverse(sigmaTildeAtZero);
    const sigma: GenericGFPoly = t.multiplyWithScalar(inverse);
    const omega: GenericGFPoly = r.multiplyWithScalar(inverse);
    return [sigma, omega];
  }

  findErrorLocations(errorLocator: GenericGFPoly): number[] {
    const numErrors: number = errorLocator.degree;
    if (numErrors == 1) {
      return [errorLocator.getCoefficient(1)];
    }
    const result: number[] = [];
    let e: number = 0;
    for (let i = 1; i < this._field.size && e < numErrors; i++) {
      if (errorLocator.evaluateAt(i) == 0) {
        result[e] = this._field.inverse(i);
        e++;
      }
    }
    if (e != numErrors) {
      throw new ReedSolomonError(
        "Error locator degree does not match number of roots"
      );
    }
    return result;
  }

  private findErrorMagnitudes(
    errorEvaluator: GenericGFPoly,
    errorLocations: number[]
  ) {
    const s = errorLocations.length;
    const result: number[] = [];
    for (let i = 0; i < s; i++) {
      const xiInverse: number = this._field.inverse(errorLocations[i]);
      let denominator: number = 1;
      for (let j = 0; j < s; j++) {
        if (i != j) {
          const term: number = this._field.multiply(
            errorLocations[j],
            xiInverse
          );
          const termPlus1: number = (term & 0x1) == 0 ? term | 1 : term & ~1;
          denominator = this._field.multiply(denominator, termPlus1);
        }
      }
      result[i] = this._field.multiply(
        errorEvaluator.evaluateAt(xiInverse),
        this._field.inverse(denominator)
      );
      if (this._field.generatorBase != 0) {
        result[i] = this._field.multiply(result[i], xiInverse);
      }
    }
    return result;
  }
}
