import {expect} from 'chai';
import Version from '../../../../src/qrcode/format/Version'
import {LevelH, LevelQ, LevelM, LevelL} from "../../../../src/qrcode/format/ErrorCorrectionLevel";
import IllegalArgumentError from "../../../../src/error/IllegalArgumentError";


describe("Version", function () {
    describe("version for number", function () {
        it("should throw error with illegal version number", function () {
            expect(function () {
                Version.getVersionForNumber(0)
            }).to.throw(IllegalArgumentError);
        });
        it("should be valid number", function () {
            for (let i = 1; i <= 40; i++) {
                checkVersion(Version.getVersionForNumber(i), i, 4 * i + 17);
            }
        });
    });
    describe("Get provisional version for dimension", function () {
        it("should have current version number ", function () {
            for (let i = 1; i <= 40; i++) {
                expect(i).to.be.equal(Version.getProvisionalVersionForDimension(4 * i + 17).versionNumber)
            }
        });
    });
    describe("DecodeVersionInformation", function () {
        it("can decode version information", function () {
            doTestVersion(7, 0x07C94);
            doTestVersion(12, 0x0C762);
            doTestVersion(17, 0x1145D);
            doTestVersion(22, 0x168C9);
            doTestVersion(27, 0x1B08E);
            doTestVersion(32, 0x209D5);
        });
    });
});

function checkVersion(version: Version, number: number, dimension: number) {
    expect(version).to.not.be.null;
    expect(number).to.equal(version.versionNumber);
    expect(version.alignmentPatternCenters).to.not.be.null;
    if (number > 1) {
        expect(version.alignmentPatternCenters.length > 0).to.be.true;
    }
    expect(dimension).to.equal(version.dimensionForVersion);
    expect(version.getECBlocksForLevel(new LevelH())).to.not.be.null;
    expect(version.getECBlocksForLevel(new LevelL())).to.not.be.null;
    expect(version.getECBlocksForLevel(new LevelM())).to.not.be.null;
    expect(version.getECBlocksForLevel(new LevelQ())).to.not.be.null;
    expect(version.buildFunctionPattern()).to.not.be.null;
}


function doTestVersion(expectedVersion: number, mask: number) {
    const version: Version = Version.decodeVersionInformation(mask);
    expect(version).to.not.be.null;
    expect(expectedVersion).to.equal(version.versionNumber);
}

