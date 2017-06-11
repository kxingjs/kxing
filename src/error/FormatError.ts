import KXingError from "./KXingError";

export default class FormatError extends KXingError {
    constructor(message?: string) {
        super('FormatError', message);
    }
}
