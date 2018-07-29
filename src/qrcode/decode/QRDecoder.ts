import DataBlock from "./DataBlock";
import BitMatrixParser from "./BitMatrixParser";
import ReedSolomonDecoder from "../../common/reedsolomon/ReedSolomonDecoder";
import GenericGF from "../../common/reedsolomon/GenericGF";
import DecodedBitStreamParser from "./DecodedBitStreamParser";
import DecoderResult from "../../common/DecoderResult";
import Version from "../format/Version";
import ChecksumError from "../../error/ChecksumError";
import BitMatrix from "../../common/BitMatrix";

/*
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/decoder/Decoder.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class QRDecoder {
  private decoder: ReedSolomonDecoder = new ReedSolomonDecoder(
    GenericGF.QR_CODE_FIELD_256
  );

  /**
   * <p>Decodes a Data Matrix Code represented as a {@link BitMatrix}. A 1 or "true" is taken
   * to mean a black module.</p>
   *
   * @param bits booleans representing white/black Data Matrix Code modules
   * @return text and bytes encoded within the Data Matrix Code
   * @throws FormatException if the Data Matrix Code cannot be decoded
   * @throws ChecksumException if error correction fails
   */
  public decode(bits: BitMatrix): DecoderResult {
    // Construct a parser and read version, error-correction level
    const bitMatrixParser: BitMatrixParser = new BitMatrixParser(bits);

    const version: Version = bitMatrixParser.readVersion();
    const ecLevel = bitMatrixParser.readFormatInformation()
      .errorCorrectionLevel;

    // Read codewords
    const codewords: number[] = bitMatrixParser.readCodewords();
    // Separate into data blocks
    const dataBlocks: DataBlock[] = DataBlock.getDataBlocks(
      codewords,
      version,
      ecLevel
    );

    const resultBytes = [];
    let resultOffset = 0;

    // Error-correct and copy data blocks together into a stream of bytes
    dataBlocks.forEach((dataBlock: DataBlock) => {
      const codewordBytes = dataBlock.codewords;
      const numDataCodewords = dataBlock.numDataCodewords;
      this.correctErrors(codewordBytes, numDataCodewords);
      for (let i = 0; i < numDataCodewords; i++) {
        resultBytes[resultOffset++] = codewordBytes[i];
      }
    });

    // Decode the contents of that stream of bytes
    return DecodedBitStreamParser.decode(resultBytes, version, ecLevel);
  }

  /**
   * <p>Given data and error-correction codewords received, possibly corrupted by errors, attempts to
   * correct the errors in-place using Reed-Solomon error correction.</p>
   *
   * @param codewordBytes data and error correction codewords
   * @param numDataCodewords number of codewords that are data bytes
   * @throws ChecksumException if error correction fails
   */
  private correctErrors(
    codewordBytes: number[],
    numDataCodewords: number
  ): void {
    const numCodewords: number = codewordBytes.length;
    // First read into an array of ints
    const codewordsInts: number[] = [];
    for (let i = 0; i < numCodewords; i++) {
      codewordsInts[i] = codewordBytes[i] & 0xff;
    }

    try {
      this.decoder.decode(
        codewordsInts,
        codewordBytes.length - numDataCodewords
      );
    } catch (ignored) {
      throw new ChecksumError();
    }

    // Copy back into array of bytes -- only need to worry about the bytes that were data
    // We don't care about errors in the error-correction codewords
    for (let i = 0; i < numDataCodewords; i++) {
      codewordBytes[i] = codewordsInts[i];
    }
  }
}
