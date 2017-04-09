import {BarcodeFormat} from "./BarcodeFormat";

export default class Result {
    private _text: string;
    private _rawBytes: number[];
    private _numBits: number;
    private _format: BarcodeFormat;
    private _timestamp: number;

    public constructor(text: string,
                       rawBytes: number[],
                       format: BarcodeFormat,
                       timestamp?: number) {
        this._text = text;
        this._rawBytes = rawBytes;
        this._numBits = rawBytes == null ? 0 : 8 * rawBytes.length;
        this._format = format;
        this._timestamp = timestamp ? timestamp : Date.now();
    }

    /**
     * @return raw text encoded by the barcode
     */
    public get text(): string {
        return this._text;
    }

    /**
     * @return raw bytes encoded by the barcode, if applicable, otherwise {@code null}
     */
    public get rawBytes(): number[] {
        return this._rawBytes;
    }

    /**
     * @return how many bits of {@link Result#rawBytes} are valid; typically 8 times its length
     * @since 3.3.0
     */
    public get numBits(): number {
        return this._numBits;
    }

    /**
     * @return {@link BarcodeFormat} representing the format of the barcode that was decoded
     */
    public get barcodeFormat(): BarcodeFormat {
        return this._format;
    }

    public get timestamp(): number {
        return this._timestamp;
    }
}
