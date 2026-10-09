import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Camera } from 'lucide-react';

export const ImageDropzone = ({ onSelectFile, onOpenCamera }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelectFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
            : 'border-gray-300 hover:border-emerald-400 bg-white hover:bg-gray-50/80 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-semibold text-gray-800">
          Upload a meal photo
        </h3>
        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
          Drag and drop your image here, or click to browse (JPG, PNG, WebP up to 5 MB)
        </p>

        <div className="mt-4 flex items-center justify-center space-x-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit mx-auto px-3 py-1.5 rounded-full">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Client-side compression enabled</span>
        </div>
      </div>

      {/* Or Open Camera button */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        onClick={onOpenCamera}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition transform active:scale-[0.99]"
      >
        <Camera className="w-5 h-5" />
        <span>Use Device Camera</span>
      </button>
    </div>
  );
};
