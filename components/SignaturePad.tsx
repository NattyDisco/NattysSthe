import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface SignaturePadRef {
  getSignature: () => string;
  clear: () => void;
}

const SignaturePad = forwardRef<SignaturePadRef>((props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastPos = useRef<{ x: number, y: number } | null>(null);

    const getPosition = (e: MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        if (e instanceof MouseEvent) {
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        } else if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return { x: 0, y: 0 };
    };

    const draw = (e: MouseEvent | TouchEvent) => {
        if (!isDrawing.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !lastPos.current) return;
        
        const pos = getPosition(e);
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        lastPos.current = pos;
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
        isDrawing.current = true;
        lastPos.current = getPosition(e);
    };

    const stopDrawing = () => {
        isDrawing.current = false;
        lastPos.current = null;
    };
    
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const getSignatureData = () => {
        const canvas = canvasRef.current;
        if (!canvas) return '';
        // Check if canvas is blank before returning data
        const blank = document.createElement('canvas');
        blank.width = canvas.width;
        blank.height = canvas.height;
        if(canvas.toDataURL() === blank.toDataURL()) return '';

        return canvas.toDataURL('image/png');
    };

    useImperativeHandle(ref, () => ({
        getSignature: getSignatureData,
        clear: clearCanvas
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas dimensions based on container size
        const resizeCanvas = () => {
             if(canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
             }
             const ctx = canvas.getContext('2d');
             if (ctx) {
                ctx.strokeStyle = '#334155'; // slate-700
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
             }
        };

        resizeCanvas();

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            draw(e);
        }, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);
        
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            // Cleanup: remove event listeners
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, []);

    return (
        <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden cursor-crosshair">
            <canvas ref={canvasRef} />
        </div>
    );
});

export default SignaturePad;