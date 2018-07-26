/**
 * Load image as bitmap.
 *
 * @param filePath
 * @param callback
 */
export function loadImage(filePath, callback) {
  const imageElement: HTMLImageElement = new Image();
  const canvasElement: HTMLCanvasElement = document.createElement("canvas");
  const context: CanvasRenderingContext2D = canvasElement.getContext("2d");

  imageElement.onload = function() {
    context.drawImage(
      imageElement,
      0,
      0,
      imageElement.width,
      imageElement.height
    );
    const qrcodeImage = context.getImageData(
      0,
      0,
      imageElement.width,
      imageElement.height
    );

    callback(qrcodeImage);
  };

  imageElement.src = filePath;
}
