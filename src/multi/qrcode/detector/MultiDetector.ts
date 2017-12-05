import QRDetector from "../../../qrcode/detector/QRDetector";
import MultiFinderPatternFinder from "./MultiFinderPatternFinder";
import BitMatrix from "../../../common/BitMatrix";

class MultiDetector extends QRDetector {

    public detectMulti(): BitMatrix[] {

        const finderPatternFinder = new MultiFinderPatternFinder(this._bits, this._width, this._height);
        const finderPatterns = finderPatternFinder.findMulti();

        const results: BitMatrix[] = [];
        finderPatterns.forEach((pattern) => {
            try {
                results.push(this.processFinderPatternInfo(pattern));
            } catch (e) {
                // ignore
            }
        });

        return results;
    }
}

export default MultiDetector;
