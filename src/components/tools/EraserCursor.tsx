"use client";
import { useEffect, useState } from 'react';

export function EraserCursor({ size }: { size: number }) {
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const moveHandler = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };
        window.addEventListener('mousemove', moveHandler);
        
        return () => {
            window.removeEventListener('mousemove', moveHandler);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div 
            className="fixed pointer-events-none rounded-full border-2 border-white bg-black/20 z-50 backdrop-invert mix-blend-difference"
            style={{
                top: position.y,
                left: position.x,
                width: size,
                height: size,
                transform: 'translate(-50%, -50%)',
            }}
        />
    );
}
