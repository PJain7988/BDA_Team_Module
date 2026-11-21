// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setUser } from '../redux/slices/authSlice';
import authService from '../services/authService';
import biometricService from '../services/biometricService';
import { toast } from 'react-toastify';
import { 
  User, ShieldAlert, KeyRound, Building, Phone, Mail, Lock, 
  Fingerprint, Sparkles, CheckCircle2, Smartphone, ShieldCheck, 
  Trash2, QrCode, Copy, Check, AlertTriangle, Plus, RefreshCw, X
} from 'lucide-react';
import BiometricModal from '../components/BiometricModal';

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [hasHardwareBio, setHasHardwareBio] = useState(false);

  // Tab state: 'profile' | 'security' | 'biometrics'
  const [activeTab, setActiveTab] = useState('profile');

  // WebAuthn Passkeys state
  const [credentials, setCredentials] = useState([]);
  const [credLoading, setCredLoading] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [showAddPasskeyModal, setShowAddPasskeyModal] = useState(false);

  // 2FA state
  const [totpData, setTotpData] = useState(null); // { secret, qrCode, backupCodes }
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [totpVerifyCode, setTotpVerifyCode] = useState('');
  const [totpDisablePassword, setTotpDisablePassword] = useState('');
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Check hardware biometric availability
  useEffect(() => {
    biometricService.isBiometricAvailable().then((res) => {
      setHasHardwareBio(res);
    });
  }, []);

  // Fetch registered WebAuthn credentials
  const fetchCredentials = async () => {
    try {
      setCredLoading(true);
      const res = await authService.getWebAuthnCredentials();
      setCredentials(res.credentials || []);
    } catch (e) {
      console.warn('Failed to load passkeys:', e.message);
    } finally {
      setCredLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'biometrics' || activeTab === 'security') {
      fetchCredentials();
    }
  }, [activeTab]);

  // Sync active tab with URL query parameter ?tab=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'security' || tab === 'profile' || tab === 'biometrics') {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await authService.updateProfile(profileData);
      const token = localStorage.getItem('token');
      dispatch(setUser({ token, user: response.user }));
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }

    try {
      setLoading(true);
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Register Passkey via @simplewebauthn/browser
  const handleRegisterPasskey = async () => {
    try {
      setLoading(true);
      const defaultName = hasHardwareBio
        ? navigator.userAgent.includes('Mac') ? 'MacBook Touch ID' : 'Windows Hello Sensor'
        : 'Enterprise WebAuthn Key';
      const name = newDeviceName.trim() || defaultName;

      await biometricService.registerPasskey(name);
      toast.success(`Biometric passkey registered for "${name}"! 🎉`);
      setShowAddPasskeyModal(false);
      setNewDeviceName('');
      fetchCredentials();

      // Refresh current user in Redux
      const refreshedUser = await authService.getCurrentUser();
      const token = localStorage.getItem('token');
      dispatch(setUser({ token, user: refreshedUser }));
    } catch (error) {
      toast.error(error.message || 'Passkey registration cancelled or failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete Passkey
  const handleDeletePasskey = async (id, name) => {
    if (!window.confirm(`Are you sure you want to revoke passkey "${name}"?`)) return;
    try {
      setLoading(true);
      await authService.deleteWebAuthnCredential(id);
      toast.info(`Passkey "${name}" revoked`);
      fetchCredentials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke passkey');
    } finally {
      setLoading(false);
    }
  };

  // Generate 2FA Secret & QR Code
  const handleStart2FASetup = async () => {
    try {
      setLoading(true);
      const data = await authService.generate2FA();
      setTotpData(data);
      setShow2FAModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initialize 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  // Verify and activate 2FA
  const handleConfirm2FA = async (e) => {
    e.preventDefault();
    if (!totpVerifyCode || totpVerifyCode.length !== 6) {
      return toast.warn('Please enter the 6-digit code from Google Authenticator');
    }
    try {
      setLoading(true);
      await authService.verify2FA(totpVerifyCode);
      toast.success('Two-Factor Authentication is now ACTIVE on your account! 🔒');
      setShow2FAModal(false);
      setTotpVerifyCode('');
      setTotpData(null);

      // Refresh user
      const refreshedUser = await authService.getCurrentUser();
      const token = localStorage.getItem('token');
      dispatch(setUser({ token, user: refreshedUser }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (!totpDisablePassword) {
      return toast.warn('Please enter your current password');
    }
    try {
      setLoading(true);
      await authService.disable2FA(totpDisablePassword);
      toast.info('Two-Factor Authentication has been disabled');
      setShowDisableModal(false);
      setTotpDisablePassword('');

      const refreshedUser = await authService.getCurrentUser();
      const token = localStorage.getItem('token');
      dispatch(setUser({ token, user: refreshedUser }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      
      {/* Top Profile Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/60 dark:border-slate-700/60 p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-4 ring-white dark:ring-slate-900 flex-shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {user.name}
              </h1>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                user.role === 'Manager' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30' :
                user.role === 'TeamLead' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30' :
                'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}>
                {user.role}
              </span>
              {user.totpEnabled && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 flex items-center gap-1">
                  <ShieldCheck size={11} /> 2FA Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-2">
              <Mail size={13} className="text-gray-400" />
              <span>{user.email}</span>
              <span>&bull;</span>
              <Building size={13} className="text-gray-400" />
              <span>{user.department || 'Manufacturing Sales'}</span>
            </p>
          </div>
        </div>

        {/* Quick Security Status Pill */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 text-xs">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Fingerprint size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Passkey Enclave</span>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {credentials.length > 0 ? `${credentials.length} Device(s) Synced` : 'No Passkey Enrolled'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-slate-700/80 space-x-1 sm:space-x-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <User size={15} />
          <span>General Info</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <KeyRound size={15} />
          <span>Security & Passwords</span>
        </button>
        <button
          onClick={() => setActiveTab('biometrics')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'biometrics'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Fingerprint size={15} />
          <span>Biometrics & Passkeys</span>
          <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.2 rounded font-mono">
            FIDO2
          </span>
        </button>
      </div>

      {/* Tab 1: General Info */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/60 dark:border-slate-700/60 p-6 shadow-sm space-y-6">
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-slate-700/50">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Email</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{user.email}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Department</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{user.department || 'Sales Operations'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Role Privilege</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{user.role}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-700/50">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          
          {/* Password Management Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/60 dark:border-slate-700/60 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/50 pb-3">
              <KeyRound size={17} className="text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Password Settings
              </h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication (TOTP) Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/60 dark:border-slate-700/60 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700/50 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-cyan-500" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Two-Factor Authentication (TOTP 2FA)
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Protect your account with Google Authenticator or Microsoft Authenticator
                  </p>
                </div>
              </div>
              {user.totpEnabled ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  ENABLED
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
                  DISABLED
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xl">
                When 2FA is active, signing in will require your standard password or biometric passkey, followed by a time-sensitive 6-digit TOTP verification code.
              </p>

              {user.totpEnabled ? (
                <button
                  onClick={() => setShowDisableModal(true)}
                  className="px-4 py-2 border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition flex-shrink-0"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  onClick={handleStart2FASetup}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition flex-shrink-0 flex items-center gap-1.5"
                >
                  <QrCode size={14} />
                  <span>Setup Google Authenticator</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Biometrics & Passkeys */}
      {activeTab === 'biometrics' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/60 dark:border-slate-700/60 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-700/50 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Fingerprint size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Registered WebAuthn Passkeys & Hardware Devices
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Passwordless public key cryptography stored in your device Secure Enclave (Touch ID, Face ID, Windows Hello)
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddPasskeyModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Enroll New Passkey</span>
            </button>
          </div>

          {/* Hardware Detection Status */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Smartphone size={20} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Browser Security Hardware Detection
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {hasHardwareBio
                    ? 'Platform biometric hardware verified: Touch ID / Face ID / Windows Hello is fully available.'
                    : 'WebAuthn API active. Hardware authenticator or USB security key can be registered.'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
              <CheckCircle2 size={14} /> Ready
            </span>
          </div>

          {/* List of Registered Passkeys */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Active Enrolled Devices ({credentials.length})
              </h4>
              <button
                onClick={fetchCredentials}
                className="text-[11px] text-cyan-500 hover:text-cyan-400 flex items-center gap-1 font-semibold"
              >
                <RefreshCw size={12} className={credLoading ? 'animate-spin' : ''} />
                <span>Reload</span>
              </button>
            </div>

            {credLoading ? (
              <div className="py-8 text-center text-xs text-gray-400">Loading enrolled passkeys...</div>
            ) : credentials.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl space-y-2">
                <Fingerprint size={28} className="mx-auto text-gray-400" />
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">No Biometric Passkeys Enrolled</p>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  Click "Enroll New Passkey" to register this device's Touch ID, Face ID, or Windows Hello for instant 1-tap login.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {credentials.map((cred) => (
                  <div
                    key={cred.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
                        <Fingerprint size={20} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white block">
                          {cred.deviceName || 'Biometric Authenticator'}
                        </span>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-0.5 font-mono">
                          <span>Key ID: {cred.credentialID.slice(0, 16)}...</span>
                          <span>&bull;</span>
                          <span>Registered: {new Date(cred.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        ACTIVE
                      </span>
                      <button
                        onClick={() => handleDeletePasskey(cred.id, cred.deviceName)}
                        className="p-2 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition"
                        title="Revoke passkey"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enroll Passkey Modal */}
      {showAddPasskeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-gray-200 dark:border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Fingerprint size={20} className="text-cyan-400" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Enroll New Biometric Passkey</h3>
              </div>
              <button onClick={() => setShowAddPasskeyModal(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              When you click Enroll, your operating system will display a prompt to scan your fingerprint, Face ID, or Windows Hello.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Device / Authenticator Name
              </label>
              <input
                type="text"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder={hasHardwareBio ? (navigator.userAgent.includes('Mac') ? 'MacBook Touch ID' : 'Windows Hello') : 'My Office Laptop'}
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPasskeyModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegisterPasskey}
                disabled={loading}
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                {loading ? 'Prompting Biometrics...' : 'Trigger Biometric Prompt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal with QR Code */}
      {show2FAModal && totpData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-gray-200 dark:border-slate-700 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <QrCode size={20} className="text-cyan-400" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Setup Two-Factor Authentication</h3>
              </div>
              <button onClick={() => setShow2FAModal(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <p className="font-bold">Step 1: Scan this QR code</p>
                <p className="text-[11px] text-gray-400">
                  Open Google Authenticator, Microsoft Authenticator, or 1Password and scan the code below:
                </p>
              </div>

              {/* QR Code Display */}
              <div className="p-4 bg-white rounded-2xl w-fit mx-auto border border-gray-200 shadow-inner">
                <img src={totpData.qrCode} alt="TOTP QR Code" className="w-48 h-48 mx-auto" />
              </div>

              {/* Manual Secret Key */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Or enter secret key manually:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={totpData.secret}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg text-cyan-500"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(totpData.secret);
                      setCopiedSecret(true);
                      setTimeout(() => setCopiedSecret(false), 2000);
                    }}
                    className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300 flex items-center gap-1"
                  >
                    {copiedSecret ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Backup Codes */}
              {totpData.backupCodes && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                      Step 2: Save your 8 emergency backup codes
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(totpData.backupCodes.join('\n'));
                        setCopiedCodes(true);
                        setTimeout(() => setCopiedCodes(false), 2000);
                      }}
                      className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      {copiedCodes ? 'Copied All!' : 'Copy All Codes'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[10px] text-gray-600 dark:text-gray-300">
                    {totpData.backupCodes.map((code) => (
                      <span key={code} className="p-1 bg-white dark:bg-slate-900 rounded text-center border border-gray-200 dark:border-slate-800">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Verification Code Input */}
              <form onSubmit={handleConfirm2FA} className="space-y-3 pt-2">
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block">
                  Step 3: Enter the 6-digit code shown in your app
                </span>
                <input
                  type="text"
                  maxLength={6}
                  value={totpVerifyCode}
                  onChange={(e) => setTotpVerifyCode(e.target.value)}
                  placeholder="000000"
                  className="w-full text-center py-2.5 text-lg font-mono font-bold tracking-widest bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  required
                />

                <button
                  type="submit"
                  disabled={loading || totpVerifyCode.length !== 6}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {loading ? 'Verifying Code...' : 'Verify & Enable 2FA'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleDisable2FA} className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-gray-200 dark:border-slate-700 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Disable Two-Factor Authentication</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Please confirm your current account password to disable 2FA protection.
            </p>
            <input
              type="password"
              value={totpDisablePassword}
              onChange={(e) => setTotpDisablePassword(e.target.value)}
              placeholder="Your Current Password"
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-rose-500"
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDisableModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                {loading ? 'Disabling...' : 'Confirm Disable'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Legacy Biometric Modal */}
      <BiometricModal
        isOpen={showBioModal}
        onClose={() => setShowBioModal(false)}
        mode="register"
        user={user}
        onSuccess={() => {
          fetchCredentials();
        }}
      />

    </div>
  );
}

export default Profile;
