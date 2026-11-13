import React, { useState } from 'react';
import { Upload, ScanLine, FileImage, AlertTriangle, CheckCircle2, Loader2, Stethoscope } from 'lucide-react';
import { api } from '../api';
import { MedicalDisclaimer } from './common/MedicalDisclaimer';

interface MedicalImageAnalyzerProps {
  user?: any;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const MODALITIES = [
  'Chest Radiograph (CXR)',
  'Dermatology / Skin Lesion Photo',
  'Malaria Blood Smear Microscopy',
  'Urinalysis / Rapid Test Strip',
  'Wound Care Progress Photo'
];

export const MedicalImageAnalyzer: React.FC<MedicalImageAnalyzerProps> = ({ addToast }) => {
  const [modality, setModality] = useState(MODALITIES[0]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/png');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    analysis: string;
    provider?: string;
    model?: string;
    disclaimer?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMimeType(file.type || 'image/png');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
        setAnalysisResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = () => {
    // Clean minimal clinical placeholder SVG rendered to base64 data URI for testing
    const svgSample = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320"><rect width="480" height="320" fill="#0f172a"/><ellipse cx="180" cy="160" rx="68" ry="96" fill="#1e293b" stroke="#64748b" stroke-width="2"/><ellipse cx="300" cy="160" rx="68" ry="96" fill="#1e293b" stroke="#64748b" stroke-width="2"/><rect x="228" y="40" width="24" height="220" rx="8" fill="#334155"/><circle cx="310" cy="185" r="24" fill="#94a3b8" opacity="0.45"/><text x="20" y="28" fill="#94a3b8" font-family="sans-serif" font-size="13">Sample PA Chest Study (Simulation)</text></svg>`;
    const encoded = `data:image/svg+xml;base64,${btoa(svgSample)}`;
    setPreviewUrl(encoded);
    setMimeType('image/png');
    setModality('Chest Radiograph (CXR)');
    setClinicalNotes('Adult patient with 5-day cough, fever 38.4C, mild right basal crackles.');
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!previewUrl) {
      addToast?.('Please upload a medical image or load the sample study first.', 'info');
      return;
    }
    setAnalyzing(true);
    try {
      const result = await api.clinical.analyzeImage({
        imageBase64: previewUrl,
        mimeType: mimeType === 'image/svg+xml' ? 'image/png' : mimeType,
        modality,
        clinicalNotes
      });
      setAnalysisResult(result);
      addToast?.('Preliminary visual review complete.', 'success');
    } catch (err: any) {
      addToast?.(err?.message || 'Unable to analyze clinical image.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ScanLine size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Medical Image Analysis Assistant</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preliminary structured observations for radiographs, skin photos, microscopy, and rapid test strips
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3.5 py-2 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-lg hover:bg-sky-100 transition-colors self-start sm:self-auto"
          >
            Load Sample Case
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Imaging Modality / Specimen Type
              </label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                {MODALITIES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Clinical Context &amp; Vital Signs (Optional)
              </label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Enter brief clinical history, fever duration, SpO2, or examination findings..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>

            <label className="block border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center cursor-pointer hover:border-teal-500 transition-colors bg-slate-50 dark:bg-slate-950/60">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {previewUrl ? (
                <div className="space-y-2">
                  <img src={previewUrl} alt="Clinical upload preview" className="max-h-52 mx-auto rounded-lg object-contain" />
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-400 block">
                    Click to replace image
                  </span>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <Upload size={24} className="mx-auto text-slate-400" />
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Upload radiograph, dermatology photo, or test strip
                  </div>
                  <div className="text-xs text-slate-500">PNG, JPG, or WEBP</div>
                </div>
              )}
            </label>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || !previewUrl}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Stethoscope size={16} />}
              <span>{analyzing ? 'Generating Preliminary Observations...' : 'Run Preliminary Image Review'}</span>
            </button>
          </div>

          <div className="lg:col-span-7 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            {analysisResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <CheckCircle2 size={16} className="text-teal-600" />
                    <span>Structured Visual Review</span>
                  </div>
                  <span className="text-xs text-slate-500">{analysisResult.provider}</span>
                </div>

                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {analysisResult.analysis}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-3">
                <FileImage size={32} className="text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No image analyzed yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                  Upload a clinical image or load the sample chest study on the left. Doctorian AI produces structured preliminary observations and quality checks for clinician review.
                </p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>
                  Automated image observations are preliminary support only and never replace formal radiologist or physician interpretation.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MedicalDisclaimer variant="banner" />
    </div>
  );
};

export default MedicalImageAnalyzer;
