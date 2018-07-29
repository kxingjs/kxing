const fs = require("fs");
const { Image } = require("canvas");

/**
 * Load image as bitmap.
 *
 * @param filePath
 * @returns {Promise<ImageData>}
 */
export function loadImage(filePath): Promise<ImageData> {
  const img = new Image();
  const canvasElement = document.createElement("canvas");
  const context = canvasElement.getContext("2d");

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, function(err, squid) {
      if (err) {
        reject(err);
        return;
      }

      img.src = squid;

      context.drawImage(img, 0, 0, img.width, img.height);
      const qrcodeImage = context.getImageData(0, 0, img.width, img.height);

      resolve(qrcodeImage);
    });
  });
}
