// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearAuth } from '../redux/slices/authSlice';
import { Bell, LogOut, User, Settings, Sun, Moon, X, Fingerprint, Camera, Sparkles, MapPin } from 'lucide-react';
import BiometricModal from './BiometricModal';
import BusinessCardScannerModal from './BusinessCardScannerModal';
import biometricService from '../services/biometricService';
import attendanceService from '../services/attendanceService';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Dropdown states
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Modals
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Attendance punch state
  const [attendance, setAttendance] = useState(() => biometricService.getStoredAttendanceState());

  // Simulated notification list
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Biometric terminal ready: Hardware-backed encryption active.', time: 'Just now', unread: true },
    { id: 2, text: 'New sales lead "Apex Solutions" assigned to you.', time: '5m ago', unread: true },
    { id: 3, text: 'Follow-up discussion scheduled with John Doe today.', time: '1h ago', unread: false },
    { id: 4, text: 'Pipeline value increased by +12% this week!', time: '1d ago', unread: false },
  ]);

  useEffect(() => {
    // Fetch live attendance from backend
    const syncAttendance = async () => {
      try {
        const data = await attendanceService.getToday();
        setAttendance({
          isPunchedIn: data.isPunchedIn,
          todayMinutes: data.activeMinutes,
          record: data.record,
        });
      } catch (e) {
        setAttendance(biometricService.getStoredAttendanceState());
      }
    };
    syncAttendance();

    // Listen for storage changes across tabs
    const handleStorage = () => {
      syncAttendance();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate('/login');
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleReadNotification = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleDismissNotification = (e, id) => {
    e.stopPropagation(); // Avoid triggering read click
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const hasUnread = notifications.some(n => n.unread);

  return (
    <nav className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/50 shadow-sm transition-colors duration-200">
      <div className="h-16 px-8 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition font-display flex items-center space-x-2">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text font-extrabold tracking-wide">BDA CRM PORTAL</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3 md:space-x-4">
          
          {/* Biometric Field Attendance Status Pill */}
          <button
            type="button"
            onClick={() => setShowBiometricModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              attendance.isPunchedIn
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
            }`}
            title="Click to Punch In / Punch Out with Biometrics"
          >
            <Fingerprint size={15} className={attendance.isPunchedIn ? 'text-emerald-500' : 'text-rose-500'} />
            <span className="hidden md:inline">
              {attendance.isPunchedIn ? 'Punched In' : 'Punch In Required'}
            </span>
            <span className={`w-2 h-2 rounded-full ${
              attendance.isPunchedIn ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`} />
          </button>

          {/* Quick Visiting Card Scanner Button */}
          <button
            type="button"
            onClick={() => setShowScannerModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold transition shadow-sm"
            title="Scan Visiting Card / Document"
          >
            <Camera size={15} />
            <span>Scan Card</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400" />}
          </button>

          {/* Notifications Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowMenu(false);
              }}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Notifications"
            >
              <Bell size={18} />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {/* Backdrop Layer to Close on Click Outside */}
            {showNotifications && (
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setShowNotifications(false)}
              />
            )}

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-gray-200/50 dark:border-slate-850/50 rounded-xl shadow-2xl py-3 z-50 transition-all duration-200">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-105/50 dark:border-slate-800/50">
                  <span className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Alerts</span>
                  {hasUnread && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-blue-600 dark:text-blue-450 hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto mt-2">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleReadNotification(n.id)}
                        className={`px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition flex items-start justify-between border-b border-gray-50/30 dark:border-slate-800/30 last:border-b-0 ${
                          n.unread ? 'bg-blue-50/20 dark:bg-blue-955/5 border-l-2 border-blue-500' : 'pl-5'
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-xs text-gray-800 dark:text-gray-200 leading-normal font-medium">{n.text}</p>
                          <span className="text-2xs text-gray-400 dark:text-gray-500 mt-1 block">{n.time}</span>
                        </div>
                        <button
                          onClick={(e) => handleDismissNotification(e, n.id)}
                          className="text-gray-400 hover:text-red-505 dark:hover:text-red-400 p-0.5 rounded transition shrink-0"
                          title="Dismiss Alert"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-xs text-gray-500 dark:text-gray-400">
                      No notifications currently active.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMenu(!showMenu);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">{user?.name}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">{user?.role}</p>
              </div>
            </button>

            {/* Backdrop Layer to Close on Click Outside */}
            {showMenu && (
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setShowMenu(false)}
              />
            )}

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-gray-200/50 dark:border-slate-850/50 rounded-xl shadow-2xl py-2 z-50">
                <Link
                  to="/profile?tab=profile"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 dark:text-gray-250 hover:bg-gray-50 dark:hover:bg-slate-800 transition font-medium text-xs"
                >
                  <User size={14} />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  to="/profile?tab=security"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 dark:text-gray-250 hover:bg-gray-50 dark:hover:bg-slate-800 transition font-medium text-xs"
                >
                  <Settings size={14} />
                  <span>Account Security</span>
                </Link>
                <hr className="my-1.5 border-gray-100 dark:border-slate-800" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center space-x-2 px-4 py-2.5 text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/10 transition font-medium text-xs"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Modals for Quick Access */}
      <BiometricModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        mode="attendance"
        user={user}
        onSuccess={(punchState) => {
          setAttendance(punchState);
        }}
      />

      <BusinessCardScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onLeadCreated={(newLead) => {
          // If on leads page, can navigate or notify
          navigate('/leads');
        }}
      />
    </nav>
  );
}

export default Navbar;
