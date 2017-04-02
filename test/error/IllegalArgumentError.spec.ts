import {expect} from 'chai';
import IllegalArgumentError from "../../src/error/IllegalArgumentError";

describe("IllegalArgumentError", function () {
    describe("constructor()", function () {
        it("should be error type.", function () {
            const error: IllegalArgumentError = new IllegalArgumentError();
            expect(error).to.be.an.instanceof(Error);
        });
    });

    describe("property", function () {
        it("can get a error message.", function () {

            const message = 'This is message!';
            const error: IllegalArgumentError = new IllegalArgumentError(message);
            expect(error.message).to.be.equal(message);
        });
    });
    describe("property", function () {
        it("can get error name.", function () {

            const error: IllegalArgumentError = new IllegalArgumentError();
            expect(error.name).to.be.equal('IllegalArgumentError');
        });
    });
});
