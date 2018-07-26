import Version from "../format/Version";
import FormatInformation from "../format/FormatInformation";
import BitMatrix from "../../common/BitMatrix";
import { DataMask } from "../format/DataMask";
import FormatError from "../../error/FormatError";

/**
 * Porting from {@link https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/decoder/BitMatrixParser.java}
 *
 * @author Tatsuya Yamamoto
 */
export default class BitMatrixParser {
  private _target: BitMatrix;
  private _parsedVersion: Version;
  private _parsedFormatInfo: FormatInformation;

  constructor(target: BitMatrix) {
    const dimension = target.height;
    if (dimension < 21 || (dimension & 0x03) != 1) {
      throw new FormatError();
    }
    this._target = target;
  }

  /**
   * <p>Reads format information from one of its two locations within the QR Code.</p>
   *
   * @return {@link FormatInformation} encapsulating the QR Code's format info
   * @throws FormatException if both format information locations cannot be parsed as
   * the valid encoding of format information
   */
  readFormatInformation(): FormatInformation {
    if (this._parsedFormatInfo != null) {
      return this._parsedFormatInfo;
    }

    // Read top-left format info bits
    let formatInfoBits1: number = 0;
    for (let i = 0; i < 6; i++) {
      formatInfoBits1 = this.copyBit(i, 8, formatInfoBits1);
    }

    // .. and skip a bit in the timing pattern ...
    formatInfoBits1 = this.copyBit(7, 8, formatInfoBits1);
    formatInfoBits1 = this.copyBit(8, 8, formatInfoBits1);
    formatInfoBits1 = this.copyBit(8, 7, formatInfoBits1);
    // .. and skip a bit in the timing pattern ...

    for (let j = 5; j >= 0; j--) {
      formatInfoBits1 = this.copyBit(8, j, formatInfoBits1);
    }

    // Read the top-right/bottom-left pattern too
    let dimension: number = this._target.height;
    let formatInfoBits2: number = 0;
    const jMin: number = dimension - 7;
    for (let j = dimension - 1; j >= jMin; j--) {
      formatInfoBits2 = this.copyBit(8, j, formatInfoBits2);
    }
    for (let i = dimension - 8; i < dimension; i++) {
      formatInfoBits2 = this.copyBit(i, 8, formatInfoBits2);
    }

    this._parsedFormatInfo = FormatInformation.decodeFormatInformation(
      formatInfoBits1,
      formatInfoBits2
    );
    if (this._parsedFormatInfo != null) {
      return this._parsedFormatInfo;
    }

    throw new FormatError();
  }

  /**
   * <p>Reads version information from one of its two locations within the QR Code.</p>
   *
   * @return {@link Version} encapsulating the QR Code's version
   * @throws FormatException if both version information locations cannot be parsed as
   * the valid encoding of version information
   */
  readVersion(): Version {
    if (this._parsedVersion != null) {
      return this._parsedVersion;
    }

    const dimension: number = this._target.height;

    const provisionalVersion: number = (dimension - 17) / 4;
    if (provisionalVersion <= 6) {
      return Version.getVersionForNumber(provisionalVersion);
    }

    // Read top-right version info: 3 wide by 6 tall
    let versionBits: number = 0;
    const ijMin: number = dimension - 11;
    for (let j = 5; j >= 0; j--) {
      for (let i = dimension - 9; i >= ijMin; i--) {
        versionBits = this.copyBit(i, j, versionBits);
      }
    }

    let theParsedVersion = Version.decodeVersionInformation(versionBits);
    if (
      theParsedVersion != null &&
      theParsedVersion.dimensionForVersion == dimension
    ) {
      this._parsedVersion = theParsedVersion;
      return theParsedVersion;
    }

    // Hmm, failed. Try bottom left: 6 wide by 3 tall
    versionBits = 0;
    for (let i = 5; i >= 0; i--) {
      for (let j = dimension - 9; j >= ijMin; j--) {
        versionBits = this.copyBit(i, j, versionBits);
      }
    }

    theParsedVersion = Version.decodeVersionInformation(versionBits);
    if (
      theParsedVersion != null &&
      theParsedVersion.dimensionForVersion == dimension
    ) {
      this._parsedVersion = theParsedVersion;
      return theParsedVersion;
    }
    throw new FormatError();
  }

  private copyBit(i, j, versionBits): number {
    return this._target.getBit(i, j)
      ? (versionBits << 1) | 0x1
      : versionBits << 1;
  }

  /**
   * <p>Reads the bits in the {@link BitMatrix} representing the finder pattern in the
   * correct order in order to reconstruct the codewords bytes contained within the
   * QR Code.</p>
   *
   * @return bytes encoded within the QR Code
   * @throws FormatException if the exact number of bytes expected is not read
   */
  readCodewords(): number[] {
    const formatInformation: FormatInformation = this.readFormatInformation();
    const version: Version = this.readVersion();

    // Get the data mask for the format used in this QR Code. This will exclude
    // some bits from reading as we wind through the bit matrix.
    const dataMask: DataMask = formatInformation.dataMask;
    const dimension: number = this._target.height;
    dataMask.unmaskBitMatrix(this._target, dimension);

    const functionPattern: BitMatrix = version.buildFunctionPattern();

    let readingUp: boolean = true;
    const result: number[] = [];
    let resultOffset: number = 0;
    let currentByte: number = 0;
    let bitsRead: number = 0;

    // Read columns in pairs, from right to left
    for (let j = dimension - 1; j > 0; j -= 2) {
      if (j == 6) {
        // Skip whole column with vertical alignment pattern;
        // saves time and makes the other code proceed more cleanly
        j--;
      }
      // Read alternatingly from bottom to top then top to bottom
      for (let count = 0; count < dimension; count++) {
        const i: number = readingUp ? dimension - 1 - count : count;
        for (let col = 0; col < 2; col++) {
          // Ignore bits covered by the function pattern
          if (!functionPattern.getBit(j - col, i)) {
            // Read a bit
            bitsRead++;
            currentByte <<= 1;
            if (this._target.getBit(j - col, i)) {
              currentByte |= 1;
            }
            // If we've made a whole byte, save it off
            if (bitsRead == 8) {
              result[resultOffset++] = Math.floor(currentByte);
              bitsRead = 0;
              currentByte = 0;
            }
          }
        }
      }
      readingUp = !readingUp;
    }
    if (resultOffset != version.totalCodewords) {
      throw new FormatError();
    }
    return result;
  }
}
