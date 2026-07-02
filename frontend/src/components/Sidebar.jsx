// frontend/src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, BarChart3, MessageSquare, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../redux/slices/authSlice';

function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/leads', label: 'Leads', icon: Briefcase },
    ...(user?.role !== 'BDA' ? [{ path: '/team', label: 'Team', icon: Users }] : []),
    ...(user?.role !== 'BDA' ? [{ path: '/analytics', label: 'Analytics', icon: BarChart3 }] : []),
    { path: '/communications', label: 'Communications', icon: MessageSquare },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-900 dark:bg-slate-950 text-white h-screen flex flex-col border-r border-slate-800/80 transition-colors duration-200">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/80">
        <h1 className="text-lg font-bold flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-sm tracking-wider">BDA</span>
          </div>
          <span className="tracking-tight text-slate-100 font-display">CRM Module</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/10 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <Icon size={18} className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'} />
              <span className="text-xs tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={() => dispatch(clearAuth())}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="text-xs font-semibold tracking-wide">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
