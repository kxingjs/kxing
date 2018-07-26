import { expect } from "chai";
import Version from "../Version";
import IllegalArgumentError from "../../../error/IllegalArgumentError";
import {
  forBits,
  TerminatorMode,
  NumericMode,
  AlphaNumericMode,
  ByteMode,
  KanjiMode
} from "../Mode";

describe("Mode", function() {
  describe("testForBits", function() {
    it("can find mode by bits", function() {
      expect(forBits(0x00)).to.be.instanceof(TerminatorMode);
      expect(forBits(0x01)).to.be.instanceof(NumericMode);
      expect(forBits(0x02)).to.be.instanceOf(AlphaNumericMode);
      expect(forBits(0x04)).to.be.instanceof(ByteMode);
      expect(forBits(0x08)).to.be.instanceof(KanjiMode);
    });

    it("should throw error with illegal bits", function() {
      expect(function() {
        forBits(0x10);
      }).to.throw(IllegalArgumentError);
    });
  });
  describe("testCharacterCount", function() {
    it("should return character count with QRcode version.", function() {
      expect(10).to.be.equal(
        new NumericMode().getCharacterCountBits(Version.getVersionForNumber(5))
      );
      expect(12).to.be.equal(
        new NumericMode().getCharacterCountBits(Version.getVersionForNumber(26))
      );
      expect(14).to.be.equal(
        new NumericMode().getCharacterCountBits(Version.getVersionForNumber(40))
      );
      expect(9).to.be.equal(
        new AlphaNumericMode().getCharacterCountBits(
          Version.getVersionForNumber(6)
        )
      );
      expect(8).to.be.equal(
        new ByteMode().getCharacterCountBits(Version.getVersionForNumber(7))
      );
      expect(8).to.be.equal(
        new KanjiMode().getCharacterCountBits(Version.getVersionForNumber(8))
      );
    });
  });
});
