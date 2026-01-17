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
  onMouseDown?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onTouchStart?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchMove?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
}

export const ImageCanvas = forwardRef<ImageCanvasHandle, ImageCanvasProps>(
  function ImageCanvas(
    { image, className = "", showCheckerboard = true, onCanvasClick, onImageLoaded, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasImage, setHasImage] = useState(false);
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
    const [, setUpdateCount] = useState(0);

    const drawImage = useCallback((img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (canvas && ctx) {
        // High DPI Display support? 
        // For now keep simple as per original
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        requestAnimationFrame(() => {
          setCanvasDimensions({ width: img.naturalWidth, height: img.naturalHeight });
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

    const handleInteraction = useCallback((clientX: number, clientY: number) => {
      if (!onCanvasClick || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return;
      }

      const x = Math.floor((clientX - rect.left) * scaleX);
      const y = Math.floor((clientY - rect.top) * scaleY);

      if (x < 0 || x >= canvasRef.current.width || y < 0 || y >= canvasRef.current.height) {
        return;
      }

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      const pixel = ctx.getImageData(x, y, 1, 1).data;
      onCanvasClick(x, y, {
        r: pixel[0],
        g: pixel[1],
        b: pixel[2],
        a: pixel[3],
      });
    }, [onCanvasClick]);

    const handleMouseDownWrapper = (e: React.MouseEvent<HTMLCanvasElement>) => {
      handleInteraction(e.clientX, e.clientY);
      if (onMouseDown) onMouseDown(e);
    };

    const handleTouchStartWrapper = (e: React.TouchEvent<HTMLCanvasElement>) => {
      const touch = e.touches[0];
      handleInteraction(touch.clientX, touch.clientY);
      if (onTouchStart) onTouchStart(e);
    };

    // Calculate display dimensions using useMemo (mobile only)
    const displayDimensions = (() => {
      if (!hasImage || canvasDimensions.width === 0) {
        return {};
      }
      
      // Only apply on mobile (width < 768px)
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        return { maxWidth: '100%', maxHeight: '500px' }; // Desktop: traditional behavior
      }
      
      const naturalW = canvasDimensions.width;
      const naturalH = canvasDimensions.height;
      
      // Mobile display constraints
      const minDisplaySize = 250;
      const maxDisplayHeight = 350;
      const maxDisplayWidth = typeof window !== 'undefined' ? window.innerWidth * 0.85 : 300;
      
      let scale = 1;
      if (naturalW > maxDisplayWidth) {
        scale = Math.min(scale, maxDisplayWidth / naturalW);
      }
      if (naturalH > maxDisplayHeight) {
        scale = Math.min(scale, maxDisplayHeight / naturalH);
      }
      
      const displayW = naturalW * scale;
      const displayH = naturalH * scale;
      
      if (displayW < minDisplaySize && displayH < minDisplaySize) {
        const upscale = minDisplaySize / Math.max(displayW, displayH);
        scale *= upscale;
      }
      
      return {
        width: naturalW * scale,
        height: naturalH * scale,
      };
    })();

    return (
      <div className={`relative inline-block ${className}`}>
        {showCheckerboard && hasImage && (
          <div className="absolute inset-0 bg-checkerboard pointer-events-none rounded-lg" />
        )}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDownWrapper}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={handleTouchStartWrapper}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={`relative z-10 block rounded-lg cursor-crosshair touch-none ${hasImage ? "" : "hidden"}`}
          style={displayDimensions}
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
