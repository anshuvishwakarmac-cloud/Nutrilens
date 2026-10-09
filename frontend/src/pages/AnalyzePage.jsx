import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeMeal, saveMeal } from '../api/mealApi';
import { CameraCapture } from '../components/CameraCapture';
import { ImageDropzone } from '../components/ImageDropzone';
import { FoodItemEditor } from '../components/FoodItemEditor';
import { AllergenWarning } from '../components/AllergenWarning';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { compressImage } from '../utils/imageCompressor';
import { Camera, Sparkles, CheckCircle, RefreshCw, AlertCircle, Save, ArrowLeft } from 'lucide-react';

export const AnalyzePage = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState('dropzone'); // 'dropzone' | 'camera'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loadingStep, setLoadingStep] = useState(''); // '' | 'compressing' | 'uploading' | 'analyzing' | 'verifying'
  const [analysisResult, setAnalysisResult] = useState(null);
  const [editedFoods, setEditedFoods] = useState([]);
  const [mealType, setMealType] = useState('lunch');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleImageSelected = async (file) => {
    setError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      setLoadingStep('Compressing image on client...');
      const compressed = await compressImage(file);

      setLoadingStep('Analyzing image with Vision AI & USDA FoodData...');
      const res = await analyzeMeal(compressed);

      setAnalysisResult(res);
      setEditedFoods(res.foods || []);
      setLoadingStep('');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze meal photo. Please try another image.');
      setLoadingStep('');
    }
  };

  const handleSaveConfirmedMeal = async () => {
    if (!analysisResult || editedFoods.length === 0) return;

    setSaving(true);
    setError('');

    try {
      await saveMeal({
        imageUrl: analysisResult.imageUrl,
        mealType,
        foods: editedFoods,
        notes,
        eatenAt: new Date().toISOString()
      });

      navigate('/history');
    } catch (err) {
      console.error('Save meal error:', err);
      setError(err.message || 'Failed to save meal log.');
    } finally {
      setSaving(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setEditedFoods([]);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            <span>AI Meal Photo Analyzer</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Snap or upload your meal plate for instant nutrition breakdown
          </p>
        </div>

        {analysisResult && (
          <button
            onClick={resetAnalysis}
            className="flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Analyze New Photo</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Input selection (Camera or Dropzone) */}
      {!analysisResult && !loadingStep && (
        <div className="space-y-6">
          {mode === 'camera' ? (
            <CameraCapture
              onCapture={(file) => {
                setMode('dropzone');
                handleImageSelected(file);
              }}
              onClose={() => setMode('dropzone')}
            />
          ) : (
            <ImageDropzone
              onSelectFile={handleImageSelected}
              onOpenCamera={() => setMode('camera')}
            />
          )}
        </div>
      )}

      {/* Loading Progress State */}
      {loadingStep && (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{loadingStep}</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            NutriLens AI is identifying ingredients, estimating gram weights, verifying USDA data, and scanning allergens.
          </p>
        </div>
      )}

      {/* Step 2: Analysis Results & Editor Workspace */}
      {analysisResult && (
        <div className="space-y-8">
          {/* Top Preview Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="aspect-video md:aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={analysisResult.imageUrl || previewUrl}
                alt="Meal analysis preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                  AI Confidence: {Math.round((analysisResult.confidence || 0.88) * 100)}%
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-2">
                  Meal Analysis Summary
                </h2>
                <p className="text-sm text-gray-500 mt-1">{analysisResult.notes}</p>
              </div>

              {/* Meal Type Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition ${
                      mealType === type
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Allergen Screening Component */}
          <AllergenWarning
            allergens={analysisResult.allergens || []}
            warningInfo={analysisResult.allergenWarning}
          />

          {/* Interactive Food Breakdown Editor */}
          <FoodItemEditor
            initialFoods={analysisResult.foods || []}
            onFoodsChange={(updated) => setEditedFoods(updated)}
          />

          {/* Optional Meal Notes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Meal Notes / Comments (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Ate post-workout, felt satisfied"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Confirm & Save Button */}
          <button
            onClick={handleSaveConfirmedMeal}
            disabled={saving || editedFoods.length === 0}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-base font-bold flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl transition transform active:scale-[0.99]"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving Meal Log...' : 'Confirm & Save Meal Log'}</span>
          </button>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
};
