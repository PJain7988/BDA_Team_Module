// frontend/src/pages/Attendance.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Clock, Fingerprint, MapPin, Calendar, Users, TrendingUp,
  Download, CheckCircle2, AlertTriangle, XCircle, Search,
  RefreshCw, BarChart2, ShieldCheck, Zap, ArrowRight, Play, Square, Camera
} from 'lucide-react';
import attendanceService from '../services/attendanceService';
import biometricService from '../services/biometricService';
import BiometricModal from '../components/BiometricModal';
import { toast } from 'react-toastify';

export default function Attendance() {
  const { user } = useSelector((state) => state.auth);
  const isManagerOrLead = user?.role === 'Manager' || user?.role === 'TeamLead';

  // Active view tab: 'roster' | 'heatmap' | 'correlation' | 'my-history'
  const [activeTab, setActiveTab] = useState(isManagerOrLead ? 'roster' : 'my-history');

  // Live timer & Punch State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayState, setTodayState] = useState({ isPunchedIn: false, activeMinutes: 0, record: null });
  const [punchLoading, setPunchLoading] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [modalMode, setModalMode] = useState('attendance');
  const [currentLocation, setCurrentLocation] = useState(null);

  // Team Attendance (Roster) State
  const [rosterData, setRosterData] = useState({ stats: null, roster: [] });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [rosterLoading, setRosterLoading] = useState(false);

  // Monthly Heatmap State
  const [heatmapData, setHeatmapData] = useState({ heatmap: [], lateArrivals: [] });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  // KPI Correlation State
  const [kpiData, setKpiData] = useState([]);
  const [kpiLoading, setKpiLoading] = useState(false);

  // Personal History State
  const [myHistory, setMyHistory] = useState({ records: [], stats: null });
  const [historyLoading, setHistoryLoading] = useState(false);

  // Real-time clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch device GPS on mount
  useEffect(() => {
    biometricService.getCurrentLocation().then(setCurrentLocation);
  }, []);

  // Fetch today's punch state
  const fetchTodayState = useCallback(async () => {
    try {
      const data = await attendanceService.getToday();
      setTodayState(data);
    } catch (e) {
      console.warn('Could not fetch today attendance:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchTodayState();
  }, [fetchTodayState]);

  // Fetch Team Roster
  const fetchTeamRoster = useCallback(async () => {
    if (!isManagerOrLead) return;
    try {
      setRosterLoading(true);
      const data = await attendanceService.getTeamAttendance({
        date: selectedDate,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      setRosterData(data);
    } catch (e) {
      toast.error('Failed to load team roster');
    } finally {
      setRosterLoading(false);
    }
  }, [isManagerOrLead, selectedDate, statusFilter, searchQuery]);

  // Fetch Monthly Heatmap
  const fetchMonthlyHeatmap = useCallback(async () => {
    if (!isManagerOrLead) return;
    try {
      setHeatmapLoading(true);
      const data = await attendanceService.getMonthlySummary({
        year: selectedYear,
        month: selectedMonth,
      });
      setHeatmapData(data);
    } catch (e) {
      toast.error('Failed to load monthly summary');
    } finally {
      setHeatmapLoading(false);
    }
  }, [isManagerOrLead, selectedYear, selectedMonth]);

  // Fetch KPI Correlation
  const fetchKpiCorrelation = useCallback(async () => {
    if (!isManagerOrLead) return;
    try {
      setKpiLoading(true);
      const data = await attendanceService.getKpiCorrelation();
      setKpiData(data.correlations || []);
    } catch (e) {
      toast.error('Failed to load KPI correlation');
    } finally {
      setKpiLoading(false);
    }
  }, [isManagerOrLead]);

  // Fetch Personal History
  const fetchMyHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const data = await attendanceService.getMyHistory();
      setMyHistory(data);
    } catch (e) {
      toast.error('Failed to load personal history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Sync tab loading
  useEffect(() => {
    if (activeTab === 'roster') fetchTeamRoster();
    if (activeTab === 'heatmap') fetchMonthlyHeatmap();
    if (activeTab === 'correlation') fetchKpiCorrelation();
    if (activeTab === 'my-history') fetchMyHistory();
  }, [activeTab, fetchTeamRoster, fetchMonthlyHeatmap, fetchKpiCorrelation, fetchMyHistory]);

  // Trigger Biometric Punch
  const handleTriggerPunch = (type) => {
    setModalMode('attendance');
    setShowBioModal(true);
  };

  // Direct Quick Punch opens live camera face terminal
  const handleQuickPunch = () => {
    setShowBioModal(true);
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      await attendanceService.exportAttendanceCSV();
      toast.success('Attendance CSV exported successfully');
    } catch (e) {
      toast.error('Failed to export CSV');
    }
  };

  const getStatusBadge = (status, isLate) => {
    if (status === 'Late' || isLate) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <AlertTriangle size={11} /> Late Arrival
        </span>
      );
    }
    if (status === 'Present') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 size={11} /> Present
        </span>
      );
    }
    if (status === 'HalfDay') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Clock size={11} /> Half Day
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
        <XCircle size={11} /> Absent
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Punch Terminal Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Clock & Status */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-cyan-400 font-mono font-semibold">
              <span className={`w-2 h-2 rounded-full ${todayState.isPunchedIn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{todayState.isPunchedIn ? 'SESSION ACTIVE (ON SHIFT)' : 'CURRENTLY OFF DUTY'}</span>
            </div>

            <div>
              <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white flex items-baseline gap-2">
                <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span className="text-xs text-slate-400 font-sans font-medium uppercase tracking-widest">IST</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* GPS Location Pill */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <MapPin size={14} className="text-cyan-400 flex-shrink-0" />
              <span className="truncate max-w-xs sm:max-w-md">
                {currentLocation ? currentLocation.address : 'Acquiring GPS coordinates...'}
              </span>
            </div>
          </div>

          {/* Quick Punch Action Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-inner">
            <div className="text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Today's Total Shift</span>
              <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
                {Math.floor(todayState.activeMinutes / 60)}h {(todayState.activeMinutes % 60).toString().padStart(2, '0')}m
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {todayState.record?.checkIn
                  ? `Checked In: ${new Date(todayState.record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'No punches today'}
              </span>
            </div>

            <button
              onClick={handleQuickPunch}
              disabled={punchLoading}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition shadow-lg ${
                todayState.isPunchedIn
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-500/20'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white shadow-emerald-500/20'
              }`}
            >
              {punchLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Biometric Enclave...</span>
                </>
              ) : todayState.isPunchedIn ? (
                <>
                  <Square size={16} fill="white" />
                  <span>Punch Out (Biometric)</span>
                </>
              ) : (
                <>
                  <Fingerprint size={18} />
                  <span>Punch In (Biometric)</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 space-x-1 sm:space-x-3 text-xs font-bold">
        {isManagerOrLead && (
          <>
            <button
              onClick={() => setActiveTab('roster')}
              className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'roster'
                  ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Users size={15} />
              <span>Daily Team Roster</span>
            </button>

            <button
              onClick={() => setActiveTab('heatmap')}
              className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'heatmap'
                  ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Calendar size={15} />
              <span>Monthly Heatmap & Late Arrivals</span>
            </button>

            <button
              onClick={() => setActiveTab('correlation')}
              className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'correlation'
                  ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <TrendingUp size={15} />
              <span>Attendance vs Sales KPIs</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('my-history')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'my-history'
              ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Clock size={15} />
          <span>My Punch History (30 Days)</span>
        </button>
      </div>

      {/* ── TAB 1: DAILY TEAM ROSTER (Team Lead & Manager) ───────── */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          
          {/* Roster Controls & Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Team</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">{rosterData.stats?.totalStaff ?? 0}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-500 block">Present</span>
                <span className="text-lg font-black text-emerald-500">{rosterData.stats?.presentCount ?? 0}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-500 block">Late Arrivals</span>
                <span className="text-lg font-black text-amber-500">{rosterData.stats?.lateCount ?? 0}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
                <span className="text-[10px] uppercase font-bold text-rose-500 block">Absent</span>
                <span className="text-lg font-black text-rose-500">{rosterData.stats?.absentCount ?? 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name or email..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-700 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Role & Team</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Check In</th>
                    <th className="py-3 px-4">Check Out</th>
                    <th className="py-3 px-4">Working Hours</th>
                    <th className="py-3 px-4">Method & Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {rosterLoading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-gray-400">
                        <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-xs">Loading team attendance roster...</p>
                      </td>
                    </tr>
                  ) : rosterData.roster.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-gray-400">
                        <Clock size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                        <p className="font-bold">No attendance records found for this date</p>
                      </td>
                    </tr>
                  ) : (
                    rosterData.roster.map((member) => (
                      <tr key={member.userId} className="hover:bg-gray-50/60 dark:hover:bg-slate-700/30 transition">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {member.photoSnapshot ? (
                              <div className="relative group flex-shrink-0">
                                <img
                                  src={member.photoSnapshot}
                                  alt={member.name}
                                  className="w-9 h-9 rounded-xl object-cover border-2 border-emerald-500 shadow-sm"
                                />
                                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow">
                                  <Camera size={9} />
                                </span>
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                                {member.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-gray-900 dark:text-white block">{member.name}</span>
                              <span className="text-[10px] text-gray-400 block">{member.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">{member.role}</span>
                          <span className="text-[10px] text-gray-400">{member.teamName}</span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {getStatusBadge(member.status, member.isLate)}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {member.checkIn ? (
                            <div>
                              <span className="font-mono text-xs text-gray-900 dark:text-white font-semibold block">
                                {member.punchTimestamp || new Date(member.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                              <span className="text-[9px] text-emerald-500 font-mono font-medium">Verified Face Photo</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {member.checkOut ? (
                            <span className="font-mono text-xs text-gray-900 dark:text-white font-semibold">
                              {new Date(member.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : member.checkIn ? (
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Active Shift
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                            {(member.durationMinutes / 60).toFixed(1)} hrs
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col max-w-[220px]">
                            <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                              {member.method === 'biometric' ? <Fingerprint size={12} className="text-cyan-400" /> : <Clock size={12} />}
                              <span>{member.deviceName || 'WebAuthn Device'}</span>
                            </span>
                            <span className="text-[10px] text-gray-400 truncate" title={member.location?.address}>
                              {member.location?.address || 'Cluster Site 4'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 2: MONTHLY CALENDAR HEATMAP ─────────────────────── */}
      {activeTab === 'heatmap' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Attendance Density & Punctuality Heatmap
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-semibold"
              >
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-semibold"
              >
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100 dark:border-slate-700/50">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            {heatmapLoading ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading monthly calendar telemetry...</div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const cell = heatmapData.heatmap.find((h) => h.date === dateStr);
                  const isPresent = cell && cell.present > 0;
                  const hasLate = cell && cell.late > 0;

                  return (
                    <div
                      key={day}
                      className={`p-2.5 rounded-2xl border text-center transition min-h-[70px] flex flex-col justify-between ${
                        hasLate
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                          : isPresent
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-gray-50 dark:bg-slate-900/60 border-gray-200/60 dark:border-slate-800 text-gray-400'
                      }`}
                    >
                      <span className="text-xs font-bold font-mono">{day}</span>
                      {cell ? (
                        <div className="text-[10px] font-bold mt-1">
                          <span className="block">{cell.count} Present</span>
                          {cell.late > 0 && <span className="text-amber-500 block text-[9px]">({cell.late} Late)</span>}
                        </div>
                      ) : (
                        <span className="text-[9px] text-gray-400 mt-1">Off</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Late Arrivals Watchlist */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>Late Arrival Incidents this Month ({heatmapData.lateArrivals.length})</span>
            </h4>

            {heatmapData.lateArrivals.length === 0 ? (
              <p className="text-xs text-gray-400 py-3">No late arrivals logged this month. 100% punctuality!</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {heatmapData.lateArrivals.map((late) => (
                  <div key={late.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white block">{late.userName}</span>
                      <span className="text-[10px] text-gray-400">{late.date} &bull; Check-in: {new Date(late.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      +{late.minutesLate} mins late
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: ATTENDANCE VS SALES KPIS ─────────────────────── */}
      {activeTab === 'correlation' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-500" />
                <span>Field Hours Worked vs Sales Engagement (Past 30 Days)</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Direct correlation of attendance biometric hours against client calls logged and deals won.
              </p>
            </div>

            {kpiLoading ? (
              <div className="py-12 text-center text-xs text-gray-400">Computing sales efficiency matrix...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {kpiData.map((item) => (
                  <div
                    key={item.userId}
                    className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 border border-gray-200 dark:border-slate-700 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-gray-900 dark:text-white block">{item.name}</span>
                          <span className="text-[10px] text-gray-400">{item.daysPresent} days on field</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-cyan-400 font-mono block">{item.efficiencyScore}</span>
                        <span className="text-[9px] text-gray-400 uppercase font-bold">Score</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-gray-100 dark:border-slate-800">
                      <div className="p-2 bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200/60 dark:border-slate-700">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Hours Worked</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white font-mono">{item.hoursWorked}h</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200/60 dark:border-slate-700">
                        <span className="text-[10px] uppercase font-bold text-blue-500 block">Calls Logged</span>
                        <span className="text-sm font-black text-blue-500 font-mono">{item.callsMade}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-gray-500 text-[11px]">Calls per hour:</span>
                      <span className="font-bold font-mono text-gray-900 dark:text-white">{item.callsPerHour}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 text-[11px]">Deals Closed:</span>
                      <span className="font-bold font-mono text-emerald-500">{item.dealsWon} won</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: MY PERSONAL PUNCH HISTORY (30 Days) ──────────── */}
      {activeTab === 'my-history' && (
        <div className="space-y-4">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Days Present</span>
              <span className="text-xl font-black text-emerald-500">{myHistory.stats?.totalDaysPresent ?? 0}</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Late Arrivals</span>
              <span className="text-xl font-black text-amber-500">{myHistory.stats?.lateDays ?? 0}</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Shift Hours</span>
              <span className="text-xl font-black text-cyan-400">{myHistory.stats?.totalHours ?? 0}h</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Punctuality</span>
              <span className="text-xl font-black text-blue-500">{myHistory.stats?.punctualityRate ?? 100}%</span>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-700 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Check In</th>
                    <th className="py-3 px-4">Check Out</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {historyLoading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-400">Loading history...</td>
                    </tr>
                  ) : myHistory.records.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-400">No punch history recorded yet.</td>
                    </tr>
                  ) : (
                    myHistory.records.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50/60 dark:hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-mono font-semibold text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            {r.photoSnapshot && (
                              <img
                                src={r.photoSnapshot}
                                alt="Selfie"
                                className="w-7 h-7 rounded-lg object-cover border border-emerald-500 shadow-xs flex-shrink-0"
                              />
                            )}
                            <span>{new Date(r.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(r.status, r.isLate)}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {r.checkIn ? (
                            <div>
                              <span>{r.punchTimestamp || new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                              <span className="text-[9px] text-emerald-500 block font-sans">Face Verified</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">
                          {(r.durationMinutes / 60).toFixed(1)} hrs
                        </td>
                        <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate" title={r.location?.address}>
                          {r.location?.address || 'Site 4'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Modal fallback */}
      <BiometricModal
        isOpen={showBioModal}
        onClose={() => setShowBioModal(false)}
        mode={modalMode}
        user={user}
        onSuccess={() => {
          fetchTodayState();
          if (activeTab === 'roster') fetchTeamRoster();
          if (activeTab === 'my-history') fetchMyHistory();
        }}
      />

    </div>
  );
}
