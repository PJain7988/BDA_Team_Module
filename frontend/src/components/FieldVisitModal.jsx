// frontend/src/components/FieldVisitModal.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, Building, Calendar, User, CheckCircle2, X, Star, FileText, Send, Sparkles } from 'lucide-react';
import api from '../services/api';
import biometricService from '../services/biometricService';
import { toast } from 'react-toastify';

export default function FieldVisitModal({
  isOpen,
  onClose,
  lead = null,
  user = null,
  onVisitLogged = () => {},
}) {
  const [leadsList, setLeadsList] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [plantAddress, setPlantAddress] = useState('');
  const [geoCoords, setGeoCoords] = useState(null);
  const [objective, setObjective] = useState('Machine Demo & Technical Trial');
  const [minutesOfMeeting, setMinutesOfMeeting] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [satisfactionRating, setSatisfactionRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const visitObjectives = [
    'Initial Factory Site Survey',
    'Machine Demo & Technical Trial',
    'Commercial & Pricing Negotiation',
    'Final Contract Closure & PO Handover',
    'Quality Audit & Plant Approval',
    'Annual Maintenance Contract Review',
  ];

  useEffect(() => {
    if (isOpen) {
      // Auto capture GPS
      biometricService.getCurrentLocation().then((loc) => {
        setGeoCoords(loc);
        if (!plantAddress) {
          setPlantAddress(loc.address || 'Industrial Manufacturing Hub Site 3');
        }
      });

      // Default follow up in 3 days
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setNextFollowUp(d.toISOString().split('T')[0]);

      if (lead) {
        setSelectedLeadId(lead._id);
        setContactPerson(lead.contactName || '');
      } else {
        fetchLeads();
      }
    }
  }, [isOpen, lead]);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/api/leads');
      const items = res.data.leads || [];
      setLeadsList(items);
      if (items.length > 0 && !selectedLeadId) {
        setSelectedLeadId(items[0]._id);
        setContactPerson(items[0].contactName || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeadChange = (e) => {
    const id = e.target.value;
    setSelectedLeadId(id);
    const found = leadsList.find((l) => l._id === id);
    if (found) {
      setContactPerson(found.contactName || '');
    }
  };

  const handleSaveVisit = async (e) => {
    e.preventDefault();
    if (!selectedLeadId) {
      return toast.warn('Please select a lead or company');
    }

    setLoading(true);
    try {
      const payload = {
        lead: selectedLeadId,
        type: 'Meeting',
        subject: `📍 Field Visit: ${objective}`,
        description: `Factory Visit verified with GPS (${geoCoords?.latitude?.toFixed(4)}°N, ${geoCoords?.longitude?.toFixed(4)}°E).\n\n` +
          `Plant Location: ${plantAddress}\n` +
          `POC Met: ${contactPerson}\n` +
          `Meeting Minutes: ${minutesOfMeeting}\n` +
          `Client Interest Score: ${satisfactionRating}/5 Stars`,
        communicatedWith: contactPerson || 'Plant Representative',
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : undefined,
      };

      const res = await api.post('/api/communications', payload);
      toast.success('Field visit successfully logged and verified with GPS stamp!');
      onVisitLogged(res.data.communication);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log field visit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MapPin size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Client Plant / Factory Visit Log</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Geo-Stamped
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Log on-site client audit, trial, and minutes of meeting with GPS verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSaveVisit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* GPS Location Banner */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300">
            <MapPin size={16} className="text-emerald-400 flex-shrink-0 animate-pulse" />
            <div className="truncate">
              <span className="font-semibold text-emerald-200">GPS Geo-Tag Verified: </span>
              <span className="font-mono text-emerald-300 text-[11px]">
                {geoCoords
                  ? `${geoCoords.latitude?.toFixed(4)}°N, ${geoCoords.longitude?.toFixed(4)}°E (Accuracy: ${geoCoords.accuracy}m)`
                  : 'Acquiring high-precision GPS lock...'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Select Lead */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Client Company / Lead *
              </label>
              {lead ? (
                <div className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-semibold">
                  {lead.companyName}
                </div>
              ) : (
                <select
                  value={selectedLeadId}
                  onChange={handleLeadChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Select Client --</option>
                  {leadsList.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.companyName} ({l.contactName})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Contact Person Met */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Person Met (POC) *
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Mr. Sharma (Plant Head)"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Plant Address / Site */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Factory / Plant Location
            </label>
            <input
              type="text"
              value={plantAddress}
              onChange={(e) => setPlantAddress(e.target.value)}
              placeholder="e.g. Plot 15, Peenya Industrial Area Phase 2"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Visit Objective */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Primary Objective of Visit
            </label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            >
              {visitObjectives.map((obj) => (
                <option key={obj} value={obj}>{obj}</option>
              ))}
            </select>
          </div>

          {/* Minutes of Meeting */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Discussion Minutes & Plant Observations
            </label>
            <textarea
              rows={3}
              value={minutesOfMeeting}
              onChange={(e) => setMinutesOfMeeting(e.target.value)}
              placeholder="Key technical specifications discussed, machine trial results, client objections resolved, sample parts collected..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Next Follow Up */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Next Follow-Up Date
              </label>
              <input
                type="date"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Satisfaction / Intent Score */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Client Interest Rating
              </label>
              <div className="flex items-center gap-1.5 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSatisfactionRating(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      size={20}
                      className={
                        star <= satisfactionRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }
                    />
                  </button>
                ))}
                <span className="text-xs font-mono text-slate-400 ml-2">
                  {satisfactionRating}/5
                </span>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Visit Record...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Log Verified Field Visit</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
