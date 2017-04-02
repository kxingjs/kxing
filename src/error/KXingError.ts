export abstract class KXingError {
    constructor() {
        Error.apply(this, arguments);
    }
    abstract get name():string;
    abstract get message():string;
}

KXingError.prototype = new Error();
