import { expect } from "chai";
import BitSource from "../../src/common/BitSource";

describe("BitSource", function() {
  describe("testSource", function() {
    const bytes: number[] = [1, 2, 3, 4, 5];
    const source: BitSource = new BitSource(bytes);

    it("can be read successfully.", function() {
      expect(40).to.be.equal(source.available());
      expect(0).to.be.equal(source.readBits(1));
      expect(39).to.be.equal(source.available());
      expect(0).to.be.equal(source.readBits(6));
      expect(33).to.be.equal(source.available());
      expect(1).to.be.equal(source.readBits(1));
      expect(32).to.be.equal(source.available());
      expect(2).to.be.equal(source.readBits(8));
      expect(24).to.be.equal(source.available());
      expect(12).to.be.equal(source.readBits(10));
      expect(14).to.be.equal(source.available());
      expect(16).to.be.equal(source.readBits(8));
      expect(6).to.be.equal(source.available());
      expect(5).to.be.equal(source.readBits(6));
      expect(0).to.be.equal(source.available());
    });
  });
});
