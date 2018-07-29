import BitSource from "../BitSource";

describe("BitSource", function() {
  describe("testSource", function() {
    const bytes: number[] = [1, 2, 3, 4, 5];
    const source: BitSource = new BitSource(bytes);

    it("can be read successfully.", function() {
      expect(40).toEqual(source.available());
      expect(0).toEqual(source.readBits(1));
      expect(39).toEqual(source.available());
      expect(0).toEqual(source.readBits(6));
      expect(33).toEqual(source.available());
      expect(1).toEqual(source.readBits(1));
      expect(32).toEqual(source.available());
      expect(2).toEqual(source.readBits(8));
      expect(24).toEqual(source.available());
      expect(12).toEqual(source.readBits(10));
      expect(14).toEqual(source.available());
      expect(16).toEqual(source.readBits(8));
      expect(6).toEqual(source.available());
      expect(5).toEqual(source.readBits(6));
      expect(0).toEqual(source.available());
    });
  });
});
