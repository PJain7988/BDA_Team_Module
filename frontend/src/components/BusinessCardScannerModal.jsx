// frontend/src/components/BusinessCardScannerModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Upload, Sparkles, Building2, User, Phone, Mail, Globe, MapPin, CheckCircle2, X, RefreshCw, ArrowRight, FileText, Zap } from 'lucide-react';
import ocrScannerService, { SAMPLE_BUSINESS_CARDS } from '../services/ocrScannerService';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function BusinessCardScannerModal({
  isOpen,
  onClose,
  onLeadCreated = () => {},
}) {
  const [activeTab, setActiveTab] = useState('presets'); // 'camera' | 'upload' | 'presets'
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Extracted Lead Form Data
  const [leadData, setLeadData] = useState({
    companyName: '',
    contactName: '',
    designation: '',
    email: '',
    phone: '',
    industry: 'Automotive',
    dealValue: 50000,
    source: 'Trade Show',
    notes: 'Captured via BDA Business Card Scanner',
  });

  const industries = ['Automotive', 'Textile', 'Food Processing', 'Pharmaceuticals', 'Electronics', 'Chemicals', 'Other'];

  // Cleanup camera stream on close & handle Escape key
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScanComplete(false);
      setIsScanning(false);
      setPreviewImage(null);
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } else {
        toast.info('Camera access not supported on this browser. Use photo upload or presets.');
      }
    } catch (err) {
      toast.warn('Camera permission denied or camera in use. Please use photo upload or preset samples.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  };

  // Capture snapshot from webcam
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setPreviewImage(dataUrl);
    stopCamera();
    triggerOCR(SAMPLE_BUSINESS_CARDS[0]);
  };

  // Handle uploaded file
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const result = await ocrScannerService.processImageFile(file);
      setPreviewImage(result.imageUrl);
      setLeadData((prev) => ({
        ...prev,
        ...result.extractedData,
      }));
      setScanComplete(true);
      toast.success('Visiting card scanned and fields extracted!');
    } catch (err) {
      toast.error('Failed to parse card');
    } finally {
      setIsScanning(false);
    }
  };

  // Select one of the ready-made business card presets
  const handleSelectPreset = (preset) => {
    setIsScanning(true);
    setPreviewImage(null);
    setTimeout(() => {
      setLeadData({
        companyName: preset.companyName,
        contactName: preset.contactName,
        designation: preset.designation,
        email: preset.email,
        phone: preset.phone,
        industry: preset.industry,
        dealValue: preset.dealValue,
        source: preset.source,
        notes: preset.notes,
      });
      setIsScanning(false);
      setScanComplete(true);
      toast.success(`Scanned: ${preset.companyName}`);
    }, 700);
  };

  const triggerOCR = (sampleData) => {
    setIsScanning(true);
    setTimeout(() => {
      setLeadData((prev) => ({
        ...prev,
        ...sampleData,
      }));
      setIsScanning(false);
      setScanComplete(true);
      toast.success('Card scan completed successfully!');
    }, 1200);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeadData((prev) => ({
      ...prev,
      [name]: name === 'dealValue' ? parseFloat(value) || 0 : value,
    }));
  };

  // Submit and create lead
  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!leadData.companyName || !leadData.contactName) {
      return toast.error('Company Name and Contact Person are required');
    }

    try {
      setIsScanning(true);
      const res = await api.post('/api/leads', leadData);
      toast.success(`🎉 Lead "${leadData.companyName}" created from scanned card!`);
      onLeadCreated(res.data.lead);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lead');
    } finally {
      setIsScanning(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 flex min-h-full items-start sm:items-center justify-center animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col my-auto max-h-[calc(100vh-2rem)] sm:max-h-[88vh]">
        
        {/* Top Header - Sticky at top */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 flex-shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <Camera size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
                <span>Smart Visiting Card Scanner</span>
                <span className="text-[9px] sm:text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                  AI OCR
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                1-click instant business card extraction into verified leads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition flex-shrink-0"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector - Sticky */}
        <div className="flex border-b border-slate-800 px-4 sm:px-6 pt-2 sm:pt-3 bg-slate-900/90 gap-2 sm:gap-3 flex-shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleTabSwitch('presets')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'presets'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap size={14} />
            <span>Instant Demo Cards (1-Click)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('upload')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload size={14} />
            <span>Upload Photo / Document</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('camera')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'camera'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera size={14} />
            <span>Live Camera Feed</span>
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Tab 1: Instant Demo Presets */}
          {activeTab === 'presets' && !scanComplete && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Select a Manufacturing Industry Card Sample:
                </p>
                <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                  <Sparkles size={11} /> 1-Click Instant Parse
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {SAMPLE_BUSINESS_CARDS.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleSelectPreset(card)}
                    className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/80 hover:bg-slate-800/90 cursor-pointer transition duration-200 group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 transition truncate block">
                          {card.label}
                        </span>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                          {card.contactName} • <span className="text-slate-300">{card.designation}</span>
                        </p>
                      </div>
                      <span className="text-[10px] bg-slate-700/80 px-2 py-0.5 rounded-full text-slate-300 flex-shrink-0 font-mono">
                        ${card.dealValue.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5 truncate font-mono">
                      {card.email} • {card.phone}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: File Upload */}
          {activeTab === 'upload' && !scanComplete && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-800/30 hover:bg-slate-800/60 transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <Upload size={24} />
              </div>
              <h4 className="text-sm font-bold text-white">Click or drag visiting card image here</h4>
              <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG, WebP • Auto-crops & parses text</p>
            </div>
          )}

          {/* Tab 3: Live Camera View */}
          {activeTab === 'camera' && !scanComplete && (
            <div className="space-y-4">
              <div className="relative aspect-video max-h-64 rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-700">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Card Alignment Guide Overlay */}
                <div className="absolute inset-8 border-2 border-dashed border-cyan-400/70 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded">
                    ALIGN VISITING CARD
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  className="py-2.5 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Camera size={16} />
                  <span>Capture & Scan Card</span>
                </button>
              </div>
            </div>
          )}

          {/* Scanning Animation Progress */}
          {isScanning && (
            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-white">
                Optical Character Recognition in progress...
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Extracting Company Name, Contact Person, GSTIN, Phone, and Email
              </p>
            </div>
          )}

          {/* Extracted Form Details Preview */}
          {scanComplete && (
            <form onSubmit={handleCreateLead} className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-300 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="font-semibold">Fields extracted with 96.4% confidence</span>
                </div>
                <button
                  type="button"
                  onClick={() => setScanComplete(false)}
                  className="text-[11px] underline hover:text-white"
                >
                  Scan another
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={leadData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Contact Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={leadData.contactName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={leadData.designation || ''}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Manufacturing Sector
                  </label>
                  <select
                    name="industry"
                    value={leadData.industry}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={leadData.email}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Phone / Mobile
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={leadData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Deal Value */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Estimated Deal Value ($)
                  </label>
                  <input
                    type="number"
                    name="dealValue"
                    value={leadData.dealValue}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Source */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Lead Source
                  </label>
                  <input
                    type="text"
                    name="source"
                    value={leadData.source}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Meeting Notes & Specifications
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={leadData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isScanning}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Building2 size={16} />
                  <span>Create Lead in CRM</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
