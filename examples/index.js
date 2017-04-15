const
    filePath = './code.png',
    image = document.getElementById("qrcode"),
    text = document.getElementById("text"),
    rawBytes = document.getElementById("rawBytes"),
    numBits = document.getElementById("numBits"),
    barcodeFormat = document.getElementById("barcodeFormat"),
    timestamp = document.getElementById("timestamp");

image.onload = function () {
    try {
        const canvasElement = document.createElement('canvas');
        const context = canvasElement.getContext('2d');
        context.drawImage(image, 0, 0, image.width, image.height);

        const result = KXing.getReader().decode(context.getImageData(0, 0, image.width, image.height));

        text.innerHTML = result.text;
        rawBytes.innerHTML = result.rawBytes;
        numBits.innerHTML = result.numBits;
        barcodeFormat.innerHTML = result.barcodeFormat;
        timestamp.innerHTML = result.timestamp;

    } catch (e) {
        console.error('fail to decode.', e);
    }
};

image.src = filePath;
