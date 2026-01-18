import { removeBackground as removeBackgroundAI } from "@imgly/background-removal";
import { 
    removeBackground as removeBackgroundManual,
    cropImage, 
    splitImage, 
    detectBoundingBox,
    resizeImage,
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
    
    const resultData = removeBackgroundManual(imageData, rgb, config.tolerance, config.feather);
    return imageDataToBlob(resultData);
}

export interface AIConfig {
    aiModel?: string;      // e.g. "isnet-general-use"
    alphaMatting?: boolean; // e.g. true
    foregroundThreshold?: number; // 0-255, default 240
    backgroundThreshold?: number; // 0-255, default 10
}

export async function processRemoveBackgroundAI(file: File): Promise<Blob> {
    // Note: browser-side execution via @imgly/background-removal currently doesn't easily support dynamic model switching via this wrapper without complex config
    // For now, these params are mainly for the server-side implementation which uses a different path in page.tsx
    
    // @imgly/background-removal を使用して自動背景削除
    const blob = await removeBackgroundAI(file, {
        debug: true,
        progress: (key, current, total) => {
            console.log(`AI Model Download [${key}]: ${current}/${total}`);
        }
    });
    return blob;
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

export interface ResizeConfig {
    width: number;
    height: number;
    keepAspectRatio: boolean;
}

export async function processResize(file: File, config: ResizeConfig): Promise<Blob> {
    const { imageData } = await loadImageData(file);
    let targetWidth = config.width;
    let targetHeight = config.height;

    // アスペクト比維持の計算 (もし0が渡された場合などのフォールバックも兼ねて)
    if (config.keepAspectRatio) {
        const aspect = imageData.width / imageData.height;
        // 基本的にはwidth/height両方指定される前提だが、どちらか片方だけ変更されたケースなどを考慮してもよい
        // ここでは単純に指定されたサイズにリサイズする実装にする（UI側でアスペクト比計算を行う）
        // ただし、もし片方が0なら自動計算するロジックも便利
        if (targetWidth === 0 && targetHeight > 0) {
            targetWidth = Math.round(targetHeight * aspect);
        } else if (targetHeight === 0 && targetWidth > 0) {
            targetHeight = Math.round(targetWidth / aspect);
        }
    }

    const resultData = resizeImage(imageData, targetWidth, targetHeight);
    return imageDataToBlob(resultData);
}
