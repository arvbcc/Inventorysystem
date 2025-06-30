import React, { useEffect } from 'react';
import { Camera, X, Zap, ZapOff } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { useScanner } from '../hooks/useScanner';

interface ScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  isActive: boolean;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onClose, isActive }) => {
  const { videoRef, isActive: cameraActive, error: cameraError, startCamera, stopCamera } = useCamera();
  const { isScanning, error: scannerError, startScanning, stopScanning } = useScanner(
    videoRef.current,
    onScan
  );

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
      stopScanning();
    }

    return () => {
      stopCamera();
      stopScanning();
    };
  }, [isActive, startCamera, stopCamera, stopScanning]);

  useEffect(() => {
    if (cameraActive && videoRef.current) {
      startScanning();
    }
  }, [cameraActive, startScanning]);

  if (!isActive) return null;

  const error = cameraError || scannerError;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center">
          <Camera className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Scan Asset</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isScanning ? (
              <Zap className="w-4 h-4 text-green-500" />
            ) : (
              <ZapOff className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-600">
              {isScanning ? 'Scanning...' : 'Initializing...'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white rounded-lg p-6 mx-4 max-w-md text-center">
              <Camera className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Error</h3>
              <p className="text-gray-600 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
                  
                  {/* Scanning animation */}
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-blue-400 animate-pulse"></div>
                    </div>
                  )}
                </div>
                
                <p className="text-white text-center mt-4 text-sm">
                  Position the QR code or barcode within the frame
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white p-4 text-center">
        <p className="text-sm text-gray-600">
          Hold your device steady and ensure the code is clearly visible
        </p>
      </div>
    </div>
  );
};