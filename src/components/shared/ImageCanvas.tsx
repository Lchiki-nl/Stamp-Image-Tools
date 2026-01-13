"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

export interface ImageCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
  getContext: () => CanvasRenderingContext2D | null;
  getImageData: () => ImageData | null;
  putImageData: (imageData: ImageData) => void;
  toBlob: (type?: string, quality?: number) => Promise<Blob | null>;
  drawImage: (image: HTMLImageElement) => void;
}

interface ImageCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  showCheckerboard?: boolean;
  onCanvasClick?: (x: number, y: number, color: { r: number; g: number; b: number; a: number }) => void;
}

export const ImageCanvas = forwardRef<ImageCanvasHandle, ImageCanvasProps>(
  function ImageCanvas(
    { width = 800, height = 600, className = "", showCheckerboard = true, onCanvasClick },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      getContext: () => canvasRef.current?.getContext("2d") ?? null,
      getImageData: () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx || !canvasRef.current) return null;
        return ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      },
      putImageData: (imageData: ImageData) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.putImageData(imageData, 0, 0);
        }
      },
      toBlob: (type = "image/png", quality = 1.0) => {
        return new Promise((resolve) => {
          canvasRef.current?.toBlob((blob) => resolve(blob), type, quality);
        });
      },
      drawImage: (image: HTMLImageElement) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
      },
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
      <div className={`relative overflow-hidden rounded-2xl ${className}`}>
        {showCheckerboard && (
          <div className="absolute inset-0 bg-checkerboard pointer-events-none" />
        )}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleClick}
          className="relative z-10 max-w-full max-h-full object-contain cursor-crosshair"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    );
  }
);
