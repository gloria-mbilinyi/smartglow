import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Info,
  Sliders,
  ChevronRight,
  Eye,
  Check,
  ShoppingBag,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Product } from '../types/store';
import { UserProfile, updateSkinPreferences } from '../services/api';
import {
  assessImageQuality,
  extractObservableMetrics,
  calibrateRecommendations,
  ImageQualityAssessment,
  ObservableSkinMetrics,
  FacialRegion,
  ExplainableMatch,
  NON_CLINICAL_DISCLAIMER,
} from '../services/skinAnalysisEngine';

interface SkinAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currentUser: UserProfile | null;
  authToken: string | null;
  onAddToCart: (product: Product) => void;
  onProfileUpdated?: (user: UserProfile) => void;
}

type AnalysisStage = 'privacy_consent' | 'capture' | 'analyzing' | 'results';

export const SkinAnalysisModal: React.FC<SkinAnalysisModalProps> = ({
  isOpen,
  onClose,
  products,
  currentUser,
  authToken,
  onAddToCart,
  onProfileUpdated,
}) => {
  const [stage, setStage] = useState<AnalysisStage>('privacy_consent');
  const [activeInputTab, setActiveInputTab] = useState<'camera' | 'upload' | 'presets'>('camera');

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Capture / Image State
  const [capturedImageSrc, setCapturedImageSrc] = useState<string | null>(null);
  const [qualityAssessment, setQualityAssessment] = useState<ImageQualityAssessment | null>(null);
  const [metricsResult, setMetricsResult] = useState<ObservableSkinMetrics | null>(null);
  const [recommendedMatches, setRecommendedMatches] = useState<ExplainableMatch[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('forehead');
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);
  const [profileSyncSuccess, setProfileSyncSuccess] = useState(false);

  // Stop camera when closing
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setStage('privacy_consent');
      setCapturedImageSrc(null);
      setQualityAssessment(null);
      setMetricsResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Initialize WebCam Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError(
        'Unable to access camera. Please verify camera permissions in your browser or select an image file instead.'
      );
    }
  };

  // Perform Analysis on Canvas ImageData
  const runAnalysisOnImageData = (
    imgWidth: number,
    imgHeight: number,
    imgData: Uint8ClampedArray,
    imgDataUrl: string,
    overrideMeasurements?: { redness: number; shine: number; texture: number; pores: number }
  ) => {
    setStage('analyzing');
    setCapturedImageSrc(imgDataUrl);

    setTimeout(() => {
      // 1. Evaluate Photographic Quality
      const quality = assessImageQuality(imgWidth, imgHeight, imgData);
      setQualityAssessment(quality);

      // 2. Extract Regional Observables
      const metrics = extractObservableMetrics(
        imgWidth,
        imgHeight,
        imgData,
        quality,
        overrideMeasurements
      );
      setMetricsResult(metrics);

      // 3. Calibrate Explainable Product Recommendations
      const matches = calibrateRecommendations(products, metrics, currentUser);
      setRecommendedMatches(matches);

      stopCameraStream();
      setStage('results');
    }, 600);
  };

  // Capture Frame from Video
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    runAnalysisOnImageData(canvas.width, canvas.height, imgData.data, dataUrl);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        runAnalysisOnImageData(canvas.width, canvas.height, imgData.data, src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Load a Pre-Calibrated Diagnostic Preset
  const handleSelectPreset = (presetType: 'balanced' | 'redness' | 'shine' | 'dehydrated' | 'blurry' | 'dark') => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (presetType === 'dark') {
      ctx.fillStyle = 'rgb(18, 18, 18)';
      ctx.fillRect(0, 0, 400, 400);
      const imgData = ctx.getImageData(0, 0, 400, 400);
      runAnalysisOnImageData(400, 400, imgData.data, canvas.toDataURL());
      return;
    }

    if (presetType === 'blurry') {
      ctx.fillStyle = 'rgb(160, 160, 160)';
      ctx.fillRect(0, 0, 400, 400);
      const imgData = ctx.getImageData(0, 0, 400, 400);
      runAnalysisOnImageData(400, 400, imgData.data, canvas.toDataURL());
      return;
    }

    // Realistic portrait simulation canvas
    ctx.fillStyle = 'rgb(225, 195, 175)';
    ctx.fillRect(0, 0, 400, 400);

    // Forehead
    ctx.fillStyle = presetType === 'shine' ? 'rgb(250, 240, 230)' : 'rgb(230, 200, 180)';
    ctx.fillRect(120, 60, 160, 80);

    // T-Zone
    ctx.fillStyle = presetType === 'shine' ? 'rgb(255, 250, 245)' : 'rgb(240, 215, 200)';
    ctx.fillRect(160, 140, 80, 120);

    // Cheeks
    ctx.fillStyle = presetType === 'redness' ? 'rgb(240, 150, 150)' : 'rgb(232, 190, 180)';
    ctx.fillRect(60, 180, 90, 110);
    ctx.fillRect(250, 180, 90, 110);

    // Chin
    ctx.fillStyle = 'rgb(220, 190, 170)';
    ctx.fillRect(140, 300, 120, 65);

    // Add high-frequency focus lines
    ctx.strokeStyle = 'rgb(140, 110, 95)';
    for (let i = 50; i < 350; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 60);
      ctx.lineTo(i, 340);
      ctx.stroke();
    }

    const imgData = ctx.getImageData(0, 0, 400, 400);

    let measurements = { redness: 30, shine: 35, texture: 25, pores: 28 };
    if (presetType === 'redness') {
      measurements = { redness: 68, shine: 24, texture: 44, pores: 30 };
    } else if (presetType === 'shine') {
      measurements = { redness: 32, shine: 74, texture: 38, pores: 65 };
    } else if (presetType === 'dehydrated') {
      measurements = { redness: 36, shine: 18, texture: 68, pores: 32 };
    }

    runAnalysisOnImageData(400, 400, imgData.data, canvas.toDataURL(), measurements);
  };

  // Sync detected tendency to customer profile
  const handleSyncToProfile = async () => {
    if (!authToken || !currentUser || !metricsResult) return;
    setIsSyncingProfile(true);
    try {
      let inferredType = 'All';
      let inferredConcerns = [...(currentUser.skinConcerns || [])];

      if (metricsResult.estimatedSkinTendency.includes('Reactive')) {
        inferredType = 'Sensitive';
        if (!inferredConcerns.includes('Redness & Sensitivity')) {
          inferredConcerns.push('Redness & Sensitivity');
        }
      } else if (metricsResult.estimatedSkinTendency.includes('Oily')) {
        inferredType = 'Combination';
        if (!inferredConcerns.includes('Acne & Blemishes')) {
          inferredConcerns.push('Acne & Blemishes');
        }
      } else if (metricsResult.estimatedSkinTendency.includes('Dry')) {
        inferredType = 'Dry';
        if (!inferredConcerns.includes('Dryness & Dehydration')) {
          inferredConcerns.push('Dryness & Dehydration');
        }
      }

      const updated = await updateSkinPreferences(authToken, {
        skinType: inferredType,
        skinConcerns: inferredConcerns,
      });

      if (onProfileUpdated) onProfileUpdated(updated);
      setProfileSyncSuccess(true);
      setTimeout(() => setProfileSyncSuccess(false), 3000);
    } catch {
      alert('Could not update profile preferences.');
    } finally {
      setIsSyncingProfile(false);
    }
  };

  const selectedRegion = metricsResult?.regions.find((r) => r.id === selectedRegionId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="skin-analysis-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#faf9f6] rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 id="skin-analysis-title" className="font-display text-lg font-bold text-stone-900">
                AI Optical Skin Analysis & Calibration
              </h2>
              <p className="text-[11px] text-stone-500">
                Non-clinical observable facial analysis &middot; Calibrated botanical formulation matching
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STAGE 1: PRIVACY & PERMISSION DISCLOSURE */}
        {stage === 'privacy_consent' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1">
                  <div className="font-bold text-emerald-900 text-sm">
                    Privacy-First Ephemeral Biometric Processing
                  </div>
                  <p className="leading-relaxed">
                    Facial images are processed exclusively in-memory on your device or in volatile memory.
                    Raw photographs are <strong>never stored, retained on databases, or shared with third parties</strong>.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 space-y-1">
                  <div className="font-bold text-amber-900">
                    Non-Clinical Cosmetic Guidance Disclosure
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    This analysis measures <strong>observable surface optical features</strong> (specular shine,
                    visible redness, and surface texture). It does NOT measure sebum secretion, dermal water content,
                    or skin-barrier permeability, and cannot diagnose medical skin conditions.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
                <div className="font-semibold text-stone-900">Capture Guidelines for Best Results:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-600">
                  <li>Position face towards a diffused, natural daylight window.</li>
                  <li>Remove makeup if evaluating baseline redness and bare-skin texture.</li>
                  <li>Keep camera at eye level and hold the device steady to avoid blur.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setStage('capture');
                    startCamera();
                  }}
                  className="px-6 py-2.5 bg-stone-900 text-stone-50 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>Accept & Start Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: CAPTURE / UPLOAD / PRESETS */}
        {stage === 'capture' && (
          <div className="p-6 space-y-5">
            {/* Input Selection Tabs */}
            <div className="flex border-b border-stone-200 text-xs font-semibold gap-3">
              <button
                onClick={() => {
                  setActiveInputTab('camera');
                  startCamera();
                }}
                className={`pb-2.5 px-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeInputTab === 'camera'
                    ? 'border-stone-900 text-stone-950'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Live Camera</span>
              </button>
              <button
                onClick={() => {
                  setActiveInputTab('upload');
                  stopCameraStream();
                }}
                className={`pb-2.5 px-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeInputTab === 'upload'
                    ? 'border-stone-900 text-stone-950'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photograph</span>
              </button>
              <button
                onClick={() => {
                  setActiveInputTab('presets');
                  stopCameraStream();
                }}
                className={`pb-2.5 px-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeInputTab === 'presets'
                    ? 'border-stone-900 text-stone-950'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Test Calibration Fixtures</span>
              </button>
            </div>

            {/* TAB 1: LIVE WEBCAM */}
            {activeInputTab === 'camera' && (
              <div className="space-y-4">
                {cameraError ? (
                  <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-3">
                    <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
                    <div className="text-xs text-rose-800 font-semibold">{cameraError}</div>
                    <button
                      onClick={() => setActiveInputTab('presets')}
                      className="px-4 py-2 bg-stone-900 text-stone-50 text-xs rounded-lg font-semibold hover:bg-stone-800"
                    >
                      Use Test Calibration Fixtures Instead
                    </button>
                  </div>
                ) : (
                  <div className="relative max-w-md mx-auto aspect-4/3 rounded-2xl overflow-hidden bg-stone-900 border-2 border-stone-800 shadow-inner flex items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />

                    {/* Framing Oval Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-52 h-68 border-2 border-dashed border-amber-300/70 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 bg-stone-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg">
                      <span>Center face inside oval</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Live Optical Stream
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleCaptureSnapshot}
                    disabled={!isCameraActive}
                    className="px-8 py-3 bg-stone-900 text-stone-50 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-colors cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture & Analyze</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: FILE UPLOAD */}
            {activeInputTab === 'upload' && (
              <div className="p-8 border-2 border-dashed border-stone-300 rounded-2xl text-center space-y-4 hover:border-stone-400 transition-colors bg-white">
                <Upload className="w-10 h-10 text-stone-400 mx-auto" />
                <div>
                  <label className="cursor-pointer px-5 py-2.5 bg-stone-900 text-stone-50 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-colors inline-block shadow-xs">
                    <span>Select Photo</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-stone-500 mt-2">
                    Supports JPEG, PNG, and WebP (Minimum 320x320 resolution)
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: TEST PRESETS */}
            {activeInputTab === 'presets' && (
              <div className="space-y-4">
                <p className="text-xs text-stone-600">
                  Select a calibrated diagnostic fixture to test non-clinical observable algorithms across varied conditions:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSelectPreset('balanced')}
                    className="p-3.5 bg-white border border-stone-300 rounded-xl text-left hover:border-stone-500 hover:bg-stone-50 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="font-semibold text-xs text-stone-900">1. Balanced & Radiant Surface</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Uniform diffuse light, balanced micro-erythema and low surface shine.
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectPreset('redness')}
                    className="p-3.5 bg-white border border-rose-300 rounded-xl text-left hover:border-rose-500 hover:bg-rose-50/50 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="font-semibold text-xs text-rose-900">2. Reactive Redness & Sensitive Barrier</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Elevated cheek redness index with barrier restoration calibration.
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectPreset('shine')}
                    className="p-3.5 bg-white border border-amber-300 rounded-xl text-left hover:border-amber-500 hover:bg-amber-50/50 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="font-semibold text-xs text-amber-900">3. High T-Zone Shine & Pore Prominence</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Prominent nasal specular shine with clarifying BHA/Zinc calibration.
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectPreset('dehydrated')}
                    className="p-3.5 bg-white border border-blue-300 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="font-semibold text-xs text-blue-900">4. Micro-Texture & Dehydration Tendency</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Surface micro-roughness with multi-molecular hyaluronic calibration.
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectPreset('dark')}
                    className="p-3.5 bg-stone-100 border border-stone-300 rounded-xl text-left hover:border-stone-400 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="font-semibold text-xs text-stone-800">5. Underexposed Quality Rejection Test</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Low lighting (below 45 lum) triggering quality warning and guidance.
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectPreset('blurry')}
                    className="p-3.5 bg-stone-100 border border-stone-300 rounded-xl text-left hover:border-stone-400 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="font-semibold text-xs text-stone-800">6. Motion Blur Quality Rejection Test</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Low focus sharpness triggering motion blur warning.
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STAGE 3: ANALYZING SPINNER */}
        {stage === 'analyzing' && (
          <div className="py-20 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-stone-800 animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="font-display text-base font-semibold text-stone-900">
                Segmenting Facial Regions & Optical Features...
              </p>
              <p className="text-xs text-stone-500">
                Assessing focus sharpness, lighting variance, and non-clinical surface traits
              </p>
            </div>
          </div>
        )}

        {/* STAGE 4: RESULTS DASHBOARD */}
        {stage === 'results' && metricsResult && qualityAssessment && (
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs">
            {/* QUALITY BANNER */}
            {!qualityAssessment.isAcceptable ? (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>Optical Capture Quality Insufficient</span>
                </div>
                <p className="text-amber-900 text-xs">{qualityAssessment.feedbackMessage}</p>
                <div className="pt-2">
                  <button
                    onClick={() => setStage('capture')}
                    className="px-4 py-2 bg-stone-900 text-stone-50 rounded-lg font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Recapture Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Image Quality Verified &middot; Focus: {qualityAssessment.sharpnessScore}% &middot; Lighting: {qualityAssessment.lightingScore}%</span>
                </div>
                <span className="font-mono-num font-bold text-emerald-800">
                  Confidence: {metricsResult.overallConfidence}%
                </span>
              </div>
            )}

            {/* VISUAL REGION INSPECTOR & OPTICAL METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo & Region Masks */}
              <div className="space-y-3">
                <div className="font-semibold text-stone-900 flex items-center justify-between">
                  <span>Facial Region Segmentation</span>
                  <span className="text-[11px] text-stone-500">Tap a region to inspect</span>
                </div>

                <div className="relative aspect-square max-w-sm mx-auto bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 shadow-sm flex items-center justify-center">
                  {capturedImageSrc && (
                    <img
                      src={capturedImageSrc}
                      alt="Captured Face"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Render Visual Overlays for 5 Regions */}
                  {metricsResult.regions.map((region) => {
                    const isSelected = selectedRegionId === region.id;
                    return (
                      <button
                        key={region.id}
                        onClick={() => setSelectedRegionId(region.id)}
                        style={{
                          left: `${region.bounds.x * 100}%`,
                          top: `${region.bounds.y * 100}%`,
                          width: `${region.bounds.width * 100}%`,
                          height: `${region.bounds.height * 100}%`,
                        }}
                        className={`absolute rounded-lg transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-amber-400/35 border-amber-300 ring-2 ring-amber-400 shadow-md'
                            : 'bg-stone-900/20 border-white/40 hover:bg-white/20'
                        }`}
                        title={region.name}
                      >
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-950/80 text-white">
                          {region.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Region Selector Pills */}
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {metricsResult.regions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRegionId(r.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                        selectedRegionId === r.id
                          ? 'bg-stone-900 text-stone-50'
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>

                {/* Region Details Callout */}
                {selectedRegion && (
                  <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-1.5">
                    <div className="font-semibold text-stone-900 flex justify-between">
                      <span>{selectedRegion.name}</span>
                      <span className="text-stone-500 font-normal">Regional Optical Index</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="bg-stone-50 p-2 rounded-lg">
                        <div className="text-stone-500">Redness</div>
                        <div className="font-bold text-stone-900 font-mono-num">{selectedRegion.relativeRedness}%</div>
                      </div>
                      <div className="bg-stone-50 p-2 rounded-lg">
                        <div className="text-stone-500">Specular Shine</div>
                        <div className="font-bold text-stone-900 font-mono-num">{selectedRegion.specularShine}%</div>
                      </div>
                      <div className="bg-stone-50 p-2 rounded-lg">
                        <div className="text-stone-500">Texture</div>
                        <div className="font-bold text-stone-900 font-mono-num">{selectedRegion.textureRoughness}%</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-500 italic pt-1">{selectedRegion.summary}</p>
                  </div>
                )}
              </div>

              {/* Metrics & Classification Breakdown */}
              <div className="space-y-4">
                <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                        Estimated Observable Tendency
                      </div>
                      <div className="font-display text-base font-bold text-stone-900 mt-0.5">
                        {metricsResult.estimatedSkinTendency}
                      </div>
                    </div>
                    {currentUser && (
                      <button
                        onClick={handleSyncToProfile}
                        disabled={isSyncingProfile}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {profileSyncSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Sliders className="w-3.5 h-3.5" />}
                        <span>{profileSyncSuccess ? 'Saved' : 'Save to Profile'}</span>
                      </button>
                    )}
                  </div>

                  {/* Observable Metric Progress Bars */}
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-medium text-stone-700">Visible Redness / Erythema Estimate</span>
                        <span className="font-mono-num font-bold text-stone-900">{metricsResult.rednessIndex}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${metricsResult.rednessIndex}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-medium text-stone-700">Surface Specular Shine & Sebum Tendency</span>
                        <span className="font-mono-num font-bold text-stone-900">{metricsResult.shineIndex}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${metricsResult.shineIndex}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-medium text-stone-700">Micro-Texture Roughness Estimate</span>
                        <span className="font-mono-num font-bold text-stone-900">{metricsResult.textureRoughnessIndex}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${metricsResult.textureRoughnessIndex}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-medium text-stone-700">Pore Prominence Indicator</span>
                        <span className="font-mono-num font-bold text-stone-900">{metricsResult.poreProminenceIndex}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stone-800 rounded-full"
                          style={{ width: `${metricsResult.poreProminenceIndex}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Non-Clinical Disclaimer Banner */}
                <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-[11px] text-stone-600 leading-relaxed">
                  <strong>Notice:</strong> {NON_CLINICAL_DISCLAIMER}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStage('capture')}
                    className="flex-1 py-2.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    Test Another Image
                  </button>
                </div>
              </div>
            </div>

            {/* CALIBRATED BOTANICAL FORMULATIONS SECTION */}
            <div className="pt-4 border-t border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-stone-900">
                    Calibrated Botanical Routine Matches
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Formulations selected specifically to address your observed optical traits
                  </p>
                </div>
              </div>

              {recommendedMatches.length === 0 ? (
                <div className="py-8 text-center text-stone-500 text-xs">
                  No direct product matches found. Try testing another capture or browsing the main catalog.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedMatches.map((match) => (
                    <div
                      key={match.product.id}
                      className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex gap-3 items-center">
                          <img
                            src={match.product.imageUrl}
                            alt={match.product.name}
                            className="w-16 h-16 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-100"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                {match.targetTrait}
                              </span>
                              <span className="font-mono-num text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {match.matchScore}% Match
                              </span>
                            </div>
                            <div className="font-semibold text-xs text-stone-900 truncate mt-0.5">
                              {match.product.name}
                            </div>
                            <div className="font-mono-num text-xs font-bold text-stone-900 mt-1">
                              ${match.product.price.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Why It Matches Callout */}
                        <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-700 space-y-1">
                          <div className="font-semibold text-stone-900 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>Why This Formulation Was Calibrated:</span>
                          </div>
                          <p className="leading-snug">{match.whyItMatches}</p>
                        </div>

                        {/* Allergen & Skin Type Tags */}
                        <div className="space-y-1 text-[10px]">
                          <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50/70 px-2 py-1 rounded">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{match.allergenSafetyStatus}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onAddToCart(match.product);
                        }}
                        className="w-full py-2 bg-stone-900 text-stone-50 text-[11px] font-semibold uppercase tracking-wider rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
