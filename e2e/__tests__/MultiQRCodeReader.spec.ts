import { loadImage } from "../util";

const KXing = require("../../dist/index.js");

const FILE_BASE_PATH = __dirname;

const TestImages = [
  {
    fileName: "testcode.multi.png",
    expectTexts: ["1029384756", "1234567890 %*+-./:QWERTYUIOP"]
  }
];

describe("MultiQRCodeReader", function() {
  describe("#decode()", function() {
    const reader = KXing.getMultiReader();

    TestImages.forEach(testImageInfo => {
      const { fileName, expectTexts } = testImageInfo;

      it(`should return expected multiple results.`, async () => {
        const path = `${FILE_BASE_PATH}/${fileName}`;

        const image = await loadImage(path);
        const results = reader.decodeMultiple(image);

        const actualTexts = results.map(result => result.text);
        expect(expectTexts.sort()).toEqual(actualTexts.sort());
      });
    });
  });
});
