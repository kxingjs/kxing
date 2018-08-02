const PROXIED_BASE_URL = "http://localhost:9876/base";

const TEST_IMAGES = {
  single: [
    {
      mode: "NumericOnly",
      filePath: "/images/testcode.num.png",
      expectText: "1029384756"
    },
    {
      mode: "Alphanumeric",
      filePath: "/images/testcode.alpha.png",
      expectText: "1234567890 %*+-./:QWERTYUIOP"
    }
  ],
  multi: [
    {
      filePath: "/images/testcode.multi.png",
      expectTexts: ["1029384756", "1234567890 %*+-./:QWERTYUIOP"]
    }
  ]
};

describe("QRCode", function() {
  describe("QRCodeReader", function() {
    describe("#decode()", function() {
      const reader = KXing.getReader();

      TEST_IMAGES.single.forEach(testImageInfo => {
        const { mode, filePath, expectText } = testImageInfo;

        it(`should return expected result text with ${mode} mode image.`, async () => {
          const path = `${PROXIED_BASE_URL}${filePath}`;

          const image = await KXing.ImageLoader.load(path);

          const result = reader.decode(image);
          expect(expectText).toEqual(result.text);
        });
      });
    });
  });

  describe("MultiQRCodeReader", function() {
    describe("#decode()", function() {
      const reader = KXing.getMultiReader();

      TEST_IMAGES.multi.forEach(testImageInfo => {
        const { filePath, expectTexts } = testImageInfo;

        it(`should return expected multiple results.`, async () => {
          const path = `${PROXIED_BASE_URL}${filePath}`;

          const image = await KXing.ImageLoader.load(path);
          const results = reader.decodeMultiple(image);

          const actualTexts = results.map(result => result.text);
          expect(expectTexts.sort()).toEqual(actualTexts.sort());
        });
      });
    });
  });
});
