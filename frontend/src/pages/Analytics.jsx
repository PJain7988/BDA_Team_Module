// frontend/src/pages/Analytics.jsx
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Download } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

function Analytics() {
  const [pipeline, setPipeline] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [pipelineRes, perfRes] = await Promise.all([
        api.get('/api/analytics/pipeline'),
        api.get('/api/analytics/team-performance'),
      ]);
      setPipeline(pipelineRes.data.pipeline || []);
      setPerformance(perfRes.data.performance || []);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      const response = await api.get(`/api/analytics/export?format=${format}`);
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leads.csv';
        a.click();
      } else {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leads.json';
        a.click();
      }
      toast.success('Export successful');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-slate-900 min-h-screen text-gray-900 dark:text-white flex justify-center items-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading analytics data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">Analytics & Intelligence</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Detailed performance metrics and manufacturing insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-2 bg-emerald-600/90 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-emerald-500/10 hover-lift transition font-semibold text-xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center space-x-2 bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-indigo-500/10 hover-lift transition font-semibold text-xs"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Grid for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 transition duration-200 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider font-display">Pipeline Distribution</h2>
          <div className="h-[280px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pipeline}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={3}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {pipeline.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Value Bar Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 transition duration-200 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider font-display">Pipeline Value by Stage</h2>
          <div className="h-[280px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipeline} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" opacity={0.3} />
                <XAxis dataKey="_id" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                <Bar dataKey="count" fill="url(#colorCount)" radius={[4, 4, 0, 0]} name="Leads Count">
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                </Bar>
                <Bar dataKey="totalValue" fill="url(#colorVal)" radius={[4, 4, 0, 0]} name="Value ($)">
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 transition duration-200 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider font-display">BDA Performance Ranking</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-gray-200/50 dark:border-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Leads</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Closed Won</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Conversion</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150/30 dark:divide-slate-700/30">
              {performance.length > 0 ? (
                performance
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((member, index) => (
                    <tr key={member.userId} className="hover:bg-slate-50/30 dark:hover:bg-slate-750/20 transition duration-150">
                      <td className="px-6 py-4 text-xs font-bold text-gray-900 dark:text-white">#{index + 1}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-950 dark:text-gray-100">{member.name}</td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">{member.totalLeads}</td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">{member.closedDeals}</td>
                      <td className="px-6 py-4 text-xs">
                        <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold tracking-wide">
                          {member.conversionRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-emerald-650 dark:text-emerald-400">
                        ${member.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                    No performance ranks available at this moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
