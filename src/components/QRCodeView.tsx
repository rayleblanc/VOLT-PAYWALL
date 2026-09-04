import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  value: string;
  size?: number;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({ value, size = 180 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1,
          color: {
            dark: '#18181b', // Zinc 900
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) {
            console.error('Error generating QR Code', error);
          }
        }
      );
    }
  }, [value, size]);

  return (
    <div className="p-3 bg-white rounded-xl shadow-inner border border-zinc-700/40 inline-block">
      <canvas ref={canvasRef} className="rounded-lg block" />
    </div>
  );
};
