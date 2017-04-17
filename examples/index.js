const
    filePath = './code.png',
    image = document.getElementById("qrcode"),
    text = document.getElementById("text"),
    rawBytes = document.getElementById("rawBytes"),
    numBits = document.getElementById("numBits"),
    barcodeFormat = document.getElementById("barcodeFormat"),
    timestamp = document.getElementById("timestamp");

image.onload = decodeWithKogera;
image.src = filePath;

function decodeWithKogera() {
    try {
        const context = createDrawnCanvasContext(image);
        const result = KXing.getReader().decode(context.getImageData(0, 0, image.width, image.height));

        setResult(result);
    } catch (e) {
        console.error('fail to decode.', e);
    }
}

function createDrawnCanvasContext(image) {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = image.width;
    canvasElement.height = image.height;

    const context = canvasElement.getContext('2d');
    context.drawImage(image, 0, 0);

    return context;
}

function setResult(result) {
    text.innerHTML = result.text;
    rawBytes.innerHTML = result.rawBytes;
    numBits.innerHTML = result.numBits;
    barcodeFormat.innerHTML = result.barcodeFormat;
    timestamp.innerHTML = result.timestamp;
}
