# Testing

## QR Code

### Input mode/datatype

[ref](https://en.wikipedia.org/wiki/QR_code)

| Input mode   | Max. characters | Bits/char. | Possible characters, default encoding                      |
| :----------- | :-------------- | :--------- | :--------------------------------------------------------- |
| Numeric only | 7,089           | 3⅓         | 0, 1, 2, 3, 4, 5, 6, 7, 8, 9                               |
| Alphanumeric | 4,296           | 5½         | 0–9, A–Z (upper-case only), space, $, %, \*, +, -, ., /, : |
| Binary/byte  | 2,953           | 8          | ISO 8859-1                                                 |
| Kanji/kana   | 1,817           | 13         | Shift JIS X 0208                                           |

### Test code images

#### Numeric only

- text - 1029384756
- Level - H
- image - [testcode.num.png](__tests__/testcode.num.png)

#### Alphanumeric

- text - 1234567890 %\*+-./:QWERTYUIOP
- Level - Q
- image - [testcode.alpha.png](__tests__/testcode.alpha.png)

#### Binary/byte

#### Kanji/kana
