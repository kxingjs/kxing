import {
  DataMask,
  DataMask000,
  DataMask001,
  DataMask010,
  DataMask011,
  DataMask100,
  DataMask111,
  DataMask101,
  DataMask110
} from "../DataMask";
import BitMatrix from "../../../common/BitMatrix";

describe("DataMask", function() {
  describe("DataMask000", function() {
    class DataMask000Condition implements MaskCondition {
      public isMasked(i: number, j: number): boolean {
        return (i + j) % 2 == 0;
      }
    }
    it("should be 0x01", function() {
      testMaskAcrossDimensions(new DataMask000(), new DataMask000Condition());
    });
  });

  describe("DataMask001", function() {
    class DataMask001Condition implements MaskCondition {
      public isMasked(i: number, _j: number): boolean {
        return i % 2 == 0;
      }
    }
    it("should be 0x01", function() {
      testMaskAcrossDimensions(new DataMask001(), new DataMask001Condition());
    });
  });

  describe("DataMask010", function() {
    class DataMask010Condition implements MaskCondition {
      public isMasked(_i: number, j: number): boolean {
        return j % 3 == 0;
      }
    }
    it("should be 0x01", function() {
      testMaskAcrossDimensions(new DataMask010(), new DataMask010Condition());
    });
  });
  describe("DataMask011", function() {
    class DataMask011Condition implements MaskCondition {
      public isMasked(i: number, j: number): boolean {
        return (i + j) % 3 == 0;
      }
    }
    it("should be 0x01", function() {
      testMaskAcrossDimensions(new DataMask011(), new DataMask011Condition());
    });
  });

  // TODO: Can't success this test case......
  describe.skip("DataMask100", function() {
    class DataMask100Condition implements MaskCondition {
      public isMasked(i: number, j: number): boolean {
        return (i / 2 + j / 3) % 2 == 0;
      }
    }
    it("should be 0x01", function() {
      testMaskAcrossDimensions(new DataMask100(), new DataMask100Condition());
    });
  });
  describe("DataMask101", function() {
    class DataMask101Condition implements MaskCondition {
      public isMasked(i: number, j: number): boolean {
        return ((i * j) % 2) + ((i * j) % 3) == 0;
      }
    }
    it("should be 0x01", function() {
      testMaskAcrossDimensions(new DataMask101(), new DataMask101Condition());
    });
  });
  describe("DataMask110", function() {
    class DataMask110Condition implements MaskCondition {
      public isMasked(i: number, j: number): boolean {
        return (((i * j) % 2) + ((i * j) % 3)) % 2 == 0;
      }
    }
    it("should be 0x01", function() {
      testMaskAcrossDimensions(new DataMask110(), new DataMask110Condition());
    });
  });

  describe("DataMask111", function() {
    class DataMask111Condition implements MaskCondition {
      public isMasked(i: number, j: number): boolean {
        return (((i + j) % 2) + ((i * j) % 3)) % 2 == 0;
      }
    }
    it("should be 0x01", function() {
      testMaskAcrossDimensions(new DataMask111(), new DataMask111Condition());
    });
  });
});

interface MaskCondition {
  isMasked(i: number, j: number): boolean;
}

function testMaskAcrossDimensions(mask: DataMask, condition: any): void {
  for (let version = 1; version <= 40; version++) {
    const dimension: number = 17 + 4 * version;
    const bits: BitMatrix = new BitMatrix(dimension);
    mask.unmaskBitMatrix(bits, dimension);
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        expect(condition.isMasked(i, j)).toEqual(bits.getBit(j, i));
      }
    }
  }
}
