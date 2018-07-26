import {
  ErrorCorrectionLevel,
  LevelL,
  LevelM,
  LevelQ,
  LevelH,
  forBits
} from "../ErrorCorrectionLevel";

describe("LevelL", function() {
  describe("bit", function() {
    it("should be 0x01", function() {
      const level: ErrorCorrectionLevel = new LevelL();
      expect(level.bits).toEqual(0x01);
    });
  });
  describe("ordinal", function() {
    it("should be 0.", function() {
      const level: ErrorCorrectionLevel = new LevelL();
      expect(level.ordinal).toEqual(0);
    });
  });
});

describe("LevelM", function() {
  describe("bit", function() {
    it("should be 0x00", function() {
      const level: ErrorCorrectionLevel = new LevelM();
      expect(level.bits).toEqual(0x00);
    });
  });
  describe("ordinal", function() {
    it("should be 1.", function() {
      const level: ErrorCorrectionLevel = new LevelM();
      expect(level.ordinal).toEqual(1);
    });
  });
});

describe("LevelQ", function() {
  describe("bit", function() {
    it("should be 0x03", function() {
      const level: ErrorCorrectionLevel = new LevelQ();
      expect(level.bits).toEqual(0x03);
    });
  });
  describe("ordinal", function() {
    it("should be 2.", function() {
      const level: ErrorCorrectionLevel = new LevelQ();
      expect(level.ordinal).toEqual(2);
    });
  });
});

describe("LevelH", function() {
  describe("bit", function() {
    it("should be 0x02", function() {
      const level: ErrorCorrectionLevel = new LevelH();
      expect(level.bits).toEqual(0x02);
    });
  });
  describe("ordinal", function() {
    it("should be 3.", function() {
      const level: ErrorCorrectionLevel = new LevelH();
      expect(level.ordinal).toEqual(3);
    });
  });
});

describe("forBits()", function() {
  it("should be able to return L", function() {
    expect(forBits(0x01)).toBeInstanceOf(LevelL);
  });
  it("should be able to return L", function() {
    expect(forBits(0x00)).toBeInstanceOf(LevelM);
  });
  it("should be able to return L", function() {
    expect(forBits(0x03)).toBeInstanceOf(LevelQ);
  });
  it("should be able to return L", function() {
    expect(forBits(0x02)).toBeInstanceOf(LevelH);
  });
});
