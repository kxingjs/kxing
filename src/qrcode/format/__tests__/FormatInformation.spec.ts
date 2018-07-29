import FormatInformation from "../FormatInformation";
import { LevelQ } from "../ErrorCorrectionLevel";
import { DataMask } from "../DataMask";

describe("FormatInformation", function() {
  describe("numBitsDiffering", function() {
    it("should be 0", function() {
      expect(FormatInformation.numBitsDiffering(1, 1)).toEqual(0);
    });
    it("should be 1", function() {
      expect(FormatInformation.numBitsDiffering(0, 2)).toEqual(1);
    });
    it("should be 2", function() {
      expect(FormatInformation.numBitsDiffering(1, 2)).toEqual(2);
    });
    it("should be 32", function() {
      expect(FormatInformation.numBitsDiffering(-1, 0)).toEqual(32);
    });
  });
  describe("basic decode", function() {
    const MASKED_TEST_FORMAT_INFO = 0x2bed;
    const UNMASKED_TEST_FORMAT_INFO = MASKED_TEST_FORMAT_INFO ^ 0x5412;

    const expected: FormatInformation = FormatInformation.decodeFormatInformation(
      MASKED_TEST_FORMAT_INFO,
      MASKED_TEST_FORMAT_INFO
    );
    it("should not be null", function() {
      expect(expected).not.toBeNull();
    });
    it("should has datamask", function() {
      expect(expected.dataMask).toEqual(DataMask.values()[0x07]);
    });
    it("should has ErrorCorrectionLevel", function() {
      expect(expected.errorCorrectionLevel).toEqual(new LevelQ());
    });
    it("should be idempotent", function() {
      expect(expected).toEqual(
        FormatInformation.decodeFormatInformation(
          UNMASKED_TEST_FORMAT_INFO,
          MASKED_TEST_FORMAT_INFO
        )
      );
    });
  });

  describe("decode with fomat information mask.", function() {
    const MASKED_TEST_FORMAT_INFO = 0x2bed;
    const expected: FormatInformation = FormatInformation.decodeFormatInformation(
      MASKED_TEST_FORMAT_INFO,
      MASKED_TEST_FORMAT_INFO
    );

    it("should be idempotent", function() {
      expect(expected).toEqual(
        FormatInformation.decodeFormatInformation(
          MASKED_TEST_FORMAT_INFO ^ 0x03,
          MASKED_TEST_FORMAT_INFO ^ 0x0f
        )
      );
    });
  });
});
