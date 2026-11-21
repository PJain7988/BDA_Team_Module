// frontend/src/pages/AuditLogs.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
  Shield, ShieldAlert, KeyRound, Search, Filter, RefreshCw, 
  Download, Calendar, User, Clock, Globe, ArrowUpDown, ChevronLeft, 
  ChevronRight, CheckCircle2, XCircle, AlertTriangle, Cpu, Terminal
} from 'lucide-react';
import authService from '../services/authService';
import { toast } from 'react-toastify';

export default function AuditLogs() {
  const { user } = useSelector((state) => state.auth);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const [logData, statsData] = await Promise.all([
        authService.getAuditLogs({
          page,
          limit: 15,
          search: search || undefined,
          action: actionFilter || undefined,
          resource: resourceFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        authService.getAuditStats().catch(() => ({ stats: null })),
      ]);

      setLogs(logData.logs || []);
      setTotalPages(logData.pages || 1);
      setTotalCount(logData.total || 0);
      if (statsData?.stats) {
        setStats(statsData.stats);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter, resourceFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Export visible logs as CSV
  const handleExportCSV = () => {
    if (!logs.length) {
      toast.warn('No logs to export');
      return;
    }

    const headers = ['Timestamp', 'User', 'Email', 'Role', 'Action', 'Resource', 'IP Address', 'Details'];
    const rows = logs.map((l) => [
      new Date(l.createdAt).toISOString(),
      `"${l.userName || 'System'}"`,
      `"${l.userEmail || ''}"`,
      `"${l.role || ''}"`,
      `"${l.action}"`,
      `"${l.resource}"`,
      `"${l.ipAddress || ''}"`,
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bda_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit trail CSV exported successfully');
  };

  const getActionBadge = (action) => {
    if (action.includes('FAILED') || action.includes('LOCKED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <AlertTriangle size={11} /> {action}
        </span>
      );
    }
    if (action.includes('WEBAUTHN') || action.includes('2FA') || action.includes('TOTP')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <KeyRound size={11} /> {action}
        </span>
      );
    }
    if (action.includes('LOGIN') || action.includes('REGISTER')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={11} /> {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-300 border border-slate-500/20">
        <Cpu size={11} /> {action}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Enterprise Security & Audit Trail</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded-md border border-purple-500/30 font-bold uppercase">
                  Manager Only
                </span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Immutable chronological logging of authentication, passkeys, 2FA, access attempts, and resource modifications.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchLogs()}
            disabled={loading}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/60 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 transition shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Events (24h)</span>
            <Clock size={16} className="text-blue-500" />
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">
            {stats?.total24h ?? '—'}
          </span>
          <p className="text-[10px] text-gray-400 mt-1">Logged across all tenants</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Sign-Ins Today</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats?.logins24h ?? '—'}
          </span>
          <p className="text-[10px] text-gray-400 mt-1">Password & Biometric Passkeys</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Security Alerts</span>
            <ShieldAlert size={16} className="text-rose-500" />
          </div>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {stats?.securityAlerts24h ?? 0}
          </span>
          <p className="text-[10px] text-gray-400 mt-1">Failed auth & lockout triggers</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Trail</span>
            <Terminal size={16} className="text-purple-500" />
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">
            {totalCount}
          </span>
          <p className="text-[10px] text-gray-400 mt-1">Records indexed in MongoDB</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="relative lg:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search user, email, action, IP..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="">All Actions</option>
              <option value="LOGIN_PASSWORD">Password Login</option>
              <option value="LOGIN_WEBAUTHN">Passkey / Biometric Login</option>
              <option value="WEBAUTHN_REGISTER">Passkey Registered</option>
              <option value="WEBAUTHN_DELETE">Passkey Deleted</option>
              <option value="TOTP_ENABLE">2FA Enabled</option>
              <option value="TOTP_DISABLE">2FA Disabled</option>
              <option value="LOGIN_FAILED">Failed Login</option>
              <option value="ACCOUNT_LOCKED">Account Locked</option>
              <option value="LOGOUT">Logout</option>
              <option value="UPDATE_PROFILE">Profile Update</option>
            </select>
          </div>

          {/* Resource Filter */}
          <div>
            <select
              value={resourceFilter}
              onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="">All Resources</option>
              <option value="AUTH">Authentication</option>
              <option value="SECURITY">Security / Keys</option>
              <option value="USER">User Account</option>
              <option value="LEAD">Leads</option>
              <option value="ATTENDANCE">Biometric Attendance</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearch('');
                setActionFilter('');
                setResourceFilter('');
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/60 rounded-xl border border-gray-200 dark:border-slate-700 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">IP Address & Agent</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Querying security audit records...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <Shield size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No audit records match your query</p>
                    <p className="text-xs text-gray-400 mt-1">Try relaxing filters or check back after actions are executed.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/60 dark:hover:bg-slate-700/30 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {log.userName?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-gray-900 dark:text-white block truncate">
                            {log.userName || 'System'}
                          </span>
                          <span className="text-[10px] text-gray-400 block truncate">
                            {log.userEmail || log.role || 'Guest'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                        {log.resource}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col max-w-[200px]">
                        <span className="font-mono text-[11px] text-gray-800 dark:text-gray-200 truncate">
                          {log.ipAddress || '127.0.0.1'}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate" title={log.userAgent}>
                          {log.userAgent ? log.userAgent.split(' ')[0] : 'Browser Client'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-purple-500 hover:text-white transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Page <strong className="text-gray-900 dark:text-white">{page}</strong> of{' '}
            <strong className="text-gray-900 dark:text-white">{totalPages}</strong> ({totalCount} total events)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-gray-200 dark:border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-purple-400" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Audit Event Telemetry</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Action</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Resource</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedLog.resource}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Initiated By</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedLog.userName} ({selectedLog.userEmail || 'N/A'}) &bull; Role: {selectedLog.role}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Network Client</span>
                <span className="font-mono text-gray-700 dark:text-gray-300 block truncate">
                  IP: {selectedLog.ipAddress || 'Unknown'} &bull; UA: {selectedLog.userAgent}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">Payload JSON</span>
                <pre className="p-3 bg-slate-950 text-cyan-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl text-gray-700 dark:text-gray-200 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
