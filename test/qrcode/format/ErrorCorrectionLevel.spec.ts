import { expect } from "chai";
import {
  ErrorCorrectionLevel,
  LevelL,
  LevelM,
  LevelQ,
  LevelH,
  forBits
} from "../../../src/qrcode/format/ErrorCorrectionLevel";

describe("LevelL", function() {
  describe("bit", function() {
    it("should be 0x01", function() {
      const level: ErrorCorrectionLevel = new LevelL();
      expect(level.bits).to.be.equal(0x01);
    });
  });
  describe("ordinal", function() {
    it("should be 0.", function() {
      const level: ErrorCorrectionLevel = new LevelL();
      expect(level.ordinal).to.be.equal(0);
    });
  });
});

describe("LevelM", function() {
  describe("bit", function() {
    it("should be 0x00", function() {
      const level: ErrorCorrectionLevel = new LevelM();
      expect(level.bits).to.be.equal(0x00);
    });
  });
  describe("ordinal", function() {
    it("should be 1.", function() {
      const level: ErrorCorrectionLevel = new LevelM();
      expect(level.ordinal).to.be.equal(1);
    });
  });
});

describe("LevelQ", function() {
  describe("bit", function() {
    it("should be 0x03", function() {
      const level: ErrorCorrectionLevel = new LevelQ();
      expect(level.bits).to.be.equal(0x03);
    });
  });
  describe("ordinal", function() {
    it("should be 2.", function() {
      const level: ErrorCorrectionLevel = new LevelQ();
      expect(level.ordinal).to.be.equal(2);
    });
  });
});

describe("LevelH", function() {
  describe("bit", function() {
    it("should be 0x02", function() {
      const level: ErrorCorrectionLevel = new LevelH();
      expect(level.bits).to.be.equal(0x02);
    });
  });
  describe("ordinal", function() {
    it("should be 3.", function() {
      const level: ErrorCorrectionLevel = new LevelH();
      expect(level.ordinal).to.be.equal(3);
    });
  });
});

describe("forBits()", function() {
  it("should be able to return L", function() {
    expect(forBits(0x01)).to.be.instanceof(LevelL);
  });
  it("should be able to return L", function() {
    expect(forBits(0x00)).to.be.instanceof(LevelM);
  });
  it("should be able to return L", function() {
    expect(forBits(0x03)).to.be.instanceof(LevelQ);
  });
  it("should be able to return L", function() {
    expect(forBits(0x02)).to.be.instanceof(LevelH);
  });
});
