import Version from "../format/Version";
import {ErrorCorrectionLevel} from "../format/ErrorCorrectionLevel";
import IllegalArgumentError from "../../error/IllegalArgumentError";
import {ECBlocks} from "../format/Version";
import {ECB} from "../format/Version";

/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/decoder/DataBlock.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class DataBlock {
    private _numDataCodewords;
    private _codewords;

    constructor(numDataCodewords: number, codewords) {
        this._numDataCodewords = numDataCodewords;
        this._codewords = codewords;
    }

    get numDataCodewords(){
        return this._numDataCodewords;
    }

    get codewords(){
        return this._codewords;
    }

    static getDataBlocks(rawCodewords: number[], version: Version, ecLevel: ErrorCorrectionLevel): DataBlock[] {

        if (rawCodewords.length != version.totalCodewords) {
            throw new IllegalArgumentError();
        }

        // Figure out the number and size of data blocks used by this version and
        // error correction level
        const ecBlocks: ECBlocks = version.getECBlocksForLevel(ecLevel);

        // First count the total number of data blocks
        let totalBlocks: number = 0;
        const ecBlockArray: ECB[] = ecBlocks.ecBlocks;
        for (let i = 0; i < ecBlockArray.length; i++) {
            totalBlocks += ecBlockArray[i].count;
        }

        // Now establish DataBlocks of the appropriate size and number of data codewords
        const result: DataBlock[] = [];
        let numResultBlocks: number = 0;

        for (let j = 0; j < ecBlockArray.length; j++) {
            const ecBlock: ECB = ecBlockArray[j];
            for (let i = 0; i < ecBlock.count; i++) {
                const numDataCodewords: number = ecBlock.dataCodewords;
                const numBlockCodewords: number = ecBlocks.ecCodewordsPerBlock + numDataCodewords;
                result[numResultBlocks++] = new DataBlock(numDataCodewords, new Array(numBlockCodewords));
            }
        }

        // All blocks have the same amount of data, except that the last n
        // (where n may be 0) have 1 more byte. Figure out where these start.
        const shorterBlocksTotalCodewords: number = result[0].codewords.length;
        let longerBlocksStartAt: number = result.length - 1;
        while (longerBlocksStartAt >= 0) {
            const numCodewords: number = result[longerBlocksStartAt].codewords.length;
            if (numCodewords == shorterBlocksTotalCodewords) {
                break;
            }
            longerBlocksStartAt--;
        }
        longerBlocksStartAt++;

        const shorterBlocksNumDataCodewords = shorterBlocksTotalCodewords - ecBlocks.ecCodewordsPerBlock;
        // The last elements of result may be 1 element longer;
        // first fill out as many elements as all of them have
        let rawCodewordsOffset = 0;
        for (let i = 0; i < shorterBlocksNumDataCodewords; i++) {
            for (let j = 0; j < numResultBlocks; j++) {
                result[j].codewords[i] = rawCodewords[rawCodewordsOffset++];
            }
        }
        // Fill out the last data block in the longer ones
        for (let j = longerBlocksStartAt; j < numResultBlocks; j++) {
            result[j].codewords[shorterBlocksNumDataCodewords] = rawCodewords[rawCodewordsOffset++];
        }
        // Now add in error correction blocks
        const max = result[0].codewords.length;
        for (let i = shorterBlocksNumDataCodewords; i < max; i++) {
            for (let j = 0; j < numResultBlocks; j++) {
                const iOffset = j < longerBlocksStartAt ? i : i + 1;
                result[j].codewords[iOffset] = rawCodewords[rawCodewordsOffset++];
            }
        }
        return result;
    }
}
