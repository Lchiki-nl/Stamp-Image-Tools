/**
 * 画像処理ユーティリティ関数
 */

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * 2色間のユークリッド距離を計算
 * @param c1 色1
 * @param c2 色2
 * @returns 距離 (0-441.67...)
 */
export function colorDistance(c1: RGBColor, c2: RGBColor): number {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Hex カラーコードを RGB に変換
 * @param hex #RRGGBB 形式
 */
export function hexToRgb(hex: string): RGBColor | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * RGB を Hex カラーコードに変換
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/**
 * 背景削除処理
 * @param imageData 元の ImageData
 * @param targetColor 削除する色
 * @param tolerance 許容値 (0-100)
 * @param feather ぼかし量 (0-100)
 * @returns 処理後の ImageData
 */
export function removeBackground(
  imageData: ImageData,
  targetColor: RGBColor,
  tolerance: number,
  feather: number = 0
): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // 最大距離 (白から黒) は sqrt(255^2 * 3) ≈ 441.67
  const maxDistance = Math.sqrt(255 * 255 * 3);
  const toleranceThreshold = (tolerance / 100) * maxDistance;
  const featherRange = (feather / 100) * maxDistance;

  // 新しい ImageData を作成
  const newImageData = new ImageData(new Uint8ClampedArray(data), width, height);
  const newData = newImageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const pixelColor: RGBColor = {
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
    };

    const distance = colorDistance(pixelColor, targetColor);

    if (distance <= toleranceThreshold) {
      // 完全に透明
      newData[i + 3] = 0;
    } else if (feather > 0 && distance <= toleranceThreshold + featherRange) {
      // フェザリング: 距離に応じてアルファを調整
      const featherProgress = (distance - toleranceThreshold) / featherRange;
      newData[i + 3] = Math.round(data[i + 3] * featherProgress);
    }
    // それ以外はそのまま (コピー済み)
  }

  return newImageData;
}

/**
 * 画像を分割する
 * @param imageData 元の ImageData
 * @param rows 行数
 * @param cols 列数
 * @returns 分割された ImageData の配列 (row-major order)
 */
export function splitImage(
  imageData: ImageData,
  rows: number,
  cols: number
): ImageData[] {
  const { width, height, data } = imageData;
  const cellWidth = Math.floor(width / cols);
  const cellHeight = Math.floor(height / rows);
  const result: ImageData[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellData = new Uint8ClampedArray(cellWidth * cellHeight * 4);

      for (let y = 0; y < cellHeight; y++) {
        for (let x = 0; x < cellWidth; x++) {
          const srcX = col * cellWidth + x;
          const srcY = row * cellHeight + y;
          const srcIdx = (srcY * width + srcX) * 4;
          const dstIdx = (y * cellWidth + x) * 4;

          cellData[dstIdx] = data[srcIdx];
          cellData[dstIdx + 1] = data[srcIdx + 1];
          cellData[dstIdx + 2] = data[srcIdx + 2];
          cellData[dstIdx + 3] = data[srcIdx + 3];
        }
      }

      result.push(new ImageData(cellData, cellWidth, cellHeight));
    }
  }

  return result;
}

/**
 * 不透明ピクセルのバウンディングボックスを検出
 * @param imageData 画像データ
 * @param bgColor 背景色として扱う色 (optional)
 * @param tolerance 背景色の許容値 (optional)
 * @returns { top, right, bottom, left } のピクセル座標
 */
export function detectBoundingBox(
  imageData: ImageData,
  bgColor?: RGBColor,
  tolerance: number = 0
): { top: number; right: number; bottom: number; left: number } | null {
  const { width, height, data } = imageData;
  const maxDistance = Math.sqrt(255 * 255 * 3);
  const toleranceThreshold = (tolerance / 100) * maxDistance;

  let top = height;
  let bottom = 0;
  let left = width;
  let right = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];

      // 完全に透明なピクセルはスキップ
      if (alpha === 0) continue;

      // 背景色と一致するピクセルはスキップ
      if (bgColor) {
        const pixelColor: RGBColor = {
          r: data[idx],
          g: data[idx + 1],
          b: data[idx + 2],
        };
        if (colorDistance(pixelColor, bgColor) <= toleranceThreshold) {
          continue;
        }
      }

      // バウンディングボックスを更新
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }

  // 有効なコンテンツが見つからなかった場合
  if (top > bottom || left > right) {
    return null;
  }

  return { top, right, bottom, left };
}

/**
 * 画像をクロップ
 */
export function cropImage(
  imageData: ImageData,
  top: number,
  right: number,
  bottom: number,
  left: number
): ImageData {
  const { width, data } = imageData;
  const newWidth = right - left + 1;
  const newHeight = bottom - top + 1;
  const newData = new Uint8ClampedArray(newWidth * newHeight * 4);

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const srcX = left + x;
      const srcY = top + y;
      const srcIdx = (srcY * width + srcX) * 4;
      const dstIdx = (y * newWidth + x) * 4;

      newData[dstIdx] = data[srcIdx];
      newData[dstIdx + 1] = data[srcIdx + 1];
      newData[dstIdx + 2] = data[srcIdx + 2];
      newData[dstIdx + 3] = data[srcIdx + 3];
    }
  }

  return new ImageData(newData, newWidth, newHeight);
}

/**
 * 画像をリサイズ
 * @param imageData 元の ImageData
 * @param width 目標の幅
 * @param height 目標の高さ
 */
export function resizeImage(imageData: ImageData, width: number, height: number): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");
    
    ctx.putImageData(imageData, 0, 0);
    
    const newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    const newCtx = newCanvas.getContext('2d');
    if (!newCtx) throw new Error("Could not get new canvas context");
    
    // 品質向上のための設定
    newCtx.imageSmoothingEnabled = true;
    newCtx.imageSmoothingQuality = 'high';
    
    newCtx.drawImage(canvas, 0, 0, width, height);
    return newCtx.getImageData(0, 0, width, height);
}
