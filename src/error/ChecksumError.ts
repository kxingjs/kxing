import KXingError from "./KXingError";

export default class ChecksumError extends KXingError {
  constructor(message?: string) {
    super("ChecksumError", message);
  }
}
