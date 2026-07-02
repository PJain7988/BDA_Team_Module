// frontend/src/components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, BarChart3, MessageSquare, LogOut, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../redux/slices/authSlice';

function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & KPIs' },
    { path: '/leads', label: 'Leads', icon: Briefcase, description: 'Manage pipeline' },
    ...(user?.role !== 'BDA' ? [{ path: '/team', label: 'Team', icon: Users, description: 'Team members' }] : []),
    ...(user?.role !== 'BDA' ? [{ path: '/analytics', label: 'Analytics', icon: BarChart3, description: 'Performance data' }] : []),
    { path: '/communications', label: 'Comms', icon: MessageSquare, description: 'Client logs' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`${collapsed ? 'w-20' : 'w-64'} bg-slate-900 dark:bg-slate-950 text-white h-screen flex flex-col border-r border-slate-800/80 transition-all duration-300 ease-in-out relative flex-shrink-0`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-50 w-6 h-6 bg-slate-700 hover:bg-blue-600 border border-slate-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
      >
        {collapsed ? <ChevronRight size={12} className="text-white" /> : <ChevronLeft size={12} className="text-white" />}
      </button>

      {/* Logo */}
      <div className={`p-5 border-b border-slate-800/80 flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
        <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
          <TrendingUp size={17} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-extrabold text-slate-100 tracking-tight leading-tight">BDA CRM</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Manufacturing Suite</p>
          </div>
        )}
      </div>

      {/* User Badge */}
      {!collapsed && (
        <div className="mx-3 mt-4 p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate leading-tight">{user?.name}</p>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-0.5 inline-block ${
                user?.role === 'Manager' ? 'bg-purple-500/20 text-purple-300' :
                user?.role === 'TeamLead' ? 'bg-blue-500/20 text-blue-300' :
                'bg-emerald-500/20 text-emerald-300'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2 overflow-y-auto">
        {!collapsed && (
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-3">Navigation</p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2.5 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/15'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon size={17} className={`flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold block truncate">{item.label}</span>
                  {!active && (
                    <span className="text-[9px] text-slate-600 group-hover:text-slate-500 truncate block">{item.description}</span>
                  )}
                </div>
              )}
              {!collapsed && active && (
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={() => dispatch(clearAuth())}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-all duration-200 group`}
        >
          <LogOut size={17} className="group-hover:text-red-400 flex-shrink-0" />
          {!collapsed && <span className="text-xs font-semibold">Sign Out</span>}
        </button>
        {!collapsed && (
          <p className="text-[9px] text-slate-700 text-center mt-2">v1.0 · MIT License</p>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
