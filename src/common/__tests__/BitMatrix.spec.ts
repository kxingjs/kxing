import { expect } from "chai";
import BitMatrix from "../BitMatrix";
import IllegalArgumentError from "../../error/IllegalArgumentError";

describe("BitMatrix", function() {
  describe("constructor()", function() {
    it("can set width, and height with demension.", function() {
      const matrix: BitMatrix = new BitMatrix(33);
      expect(matrix.height).to.equal(33);
    });
    it("should greater than 0.", function() {
      expect(function() {
        new BitMatrix(29, 0);
      }).to.throw(IllegalArgumentError);
    });
  });

  describe("setBit(), getBit()", function() {
    it("should return value that set bits.", function() {
      const matrix: BitMatrix = new BitMatrix(33);

      for (let y = 0; y < 33; y++) {
        for (let x = 0; x < 33; x++) {
          if ((y * x) % 3 == 0) {
            matrix.setBit(x, y);
          }
        }
      }
      for (let y = 0; y < 33; y++) {
        for (let x = 0; x < 33; x++) {
          expect(matrix.getBit(x, y)).to.be.equal((y * x) % 3 == 0);
        }
      }
    });
  });
  describe("setRegion()", function() {
    it("should be", function() {
      const matrix: BitMatrix = new BitMatrix(5);
      matrix.setRegion(1, 1, 3, 3);
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          expect(matrix.getBit(x, y)).to.be.equal(
            y >= 1 && y <= 3 && x >= 1 && x <= 3
          );
        }
      }
    });
  });
});
