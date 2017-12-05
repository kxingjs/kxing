import {assert} from 'chai';
import {loadImage} from '../../util';

import QRCodeMultiReader from "../../../src/multi/qrcode/QRCodeMultiReader";

const FILE_BASE_PATH = "http://localhost:9876/base/test/multi/qrcode/";
const TestImages = [
    {
        fileName: "testcode.multi.png",
        expectTexts: [
            "1029384756",
            "1234567890 %*+-./:QWERTYUIOP",
        ]
    },
];

describe("MultiQRCodeReader", function () {
    describe("#decode()", function () {
        const reader = new QRCodeMultiReader();

        TestImages.forEach((testImageInfo) => {
            const {fileName, expectTexts} = testImageInfo;

            it(`should return expected multiple results.`, (done) => {
                const path = `${FILE_BASE_PATH}${fileName}`;

                loadImage(path, (image) => {
                    const results = reader.decodeMultiple(image);
                    const actualTexts = results.map((result) => result.text);

                    assert.sameMembers(expectTexts, actualTexts);
                    done()
                });
            });
        });
    });
});

