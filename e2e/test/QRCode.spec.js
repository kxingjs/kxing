const PROXIED_BASE_URL = "http://localhost:9876/base/images/";

const tryHarderHint = new Map([[KXing.DecodeHint.TRY_HARDER, true]]);

const textCases = {
  single: {
    NumericOnly: [
      {
        fileName: "qrcode-num-single.png",
        expectedText: "1029384756",
        description: "should decode numeric only single QRCode."
      },
      {
        fileName: "qrcode-num-single-rotate.png",
        expectedText: "1029384756",
        description: "should decode rotated numeric only QRCode."
      },
      {
        fileName: "qrcode-num-single-large-margin.png",
        expectedText: "1029384756",
        description: "should decode QRCode in large margin image.",
        hints: tryHarderHint
      }
    ],
    Alphanumeric: [
      {
        fileName: "qrcode-alpha-single.png",
        expectedText: "1234567890 %\\*+-./:QWERTYUIOP",
        description: "should decode single QRCode."
      },
      {
        fileName: "qrcode-alpha-single-rotate.png",
        expectedText: "1234567890 %\\*+-./:QWERTYUIOP",
        description: "should decode rotated alphanumeric QRCode."
      }
    ]
  },
  multi: [
    {
      fileName: "qrcode-multi.png",
      expectedTexts: ["1234567890 %\\*+-./:QWERTYUIOP", "1029384756"],
      description: "should decode multi QRCodes"
    },
    {
      fileName: "qrcode-multi-large-margin.png",
      expectedTexts: ["1234567890 %\\*+-./:QWERTYUIOP", "1029384756"],
      description: "should decode multi QRCodes in image having large margin",
      hints: tryHarderHint
    }
  ]
};

describe("QRCode", function() {
  describe("QRCodeReader#decode", function() {
    describe("Numeric only mode", function() {
      const reader = KXing.getReader();

      textCases.single.NumericOnly.forEach(textCase => {
        const { description, fileName, hints, expectedText } = textCase;
        const path = `${PROXIED_BASE_URL}${fileName}`;

        it(description, async () => {
          const image = await KXing.ImageLoader.load(path);
          const result = reader.decode(image, hints);

          expect(result.text).toEqual(expectedText);
        });
      });
    });

    describe("Alphanumeric mode", function() {
      const reader = KXing.getReader();

      textCases.single.Alphanumeric.forEach(textCase => {
        const { description, fileName, hints, expectedText } = textCase;
        const path = `${PROXIED_BASE_URL}${fileName}`;

        it(description, async () => {
          const image = await KXing.ImageLoader.load(path);
          const result = reader.decode(image, hints);

          expect(result.text).toEqual(expectedText);
        });
      });
    });
  });

  describe("MultiQRCodeReader#decodeMultiple", function() {
    const reader = KXing.getMultiReader();

    textCases.multi.forEach(textCase => {
      const { description, fileName, hints, expectedTexts } = textCase;
      const path = `${PROXIED_BASE_URL}${fileName}`;

      it(description, async () => {
        const path = `${PROXIED_BASE_URL}${fileName}`;

        const image = await KXing.ImageLoader.load(path);
        const results = reader.decodeMultiple(image, hints);
        const resultTexts = results.map(r => r.text);

        expect(resultTexts).toEqual(expectedTexts);
      });
    });
  });
});
