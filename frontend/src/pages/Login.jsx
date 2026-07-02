// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import authService from '../services/authService';
import { LogIn, KeyRound, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgot, setIsForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.login(email, password);
      dispatch(setUser({ token: result.token, user: result.user }));
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.forgotPassword(forgotEmail);
      toast.success(response.message, { autoClose: 10000 }); // Longer display for sandbox temp credentials
      setIsForgot(false);
      setEmail(forgotEmail); // Autofill on back to login
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Floating Mesh Circles */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-violet-700/90 p-8 text-center border-b border-slate-800">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
                {isForgot ? (
                  <KeyRound className="w-8 h-8 text-white animate-bounce" />
                ) : (
                  <LogIn className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">BDA CRM Portal</h1>
            <p className="text-blue-100/80 mt-2 text-sm font-medium">
              {isForgot ? 'Account Password Recovery' : 'Manufacturing Lead Management'}
            </p>
          </div>

          {/* Form Switcher */}
          {!isForgot ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                  placeholder="example@mfg.com"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgot(true);
                      setForgotEmail(email);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                  placeholder="enter your email..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Processing Reset...' : 'Reset My Password'}
              </button>

              <button
                type="button"
                onClick={() => setIsForgot(false)}
                className="w-full flex items-center justify-center space-x-2 text-sm text-slate-400 hover:text-white transition font-medium pt-2"
              >
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default Login;
