// frontend/src/pages/AddMemberById.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, ShieldCheck, ShieldAlert, UserPlus, Camera, Scan, 
  CheckCircle2, AlertTriangle, RefreshCw, ArrowLeft, UserCheck, 
  Lock, CreditCard, Building2, Mail, Phone, Calendar, Sparkles,
  Users, Check, X, Clock, HelpCircle
} from 'lucide-react';
import teamService from '../services/teamService';
import { toast } from 'react-toastify';

export default function AddMemberById() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // ── 1. High Authority Access Control Check ──────────────────────────────
  // Strictly allow only High Authority roles: Manager or Admin
  const isHighAuthority = user && (user.role === 'Manager' || user.role === 'Admin');

  // Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    role: 'BDA',
    department: 'Manufacturing Sales',
    notes: '',
  });

  // ID Validation Telemetry
  const [checkingId, setCheckingId] = useState(false);
  const [idAvailability, setIdAvailability] = useState(null); // null | { available: boolean, message: string }
  
  // Biometric Face Capture Telemetry
  const [photoSnapshot, setPhotoSnapshot] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredMember, setRegisteredMember] = useState(null);
  const [recentMembers, setRecentMembers] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  // Fetch recent members added for admin visibility
  const fetchRecentMembers = async () => {
    try {
      setLoadingRecent(true);
      const res = await teamService.getMembers();
      if (res && res.members) {
        // Sort descending by creation date, take top 6
        const sorted = [...res.members].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setRecentMembers(sorted.slice(0, 6));
      }
    } catch (err) {
      console.warn('Failed to load recent members:', err.message);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    if (isHighAuthority) {
      fetchRecentMembers();
    }
  }, [isHighAuthority]);

  // Debounced Live ID Check against Database
  useEffect(() => {
    const rawId = formData.employeeId.trim();
    if (!rawId || rawId.length < 3) {
      setIdAvailability(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCheckingId(true);
        const res = await teamService.checkEmployeeId(rawId);
        setIdAvailability(res);
      } catch (err) {
        setIdAvailability({
          available: false,
          message: err.response?.data?.message || 'Error checking ID validity',
        });
      } finally {
        setCheckingId(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.employeeId]);

  // Webcam Lifecycle for Face Photo Enrollment
  const startCamera = async () => {
    try {
      setCameraError(false);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        streamRef.current = stream;
        setCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } else {
        setCameraError(true);
      }
    } catch (err) {
      console.warn('Camera stream warning:', err.message);
      setCameraError(true);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const size = 360;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const minDim = Math.min(video.videoWidth || size, video.videoHeight || size);
      const sx = ((video.videoWidth || size) - minDim) / 2;
      const sy = ((video.videoHeight || size) - minDim) / 2;

      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, size, size);
      ctx.restore();

      // Stamp with watermark
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.fillRect(0, size - 46, size, 46);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`BIOMETRIC TEMPLATE • ${formData.employeeId || 'NEW MEMBER'}`, 12, size - 26);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`Enrolled by Admin [${user?.employeeId || user?.name || 'ADMIN'}]`, 12, size - 12);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPhotoSnapshot(dataUrl);
      stopCamera();
      toast.success('Face template captured & stamped for scanning enrollment!');
    } catch (e) {
      toast.warn('Could not capture frame. You can continue without photo.');
    }
  };

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-suggest email if not manually edited yet
      if (name === 'name' && (!prev.email || prev.email.includes('@mfg-corp.com'))) {
        const cleanName = value.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanId = (prev.employeeId || 'emp').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanName) {
          updated.email = `${cleanName}.${cleanId}@mfg-corp.com`;
        }
      }
      return updated;
    });
  };

  // Quick Preset Sample ID Generator
  const generateSuggestedId = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const prefix = formData.role === 'Manager' ? 'MGR' : formData.role === 'TeamLead' ? 'TL' : 'BDA';
    setFormData((prev) => ({
      ...prev,
      employeeId: `${prefix}-${rand}`,
    }));
  };

  // ── 2. Member Registration Submit Handler ──────────────────────────────
  const handleRegisterMember = async (e) => {
    e.preventDefault();

    // Strict Validations
    if (!formData.employeeId.trim()) {
      return toast.error('ID Number is required and cannot be empty.');
    }
    if (!formData.name.trim()) {
      return toast.error('Member Full Name is required.');
    }
    if (idAvailability && idAvailability.available === false) {
      return toast.error(idAvailability.message || 'ID already exists in database.');
    }

    try {
      setIsSubmitting(true);

      const payload = {
        employeeId: formData.employeeId.trim().toUpperCase(),
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        department: formData.department,
        faceData: photoSnapshot || null,
        photoSnapshot: photoSnapshot || null,
        notes: formData.notes,
      };

      const res = await teamService.registerMemberById(payload);

      // Display required exact confirmation message
      toast.success('New member added successfully');
      setRegisteredMember(res.member);
      fetchRecentMembers();

      // Reset form
      setFormData({
        employeeId: '',
        name: '',
        email: '',
        phone: '',
        role: 'BDA',
        department: 'Manufacturing Sales',
        notes: '',
      });
      setPhotoSnapshot(null);
      setIdAvailability(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to register member';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── ACCESS DENIED VIEW FOR REGULAR USERS OR UNAUTHORIZED VISITORS ───────
  if (!isHighAuthority) {
    return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto min-h-[80vh] flex items-center justify-center animate-fadeIn">
        <div className="w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-10 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock size={32} />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldAlert size={14} /> High Authority Clearance Required
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Access Denied • Administrative Privilege Restricted
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Only authenticated <span className="text-white font-semibold">High Authority / Admin</span> accounts 
              (Manager, Admin) have permission to register new members into the database.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-400 max-w-md mx-auto space-y-1">
            <p className="text-slate-300">
              Current Session: <span className="font-semibold text-white">{user?.name || 'Visitor'}</span>
            </p>
            <p className="text-slate-400">
              Role: <span className="font-mono text-cyan-300 font-bold">{user?.role || 'Guest'}</span> • Clearance: <span className="text-rose-400 font-bold">Standard</span>
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>Return to Dashboard</span>
            </Link>
            <Link
              to="/team"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
            >
              View Team Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── HIGH AUTHORITY AUTHORIZED INTERFACE ─────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Header & High Authority Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} className="text-purple-400" />
            <span>High-Authority Admin Portal • ID Enrollment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Register New Member by ID
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Provision new employee identity, assign ID numbers, and enroll face biometric templates into the database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/team"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <Users size={14} />
            <span>Team Roster</span>
          </Link>
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
            <UserCheck size={13} className="text-emerald-400" />
            <span>Admin: {user?.name} [{user?.employeeId || 'MGR-1001'}]</span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner when Member Added */}
      {registeredMember && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/80 via-teal-950/50 to-slate-900 border-2 border-emerald-500/70 rounded-2xl shadow-xl space-y-3 animate-scaleUp">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/40">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>New member added successfully</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                    ACTIVE IN DATABASE
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Record saved with authoritative ID and enrolled into the biometric roster.
                </p>
              </div>
            </div>
            <button
              onClick={() => setRegisteredMember(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* Member Details Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">ID Number:</span>
              <span className="font-bold text-cyan-300 font-mono text-sm">{registeredMember.employeeId}</span>
            </div>
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Full Name:</span>
              <span className="font-bold text-white truncate block">{registeredMember.name}</span>
            </div>
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Assigned Role:</span>
              <span className="font-semibold text-purple-300">{registeredMember.role}</span>
            </div>
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Status / Biometrics:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <Check size={13} /> Active & Enrolled
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Form & Right Photo / Live Verification Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2-Cols: Registration Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <UserPlus size={18} />
              </div>
              <h2 className="text-base font-bold text-white">Member Credentials & ID Parameters</h2>
            </div>
            <button
              type="button"
              onClick={generateSuggestedId}
              className="text-[11px] font-mono text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
              title="Generate a unique random ID pattern"
            >
              <Sparkles size={12} />
              <span>Generate ID</span>
            </button>
          </div>

          <form onSubmit={handleRegisterMember} className="space-y-5">
            {/* Row 1: ID Number & Live Duplicate Validation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard size={13} className="text-cyan-400" />
                  <span>Employee / Corporate ID Number *</span>
                </label>
                {checkingId ? (
                  <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1 animate-pulse">
                    <RefreshCw size={11} className="animate-spin" />
                    <span>Verifying ID in MongoDB...</span>
                  </span>
                ) : idAvailability ? (
                  idAvailability.available ? (
                    <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>ID Available</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      <span>ID Already Registered</span>
                    </span>
                  )
                ) : null}
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="e.g. BDA-2045, EMP-8891, CORP-9204..."
                  required
                  className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition ${
                    idAvailability && !idAvailability.available
                      ? 'border-rose-500 focus:border-rose-400 text-rose-200'
                      : idAvailability && idAvailability.available
                      ? 'border-emerald-500 focus:border-emerald-400'
                      : 'border-slate-700 focus:border-blue-500'
                  }`}
                />
              </div>

              {idAvailability && !idAvailability.available && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-mono">
                  <AlertTriangle size={12} />
                  <span>{idAvailability.message}</span>
                </p>
              )}
              <p className="text-[10px] text-slate-500 mt-1">
                The member will use this ID for attendance punch verification and biometric face scanning.
              </p>
            </div>

            {/* Row 2: Full Name & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Priya Jain, Rahul Verma..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Authority Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="BDA">BDA (Business Development Associate)</option>
                  <option value="TeamLead">Team Lead</option>
                  <option value="Manager">Manager / High Authority</option>
                </select>
              </div>
            </div>

            {/* Row 3: Department, Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Manufacturing Sales"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name.id@mfg-corp.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Row 4: Administrative Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Administrative Notes & Authorization Scope
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Optional: Plant location, security clearance, or device MAC address..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting || (idAvailability && !idAvailability.available)}
                className="w-full sm:flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Writing Record to Database...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Authorize & Save Member Record</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({
                    employeeId: '',
                    name: '',
                    email: '',
                    phone: '',
                    role: 'BDA',
                    department: 'Manufacturing Sales',
                    notes: '',
                  });
                  setPhotoSnapshot(null);
                  setIdAvailability(null);
                }}
                className="w-full sm:w-auto py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>

        {/* Right 1-Col: Live Face/Photo Template Enrollment & Recent Roster */}
        <div className="space-y-6">
          
          {/* Biometric Face Template Capture Card */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Face Photo Template</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                FOR SCANNING
              </span>
            </div>

            {/* Video Viewfinder / Photo Preview */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              {photoSnapshot ? (
                <div className="relative w-full h-full">
                  <img
                    src={photoSnapshot}
                    alt="Captured Template"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => setPhotoSnapshot(null)}
                      className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow"
                      title="Remove Photo"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ) : cameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {/* Face alignment reticle */}
                  <div className="absolute inset-8 rounded-full border-2 border-dashed border-cyan-400 pointer-events-none flex items-center justify-center animate-pulse">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded">
                      ALIGN MEMBER FACE
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Camera size={22} />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">No Photo Captured Yet</p>
                  <p className="text-[10px] text-slate-500">
                    Snap member face photo so the scanner verifies them at attendance terminals.
                  </p>
                </div>
              )}
            </div>

            {/* Photo Capture Controls */}
            <div>
              {cameraActive ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    <Camera size={14} />
                    <span>Capture Frame</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Camera size={15} />
                  <span>{photoSnapshot ? 'Retake Member Photo' : 'Open Camera to Enroll Face'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Recent Members Registered in Database */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-purple-400" />
                <span>Recent Members</span>
              </h3>
              <button
                type="button"
                onClick={fetchRecentMembers}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                title="Refresh Roster"
              >
                <RefreshCw size={11} className={loadingRecent ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recentMembers.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No recent members found.</p>
              ) : (
                recentMembers.map((m) => (
                  <div
                    key={m._id}
                    className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {m.name?.charAt(0).toUpperCase() || 'M'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate text-xs">{m.name}</p>
                        <p className="text-[10px] font-mono text-cyan-300 truncate">
                          {m.employeeId || 'ID Pending'} • {m.role}
                        </p>
                      </div>
                    </div>

                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex-shrink-0">
                      Active
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
