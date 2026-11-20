import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Image as ImageIcon, X, AlertCircle, RefreshCw } from 'lucide-react';

export const ImageUploader = ({ onImageSelect, selectedImage, previewUrl, onClear, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const validateAndProcessFile = (file) => {
    setError(null);
    if (!file) return;

    // Check extension / type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid format! Only JPG, JPEG, and PNG images are supported.');
      return;
    }

    // Check file size (max 15MB)
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds 15 MB. Please select a smaller photo.');
      return;
    }

    if (file.size < 500) {
      setError('File appears corrupted or empty. Please select a valid photo.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    onImageSelect(file, objectUrl);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={handleChange}
        disabled={isLoading}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        capture="environment"
        className="hidden"
        onChange={handleChange}
        disabled={isLoading}
      />

      {/* Upload Box / Image Preview */}
      {!previewUrl ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
            dragActive
              ? 'border-forest-600 bg-forest-50/70 scale-[1.01]'
              : 'border-slate-300 hover:border-forest-500 bg-white hover:bg-forest-50/30'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-bold text-slate-800">
              Drag & drop infected leaf image here, or <span className="text-forest-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-500">
              Supports high-resolution JPG, JPEG, and PNG files up to 15 MB
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-md shadow-forest-600/20 transition-transform active:scale-95"
            >
              <ImageIcon className="w-4 h-4" />
              Choose from Gallery
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-transform active:scale-95"
            >
              <Camera className="w-4 h-4 text-forest-600" />
              Capture with Camera
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md group">
          <img
            src={previewUrl}
            alt="Selected leaf preview"
            className="w-full max-h-[380px] object-contain mx-auto"
          />

          {/* Overlay Controls */}
          {!isLoading && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold rounded-xl transition-colors"
                title="Replace Image"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={onClear}
                className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-colors"
                title="Remove Image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* File details banner */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white text-xs flex justify-between items-end">
            <div>
              <p className="font-bold truncate max-w-[280px] sm:max-w-md">{selectedImage?.name || 'Selected leaf image'}</p>
              <p className="text-slate-300 text-[11px]">
                {selectedImage?.size ? `${(selectedImage.size / (1024 * 1024)).toFixed(2)} MB` : 'Ready for AI diagnostics'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-forest-600/90 text-white font-extrabold uppercase text-[10px] tracking-wider">
              Ready
            </span>
          </div>
        </div>
      )}

      {/* Validation Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
