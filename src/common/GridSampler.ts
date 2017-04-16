import BitMatrix from './BitMatrix';
import PerspectiveTransform from "./PerspectiveTransform";
import NotFoundError from "../error/NotFoundError";

/*
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/common/GridSampler.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class GridSampler {
    private _width: number;
    private _height: number;

    constructor(width, height) {
        this._width = width;
        this._height = height;
    };

    sampleGrid(image: number[],
               dimensionX: number,
               dimensionY: number,
               transform: PerspectiveTransform): BitMatrix {

        if (dimensionX <= 0 || dimensionY <= 0) {
            throw new NotFoundError("x or y dimension of the code is Less than 1.");
        }

        const bits = new BitMatrix(dimensionX, dimensionY);
        const points = new Array(2 * dimensionX);

        for (let y = 0; y < dimensionY; y++) {
            const max = points.length;
            const iValue = y + 0.5;
            for (let x = 0; x < max; x += 2) {
                points[x] = (x / 2) + 0.5;
                points[x + 1] = iValue;
            }
            transform.transformPoints(points);

            // Quick check to see if points transformed to something inside the image;
            // sufficient to check the endpoints
            this.checkAndNudgePoints(points);

            try {
                for (let x = 0; x < max; x += 2) {
                    const bit = image[Math.floor(points[x]) + this._width * Math.floor(points[x + 1])];
                    if (bit) {
                        bits.setBit(x / 2, y);
                    }
                }
            } catch (aioobe) {
                // This feels wrong, but, sometimes if the finder patterns are misidentified, the resulting
                // transform gets "twisted" such that it maps a straight line of points to a set of points
                // whose endpoints are in bounds, but others are not. There is probably some mathematical
                // way to detect this about the transformation that I don't know yet.
                // This results in an ugly runtime exception despite our clever checks above -- can't have
                // that. We could check each point's coordinates but that feels duplicative. We settle for
                // catching and wrapping ArrayIndexOutOfBoundsException.
                throw new NotFoundError("ArrayIndexOutOfBoundsException");
            }
        }
        return bits;
    };

    /**
     * <p>Checks a set of points that have been transformed to sample points on an image against
     * the image's dimensions to see if the point are even within the image.</p>
     *
     * <p>This method will actually "nudge" the endpoints back onto the image if they are found to be
     * barely (less than 1 pixel) off the image. This accounts for imperfect detection of finder
     * patterns in an image where the QR Code runs all the way to the image border.</p>
     *
     * <p>For efficiency, the method will check points from either end of the line until one is found
     * to be within the image. Because the set of points are assumed to be linear, this is valid.</p>
     *
     * @param image image into which the points should map
     * @param points actual points in x1,y1,...,xn,yn form
     * @throws NotFoundException if an endpoint is lies outside the image boundaries
     */
    checkAndNudgePoints(points) {
        // Check and nudge points from start until we see some that are OK:
        let nudged = true;
        for (let offset = 0; offset < points.Length && nudged; offset += 2) {
            const x = Math.floor(points[offset]);
            const y = Math.floor(points[offset + 1]);

            if (x < -1 || x > this._width || y < -1 || y > this._height) {
                throw new NotFoundError();
            }
            nudged = false;

            if (x == -1) {
                points[offset] = 0.0;
                nudged = true;
            } else if (x == this._width) {
                points[offset] = this._width - 1;
                nudged = true;
            }

            if (y == -1) {
                points[offset + 1] = 0.0;
                nudged = true;
            } else if (y == this._height) {
                points[offset + 1] = this._height - 1;
                nudged = true;
            }
        }
        // Check and nudge points from end:
        nudged = true;
        for (let offset = points.Length - 2; offset >= 0 && nudged; offset -= 2) {
            const x = Math.floor(points[offset]);
            const y = Math.floor(points[offset + 1]);
            if (x < -1 || x > this._width || y < -1 || y > this._height) {
                throw new NotFoundError();
            }
            nudged = false;
            if (x == -1) {
                points[offset] = 0.0;
                nudged = true;
            } else if (x == this._width) {
                points[offset] = this._width - 1;
                nudged = true;
            }

            if (y == -1) {
                points[offset + 1] = 0.0;
                nudged = true;
            } else if (y == this._height) {
                points[offset + 1] = this._height - 1;
                nudged = true;
            }
        }
    };
}
