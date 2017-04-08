import BitMatrix from "./BitMatrix";

const MAX_LUMINANCE_VALUE = 255;
const MIN_LUMINANCE_VALUE = 0;

/**
 *
 * @param canvasImageData
 * @returns {BitMatrix}
 */
export function binarize(canvasImageData):BitMatrix {
    const luminanceArray: number[] = convertGreyscale(canvasImageData);
    const threshold: number = calculateThresholdWithOtsuMethod(luminanceArray);

    const bitMatrix = new BitMatrix(canvasImageData.width, canvasImageData.height);
    bitMatrix.bits = luminanceArray.map(function (lum) {
        return lum <= threshold ? 1 : 0;
    });

    return bitMatrix;
}

/**
 * convert greyscale
 *
 * @param image target of convert
 * @returns {number[]}
 */
function convertGreyscale(image: ImageData): number[] {
    const luminances: number[] = [];
    for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width; x++) {
            const point: number = (x * 4) + (y * image.width * 4);
            const r: number = image.data[point];
            const g: number = image.data[point + 1];
            const b: number = image.data[point + 2];
            luminances[x + y * image.width] = (r * 33 + g * 34 + b * 33) / 100;
        }
    }
    return luminances;
}

/**
 *
 *
 * @param luminanceArray
 * @returns {number}
 */
function calculateThresholdWithOtsuMethod(luminanceArray: number[]) {
    const luminanceHistgram: number[] = [];
    luminanceArray.forEach(function (lu) {
        if (isNaN(luminanceHistgram[lu])) {
            luminanceHistgram[lu] = 0;
        }
        luminanceHistgram[lu]++;
    });

    let threshold = 0;
    let max = 0.0;

    for (let i = 0; i <= MAX_LUMINANCE_VALUE; ++i) {
        const blackArea = {
            pixels: 0,  // number of pixel in black area.
            sum: 0,     // total of luminance value for average
            average: 0
        };
        const whiteArea = {
            pixels: 0,  // number of pixel in white area.
            sum: 0,     // total of luminance value for average
            average: 0
        };

        for (let j = MIN_LUMINANCE_VALUE; j <= i; ++j) {
            blackArea.pixels += luminanceHistgram[j];
            blackArea.sum += j * luminanceHistgram[j];
        }

        for (let j = i + 1; j < MAX_LUMINANCE_VALUE; ++j) {
            whiteArea.pixels += luminanceHistgram[j];
            whiteArea.sum += j * luminanceHistgram[j];
        }

        if (blackArea.pixels) {
            blackArea.average = blackArea.sum / blackArea.pixels;
        }
        if (whiteArea.pixels) {
            whiteArea.average = whiteArea.sum / whiteArea.pixels;
        }

        const result = (blackArea.pixels * whiteArea.pixels * Math.pow((blackArea.average - whiteArea.average), 2));

        if (max < result) {
            max = result;
            threshold = i
        }
    }
    return threshold;
}
