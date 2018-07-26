/**
 * Custom error class.
 * {@link https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Error}
 * {@link https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript}
 */
abstract class KXingError {
  public name: string;
  public message: string;
  public stack?;

  constructor(name, message) {
    this.name = name;
    this.message = message;
    this.stack = new Error().stack;
  }
}

KXingError.prototype = new Error();
export default KXingError;
