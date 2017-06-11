import KXingError from "./KXingError";

export default class ReedSolomonError extends KXingError {
    constructor(message?: string) {
        super('ReedSolomonError',message);
    }
}
