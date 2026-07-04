import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, Leaf, AlertTriangle, CheckCircle,
  XCircle, RefreshCw, Info, Save, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, Badge, Button, PageHeader } from '../components/ui/Components';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { AI_CONFIG } from '../api/ai/config';
import { analyzeCropImage, type DiseaseDetectionResult } from '../api/ai/client';
import { saveDiseaseReport, getRecentDiseaseReports, type DiseaseReport } from '../api/disease';
import type { SupportedLanguage } from '../api/ai/prompts';
import { useTranslation } from 'react-i18next';

const DiseaseDetectionPage: React.FC = () => {
  const { user, profile } = useAuth();
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'treatment' | 'prevention'>('treatment');
  const [recentScans, setRecentScans] = useState<DiseaseReport[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { t, i18n } = useTranslation();
  const getAI_Language = (code: string): SupportedLanguage => {
    if (code.startsWith('hi')) return 'Hindi';
    if (code.startsWith('bn')) return 'Bengali';
    return 'English';
  };
  const userLanguage = getAI_Language(i18n.language);

  useEffect(() => {
    if (user) {
      loadRecentScans();
    }
  }, [user]);

  const loadRecentScans = async () => {
    if (!user) return;
    try {
      const scans = await getRecentDiseaseReports(user.uid);
      setRecentScans(scans);
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  };

  const handleImageUpload = (file: File) => {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB.');
      return;
    }

    setMimeType(file.type);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Str = e.target?.result as string;
      setUploadedImage(base64Str);
      analyzeImage(base64Str, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Str: string, mime: string) => {
    setIsAnalyzing(true);
    setResult(null);
    try {
      const diagnosis = await analyzeCropImage(base64Str, mime, userLanguage);
      setResult(diagnosis);
      toast.success('Analysis complete!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze the image.');
      setUploadedImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleSaveReport = async () => {
    if (!user || !result) return;
    setIsSaving(true);
    try {
      await saveDiseaseReport(user.uid, result);
      toast.success('Report saved successfully!');
      loadRecentScans(); // Refresh list
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report.');
    } finally {
      setIsSaving(false);
    }
  };

  const severityConfig = {
    low: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Low Risk', icon: CheckCircle },
    medium: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Medium Risk', icon: AlertTriangle },
    high: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', label: 'High Risk', icon: XCircle },
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Crop Disease Detection"
        subtitle="AI-powered diagnosis from plant photos"
        action={
          <Badge variant="green">
            <Sparkles className="w-3 h-3 mr-1" />
            {AI_CONFIG.modelDisplayName}
          </Badge>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          {/* Upload Zone */}
          <Card className="overflow-hidden">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                'relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer',
                isDragging
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                  : 'border-gray-200 dark:border-slate-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
              )}
              onClick={() => {
                if (!isAnalyzing && !uploadedImage) {
                  fileInputRef.current?.click();
                }
              }}
            >
              {/* Standard File Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                id="disease-image-upload"
              />
              
              {/* Camera Upload specifically for mobile */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                id="disease-camera-upload"
              />

              {uploadedImage ? (
                <div className="relative aspect-video">
                  <img
                    src={uploadedImage}
                    alt="Uploaded crop"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl backdrop-blur-sm">
                      <div className="text-center text-white">
                        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
                        <p className="font-medium text-sm">Analyzing with {AI_CONFIG.modelDisplayName}...</p>
                        <p className="text-xs text-white/70 mt-1">Checking disease patterns</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-primary-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Upload Crop Photo
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                    Supports JPG, PNG up to 5MB
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 pt-0 grid grid-cols-2 gap-2 mt-4">
              <Button
                variant="secondary"
                icon={<Camera className="w-4 h-4" />}
                onClick={() => cameraInputRef.current?.click()}
                className="w-full"
                id="camera-btn"
                disabled={isAnalyzing}
              >
                Take Photo
              </Button>
              <Button
                variant="secondary"
                icon={<Upload className="w-4 h-4" />}
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                id="gallery-btn"
                disabled={isAnalyzing}
              >
                Gallery
              </Button>
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" /> Tips for Better Results
            </h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-start gap-2">📸 Take photos in natural light</li>
              <li className="flex items-start gap-2">🔍 Capture affected leaves close-up</li>
              <li className="flex items-start gap-2">📐 Include both healthy and affected parts</li>
            </ul>
          </Card>

          {/* Recent Scans */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Recent Scans</h3>
            <div className="space-y-2">
              {recentScans.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                  No recent scans found.
                </div>
              ) : (
                recentScans.map((scan) => {
                  const config = severityConfig[scan.severity];
                  const Icon = config.icon;
                  return (
                    <Card key={scan.id} className="p-3 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', config.bg)}>
                        <Icon className={cn('w-4 h-4', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{scan.disease}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {new Date(scan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge variant={scan.severity === 'low' ? 'green' : scan.severity === 'medium' ? 'yellow' : 'red'}>
                          {config.label}
                        </Badge>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          <AnimatePresence mode="wait">
            {!result && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-64 flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                  <Leaf className="w-10 h-10 text-gray-300 dark:text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-400 dark:text-gray-500 text-base">
                  Upload a crop photo to get started
                </h3>
                <p className="text-sm text-gray-300 dark:text-gray-600 mt-2">
                  AI will analyze and diagnose any visible diseases
                </p>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Disease Header */}
                <Card className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-2', severityConfig[result.severity].bg, severityConfig[result.severity].color)}>
                        {React.createElement(severityConfig[result.severity].icon, { className: 'w-3.5 h-3.5' })}
                        {severityConfig[result.severity].label}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{result.disease}</h3>
                    </div>
                    <button
                      onClick={() => { setResult(null); setUploadedImage(null); }}
                      className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      title="Scan Another"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Confidence & Affected Area */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">AI Confidence</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.confidence}%</p>
                      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${result.confidence}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Affected Area</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.affectedArea}%</p>
                      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-red-500 h-1.5 rounded-full"
                          style={{ width: `${result.affectedArea}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{result.description}</p>
                </Card>

                {/* Symptoms */}
                {result.symptoms && result.symptoms.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">🔍 Symptoms Observed</h4>
                    <ul className="space-y-2">
                      {result.symptoms.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Treatment / Prevention Tabs */}
                <Card className="overflow-hidden">
                  <div className="flex border-b border-gray-100 dark:border-slate-700">
                    {(['treatment', 'prevention'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          'flex-1 py-3 text-sm font-medium capitalize transition-colors',
                          activeTab === tab
                            ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        )}
                        id={`${tab}-tab`}
                      >
                        {tab === 'treatment' ? '💊 Treatment' : '🛡️ Prevention'}
                      </button>
                    ))}
                  </div>
                  <div className="p-4">
                    <ul className="space-y-3">
                      {(activeTab === 'treatment' ? (result.treatment || []) : (result.prevention || [])).map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                    {(activeTab === 'treatment' ? (result.treatment || []) : (result.prevention || [])).length === 0 && (
                      <p className="text-sm text-gray-500">No {activeTab} information available.</p>
                    )}
                  </div>
                </Card>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pb-8">
                  <Button variant="primary" className="w-full" id="consult-expert-btn">
                    Consult Expert
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleSaveReport}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Report'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetectionPage;
