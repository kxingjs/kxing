# KXing

[![Build Status](https://travis-ci.org/kxingjs/kxing.svg?branch=master)](https://travis-ci.org/kxingjs/kxing)

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

[![NPM](https://nodei.co/npm/kxing.png?compact=true)](https://nodei.co/npm/kxing/)

KXing ("kogera crossing") is JavaScript porting project of [ZXing](https://github.com/zxing/zxing), barcode image processing library implemented in Java.

## Installation

You can install via [npm](https://www.npmjs.com/package/kxing).

```
$ npm install --save kxing
```

## Usage

```
your_project/
  └ node_modules/
    └ kxing/
      ├ dist/
      │  ├ kxing.js         <- UMD (Universal Module Definition).
      │  └ kxing.min.js     <- minified UMD.
      └ es/                 <- es6 module.
```

### Browsers

You can use it within the browser. Found UMD KXing file within node_modules.

```html
<script src="./node_modules/kxing/dist/kxing.js"></script>
<script>
    var result = KXing.getReader().decode(imageData);
</script>
```

### With bundler

If you use bundler, import as ES6 module.

```js
import { getReader } from "kxing";
const result = getReader().decode(imageData);
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
