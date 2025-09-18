
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CameraIcon, CloseIcon } from './icons';

interface WebcamCaptureProps {
  onCapture: (imageData: { dataUrl: string; mimeType: string }) => void;
  onClose: () => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError("Could not access webcam. Please check permissions and ensure it's not in use by another app.");
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, 0.9);
        onCapture({ dataUrl, mimeType });
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Webcam Scanner</h2>
        <div className="aspect-video bg-black rounded-md overflow-hidden mb-4 relative">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-black bg-opacity-70">
              <p className="text-center text-red-400">{error}</p>
            </div>
          )}
        </div>
        <div className="flex justify-center">
            <button
                onClick={handleCapture}
                disabled={!stream}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 transition-transform transform hover:scale-105"
            >
                <CameraIcon className="w-6 h-6" />
                Capture Document
            </button>
        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
};

export default WebcamCapture;
