// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import authService from '../services/authService';
import biometricService from '../services/biometricService';
import { 
  LogIn, KeyRound, ArrowLeft, Eye, EyeOff, Zap, Shield, BarChart3, 
  Users, Fingerprint, Sparkles, Mail, Lock, CheckCircle2, ArrowRight, 
  ShieldCheck, MapPin, Camera, FileText, Activity, Globe, Cpu, AlertTriangle, QrCode
} from 'lucide-react';
import { toast } from 'react-toastify';
import BiometricModal from '../components/BiometricModal';

const DEMO_CREDENTIALS = [
  { 
    role: 'Manager', 
    category: 'Leadership',
    name: 'John Manager',
    email: 'manager@mfg.com', 
    password: 'Manager@123', 
    color: 'from-purple-500 to-indigo-600', 
    borderColor: 'hover:border-purple-500/60',
    icon: Shield, 
    desc: 'Full System & Team Oversight' 
  },
  { 
    role: 'Team Lead', 
    category: 'Leadership',
    name: 'Sarah Lead',
    email: 'teamlead@mfg.com', 
    password: 'TeamLead@123', 
    color: 'from-blue-500 to-cyan-600', 
    borderColor: 'hover:border-blue-500/60',
    icon: Users, 
    desc: 'Sales Alpha Team Lead' 
  },
  { 
    role: 'Team Lead 2', 
    category: 'Leadership',
    name: 'Raj Sharma',
    email: 'teamlead2@mfg.com', 
    password: 'TeamLead2@123', 
    color: 'from-sky-500 to-blue-600', 
    borderColor: 'hover:border-sky-500/60',
    icon: Users, 
    desc: 'Sales Beta Team Lead' 
  },
  { 
    role: 'Alex BDA', 
    category: 'BDA',
    name: 'Alex Johnson',
    email: 'bda@mfg.com', 
    password: 'BDA@123', 
    color: 'from-emerald-500 to-teal-600', 
    borderColor: 'hover:border-emerald-500/60',
    icon: BarChart3, 
    desc: 'North America Accounts' 
  },
  { 
    role: 'Priya BDA', 
    category: 'BDA',
    name: 'Priya Patel',
    email: 'bda2@mfg.com', 
    password: 'BDA2@123', 
    color: 'from-teal-500 to-cyan-600', 
    borderColor: 'hover:border-teal-500/60',
    icon: BarChart3, 
    desc: 'Peenya Auto Sector' 
  },
  { 
    role: 'Mohit BDA', 
    category: 'BDA',
    name: 'Mohit Singh',
    email: 'bda3@mfg.com', 
    password: 'BDA3@123', 
    color: 'from-indigo-500 to-violet-600', 
    borderColor: 'hover:border-indigo-500/60',
    icon: BarChart3, 
    desc: 'Precision Tooling & IoT' 
  },
];

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const [demoFilter, setDemoFilter] = useState('All');
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [lockoutError, setLockoutError] = useState(null);

  // 2FA Challenge state
  const [show2FAChallenge, setShow2FAChallenge] = useState(false);
  const [tempToken2FA, setTempToken2FA] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.warn('Please enter email and password');
      return;
    }
    setLoading(true);
    setLockoutError(null);
    try {
      const result = await authService.login(email, password);

      // Handle Two-Factor Authentication requirement
      if (result.twoFactorRequired) {
        setTempToken2FA(result.tempToken);
        setShow2FAChallenge(true);
        toast.info('Two-Factor Authentication required. Enter the 6-digit code from Google Authenticator.');
        return;
      }

      dispatch(setUser({ token: result.token, user: result.user }));
      toast.success(`Welcome back, ${result.user?.name}! 🎉`);
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.status === 423) {
        setLockoutError(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        toast.error(error.response?.data?.message || 'Login failed. Please verify credentials or try another demo account.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit 2FA code
  const handleVerify2FACode = async (e) => {
    e.preventDefault();
    if (!totpCode || totpCode.trim().length < 6) {
      toast.warn('Please enter a valid 6-digit code or backup code');
      return;
    }
    setLoading(true);
    try {
      const result = await authService.verify2FALogin(tempToken2FA, totpCode);
      dispatch(setUser({ token: result.token, user: result.user }));
      toast.success(`Identity Verified! Welcome back, ${result.user?.name}! 🔒`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid 2FA verification code');
    } finally {
      setLoading(false);
    }
  };

  // Direct WebAuthn Passkey Login Trigger
  const handlePasskeyLogin = async () => {
    setBioLoading(true);
    try {
      // If WebAuthn is supported, trigger platform authenticator directly
      if (biometricService.isWebAuthnSupported()) {
        const result = await biometricService.loginWithPasskey(email);
        if (result.twoFactorRequired) {
          setTempToken2FA(result.tempToken);
          setShow2FAChallenge(true);
          toast.info('Two-Factor Authentication required.');
          return;
        }

        dispatch(setUser({ token: result.token, user: result.user }));
        toast.success(`Passkey Sign-In verified for ${result.user.name}! 🚀`);
        navigate('/dashboard');
      } else {
        // Fallback to high-tech scanner modal
        setShowBiometricModal(true);
      }
    } catch (error) {
      console.warn('Direct passkey error, launching biometric terminal:', error.message);
      setShowBiometricModal(true);
    } finally {
      setBioLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.forgotPassword(forgotEmail);
      toast.success(response.message, { autoClose: 10000 });
      setIsForgot(false);
      setEmail(forgotEmail);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = async (cred, idx) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setActiveDemo(idx);
    setLockoutError(null);
    toast.info(`Loaded ${cred.role} (${cred.name})`, { autoClose: 1500 });
  };

  const filteredDemoList = demoFilter === 'All' 
    ? DEMO_CREDENTIALS 
    : DEMO_CREDENTIALS.filter(c => c.category === demoFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Dynamic Ambient Background Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '3.5s' }} />
        
        <div 
          className="absolute inset-0 opacity-[0.035]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} 
        />
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }} 
        />
      </div>

      {/* Top Global Bar */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between border-b border-slate-800/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>BDA CRM PORTAL</span>
              <span className="text-[10px] bg-cyan-500/15 text-cyan-300 font-mono px-2 py-0.5 rounded-md border border-cyan-500/30 uppercase tracking-widest font-semibold">
                Enterprise v2.0
              </span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium">Manufacturing Lead Execution & Field Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FIDO2 / WebAuthn & Refresh Tokens Active</span>
          </div>
          <a 
            href="https://github.com/PJain7988/BDA_Team_Module" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 transition"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main Split Layout Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 py-8 lg:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          
          {/* LEFT COLUMN: Enterprise Value Showcase */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                <span>Next-Gen Sales Intelligence Suite</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Accelerate Manufacturing Pipeline from Lead to Production Order.
              </h1>
              
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                Integrated BDA execution platform with hardware biometric authentication, visiting card OCR ingestion, automated RFQ generation, geo-tagged visits, and live team pipeline synchronization.
              </p>
            </div>

            {/* High-Tech Telemetry Cards Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md hover:border-cyan-500/40 transition group">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition">
                  <Fingerprint size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-0.5">FIDO2 / Passkeys</h4>
                <p className="text-[11px] text-slate-400">Touch ID, Face ID, Windows Hello & WebAuthn</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md hover:border-blue-500/40 transition group">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition">
                  <Camera size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-0.5">Card OCR Scanner</h4>
                <p className="text-[11px] text-slate-400">1-click visiting card lead extraction</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md hover:border-indigo-500/40 transition group">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition">
                  <FileText size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-0.5">Quotation Generator</h4>
                <p className="text-[11px] text-slate-400">Manufacturing RFQ proposals with tax calculation</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 transition group">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition">
                  <MapPin size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-0.5">Field Geo-Attendance</h4>
                <p className="text-[11px] text-slate-400">Biometric punch-in with live GPS verification</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Modern Enterprise Login Terminal */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/80 space-y-6">
              
              {/* Account Lockout Warning Banner */}
              {lockoutError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[10px]">Security Lockout Triggered</span>
                    <p className="mt-0.5">{lockoutError}</p>
                  </div>
                </div>
              )}

              {/* 2FA Verification Challenge Step */}
              {show2FAChallenge ? (
                <form onSubmit={handleVerify2FACode} className="space-y-5 animate-fadeIn">
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
                      <QrCode size={22} />
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight">Two-Factor Authentication</h2>
                    <p className="text-xs text-slate-400">
                      Enter the 6-digit TOTP code generated by Google Authenticator or an emergency backup code.
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={9}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      placeholder="000000 or XXXX-XXXX"
                      required
                      autoFocus
                      className="w-full text-center py-3 text-xl font-mono font-bold tracking-widest bg-slate-950 border border-cyan-500/40 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                  >
                    {loading ? 'Validating Token...' : 'Verify 2FA & Enter Portal'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShow2FAChallenge(false); setTotpCode(''); }}
                    className="w-full text-center text-xs text-slate-400 hover:text-white"
                  >
                    Back to Standard Login
                  </button>
                </form>
              ) : !isForgot ? (
                <div className="space-y-5">
                  
                  {/* Form Header */}
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Enterprise Sign In
                    </h2>
                    <p className="text-xs text-slate-400">
                      Access your manufacturing CRM workspace and team dashboard.
                    </p>
                  </div>

                  {/* Primary Biometric Passkey Button */}
                  <button
                    type="button"
                    onClick={handlePasskeyLogin}
                    disabled={bioLoading}
                    className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800/80 border border-cyan-500/40 hover:border-cyan-400 rounded-2xl text-cyan-300 font-bold text-xs flex items-center justify-between transition group shadow-lg shadow-cyan-500/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                        <Fingerprint size={16} />
                      </div>
                      <div className="text-left">
                        <span className="block text-white font-bold leading-tight">Sign in with Passkey / Biometrics</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Touch ID &bull; Face ID &bull; Windows Hello</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 uppercase font-semibold">
                      1-TAP
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-800 w-full" />
                    <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest relative">
                      or use password
                    </span>
                  </div>

                  {/* Standard Credentials Form */}
                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Work Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail size={16} />
                        </div>
                        <input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. manager@mfg.com"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => { setIsForgot(true); setForgotEmail(email); }}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold transition"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock size={16} />
                        </div>
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          required
                          className="w-full pl-10 pr-11 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Device & Security */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-200">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
                        />
                        <span className="text-[11px]">Remember this trusted device</span>
                      </label>
                      <span className="text-[10px] text-slate-500">256-Bit SSL</span>
                    </div>

                    {/* Submit Button */}
                    <button
                      id="login-submit"
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/25 transition duration-200 flex items-center justify-center gap-2 group"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Authenticating Workspace...</span>
                        </>
                      ) : (
                        <>
                          <LogIn size={15} />
                          <span>Sign In to CRM Portal</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* QUICK DEMO LOGIN: Clean Segmented Grid */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                        <Zap size={14} className="text-amber-400" />
                        <span>Quick Demo Personas</span>
                      </div>
                      
                      {/* Filter Segment Pills */}
                      <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px]">
                        {['All', 'Leadership', 'BDA'].map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setDemoFilter(f)}
                            className={`px-2.5 py-0.5 rounded font-semibold transition ${
                              demoFilter === f
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {f === 'All' ? 'All (6)' : f === 'Leadership' ? 'Leads (3)' : 'BDAs (3)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clean 2-column or 3-column Persona Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {filteredDemoList.map((cred, idx) => {
                        const Icon = cred.icon;
                        const isSelected = email === cred.email;
                        return (
                          <button
                            key={cred.role}
                            type="button"
                            onClick={() => fillAndLogin(cred, idx)}
                            className={`p-2.5 rounded-xl border text-left transition duration-200 relative group ${
                              isSelected
                                ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                                : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-950'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${cred.color} flex items-center justify-center text-white shadow-sm`}>
                                <Icon size={12} />
                              </div>
                              <span className="text-[9px] font-mono text-slate-500 group-hover:text-cyan-400">
                                FILL &rarr;
                              </span>
                            </div>
                            <span className="text-xs font-bold text-white block truncate leading-tight">
                              {cred.role}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate font-medium mt-0.5">
                              {cred.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-500 text-center">
                      Click any persona above to auto-populate credentials, then click Sign In
                    </p>
                  </div>
                </div>
              ) : (
                /* Forgot Password View */
                <form onSubmit={handleForgotPassword} className="space-y-5 animate-fadeIn">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Reset Password
                    </h2>
                    <p className="text-xs text-slate-400">
                      Enter your registered email and we'll issue sandbox credentials.
                    </p>
                  </div>

                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-xs text-cyan-300">
                    For demonstration purposes, password reset triggers an immediate temporary secure key directly on this environment.
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="your.email@mfg.com"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                  >
                    {loading ? 'Processing Reset Request...' : 'Send Reset Instructions'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsForgot(false)}
                    className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition font-medium pt-2"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Standard Sign In</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer System Bar */}
      <footer className="relative z-20 w-full px-6 py-4 border-t border-slate-800/40 text-center text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <p className="text-[11px]">
          &copy; 2026 BDA Team Module CRM &bull; High-Performance Manufacturing Sales Suite
        </p>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Render API Operational
          </span>
          <span className="text-slate-600">&bull;</span>
          <a href="https://bda-team-module.vercel.app" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">
            Live Deployment
          </a>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-400 font-mono">v2.0-Production</span>
        </div>
      </footer>

      {/* Biometric Verification Modal */}
      <BiometricModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        mode="login"
        user={email ? { email } : null}
        onSuccess={(authResponse) => {
          if (authResponse?.token && authResponse?.user) {
            dispatch(setUser({ token: authResponse.token, user: authResponse.user }));
            toast.success(`Biometric Sign-In verified for ${authResponse.user.name}! 🎉`);
            navigate('/dashboard');
          }
        }}
      />
    </div>
  );
}

export default Login;
