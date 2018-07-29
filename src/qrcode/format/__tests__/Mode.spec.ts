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
      expect(forBits(0x00)).toBeInstanceOf(TerminatorMode);
      expect(forBits(0x01)).toBeInstanceOf(NumericMode);
      expect(forBits(0x02)).toBeInstanceOf(AlphaNumericMode);
      expect(forBits(0x04)).toBeInstanceOf(ByteMode);
      expect(forBits(0x08)).toBeInstanceOf(KanjiMode);
    });

    it("should throw error with illegal bits", function() {
      expect(function() {
        forBits(0x10);
      }).toThrow(IllegalArgumentError);
    });
  });
  describe("testCharacterCount", function() {
    it("should return character count with QRcode version.", function() {
      expect(10).toEqual(
        new NumericMode().getCharacterCountBits(Version.getVersionForNumber(5))
      );
      expect(12).toEqual(
        new NumericMode().getCharacterCountBits(Version.getVersionForNumber(26))
      );
      expect(14).toEqual(
        new NumericMode().getCharacterCountBits(Version.getVersionForNumber(40))
      );
      expect(9).toEqual(
        new AlphaNumericMode().getCharacterCountBits(
          Version.getVersionForNumber(6)
        )
      );
      expect(8).toEqual(
        new ByteMode().getCharacterCountBits(Version.getVersionForNumber(7))
      );
      expect(8).toEqual(
        new KanjiMode().getCharacterCountBits(Version.getVersionForNumber(8))
      );
    });
  });
});
