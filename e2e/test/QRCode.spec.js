const PROXIED_BASE_URL = "http://localhost:9876/base/images/";

const tryHarderHint = new Map([[KXing.DecodeHint.TRY_HARDER, true]]);

const textCases = {
  single: {
    NumericOnly: [
      {
        fileName: "qrcode_num.png",
        expectedText: "1029384756",
        description: "should decode single QRCode."
      },
      {
        fileName: "qrcode_num_large-margin.png",
        expectedText: "1029384756",
        description: "should decode QRCode in large margin image.",
        hints: tryHarderHint
      },
      {
        fileName: "qrcode_num_rotate-0-deg.png",
        expectedText: "1029384756",
        description: "should decode QRCode rotated 0 degrees."
      },
      {
        fileName: "qrcode_num_rotate-30-deg.png",
        expectedText: "1029384756",
        description: "should decode QRCode rotated 30 degrees."
      },
      {
        fileName: "qrcode_num_rotate-45-deg.png",
        expectedText: "1029384756",
        description: "should decode QRCode rotated 45 degrees."
      },
      {
        fileName: "qrcode_num_rotate-60-deg.png",
        expectedText: "1029384756",
        description: "should decode QRCode rotated 60 degrees."
      },
      {
        fileName: "qrcode_num_rotate-90-deg.png",
        expectedText: "1029384756",
        description: "should decode QRCode rotated 90 degrees."
      },
      {
        fileName: "qrcode_num_rotate--30-deg.png",
        expectedText: "1029384756",
        description: "should decode QRCode rotated -30 degrees."
      },
      {
        fileName: "qrcode_num_rotate--45-deg.png",
        expectedText: "1029384756",
        description: "should decode QRCode rotated -45 degrees."
      },
      {
        fileName: "qrcode_num_rotate--60-deg.png",
        expectedText: "1029384756",
        description: "should decode QRCode rotated -60 degrees."
      },

      {
        fileName: "qrcode_num_rotate--90-deg.png",
        expectedText: "1029384756",
        description: "should decode QRCode rotated -90 degrees."
      }
    ],
    Alphanumeric: [
      {
        fileName: "qrcode_alpha.png",
        expectedText: "1234567890 %\\*+-./:QWERTYUIOP",
        description: "should decode QRCode."
      },
      {
        fileName: "qrcode_alpha_rotate.png",
        expectedText: "1234567890 %\\*+-./:QWERTYUIOP",
        description: "should decode QRCode rotated."
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
      fileName: "qrcode-multi_large-margin.png",
      expectedTexts: ["1234567890 %\\*+-./:QWERTYUIOP", "1029384756"],
      description: "should decode multi QRCodes in image having large margin",
      hints: tryHarderHint
    }
  ]
};

describe("QRCode", function() {
  describe("QRCodeReader#decode", function() {
    describe("Numeric only mode", () => {
      textCases.single.NumericOnly.forEach(testCase => {
        it(testCase.description, async () => {
          await testDecode(testCase);
        });
      });
    });

    describe("Alphanumeric mode", () => {
      textCases.single.Alphanumeric.forEach(testCase =>
        it(testCase.description, async () => await testDecode(testCase))
      );
    });
  });

  describe("MultiQRCodeReader#decodeMultiple", () => {
    textCases.multi.forEach(testCase => {
      it(testCase.description, async () => {
        await testMultiDecode(testCase);
      });
    });
  });
});

async function testDecode({ fileName, hints, expectedText }) {
  const path = `${PROXIED_BASE_URL}${fileName}`;
  const reader = KXing.getReader();

  const image = await KXing.ImageLoader.load(path);
  const result = reader.decode(image, hints);

  expect(result.text).toEqual(expectedText);
}

async function testMultiDecode({ fileName, hints, expectedTexts }) {
  const path = `${PROXIED_BASE_URL}${fileName}`;
  const reader = KXing.getMultiReader();

  const image = await KXing.ImageLoader.load(path);
  const results = reader.decodeMultiple(image, hints);
  const resultTexts = results.map(r => r.text);

  expect(resultTexts).toEqual(expectedTexts);
}
