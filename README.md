# KXing

[![Build Status](https://travis-ci.org/kxingjs/kxing.svg?branch=master)](https://travis-ci.org/kxingjs/kxing)

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

[![NPM](https://nodei.co/npm/kxing.png?compact=true)](https://nodei.co/npm/kxing/)

KXing ("kogera crossing") is JavaScript porting project of [ZXing](https://github.com/zxing/zxing), barcode image processing library implemented in Java.

## Installation

You can install via [npm](https://www.npmjs.com/package/kxing).

```
$ npm install --save kxing
// or yarn
```

## Usage

### Browsers

You can use it within the browser. Found UMD KXing file within node_modules.

```html
<!--Load UMD-->
<script src="./node_modules/kxing/dist/index.js"></script>
<script>
    // Load a pixel data
    KXing.ImageLoader.load(filePath).then(imageData => {
        try {
            // Get reader
            const reader = KXing.getReader();
            // Decode QRCode image.
            const result = reader.decode(imageData);
        } catch (e) {
            console.error("fail to decode.", e);
        }
    });
</script>
```

### With bundler

If you use bundler, import as ES6 module.

```js
import { getReader, ImageLoader } from "kxing";

// Load a pixel data
ImageLoader.load(filePath).then(imageData => {
  try {
    // Get reader
    const reader = KXing.getReader();
    // Decode QRCode image.
    const result = reader.decode(imageData);
  } catch (e) {
    console.error("fail to decode.", e);
  }
});
```

## API

### `reader = getReader()`

**_Getter that KXing [Reader](https://github.com/kxingjs/kxing/blob/master/src/Reader.ts) instance._**

- The instance can be reused.

#### Important notes

Current version can provide [QRCodeReader](https://github.com/kxingjs/kxing/blob/master/src/qrcode/QRCodeReader.ts) only.

### `result = reader.decode(imageData)`

**_Decode a barcode image and return result object._**

- `imageData` is [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) instance, pixel data of an area of a canvas element. You can get it from [CanvasRenderingContext2D.getImageData()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData).
- `decode()` provide `result` that has some values: - text: Decoded string. - rawBytes: Raw bytes encoded by the barcode - numBits: Number of valid bits. - barcodeFormat - timestamp
- In case to fail decode, throw Error: (e.g.: NotFoundError, FormatError).

### `multiReader = getMultiReader()`

**_Getter that KXing [MultipleBarcodeReader](https://github.com/kxingjs/kxing/blob/master/src/multi/MultipleBarcodeReader.ts) instance._**

- The instance can be reused.

#### Important notes

Current version can provide [MultiQRCodeReader](https://github.com/kxingjs/kxing/blob/master/src/multi/qrcode/MultiQRCodeReader.ts) only.

### `results = multiReader.decodeMultiple(imageData)`

**_Decode a barcode images and return results._**
