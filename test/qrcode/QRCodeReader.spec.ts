import {expect} from 'chai';
import QRCodeReader from "../../src/qrcode/QRCodeReader";

const FILE_BASE_PATH = "http://localhost:9876/base/test/qrcode/";
const TestImages = [
    {
        mode: "NumericOnly",
        fileName: "testcode.num.png",
        expect: "1029384756"
    },
    {
        mode: "Alphanumeric",
        fileName: "testcode.alpha.png",
        expect: "1234567890 %*+-./:QWERTYUIOP"
    }
];


describe("QRCodeReader", function () {
    describe("#decode()", function () {

        TestImages.forEach(testImageInfo => {
            const modeName = `${testImageInfo.mode}`;
            const fileUrl = `${FILE_BASE_PATH}${testImageInfo.fileName}`;
            const expectText = `${testImageInfo.expect}`;

            let qrcodeImage;

            before("load target image file.", function (done) {
                const imageElement: HTMLImageElement = new Image();

                imageElement.onload = function () {
                    const canvasElement: HTMLCanvasElement = document.createElement('canvas');
                    const context: CanvasRenderingContext2D = canvasElement.getContext('2d');
                    context.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height);
                    qrcodeImage = context.getImageData(0, 0, imageElement.width, imageElement.height);

                    done();
                };

                imageElement.src = fileUrl;
            });

            it(`should return expected result text with ${modeName} mode image.`, function (done) {
                const reader = new QRCodeReader();
                const result = reader.decode(qrcodeImage);
                expect(result.text).to.equal(expectText);

                done();
            });
        });
    });
});
