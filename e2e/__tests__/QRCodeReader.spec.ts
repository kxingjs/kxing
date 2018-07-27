import { loadImage } from "../util";

const KXing = require("../../dist/kxing.js");

const FILE_BASE_PATH = __dirname;
const TestImages = [
  {
    mode: "NumericOnly",
    fileName: "testcode.num.png",
    expectText: "1029384756"
  },
  {
    mode: "Alphanumeric",
    fileName: "testcode.alpha.png",
    expectText: "1234567890 %*+-./:QWERTYUIOP"
  }
];

describe("QRCodeReader", function() {
  describe("#decode()", function() {
    const reader = KXing.getReader();

    TestImages.forEach(testImageInfo => {
      const { mode, fileName, expectText } = testImageInfo;

      it(`should return expected result text with ${mode} mode image.`, async () => {
        const path = `${FILE_BASE_PATH}/${fileName}`;

        const image = await loadImage(path);

        const result = reader.decode(image);
        expect(expectText).toEqual(result.text);
      });
    });
  });
});
