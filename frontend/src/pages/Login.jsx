// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import authService from '../services/authService';
import { LogIn, KeyRound, ArrowLeft, Eye, EyeOff, Zap, Shield, BarChart3, Users } from 'lucide-react';
import { toast } from 'react-toastify';

const DEMO_CREDENTIALS = [
  { role: 'Manager', email: 'manager@mfg.com', password: 'Manager@123', color: 'from-purple-500 to-violet-600', icon: Shield, desc: 'Full access' },
  { role: 'Team Lead', email: 'teamlead@mfg.com', password: 'TeamLead@123', color: 'from-blue-500 to-cyan-600', icon: Users, desc: 'Sarah Lead' },
  { role: 'Team Lead 2', email: 'teamlead2@mfg.com', password: 'TeamLead2@123', color: 'from-sky-500 to-blue-600', icon: Users, desc: 'Raj Sharma' },
  { role: 'BDA', email: 'bda@mfg.com', password: 'BDA@123', color: 'from-emerald-500 to-teal-600', icon: BarChart3, desc: 'Alex BDA' },
  { role: 'BDA 2', email: 'bda2@mfg.com', password: 'BDA2@123', color: 'from-green-500 to-emerald-600', icon: BarChart3, desc: 'Priya Patel' },
  { role: 'BDA 3', email: 'bda3@mfg.com', password: 'BDA3@123', color: 'from-teal-500 to-cyan-600', icon: BarChart3, desc: 'Mohit Singh' },
];

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      dispatch(setUser({ token: result.token, user: result.user }));
      toast.success(`Welcome back, ${result.user?.name}! 🎉`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
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

  const fillCredentials = (cred, idx) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setActiveDemo(idx);
    toast.info(`Demo credentials loaded for ${cred.role}`, { autoClose: 2000 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-2/3 left-1/3 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Card */}
        <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-700/40 rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
                  {isForgot
                    ? <KeyRound className="w-9 h-9 text-white" />
                    : <LogIn className="w-9 h-9 text-white" />
                  }
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">BDA CRM Portal</h1>
              <p className="text-blue-100/75 mt-2 text-sm font-medium">
                {isForgot ? 'Account Password Recovery' : 'Manufacturing Lead Management System'}
              </p>
              {/* Live badge */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="flex items-center gap-1.5 text-xs bg-white/15 text-white/90 px-2.5 py-1 rounded-full border border-white/20">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Live on Vercel + Render
                </span>
              </div>
            </div>
          </div>

          {/* Form Switcher */}
          {!isForgot ? (
            <form onSubmit={handleLogin} className="p-7 space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 text-sm"
                  placeholder="example@mfg.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setIsForgot(true); setForgotEmail(email); }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 text-sm pr-11"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign In to Portal</span>
                  </>
                )}
              </button>

              {/* Demo Credentials */}
              <div className="border-t border-slate-700/50 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={13} className="text-amber-400" />
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Demo Login</p>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto scrollbar-thin">
                  {DEMO_CREDENTIALS.map((cred, idx) => {
                    const Icon = cred.icon;
                    return (
                      <button
                        key={cred.role}
                        type="button"
                        onClick={() => fillCredentials(cred, idx)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 text-center group ${
                          activeDemo === idx
                            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                            : 'border-slate-700/50 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cred.color} flex items-center justify-center shadow-md`}>
                          <Icon size={13} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 leading-tight">{cred.role}</span>
                        <span className="text-[9px] text-slate-500 leading-tight hidden group-hover:block">{cred.desc}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 text-center mt-2">Click a role to auto-fill credentials</p>
              </div>
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="p-7 space-y-5">
              <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-300 font-medium">
                  Enter your registered email and we'll send you reset instructions.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 text-sm"
                  placeholder="enter your email..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Processing Reset...' : 'Send Reset Instructions'}
              </button>

              <button
                type="button"
                onClick={() => setIsForgot(false)}
                className="w-full flex items-center justify-center space-x-2 text-sm text-slate-400 hover:text-white transition font-medium pt-1"
              >
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="px-7 pb-5 text-center">
            <p className="text-[10px] text-slate-600">
              BDA CRM Portal v1.0 &nbsp;·&nbsp; 
              <a href="https://bda-team-module.vercel.app" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 transition">Live App</a>
              &nbsp;·&nbsp;
              <a href="https://github.com/PJain7988/BDA_Team_Module" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 transition">GitHub</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
