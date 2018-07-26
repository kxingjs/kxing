import { expect } from "chai";
import { arraycopy } from "../Utils";

describe("Utils", () => {
  describe("#arraycopy()", () => {
    it("should return arraycopy result same as Java", () => {
      const src = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const dest = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
      const expectDest = [0, 1, 2, 3, 4, 15, 16, 17, 18, 19];

      arraycopy(src, 0, dest, 0, 5);

      dest.forEach(function(value, index) {
        expect(value).to.be.equal(expectDest[index]);
      });
    });

    it("should return arraycopy result same as Java", () => {
      const src = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const dest = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
      const expectDest = [10, 11, 3, 4, 5, 6, 16, 17, 18, 19];

      arraycopy(src, 3, dest, 2, 4);

      dest.forEach(function(value, index) {
        expect(value).to.be.equal(expectDest[index]);
      });
    });
  });
});
