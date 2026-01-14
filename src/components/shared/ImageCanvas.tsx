"use client";

import { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";

export interface ImageCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
  getContext: () => CanvasRenderingContext2D | null;
  getImageData: () => ImageData | null;
  putImageData: (imageData: ImageData) => void;
  toBlob: (type?: string, quality?: number) => Promise<Blob | null>;
  reset: () => void;
}

interface ImageCanvasProps {
  image?: HTMLImageElement | null;
  className?: string;
  showCheckerboard?: boolean;
  onCanvasClick?: (x: number, y: number, color: { r: number; g: number; b: number; a: number }) => void;
  onImageLoaded?: () => void;
}

export const ImageCanvas = forwardRef<ImageCanvasHandle, ImageCanvasProps>(
  function ImageCanvas(
    { image, className = "", showCheckerboard = true, onCanvasClick, onImageLoaded },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasImage, setHasImage] = useState(false);
    const [, setUpdateCount] = useState(0);

    const drawImage = useCallback((img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (canvas && ctx) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // requestAnimationFrame で状態更新を非同期化し、レンダリング中の更新警告を回避
        requestAnimationFrame(() => {
          setHasImage(true);
          setUpdateCount(c => c + 1);
          if (onImageLoaded) onImageLoaded();
        });
      }
    }, [onImageLoaded]);

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        requestAnimationFrame(() => {
          setHasImage(false);
        });
      }
    };

    // 画像が変更されたら描画
    useEffect(() => {
      if (image) {
        drawImage(image);
      } else {
        clearCanvas();
      }
    }, [image, drawImage]);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      getContext: () => canvasRef.current?.getContext("2d") ?? null,
      getImageData: () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx || !canvasRef.current) return null;
        return ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      },
      putImageData: (imageData: ImageData) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && canvas) {
          if (canvas.width !== imageData.width || canvas.height !== imageData.height) {
            canvas.width = imageData.width;
            canvas.height = imageData.height;
          }
          ctx.putImageData(imageData, 0, 0);
          requestAnimationFrame(() => {
            setHasImage(true);
            setUpdateCount(c => c + 1);
          });
        }
      },
      toBlob: (type = "image/png", quality = 1.0) => {
        return new Promise((resolve) => {
          canvasRef.current?.toBlob((blob) => resolve(blob), type, quality);
        });
      },
      reset: () => {
        if (image) {
          drawImage(image);
        } else {
          clearCanvas();
        }
      }
    }));

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onCanvasClick || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      const pixel = ctx.getImageData(x, y, 1, 1).data;
      onCanvasClick(x, y, {
        r: pixel[0],
        g: pixel[1],
        b: pixel[2],
        a: pixel[3],
      });
    };

    return (
      <div className={`relative inline-block ${className}`}>
        {showCheckerboard && hasImage && (
          <div className="absolute inset-0 bg-checkerboard pointer-events-none rounded-lg" />
        )}
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className={`relative z-10 block max-w-full rounded-lg cursor-crosshair ${hasImage ? "" : "hidden"}`}
          style={{ maxHeight: "500px" }}
        />
        {!hasImage && (
          <div className="w-64 h-64 flex items-center justify-center text-gray-400 text-sm">
            画像を読み込んでいます...
          </div>
        )}
      </div>
    );
  }
);
