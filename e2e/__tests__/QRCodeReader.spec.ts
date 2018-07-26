import { loadImage } from "../util";

import QRCodeReader from "../../src/qrcode/QRCodeReader";

const FILE_BASE_PATH = "http://localhost:9876/base/test/qrcode/";
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
    const reader = new QRCodeReader();

    TestImages.forEach(testImageInfo => {
      const { mode, fileName, expectText } = testImageInfo;

      it(`should return expected result text with ${mode} mode image.`, function(done) {
        const path = `${FILE_BASE_PATH}${fileName}`;

        loadImage(path, image => {
          const result = reader.decode(image);
          expect(expectText).toEqual(result.text);
          done();
        });
      });
    });
  });
});
