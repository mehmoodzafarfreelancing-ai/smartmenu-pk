const MAX_WIDTH = 1024;
const JPEG_QUALITY = 0.7;

/**
 * Downscales to max width 1024px (preserving aspect ratio) and re-encodes as JPEG.
 * Good enough for OCR, much smaller than phone camera originals.
 */
export function compressImageForScan(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("JPEG encoding failed"));
              return;
            }
            const out = new File([blob], "menu-scan.jpg", {
              type: "image/jpeg",
            });
            resolve(out);
          },
          "image/jpeg",
          JPEG_QUALITY
        );
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}
