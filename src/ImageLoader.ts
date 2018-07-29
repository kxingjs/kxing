class ImageLoader {
  /**
   * Util function to load image as {@code ImageData}.
   *
   * @param {string | HTMLImageElement} image
   * @returns {Promise<ImageData>}
   * @link https://developer.mozilla.org/en-US/docs/Web/API/ImageData
   */
  public static async load(
    image: string | HTMLImageElement
  ): Promise<ImageData> {
    if (typeof image === "string") {
      image = await ImageLoader.loadImage(image);
    }
    const canvasElement = document.createElement("canvas");
    canvasElement.width = image.width;
    canvasElement.height = image.height;

    const context = canvasElement.getContext("2d");
    context.drawImage(image, 0, 0);

    return context.getImageData(0, 0, image.width, image.height);
  }

  private static loadImage(path: string): Promise<HTMLImageElement> {
    return new Promise(resolve => {
      const imageElement = document.createElement("img");
      imageElement.onload = function() {
        resolve(imageElement);
      };
      imageElement.src = path;
    });
  }
}

export default ImageLoader;
