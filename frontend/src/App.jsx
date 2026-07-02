// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './redux/slices/authSlice';
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

// Components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Notification from './components/Notification';

import './App.css';

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
          element={
            user ? (
              <div className="flex h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-1 overflow-auto">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/leads" element={<Leads />} />
                      <Route path="/leads/:id" element={<LeadDetail />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/communications" element={<Communications />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </main>
                </div>
                <Notification />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
