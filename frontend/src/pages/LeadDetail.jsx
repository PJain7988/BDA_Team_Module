// frontend/src/pages/LeadDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
import leadService from '../services/leadService';
import { toast } from 'react-toastify';

function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  const industries = ['Automotive', 'Textile', 'Food Processing', 'Pharmaceuticals', 'Electronics', 'Chemicals', 'Other'];
  const sources = ['Cold Call', 'Email', 'Referral', 'Website', 'Trade Show', 'Other'];

  useEffect(() => {
    fetchLead();
    // Check if the URL has ?edit=true to open in edit mode automatically
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true') {
      setEditing(true);
    }
  }, [id]);

  const fetchLead = async () => {
    try {
      const response = await leadService.getLeadById(id);
      setLead(response.lead);
    } catch (error) {
      toast.error('Failed to load lead');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLead({
      ...lead,
      [name]: name === 'dealValue' || name === 'probability' ? parseFloat(value) || 0 : value
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await leadService.updateLead(id, lead);
      setEditing(false);
      toast.success('Lead updated successfully');
    } catch (error) {
      toast.error('Failed to update lead');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    fetchLead(); // Reload original data
  };

  if (loading && !lead) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-slate-900 min-h-screen text-gray-900 dark:text-white flex justify-center items-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading lead details...</span>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-slate-900 min-h-screen text-gray-900 dark:text-white flex flex-col justify-center items-center space-y-4">
        <p className="text-lg font-semibold">Lead not found</p>
        <button onClick={() => navigate('/leads')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/leads')}
            className="p-2 bg-white dark:bg-slate-800 border border-gray-250/50 dark:border-slate-700/50 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-55 dark:hover:bg-slate-750 rounded-xl transition shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            {editing ? (
              <div className="space-y-1.5">
                <input
                  type="text"
                  name="companyName"
                  value={lead.companyName}
                  onChange={handleInputChange}
                  className="text-xl font-bold text-gray-900 dark:text-white bg-white dark:bg-slate-950 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="contactName"
                  value={lead.contactName}
                  onChange={handleInputChange}
                  className="block text-xs text-gray-650 dark:text-gray-300 bg-white dark:bg-slate-950 border border-gray-250 dark:border-slate-700 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">{lead.companyName}</h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mt-1">{lead.contactName}</p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl transition text-xs font-semibold"
              >
                <X size={15} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-1.5 bg-blue-650 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-indigo-550/10 transition text-xs font-semibold hover-lift"
              >
                <Save size={15} />
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-505 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-indigo-550/10 transition text-xs font-semibold hover-lift"
            >
              <Edit2 size={15} />
              <span>Edit Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Lead Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 space-y-6 shadow-sm transition-colors duration-200">
          <section>
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={lead.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-xs text-gray-900 dark:text-white font-semibold">{lead.email || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                {editing ? (
                  <input
                    type="text"
                    name="phone"
                    value={lead.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-xs text-gray-900 dark:text-white font-semibold">{lead.phone || '—'}</p>
                )}
              </div>
            </div>
          </section>

          <hr className="border-gray-100 dark:border-slate-700/50" />

          <section>
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4">Deal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Deal Value</label>
                {editing ? (
                  <input
                    type="number"
                    name="dealValue"
                    value={lead.dealValue || 0}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 font-display">${(lead.dealValue || 0).toLocaleString()}</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Win Probability</label>
                {editing ? (
                  <input
                    type="number"
                    name="probability"
                    value={lead.probability || 0}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center space-x-3 mt-1">
                    <p className="text-xs text-gray-900 dark:text-white font-bold">{lead.probability}%</p>
                    <div className="w-28 bg-gray-150 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-650 h-full rounded-full" style={{ width: `${lead.probability}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <hr className="border-gray-100 dark:border-slate-700/50" />

          <section>
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4">Additional Information & Notes</h2>
            {editing ? (
              <textarea
                name="notes"
                value={lead.notes || ''}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2.5 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              ></textarea>
            ) : (
              <p className="text-xs text-gray-650 dark:text-gray-305 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800 leading-relaxed font-medium">
                {lead.notes || 'No notes currently recorded for this sales lead.'}
              </p>
            )}
          </section>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-6">
          {/* Stage Status Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 shadow-sm transition-colors duration-200">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-3.5">Lead Stage</h3>
            {editing ? (
              <select
                name="stage"
                value={lead.stage}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                {stages.map((stg) => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </select>
            ) : (
              <div className="inline-block px-3 py-1.5 bg-blue-500/10 text-blue-650 dark:text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold tracking-wide uppercase">
                {lead.stage}
              </div>
            )}
          </div>

          {/* Categorization Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 space-y-5 shadow-sm transition-colors duration-200">
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Industry Sector</p>
              {editing ? (
                <select
                  name="industry"
                  value={lead.industry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-gray-905 dark:text-white font-bold">{lead.industry}</p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Lead Source</p>
              {editing ? (
                <select
                  name="source"
                  value={lead.source}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  {sources.map((src) => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-gray-905 dark:text-white font-bold">{lead.source}</p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Expected Close Date</p>
              {editing ? (
                <input
                  type="date"
                  name="expectedCloseDate"
                  value={lead.expectedCloseDate ? lead.expectedCloseDate.substring(0, 10) : ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                />
              ) : (
                <p className="text-xs text-gray-905 dark:text-white font-bold">
                  {lead.expectedCloseDate
                    ? new Date(lead.expectedCloseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : '—'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadDetail;
