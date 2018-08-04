/**
 * Porting from {@link https://github.com/TatsuyaYamamoto/zxing/blob/master/core/src/main/java/com/google/zxing/DecodeHintType.java}
 *
 * {@link Reader} receives a {@link Map} containing DecodeHint(s) as key to help decoding more quickly or accurately.
 *
 * @see Reader#decode
 * @author Tatsuya Yamamoto
 */
enum DecodeHint {
  /**
   * Spend more time to try to find a barcode; optimize for accuracy, not speed.
   * Doesn't matter what it maps to; use {@code true}.
   */
  TRY_HARDER
}

export default DecodeHint;
