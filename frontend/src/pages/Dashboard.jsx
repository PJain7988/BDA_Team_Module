// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, DollarSign } from 'lucide-react';
import api from '../services/api';

function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, trendsRes] = await Promise.all([
        api.get('/api/analytics/dashboard'),
        api.get('/api/analytics/trends?months=6'),
      ]);
      setMetrics(metricsRes.data.metrics);
      setTrends(trendsRes.data.trends);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-slate-900 min-h-screen text-gray-900 dark:text-white flex justify-center items-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Leads',
      value: metrics?.totalLeads || 0,
      icon: Target,
      color: 'from-blue-500 to-cyan-500 text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Closed Deals',
      value: metrics?.closedDeals || 0,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500 text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Conversion Rate',
      value: `${metrics?.conversionRate || 0}%`,
      icon: Target,
      color: 'from-violet-500 to-purple-500 text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: 'Total Revenue',
      value: `$${(metrics?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-amber-500 to-orange-500 text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight flex items-center space-x-2">
            <span>Enterprise Dashboard</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Overview of your sales performance and metrics</p>
        </div>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-sm">
          Active Session: <span className="text-blue-600 dark:text-blue-400">{user?.name}</span> ({user?.role})
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 hover-lift transition-all duration-200 relative overflow-hidden group">
              {/* Subtle top indicator bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">{stat.title}</p>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 font-display tracking-tight">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3.5 rounded-xl transition duration-300 group-hover:scale-110`}>
                  <Icon className="text-indigo-500 dark:text-indigo-400" size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lead Trends */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 transition duration-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-display">Lead Trends</h2>
            <span className="text-2xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">Realtime</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" opacity={0.3} />
                <XAxis dataKey="_id" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} name="New Leads" activeDot={{ r: 6 }} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue" activeDot={{ r: 6 }} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 transition duration-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-display">Pipeline Distribution</h2>
            <span className="text-2xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">Overview</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" opacity={0.3} />
                <XAxis dataKey="_id" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="count" fill="url(#colorLeads)" radius={[6, 6, 0, 0]} name="Leads">
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 transition duration-200 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider font-display">Key Performance Indicators</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-5 bg-gradient-to-br from-blue-50/40 to-indigo-50/20 dark:from-blue-950/10 dark:to-indigo-950/5 border border-blue-100/30 dark:border-blue-900/20 rounded-xl hover-lift transition">
            <p className="text-2xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Pipeline Value</p>
            <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-2 font-display">${(metrics?.pipelineValue || 0).toLocaleString()}</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-green-50/40 to-teal-50/20 dark:from-green-950/10 dark:to-teal-950/5 border border-green-100/30 dark:border-green-900/20 rounded-xl hover-lift transition">
            <p className="text-2xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Closed Deals</p>
            <p className="text-xl font-extrabold text-green-600 dark:text-green-400 mt-2 font-display">{metrics?.closedDeals || 0}</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-purple-50/40 to-violet-50/20 dark:from-purple-950/10 dark:to-violet-950/5 border border-purple-100/30 dark:border-purple-900/20 rounded-xl hover-lift transition">
            <p className="text-2xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Success Rate</p>
            <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-2 font-display">{metrics?.conversionRate || 0}%</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-amber-50/40 to-orange-50/20 dark:from-amber-950/10 dark:to-orange-950/5 border border-amber-100/30 dark:border-amber-900/20 rounded-xl hover-lift transition">
            <p className="text-2xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Total Leads</p>
            <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-2 font-display">{metrics?.totalLeads || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
