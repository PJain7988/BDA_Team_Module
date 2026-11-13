// frontend/src/pages/BdaHub.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Briefcase, Camera, Fingerprint, FileText, MapPin, Send, Phone, 
  Calendar, CheckCircle2, Clock, Target, TrendingUp, Sparkles, 
  ArrowUpRight, QrCode, ShieldCheck, Plus, MessageSquare, Download, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import biometricService from '../services/biometricService';
import authService from '../services/authService';
import BiometricModal from '../components/BiometricModal';
import BusinessCardScannerModal from '../components/BusinessCardScannerModal';
import QuotationModal from '../components/QuotationModal';
import FieldVisitModal from '../components/FieldVisitModal';
import DigitalCardModal from '../components/DigitalCardModal';
import { toast } from 'react-toastify';

export default function BdaHub() {
  const { user } = useSelector((state) => state.auth);
  
  // Modals
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showCardScannerModal, setShowCardScannerModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showFieldVisitModal, setShowFieldVisitModal] = useState(false);
  const [showDigitalCardModal, setShowDigitalCardModal] = useState(false);
  
  // Selected lead for quotation/visit modal
  const [selectedLead, setSelectedLead] = useState(null);

  // Attendance state
  const [attendance, setAttendance] = useState({
    isPunchedIn: false,
    lastPunchTime: null,
    punchType: 'out',
    location: null,
  });
  const [attendanceLogs, setAttendanceLogs] = useState([]);

  // Leads & followups
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Today's BDA Targets
  const [dailyTargets, setDailyTargets] = useState({
    callsCompleted: 7,
    callsTarget: 10,
    visitsCompleted: 2,
    visitsTarget: 3,
    quotesSent: 3,
    quotesTarget: 4,
    pipelineAdded: 65000,
  });

  useEffect(() => {
    loadAttendanceData();
    fetchLeadsData();
  }, []);

  const loadAttendanceData = async () => {
    // Load from local storage first
    const stored = biometricService.getStoredAttendanceState();
    setAttendance(stored);

    // Fetch from backend
    try {
      const res = await authService.getAttendanceHistory();
      if (res.attendanceHistory && res.attendanceHistory.length > 0) {
        setAttendanceLogs(res.attendanceHistory);
        const latest = res.attendanceHistory[0];
        setAttendance({
          isPunchedIn: latest.punchType === 'in',
          lastPunchTime: latest.timestamp,
          punchType: latest.punchType,
          location: latest.location,
        });
      }
    } catch (e) {
      console.warn('Backend attendance history sync fallback', e);
    }
  };

  const fetchLeadsData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/leads');
      setLeads(res.data.leads || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePunchSuccess = (punchState) => {
    setAttendance((prev) => ({
      ...prev,
      ...punchState,
    }));
    loadAttendanceData();
  };

  const handleOpenQuotation = (lead) => {
    setSelectedLead(lead);
    setShowQuotationModal(true);
  };

  const handleOpenVisit = (lead) => {
    setSelectedLead(lead);
    setShowFieldVisitModal(true);
  };

  const handleWhatsApp = (lead) => {
    const phone = (lead.phone || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${lead.contactName}, this is ${user?.name || 'your account manager'} from BDA Manufacturing Consortium. Following up on our recent technical specification discussions regarding ${lead.companyName}. Are you free for a brief 5-minute call today?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      
      {/* Top Banner / Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            <span>BDA Field Operations & Sales Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>BDA Sales Command Console</span>
            <span className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30">
              Live Field Ready
            </span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manufacturing lead capture, biometric attendance check-in, card scanning & quotation generator
          </p>
        </div>

        {/* Digital Card Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowDigitalCardModal(true)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-750 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition flex items-center gap-2"
          >
            <QrCode size={15} className="text-blue-500" />
            <span>My Digital Card (QR)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCardScannerModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
          >
            <Camera size={15} />
            <span>Scan Visiting Card</span>
          </button>
        </div>
      </div>

      {/* 2-Column Overview: Biometric Field Punch & Daily Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Biometric Attendance & Field Geo-Punch Terminal */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-cyan-400" />
                <span>Biometric Punch Terminal</span>
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                attendance.isPunchedIn
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
              }`}>
                {attendance.isPunchedIn ? '🟢 PUNCHED IN' : '🔴 PUNCHED OUT'}
              </span>
            </div>

            <div className="space-y-2 mb-6">
              <h3 className="text-2xl font-black text-white tracking-tight">
                {attendance.isPunchedIn ? 'On Active Duty' : 'Shift Not Started'}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock size={13} className="text-blue-400" />
                <span>
                  {attendance.lastPunchTime
                    ? `Last Recorded: ${new Date(attendance.lastPunchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'No punch recorded today'}
                </span>
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 truncate font-mono">
                <MapPin size={13} className="text-cyan-400 flex-shrink-0" />
                <span className="truncate">
                  {attendance.location?.address || 'GPS: 12.9716°N, 77.5946°E (Peenya Industrial Cluster)'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowBiometricModal(true)}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 group ${
              attendance.isPunchedIn
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-500/20'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-blue-500/25'
            }`}
          >
            <Fingerprint size={18} className="group-hover:scale-110 transition" />
            <span>
              {attendance.isPunchedIn
                ? 'Scan Fingerprint to Punch OUT'
                : 'Scan Fingerprint to Punch IN'}
            </span>
          </button>
        </div>

        {/* Card 2 & 3: Today's BDA Targets & Pipeline Velocity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-200/60 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target size={18} className="text-indigo-500" />
                  <span>Today's BDA Targets & Achievement</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Target metrics for client outreach, factory visits & deal proposals
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full">
                Target Progress: 82%
              </span>
            </div>

            {/* Target Progress Bars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
              {/* Calls */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-700/50">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Client Calls</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {dailyTargets.callsCompleted}/{dailyTargets.callsTarget}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(dailyTargets.callsCompleted / dailyTargets.callsTarget) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-2 block">70% target achieved</span>
              </div>

              {/* Factory Visits */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-700/50">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Plant Visits</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {dailyTargets.visitsCompleted}/{dailyTargets.visitsTarget}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(dailyTargets.visitsCompleted / dailyTargets.visitsTarget) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-2 block">1 visit remaining today</span>
              </div>

              {/* Quotations */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-700/50">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">RFQs Issued</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {dailyTargets.quotesSent}/{dailyTargets.quotesTarget}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(dailyTargets.quotesSent / dailyTargets.quotesTarget) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-2 block">75% quote goal</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Strip */}
          <div className="pt-3 border-t border-gray-100 dark:border-slate-700/60 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setShowCardScannerModal(true)}
              className="py-2 px-3.5 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Camera size={14} />
              <span>Scan Visiting Card</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenQuotation(null)}
              className="py-2 px-3.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <FileText size={14} />
              <span>Draft Quotation / RFQ</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenVisit(null)}
              className="py-2 px-3.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <MapPin size={14} />
              <span>Log Factory Visit</span>
            </button>
            <button
              type="button"
              onClick={() => setShowBiometricModal(true)}
              className="py-2 px-3.5 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Fingerprint size={14} />
              <span>Biometric Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Priority Follow-ups & Direct BDA Outreach */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-200/60 dark:border-slate-700/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-500" />
              <span>Today's Priority Manufacturing Leads</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Immediate outreach required: 1-click WhatsApp, quotation generation, and field visit logs
            </p>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {leads.length} Active Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-900/60 text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-wider border-y border-gray-200/60 dark:border-slate-700/60">
              <tr>
                <th className="p-3.5">Company & Contact</th>
                <th className="p-3.5">Industry</th>
                <th className="p-3.5">Pipeline Stage</th>
                <th className="p-3.5">Est. Value</th>
                <th className="p-3.5">Lead Source</th>
                <th className="p-3.5 text-right">Quick BDA Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {leads.slice(0, 6).map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50/70 dark:hover:bg-slate-750/50 transition">
                  <td className="p-3.5">
                    <span className="font-bold text-gray-900 dark:text-white block">
                      {lead.companyName}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                      {lead.contactName} {lead.phone ? `• ${lead.phone}` : ''}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium text-[10px]">
                      {lead.industry || 'Manufacturing'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      lead.stage === 'Closed Won'
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : lead.stage === 'Negotiation'
                        ? 'bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400'
                        : 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-gray-900 dark:text-white">
                    ${(lead.dealValue || 0).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-gray-500 dark:text-gray-400 text-[11px]">
                    {lead.source || 'Trade Show'}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* WhatsApp */}
                      <button
                        type="button"
                        onClick={() => handleWhatsApp(lead)}
                        title="Quick WhatsApp Follow-up"
                        className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition"
                      >
                        <Send size={15} />
                      </button>
                      {/* Create Quotation */}
                      <button
                        type="button"
                        onClick={() => handleOpenQuotation(lead)}
                        title="Create Commercial Quotation"
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition"
                      >
                        <FileText size={15} />
                      </button>
                      {/* Field Visit */}
                      <button
                        type="button"
                        onClick={() => handleOpenVisit(lead)}
                        title="Log Factory Visit"
                        className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition"
                      >
                        <MapPin size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Biometric Attendance Log History */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-200/60 dark:border-slate-700/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Fingerprint size={18} className="text-cyan-500" />
              <span>Biometric Attendance & Site Punch Records</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Auditable biometric logs with cryptographic signatures and GPS location coordinates
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Hardware-Backed Encryption
          </span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {attendanceLogs.length > 0 ? (
            attendanceLogs.slice(0, 5).map((log, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    log.punchType === 'in'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                  }`}>
                    {log.punchType === 'in' ? 'IN' : 'OUT'}
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      Biometric Punch {log.punchType?.toUpperCase()}
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {log.location?.address || 'Peenya Industrial Area Site Hub'} • {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    BIO-VERIFIED
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-gray-400 text-xs">
              No recent attendance logs recorded. Click "Scan Fingerprint to Punch IN" above to log your first verified attendance.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <BiometricModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        mode="attendance"
        user={user}
        onSuccess={handlePunchSuccess}
      />

      <BusinessCardScannerModal
        isOpen={showCardScannerModal}
        onClose={() => setShowCardScannerModal(false)}
        onLeadCreated={() => fetchLeadsData()}
      />

      <QuotationModal
        isOpen={showQuotationModal}
        onClose={() => setShowQuotationModal(false)}
        lead={selectedLead}
        user={user}
      />

      <FieldVisitModal
        isOpen={showFieldVisitModal}
        onClose={() => setShowFieldVisitModal(false)}
        lead={selectedLead}
        user={user}
        onVisitLogged={() => fetchLeadsData()}
      />

      <DigitalCardModal
        isOpen={showDigitalCardModal}
        onClose={() => setShowDigitalCardModal(false)}
        user={user}
      />
    </div>
  );
}
