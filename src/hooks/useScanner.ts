import { useEffect, useRef, useState, useCallback } from 'react';
import QrScanner from 'qr-scanner';

export const useScanner = (videoElement: HTMLVideoElement | null, onScan: (result: string) => void) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const startScanning = useCallback(async () => {
    if (!videoElement || scannerRef.current) return;

    try {
      setError(null);
      const scanner = new QrScanner(
        videoElement,
        (result) => {
          onScan(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment'
        }
      );

      await scanner.start();
      scannerRef.current = scanner;
      setIsScanning(true);
    } catch (err) {
      setError('Failed to start scanner. Please ensure camera permissions are granted.');
      console.error('Scanner error:', err);
    }
  }, [videoElement, onScan]);

  const stopScanning = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    isScanning,
    error,
    startScanning,
    stopScanning
  };
};