import KXingError from "./KXingError";

export default class IllegalArgumentError extends KXingError {
  constructor(message?: string) {
    super("IllegalArgumentError", message);
  }
}
