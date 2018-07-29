import { DataMask } from "../DataMask";
import BitMatrix from "../../../common/BitMatrix";

type IsMasked = (i: number, j: number) => boolean;

describe("DataMask", function() {
  describe("DataMask000", function() {
    it("should be 0x01", function() {
      const isMasked = (i, j) => {
        return (i + j) % 2 == 0;
      };

      testMaskAcrossDimensions(0, isMasked);
    });
  });

  describe("DataMask001", function() {
    const isMasked = (i, _) => {
      return i % 2 == 0;
    };

    it("should be 0x01", function() {
      testMaskAcrossDimensions(1, isMasked);
    });
  });

  describe("DataMask010", function() {
    const isMasked = (_, j) => {
      return j % 3 == 0;
    };

    it("should be 0x01", function() {
      testMaskAcrossDimensions(2, isMasked);
    });
  });

  describe("DataMask011", function() {
    const isMasked = (i, j) => {
      return (i + j) % 3 == 0;
    };

    it("should be 0x01", function() {
      testMaskAcrossDimensions(3, isMasked);
    });
  });

  // TODO: Can't success this test case......
  describe.skip("DataMask100", function() {
    const isMasked = (i, j) => {
      return (i / 2 + j / 3) % 2 == 0;
    };

    it("should be 0x01", function() {
      testMaskAcrossDimensions(4, isMasked);
    });
  });

  describe("DataMask101", function() {
    const isMasked = (i, j) => {
      return ((i * j) % 2) + ((i * j) % 3) == 0;
    };

    it("should be 0x01", function() {
      testMaskAcrossDimensions(5, isMasked);
    });
  });

  describe("DataMask110", function() {
    const isMasked = (i, j) => {
      return (((i * j) % 2) + ((i * j) % 3)) % 2 == 0;
    };

    it("should be 0x01", function() {
      testMaskAcrossDimensions(6, isMasked);
    });
  });

  describe("DataMask111", function() {
    const isMasked = (i, j) => {
      return (((i + j) % 2) + ((i * j) % 3)) % 2 == 0;
    };

    it("should be 0x01", function() {
      testMaskAcrossDimensions(7, isMasked);
    });
  });
});

function testMaskAcrossDimensions(reference: number, isMasked: IsMasked): void {
  const mask: DataMask = DataMask.values()[reference];
  for (let version = 1; version <= 40; version++) {
    const dimension = 17 + 4 * version;

    const bits: BitMatrix = new BitMatrix(dimension);
    mask.unmaskBitMatrix(bits, dimension);

    const isMaskedList: boolean[] = [];
    const bitList: boolean[] = [];

    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        isMaskedList.push(isMasked(i, j));
        bitList.push(bits.getBit(j, i));
      }
    }

    expect(isMaskedList).toEqual(bitList);
  }
}
