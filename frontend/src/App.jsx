// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './redux/slices/authSlice';
import { LayoutDashboard, Sparkles, Clock, Briefcase, Menu as MenuIcon } from 'lucide-react';
import authService from './services/authService';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Team from './pages/Team';
import Analytics from './pages/Analytics';
import Communications from './pages/Communications';
import Profile from './pages/Profile';
import BdaHub from './pages/BdaHub';
import AuditLogs from './pages/AuditLogs';
import Attendance from './pages/Attendance';
import AddMemberById from './pages/AddMemberById';

// Components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Notification from './components/Notification';

import './App.css';

function MobileBottomNav({ onOpenMenu }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
      <Link
        to="/dashboard"
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
          isActive('/dashboard') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutDashboard size={18} />
        <span className="text-[10px] mt-0.5">Home</span>
      </Link>

      <Link
        to="/bda-hub"
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
          isActive('/bda-hub') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sparkles size={18} />
        <span className="text-[10px] mt-0.5">Hub</span>
      </Link>

      <Link
        to="/attendance"
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
          isActive('/attendance') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Clock size={18} />
        <span className="text-[10px] mt-0.5">Attendance</span>
      </Link>

      <Link
        to="/leads"
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
          isActive('/leads') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Briefcase size={18} />
        <span className="text-[10px] mt-0.5">Leads</span>
      </Link>

      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-white transition"
      >
        <MenuIcon size={18} />
        <span className="text-[10px] mt-0.5">Menu</span>
      </button>
    </nav>
  );
}

function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 overflow-hidden">
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bda-hub" element={<BdaHub />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/team" element={<Team />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/communications" element={<Communications />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/add-member" element={<AddMemberById />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
      <Notification />
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Restore user from localStorage
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      dispatch(setUser({ token, user: JSON.parse(savedUser) }));
    }
    
    // Restore theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={user ? <MainLayout /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
