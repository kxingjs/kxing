/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/decoder/DataMask.java}
 *
 * @author Tatsuya Yamamoto
 */

import BitMatrix from "../../common/BitMatrix";

export abstract class DataMask {
    unmaskBitMatrix(bits: BitMatrix, dimension: number): void {
        for (let i = 0; i < dimension; i++) {
            for (let j = 0; j < dimension; j++) {
                if (this.isMasked(i, j)) {
                    bits.flip(j, i);
                }
            }
        }
    }

    abstract isMasked(i, j): boolean;
}

export class DataMask000 extends DataMask {
    isMasked(i: number, j: number): boolean {
        return ((i + j) & 0x01) == 0;
    }
}

export class DataMask001 extends DataMask {
    isMasked(i: number, _j: number): boolean {
        return (i & 0x01) == 0;
    }
}

export class DataMask010 extends DataMask {
    isMasked(_i: number, j: number): boolean {
        return j % 3 == 0;
    }
}

export class DataMask011 extends DataMask {
    isMasked(i: number, j: number): boolean {
        return (i + j) % 3 == 0;
    }
}

export class DataMask100 extends DataMask {
    isMasked(i: number, j: number): boolean {
        return (((i / 2) + (j / 3)) & 0x01) == 0;
    }
}

export class DataMask101 extends DataMask {
    isMasked(i: number, j: number): boolean {
        return (i * j) % 6 == 0;
    }
}

export class DataMask110 extends DataMask {
    isMasked(i: number, j: number): boolean {
        return ((i * j) % 6) < 3;
    }
}

export class DataMask111 extends DataMask {
    isMasked(i: number, j: number): boolean {
        return ((i + j + ((i * j) % 3)) & 0x01) == 0;
    }
}
