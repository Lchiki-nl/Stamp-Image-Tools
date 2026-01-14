
import { 
    removeBackground, 
    cropImage, 
    splitImage, 
    detectBoundingBox,
    hexToRgb
} from './image-utils';

/**
 * 画像ファイルを読み込んでImageDataを取得するヘルパー
 */
async function loadImageData(file: File): Promise<{ imageData: ImageData, width: number, height: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }> {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");

    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    return {
        imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
        width: canvas.width,
        height: canvas.height,
        canvas,
        ctx
    };
}

/**
 * ImageDataをBlobに変換するヘルパー
 */
async function imageDataToBlob(imageData: ImageData): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");
    
    ctx.putImageData(imageData, 0, 0);
    
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Could not create blob"));
        }, 'image/png');
    });
}

// --- Batch Process Functions ---

export interface RemoveBackgroundConfig {
    targetColor: string; // hex
    tolerance: number;
    feather: number;
}

export async function processRemoveBackground(file: File, config: RemoveBackgroundConfig): Promise<Blob> {
    const { imageData } = await loadImageData(file);
    const rgb = hexToRgb(config.targetColor) || { r: 255, g: 255, b: 255 };
    
    const resultData = removeBackground(imageData, rgb, config.tolerance, config.feather);
    return imageDataToBlob(resultData);
}

export interface CropConfig {
    mode: 'auto' | 'manual';
    manual?: { top: number, right: number, bottom: number, left: number };
}

export async function processCrop(file: File, config: CropConfig): Promise<Blob> {
    const { imageData } = await loadImageData(file);
    let bounds;

    if (config.mode === 'auto') {
        const detected = detectBoundingBox(imageData);
        if (!detected) return file; // No content found, return original
        bounds = detected;
    } else if (config.manual) {
        bounds = {
            top: config.manual.top,
            right: imageData.width - config.manual.right - 1,
            bottom: imageData.height - config.manual.bottom - 1,
            left: config.manual.left
        };
    } else {
        return file;
    }

    // クロップ範囲のバリデーション
    if (bounds.right < bounds.left || bounds.bottom < bounds.top) {
        return file; // Invalid bounds
    }

    const resultData = cropImage(imageData, bounds.top, bounds.right, bounds.bottom, bounds.left);
    return imageDataToBlob(resultData);
}

export interface SplitConfig {
    rows: number;
    cols: number;
}

export async function processSplit(file: File, config: SplitConfig): Promise<Blob[]> {
    const { imageData } = await loadImageData(file);
    const parts = splitImage(imageData, config.rows, config.cols);
    
    const blobs = await Promise.all(parts.map(part => imageDataToBlob(part)));
    return blobs;
}
