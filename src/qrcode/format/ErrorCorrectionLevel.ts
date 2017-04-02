import IllegalArgumentError from "../../error/IllegalArgumentError";

/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/decoder/ErrorCorrectionLevel.java}
 *
 * @author Tatsuya Yamamoto
 */
export abstract class ErrorCorrectionLevel {
    private _ordinal;
    private _bits;

    constructor(ordinal, bits) {
        this._ordinal = ordinal;
        this._bits = bits;
    }

    get bits() {
        return this._bits;
    }

    get ordinal() {
        return this._ordinal;
    }
}

export class LevelL extends ErrorCorrectionLevel {
    private static ORDINAL = 0;
    private static BITS = 0x01;

    constructor() {
        super(LevelL.ORDINAL, LevelL.BITS)
    }
}

export class LevelM extends ErrorCorrectionLevel {
    private static ORDINAL = 1;
    private static BITS = 0x00;

    constructor() {
        super(LevelM.ORDINAL, LevelM.BITS)
    }
}

export class LevelQ extends ErrorCorrectionLevel {
    private static ORDINAL = 2;
    private static BITS = 0x03;

    constructor() {
        super(LevelQ.ORDINAL, LevelQ.BITS)
    }
}


export class LevelH extends ErrorCorrectionLevel {
    private static ORDINAL = 3;
    private static BITS = 0x02;

    constructor() {
        super(LevelH.ORDINAL, LevelH.BITS)
    }
}

const ErrorCorrectionLevels = [
    LevelM,
    LevelL,
    LevelH,
    LevelQ
];

/**
 * @param bits int containing the two bits encoding a QR Code's error correction level
 * @return ErrorCorrectionLevel representing the encoded error correction level
 */
export function forBits(bits: number): ErrorCorrectionLevel {
    if (bits < 0 || bits >= ErrorCorrectionLevels.length) {
        throw new IllegalArgumentError();
    }
    return new (ErrorCorrectionLevels[bits])();
}
