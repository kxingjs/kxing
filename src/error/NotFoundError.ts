import KXingError from "./KXingError";

export default class NotFoundError extends KXingError {
    constructor(message?: string) {
        super('NotFoundError',message);
    }
}
