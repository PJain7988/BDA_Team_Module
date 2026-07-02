// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setUser } from '../redux/slices/authSlice';
import authService from '../services/authService';
import { toast } from 'react-toastify';
import { User, ShieldAlert, KeyRound, Building, Phone, Mail, Lock } from 'lucide-react';

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Tab state: 'profile' or 'security'
  const [activeTab, setActiveTab] = useState('profile');

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

  // Sync active tab with URL query parameter ?tab=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'security' || tab === 'profile') {
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
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-slate-900 min-h-screen text-gray-900 dark:text-white flex justify-center items-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
        <span>Loading profile settings...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">User Settings</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">Manage your CRM account info, general configurations, and password security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Basic Info Widget */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10 mb-4 text-white font-extrabold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate w-full tracking-tight">{user.name}</h2>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-650 dark:text-blue-400 border border-blue-500/20 rounded-md text-[9px] font-bold mt-2 uppercase tracking-wider">
              {user.role}
            </span>
          </div>

          {/* Vertical Menu Tabs */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-2 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-200 ${
                activeTab === 'profile'
                  ? 'bg-blue-500/10 text-blue-650 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-750/30'
              }`}
            >
              <User size={15} />
              <span>Profile Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-200 ${
                activeTab === 'security'
                  ? 'bg-blue-500/10 text-blue-650 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-750/30'
              }`}
            >
              <Lock size={15} />
              <span>Account Security</span>
            </button>
          </div>
        </div>

        {/* Content Body Display Column */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' ? (
            /* Tab 1: Profile Configuration Settings */
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 shadow-sm transition duration-300">
              <div className="flex items-center space-x-2.5 border-b border-gray-100 dark:border-slate-700/50 pb-4 mb-6">
                <User className="text-blue-500" size={18} />
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">General Information</h3>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="e.g. 10-digit number"
                      className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 border-t border-gray-100 dark:border-slate-700/50">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1">Corporate Department</p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white">{user.department || 'Sales Operations'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1">Active Privileges</p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white">{user.role}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-5 border-t border-gray-100 dark:border-slate-700/50">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-650 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover-lift transition disabled:opacity-50"
                  >
                    {loading ? 'Saving Settings...' : 'Save General Info'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Tab 2: Account Security & Password Changes */
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 shadow-sm transition duration-300">
              <div className="flex items-center space-x-2.5 border-b border-gray-100 dark:border-slate-700/50 pb-4 mb-6">
                <KeyRound className="text-amber-500" size={18} />
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Password Management</h3>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full max-w-sm px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full max-w-sm px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full max-w-sm px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-5 border-t border-gray-100 dark:border-slate-700/50">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover-lift transition disabled:opacity-50"
                  >
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>

              {/* Dev Note Warnings */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start space-x-3 text-xs text-amber-700 dark:text-amber-300 mt-8">
                <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-bold uppercase tracking-wider text-[10px] text-amber-600 dark:text-amber-400">Security Sandbox Notice</p>
                  <p className="font-medium mt-1 leading-relaxed text-gray-600 dark:text-amber-400/80">
                    Your password updates instantly hash and save directly to your connected database. Please remember your updated credentials for future logins.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
