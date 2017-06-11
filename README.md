# KXing

[![Build Status](https://travis-ci.org/kxingjs/kxing.svg?branch=master)](https://travis-ci.org/kxingjs/kxing)

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

```
<script src="./node_modules/kxing/dist/kxing.js"></script>
<script>
    var result = KXing.getReader().decode(imageData);
</script>
```
