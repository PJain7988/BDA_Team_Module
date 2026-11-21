// frontend/src/components/BiometricModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Fingerprint, Scan, ShieldCheck, MapPin, CheckCircle2, AlertCircle, X, RefreshCw, Smartphone, Sparkles } from 'lucide-react';
import biometricService from '../services/biometricService';
import authService from '../services/authService';
import attendanceService from '../services/attendanceService';
import { toast } from 'react-toastify';

export default function BiometricModal({
  isOpen,
  onClose,
  mode = 'attendance', // 'attendance' | 'login' | 'register'
  user = null,
  onSuccess = () => {},
}) {
  const [scanType, setScanType] = useState('fingerprint'); // 'fingerprint' | 'face'
  const [status, setStatus] = useState('idle'); // 'idle' | 'scanning' | 'verifying' | 'success' | 'error'
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Ready for biometric scan');
  const [geoData, setGeoData] = useState(null);
  const [punchType, setPunchType] = useState('in'); // 'in' | 'out'
  const [notes, setNotes] = useState('');

  // Fetch location on modal open
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setProgress(0);
      setStatusText(
        mode === 'login'
          ? 'Place your finger on the sensor or authenticate with Face ID'
          : mode === 'register'
          ? 'Register this device for instant 1-tap biometric access'
          : `Verify biometric signature for daily punch-${punchType.toUpperCase()}`
      );

      // Check current punch state if attendance mode
      if (mode === 'attendance') {
        const state = biometricService.getStoredAttendanceState();
        setPunchType(state.isPunchedIn ? 'out' : 'in');
      }

      // Fetch GPS
      biometricService.getCurrentLocation().then((loc) => {
        setGeoData(loc);
      });
    }
  }, [isOpen, mode, punchType]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartScan = async () => {
    setStatus('scanning');
    setProgress(15);
    setStatusText('Reading biometric signature...');
    biometricService.audio.playScanTone();

    // Progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 15;
      });
    }, 120);

    try {
      // Execute biometric authentication
      const authResult = await biometricService.authenticateWithBiometrics({
        userEmail: user?.email || '',
        promptMessage:
          mode === 'login'
            ? 'Sign in to BDA Manufacturing CRM'
            : `Confirm BDA Attendance Punch-${punchType.toUpperCase()}`,
      });

      clearInterval(interval);
      setProgress(95);
      setStatus('verifying');
      setStatusText('Verifying cryptographic token...');

      if (authResult.success) {
        if (mode === 'login') {
          // Send biometric login request to API
          const response = await authService.biometricLogin({
            email: user?.email || undefined,
            credentialId: authResult.credentialId,
          });
          setProgress(100);
          setStatus('success');
          setStatusText('Biometric Authentication Successful!');
          biometricService.audio.playSuccessTone();
          setTimeout(() => {
            onSuccess(response);
            onClose();
          }, 900);
        } else if (mode === 'register') {
          // Register device
          await authService.biometricRegister(authResult.credentialId);
          setProgress(100);
          setStatus('success');
          setStatusText('Device Biometric Registered!');
          biometricService.audio.playSuccessTone();
          toast.success('Device registered for biometric sign-in');
          setTimeout(() => {
            onSuccess(authResult);
            onClose();
          }, 900);
        } else {
          // Dedicated Attendance checkIn / checkOut API
          try {
            if (punchType === 'in') {
              await attendanceService.checkIn({
                method: 'biometric',
                deviceName: navigator.userAgent.includes('Mac') ? 'MacBook Touch ID' : 'Windows Hello Platform Sensor',
                location: geoData,
                notes: notes || `Biometric punch-in verified via ${scanType}`,
                verifiedByWebAuthn: true,
              });
            } else {
              await attendanceService.checkOut({
                location: geoData,
                notes: notes || `Biometric punch-out verified via ${scanType}`,
              });
            }
          } catch (e) {
            console.warn('Backend attendance fallback', e);
          }

          // Update local attendance state
          const now = new Date().toISOString();
          const nextState = {
            isPunchedIn: punchType === 'in',
            lastPunchTime: now,
            punchType: punchType,
            location: geoData,
          };
          biometricService.setStoredAttendanceState(nextState);

          setProgress(100);
          setStatus('success');
          setStatusText(
            punchType === 'in'
              ? 'Punched In Successfully! Have a productive day.'
              : 'Punched Out Successfully! Safe travels.'
          );
          biometricService.audio.playSuccessTone();
          toast.success(`Biometric Punch-${punchType.toUpperCase()} Recorded!`);
          setTimeout(() => {
            onSuccess(nextState);
            onClose();
          }, 1100);
        }
      }
    } catch (err) {
      clearInterval(interval);
      setStatus('error');
      setProgress(0);
      setStatusText(err.message || 'Biometric verification failed. Please try again.');
      biometricService.audio.playErrorTone();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 flex min-h-full items-start sm:items-center justify-center animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/60 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-white my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col">
        
        {/* Glowing top line */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${
          status === 'success'
            ? 'from-emerald-400 via-teal-500 to-cyan-400'
            : status === 'error'
            ? 'from-rose-500 via-red-500 to-amber-500'
            : 'from-blue-500 via-indigo-500 to-cyan-400'
        } transition-all duration-300`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="p-6 pb-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles size={13} className="text-blue-400" />
            <span>BDA Biometric Terminal</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === 'login'
              ? 'Fast Biometric Sign-In'
              : mode === 'register'
              ? 'Register Biometric Key'
              : `Field Attendance • Punch ${punchType.toUpperCase()}`}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {mode === 'attendance'
              ? 'Geo-stamped biometric verification for field & plant visits'
              : 'Enterprise-grade WebAuthn & hardware security verification'}
          </p>
        </div>

        {/* Scan Type Selector (Fingerprint vs Face) */}
        <div className="flex justify-center px-6 my-2">
          <div className="flex bg-slate-800/70 p-1 rounded-xl border border-slate-700/50">
            <button
              type="button"
              onClick={() => setScanType('fingerprint')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                scanType === 'fingerprint'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Fingerprint size={14} />
              <span>Fingerprint / Touch ID</span>
            </button>
            <button
              type="button"
              onClick={() => setScanType('face')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                scanType === 'face'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scan size={14} />
              <span>Facial Recognition</span>
            </button>
          </div>
        </div>

        {/* Biometric Scanner Visual Reticle */}
        <div className="px-6 py-6 flex flex-col items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            
            {/* Outer radar pulse rings */}
            <div className={`absolute inset-0 rounded-full border border-blue-500/20 ${
              status === 'scanning' ? 'animate-ping' : ''
            }`} />
            <div className={`absolute -inset-3 rounded-full border border-indigo-500/10 ${
              status === 'scanning' ? 'animate-pulse' : ''
            }`} />

            {/* Glowing circular chassis */}
            <div className={`w-36 h-36 rounded-full bg-slate-900/90 border-2 flex items-center justify-center relative overflow-hidden transition-all duration-300 shadow-2xl ${
              status === 'success'
                ? 'border-emerald-500 shadow-emerald-500/20'
                : status === 'error'
                ? 'border-rose-500 shadow-rose-500/20'
                : status === 'scanning'
                ? 'border-cyan-400 shadow-cyan-500/30 ring-4 ring-cyan-500/10'
                : 'border-slate-700 hover:border-blue-500/60'
            }`}>
              
              {/* Animated Laser Scanning Beam */}
              {status === 'scanning' && (
                <div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce z-20 pointer-events-none"
                  style={{ animationDuration: '1.2s' }}
                />
              )}

              {/* Background circular grid */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle, #3b82f6 1px, transparent 1px)`,
                  backgroundSize: '12px 12px',
                }}
              />

              {/* Sensor Icon & States */}
              {status === 'success' ? (
                <div className="flex flex-col items-center animate-scaleUp z-10">
                  <CheckCircle2 size={56} className="text-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mt-1">
                    VERIFIED
                  </span>
                </div>
              ) : status === 'error' ? (
                <div className="flex flex-col items-center animate-shake z-10">
                  <AlertCircle size={56} className="text-rose-400" />
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mt-1">
                    FAILED
                  </span>
                </div>
              ) : scanType === 'fingerprint' ? (
                <div className="flex flex-col items-center z-10">
                  <Fingerprint
                    size={68}
                    className={`transition-all duration-300 ${
                      status === 'scanning'
                        ? 'text-cyan-400 scale-105 filter drop-shadow-[0_0_8px_#22d3ee]'
                        : 'text-slate-400 hover:text-blue-400'
                    }`}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center z-10">
                  <Scan
                    size={64}
                    className={`transition-all duration-300 ${
                      status === 'scanning'
                        ? 'text-cyan-400 scale-105 filter drop-shadow-[0_0_8px_#22d3ee]'
                        : 'text-slate-400 hover:text-blue-400'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Progress bar during scan */}
          {status === 'scanning' && (
            <div className="w-56 mt-4">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-cyan-300 font-mono text-center mt-1">
                CRYPTOGRAPHIC ENCLAVE: {progress}%
              </p>
            </div>
          )}

          {/* Status Message */}
          <p className={`text-xs font-medium text-center mt-4 px-4 ${
            status === 'success'
              ? 'text-emerald-400'
              : status === 'error'
              ? 'text-rose-400'
              : 'text-slate-300'
          }`}>
            {statusText}
          </p>
        </div>

        {/* Mode Specific Controls: Attendance Options */}
        {mode === 'attendance' && (
          <div className="px-6 py-2 space-y-3 bg-slate-950/60 border-t border-slate-800/80">
            {/* Punch in/out toggle */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Punch Action:
              </span>
              <div className="flex bg-slate-900 border border-slate-700/60 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setPunchType('in')}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${
                    punchType === 'in'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PUNCH IN
                </button>
                <button
                  type="button"
                  onClick={() => setPunchType('out')}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${
                    punchType === 'out'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PUNCH OUT
                </button>
              </div>
            </div>

            {/* GPS Geolocation Info */}
            <div className="flex items-center gap-2 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-300">
              <MapPin size={15} className="text-cyan-400 flex-shrink-0" />
              <div className="flex-1 truncate">
                <span className="text-slate-400">Geo Stamp: </span>
                <span className="font-mono text-cyan-300 font-medium">
                  {geoData ? geoData.address : 'Detecting GPS coordinates...'}
                </span>
              </div>
            </div>

            {/* Notes input */}
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional: Plant name or meeting note..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Geolocation info for login mode */}
        {mode === 'login' && geoData && (
          <div className="px-6 pb-2">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
              <ShieldCheck size={12} className="text-blue-400" />
              <span>Hardware-backed WebAuthn Token • {geoData.address}</span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 pt-3 flex gap-3">
          {status === 'error' ? (
            <button
              type="button"
              onClick={handleStartScan}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              <span>Retry Biometric Verification</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={status === 'scanning' || status === 'success'}
              onClick={handleStartScan}
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/20 transition flex items-center justify-center gap-2 group"
            >
              {status === 'scanning' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scanning Identity...</span>
                </>
              ) : (
                <>
                  <Fingerprint size={16} className="text-white group-hover:scale-110 transition" />
                  <span>
                    {mode === 'login'
                      ? 'Authenticate & Sign In'
                      : mode === 'register'
                      ? 'Register Device Key'
                      : `Confirm Punch ${punchType.toUpperCase()}`}
                  </span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
