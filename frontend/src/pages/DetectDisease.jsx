import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { ImageUploader } from '../components/ImageUploader';
import { PredictionCard } from '../components/PredictionCard';
import { 
  Activity, 
  Sparkles, 
  Loader2, 
  Info, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  FileQuestion
} from 'lucide-react';

export const DetectDisease = ({ setActivePage, selectedSample, onClearSample }) => {
  const { token } = useAuth();
  const { t } = useLanguage();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);

  // If a sample was passed from Home page, load it
  useEffect(() => {
    if (selectedSample) {
      handleLoadSample(selectedSample.file);
      if (onClearSample) onClearSample();
    }
  }, [selectedSample]);

  const handleImageSelect = (file, url) => {
    setSelectedFile(file);
    setPreviewUrl(url);
    setPredictionResult(null);
    setError(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPredictionResult(null);
    setError(null);
  };

  const handleRunInference = async () => {
    if (!selectedFile) {
      setError("Please upload or capture a leaf photo first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    setLoadingStep("Preprocessing image & validating plant leaf characteristics...");

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setLoadingStep("Running MobileNetV2 neural network inference on CPU...");

      const response = await api.detectDisease(formData, token);
      setPredictionResult(response);
    } catch (err) {
      console.error("AI Prediction Error:", err);
      setError(err.message || "Failed to process image through AI model.");
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Helper to load sample files from backend or generate blob
  const handleLoadSample = async (sampleFilename) => {
    handleClear();
    setIsLoading(true);
    setLoadingStep(`Loading verified demo sample: ${sampleFilename}...`);

    try {
      // In local dev, fetch sample from backend uploads or sample_images
      const sampleUrl = `http://localhost:8000/uploads/detections/${sampleFilename.startsWith('sample_') ? sampleFilename : `sample_${sampleFilename}`}`;
      const res = await fetch(sampleUrl);
      if (!res.ok) {
        throw new Error("Sample file could not be loaded from backend.");
      }
      const blob = await res.blob();
      const file = new File([blob], sampleFilename, { type: 'image/jpeg' });
      const objectUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      
      // Automatically run inference on demo samples
      const formData = new FormData();
      formData.append('file', file);
      setLoadingStep("Running MobileNetV2 neural network inference...");
      const prediction = await api.detectDisease(formData, token);
      setPredictionResult(prediction);
    } catch (err) {
      console.warn("Direct sample fetch notice, fetching fallback demo:", err);
      // If direct fetch from static uploads fails, try relative or show error
      setError("Please select or drop a local image file from your computer or camera.");
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100 text-forest-800 text-xs font-bold uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-forest-600" />
          <span>AI Computer Vision Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-forest-950 font-sans tracking-tight">
          {t('detect.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {t('detect.subtitle')}
        </p>
      </div>

      {/* Main Interactive Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Uploader & Quick Samples */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
            
            <ImageUploader
              onImageSelect={handleImageSelect}
              selectedImage={selectedFile}
              previewUrl={previewUrl}
              onClear={handleClear}
              isLoading={isLoading}
            />

            {/* Inference Trigger Button */}
            {previewUrl && !predictionResult && (
              <button
                type="button"
                onClick={handleRunInference}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-black text-sm shadow-lg shadow-forest-700/20 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{loadingStep || 'Analyzing Leaf with AI...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-agricultural-300" />
                    <span>Run AI Disease Diagnosis</span>
                  </>
                )}
              </button>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* CSP Demonstration Sample Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {t('detect.samplePhotos')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: "Tomato Blight", file: "sample_tomato_early_blight.jpg" },
                  { name: "Healthy Tomato", file: "sample_tomato_healthy.jpg" },
                  { name: "Potato Blight", file: "sample_potato_early_blight.jpg" }
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLoadSample(sample.file)}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-forest-500 bg-slate-50 hover:bg-forest-50/50 text-[11px] font-bold text-slate-700 hover:text-forest-800 transition-colors text-left"
                  >
                    🌱 {sample.name}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Environmental Factors & Accuracy Notice */}
          <div className="p-5 rounded-2xl bg-forest-50/80 border border-forest-100 text-forest-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-forest-950">
              <Lightbulb className="w-4 h-4 text-forest-700" />
              <span>Guidelines for Accurate AI Leaf Diagnosis</span>
            </div>
            <p className="text-forest-800/90 leading-relaxed">
              {t('detect.accuracyNote')}
            </p>
          </div>
        </div>

        {/* Right Column: Prediction Output */}
        <div className="lg:col-span-5 space-y-6">
          {isLoading ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-md text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mx-auto animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Analyzing Specimen</h3>
                <p className="text-xs text-slate-500">{loadingStep || 'Evaluating image with deep CNN...'}</p>
              </div>
            </div>
          ) : predictionResult ? (
            <PredictionCard
              result={predictionResult}
              imageUrl={previewUrl}
              onReportOutbreak={(pred) => {
                setActivePage('reports');
              }}
              onViewLibrary={(diseaseId) => {
                setActivePage('library');
              }}
            />
          ) : (
            <div className="bg-white rounded-3xl p-10 border-2 border-dashed border-slate-200 text-center space-y-4 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileQuestion className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-700">No Specimen Uploaded Yet</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Select a leaf photo or pick one of the sample demonstration leaves to view diagnostic results, symptoms, and organic treatment regimens.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
