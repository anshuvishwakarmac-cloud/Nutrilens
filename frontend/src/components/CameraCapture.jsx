import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, XCircle, AlertCircle } from 'lucide-react';

export const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' for back camera, 'user' for front
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const startCamera = async (facing) => {
    setLoading(true);
    setError('');

    // Stop existing stream if active
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setLoading(false);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Could not access device camera. Please grant camera permissions or use file upload fallback.');
      setLoading(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `camera-meal-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
          onCapture(file);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl max-w-xl mx-auto border border-gray-800">
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
        <span className="text-white font-medium text-sm flex items-center space-x-1">
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>Snap Meal Photo</span>
        </span>
        <button
          onClick={() => {
            if (stream) stream.getTracks().forEach((t) => t.stop());
            if (onClose) onClose();
          }}
          className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Video stream container */}
      <div className="relative aspect-square sm:aspect-[4/3] bg-gray-900 flex items-center justify-center">
        {loading && (
          <div className="text-emerald-400 flex flex-col items-center space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <span className="text-sm text-gray-300">Initializing camera...</span>
          </div>
        )}

        {error && (
          <div className="p-6 text-center text-red-400 flex flex-col items-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${loading || error ? 'hidden' : 'block'}`}
        />
      </div>

      {/* Control bar */}
      {!error && (
        <div className="p-4 bg-gray-950 flex items-center justify-around">
          <button
            onClick={toggleCamera}
            className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
            title="Flip Camera"
          >
            <RefreshCw className="w-6 h-6" />
          </button>

          <button
            onClick={takeSnapshot}
            disabled={loading}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition flex items-center justify-center border-4 border-white/30 shadow-lg"
            title="Capture Photo"
          >
            <div className="w-12 h-12 rounded-full border-2 border-white bg-emerald-500" />
          </button>

          <div className="w-10" /> {/* Spacer */}
        </div>
      )}
    </div>
  );
};
