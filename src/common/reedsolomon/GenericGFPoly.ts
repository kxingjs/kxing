import GenericGF from "./GenericGF";
import IllegalArgumentError from "../../error/IllegalArgumentError";
import { arraycopy } from "../Utils";

/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/common/reedsolomon/GenericGFPoly.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class GenericGFPoly {
  private _field: GenericGF;
  private _coefficients: number[];

  constructor(field: GenericGF, coefficients: number[]) {
    if (coefficients.length == 0) {
      throw new IllegalArgumentError();
    }
    this._field = field;
    const coefficientsLength = coefficients.length;
    if (coefficientsLength > 1 && coefficients[0] == 0) {
      let firstNonZero = 1;
      while (
        firstNonZero < coefficientsLength &&
        coefficients[firstNonZero] == 0
      ) {
        firstNonZero++;
      }
      if (firstNonZero == coefficientsLength) {
        this._coefficients = [0];
      } else {
        this._coefficients = [];
        arraycopy(
          coefficients,
          firstNonZero,
          this._coefficients,
          0,
          this._coefficients.length
        );
      }
    } else {
      this._coefficients = coefficients;
    }
  }

  get coefficients() {
    return this._coefficients;
  }

  /**
   * @return degree of this polynomial
   */
  get degree(): number {
    return this._coefficients.length - 1;
  }

  /**
   * @return true iff this polynomial is the monomial "0"
   */
  isZero(): boolean {
    return this._coefficients[0] == 0;
  }

  get field(): GenericGF {
    return this._field;
  }

  /**
   * @return coefficient of x^degree term in this polynomial
   */
  getCoefficient(degree: number): number {
    return this._coefficients[this._coefficients.length - 1 - degree];
  }

  /**
   * @return evaluation of this polynomial at a given point
   */
  evaluateAt(a: number): number {
    if (a == 0) {
      return this.getCoefficient(0);
    }
    const size = this._coefficients.length;
    if (a == 1) {
      let result = 0;
      for (let i = 0; i < size; i++) {
        result = GenericGF.addOrSubtract(result, this._coefficients[i]);
      }
      return result;
    }

    let result = this._coefficients[0];
    for (let i = 1; i < size; i++) {
      result = GenericGF.addOrSubtract(
        this._field.multiply(a, result),
        this._coefficients[i]
      );
    }
    return result;
  }

  addOrSubtract(other: GenericGFPoly): GenericGFPoly {
    if (this._field != other.field) {
      throw new IllegalArgumentError(
        "GenericGFPolys do not have same GenericGF field"
      );
    }
    if (this.isZero()) {
      return other;
    }
    if (other.isZero()) {
      return this;
    }

    let smallerCoefficients: number[] = this._coefficients;
    let largerCoefficients: number[] = other.coefficients;
    if (smallerCoefficients.length > largerCoefficients.length) {
      const temp: number[] = smallerCoefficients;
      smallerCoefficients = largerCoefficients;
      largerCoefficients = temp;
    }

    const sumDiff: number[] = [];
    const lengthDiff: number =
      largerCoefficients.length - smallerCoefficients.length;
    arraycopy(largerCoefficients, 0, sumDiff, 0, lengthDiff);

    for (let i = lengthDiff; i < largerCoefficients.length; i++) {
      sumDiff[i] = GenericGF.addOrSubtract(
        smallerCoefficients[i - lengthDiff],
        largerCoefficients[i]
      );
    }

    return new GenericGFPoly(this._field, sumDiff);
  }

  multiply(other: GenericGFPoly): GenericGFPoly {
    if (this._field != other.field) {
      throw new IllegalArgumentError(
        "GenericGFPolys do not have same GenericGF field"
      );
    }
    if (this.isZero() || other.isZero()) {
      return this._field.zero;
    }

    const aCoefficients: number[] = this._coefficients;
    const aLength: number = aCoefficients.length;
    const bCoefficients: number[] = other.coefficients;
    const bLength: number = bCoefficients.length;
    const product: number[] = [];
    for (let i = 0; i < aLength; i++) {
      const aCoeff = aCoefficients[i];
      for (let j = 0; j < bLength; j++) {
        product[i + j] = GenericGF.addOrSubtract(
          product[i + j],
          this._field.multiply(aCoeff, bCoefficients[j])
        );
      }
    }
    return new GenericGFPoly(this._field, product);
  }

  multiplyWithScalar(scalar: number): GenericGFPoly {
    if (scalar == 0) {
      return this._field.zero;
    }
    if (scalar == 1) {
      return this;
    }
    const size = this._coefficients.length;
    const product = new Array(size);
    for (let i = 0; i < size; i++) {
      product[i] = this._field.multiply(this._coefficients[i], scalar);
    }
    return new GenericGFPoly(this._field, product);
  }

  multiplyByMonomial(degree: number, coefficient: number): GenericGFPoly {
    if (degree < 0) {
      throw new IllegalArgumentError();
    }
    if (coefficient == 0) {
      return this._field.zero;
    }
    const size: number = this._coefficients.length;
    const product: number[] = [];
    for (let i = 0; i < product.length; i++) product[i] = 0;
    for (let i = 0; i < size; i++) {
      product[i] = this._field.multiply(this._coefficients[i], coefficient);
    }
    return new GenericGFPoly(this._field, product);
  }

  divide(other: GenericGFPoly): GenericGFPoly[] {
    if (this._field != other.field) {
      throw new IllegalArgumentError(
        "GenericGFPolys do not have same GenericGF field"
      );
    }
    if (other.isZero()) {
      throw new IllegalArgumentError("Divide by 0");
    }

    let quotient: GenericGFPoly = this._field.zero;
    let remainder: GenericGFPoly = this;

    const denominatorLeadingTerm: number = other.getCoefficient(other.degree);
    const inverseDenominatorLeadingTerm: number = this._field.inverse(
      denominatorLeadingTerm
    );

    while (remainder.degree >= other.degree && !remainder.isZero()) {
      const degreeDifference = remainder.degree - other.degree;
      const scale: number = this._field.multiply(
        remainder.getCoefficient(remainder.degree),
        inverseDenominatorLeadingTerm
      );
      const term: GenericGFPoly = other.multiplyByMonomial(
        degreeDifference,
        scale
      );
      const iterationQuotient: GenericGFPoly = this._field.buildMonomial(
        degreeDifference,
        scale
      );
      quotient = quotient.addOrSubtract(iterationQuotient);
      remainder = remainder.addOrSubtract(term);
    }

    return [quotient, remainder];
  }
}
