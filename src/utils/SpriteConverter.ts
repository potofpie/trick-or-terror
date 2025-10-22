import { Pixel } from '../types/interfaces';

export class SpriteConverter {
    static convertImageToPixels(image: HTMLImageElement, width: number = 8, height: number = 8): Pixel[] {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = width;
        tempCanvas.height = height;

        tempCtx.drawImage(image, 0, 0, width, height);

        const imageData = tempCtx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const pixels: Pixel[] = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];

                if (a > 0) {
                    pixels.push({
                        x: x,
                        y: y,
                        color: `rgb(${r}, ${g}, ${b})`
                    });
                }
            }
        }

        return pixels;
    }

    static convertBackgroundToPixels(image: HTMLImageElement, width: number, height: number): Pixel[] {
        return this.convertImageToPixels(image, width, height);
    }
}

