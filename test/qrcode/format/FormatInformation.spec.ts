import { expect } from "chai";
import FormatInformation from "../../../src/qrcode/format/FormatInformation";
import { LevelQ } from "../../../src/qrcode/format/ErrorCorrectionLevel";
import { DataMask } from "../../../src/qrcode/format/DataMask";

describe("FormatInformation", function() {
  describe("numBitsDiffering", function() {
    it("should be 0", function() {
      expect(FormatInformation.numBitsDiffering(1, 1)).to.equal(0);
    });
    it("should be 1", function() {
      expect(FormatInformation.numBitsDiffering(0, 2)).to.equal(1);
    });
    it("should be 2", function() {
      expect(FormatInformation.numBitsDiffering(1, 2)).to.equal(2);
    });
    it("should be 32", function() {
      expect(FormatInformation.numBitsDiffering(-1, 0)).to.equal(32);
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
      expect(expected).to.not.be.null;
    });
    it("should has datamask", function() {
      expect(expected.dataMask).to.equal(DataMask.values()[0x07]);
    });
    it("should has ErrorCorrectionLevel", function() {
      expect(expected.errorCorrectionLevel).to.eql(new LevelQ());
    });
    it("should be idempotent", function() {
      expect(expected).to.eql(
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
      expect(expected).to.eql(
        FormatInformation.decodeFormatInformation(
          MASKED_TEST_FORMAT_INFO ^ 0x03,
          MASKED_TEST_FORMAT_INFO ^ 0x0f
        )
      );
    });
  });
});
