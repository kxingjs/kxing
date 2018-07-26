import Version from "../Version";
import { LevelH, LevelQ, LevelM, LevelL } from "../ErrorCorrectionLevel";
import IllegalArgumentError from "../../../error/IllegalArgumentError";

describe("Version", function() {
  describe("version for number", function() {
    it("should throw error with illegal version number", function() {
      expect(function() {
        Version.getVersionForNumber(0);
      }).toThrow(IllegalArgumentError);
    });
    it("should be valid number", function() {
      for (let i = 1; i <= 40; i++) {
        checkVersion(Version.getVersionForNumber(i), i, 4 * i + 17);
      }
    });
  });
  describe("Get provisional version for dimension", function() {
    it("should have current version number ", function() {
      for (let i = 1; i <= 40; i++) {
        expect(i).toEqual(
          Version.getProvisionalVersionForDimension(4 * i + 17).versionNumber
        );
      }
    });
  });
  describe("DecodeVersionInformation", function() {
    it("can decode version information", function() {
      doTestVersion(7, 0x07c94);
      doTestVersion(12, 0x0c762);
      doTestVersion(17, 0x1145d);
      doTestVersion(22, 0x168c9);
      doTestVersion(27, 0x1b08e);
      doTestVersion(32, 0x209d5);
    });
  });
});

function checkVersion(version: Version, number: number, dimension: number) {
  expect(version).not.toBeNull();
  expect(number).toEqual(version.versionNumber);
  expect(version.alignmentPatternCenters).not.toBeNull();
  if (number > 1) {
    expect(version.alignmentPatternCenters.length > 0).toBeTruthy();
  }
  expect(dimension).toEqual(version.dimensionForVersion);
  expect(version.getECBlocksForLevel(new LevelH())).not.toBeNull();
  expect(version.getECBlocksForLevel(new LevelL())).not.toBeNull();
  expect(version.getECBlocksForLevel(new LevelM())).not.toBeNull();
  expect(version.getECBlocksForLevel(new LevelQ())).not.toBeNull();
  expect(version.buildFunctionPattern()).not.toBeNull();
}

function doTestVersion(expectedVersion: number, mask: number) {
  const version: Version = Version.decodeVersionInformation(mask);
  expect(version).not.toBeNull();
  expect(expectedVersion).toEqual(version.versionNumber);
}
