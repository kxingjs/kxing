import IllegalArgumentError from "../IllegalArgumentError";

describe("IllegalArgumentError", function() {
  describe("constructor()", function() {
    it("should be error type.", function() {
      const error: IllegalArgumentError = new IllegalArgumentError();
      expect(error).toBeInstanceOf(IllegalArgumentError);
    });
  });

  describe("property", function() {
    it("can get a error message.", function() {
      const message = "This is message!";
      const error: IllegalArgumentError = new IllegalArgumentError(message);
      expect(error.message).toEqual(message);
    });
  });
  describe("property", function() {
    it("can get error name.", function() {
      const error: IllegalArgumentError = new IllegalArgumentError();
      expect(error.name).toEqual("IllegalArgumentError");
    });
  });
});
