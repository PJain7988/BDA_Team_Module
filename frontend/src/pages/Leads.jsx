// frontend/src/pages/Leads.jsx
import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

function Leads() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'board'
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Form state for new lead
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    industry: 'Other',
    dealValue: 0,
    stage: 'Prospecting',
    source: 'Other',
    notes: '',
  });

  const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  const industries = ['Automotive', 'Textile', 'Food Processing', 'Pharmaceuticals', 'Electronics', 'Chemicals', 'Other'];
  const sources = ['Cold Call', 'Email', 'Referral', 'Website', 'Trade Show', 'Other'];

  useEffect(() => {
    fetchLeads();
  }, [stage]);

  useEffect(() => {
    filterLeads();
  }, [search, leads]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/leads', {
        params: { stage: stage || undefined },
      });
      setLeads(response.data.leads || []);
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    const filtered = leads.filter((lead) =>
      lead.companyName.toLowerCase().includes(search.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(search.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredLeads(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/api/leads/${id}`);
        setLeads(leads.filter((l) => l._id !== id));
        toast.success('Lead deleted successfully');
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'dealValue' ? parseFloat(value) || 0 : value
    });
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/leads', formData);
      setLeads([response.data.lead, ...leads]);
      setShowModal(false);
      // Reset form
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        industry: 'Other',
        dealValue: 0,
        stage: 'Prospecting',
        source: 'Other',
        notes: '',
      });
      toast.success('Lead created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create lead');
    }
  };

  // Drag and Drop handlers for Kanban Board
  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    const leadId = draggedLeadId || e.dataTransfer.getData('text/plain');
    if (!leadId || leadId === 'drag') return;

    try {
      const leadToUpdate = leads.find((l) => l._id === leadId);
      if (leadToUpdate && leadToUpdate.stage === targetStage) return;

      // Update locally first for snappier UI response
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead._id === leadId ? { ...lead, stage: targetStage } : lead
        )
      );

      await api.patch(`/api/leads/${leadId}/stage`, { stage: targetStage });
      toast.success(`Moved to ${targetStage}`);
    } catch (error) {
      toast.error('Failed to update stage');
      fetchLeads(); // Rollback to actual backend state on failure
    } finally {
      setDraggedLeadId(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">Leads Pipeline</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage and track manufacturing sales opportunities across the funnel.</p>
        </div>
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {/* Table / Kanban View Toggle */}
          <div className="flex bg-gray-200/60 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-650 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Table List
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-slate-700 text-blue-650 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Kanban Board
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-505 hover:to-indigo-505 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-indigo-550/10 transition hover-lift font-semibold text-xs animate-none"
          >
            <Plus size={15} />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Filters (Shown in table mode or always) */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search company, contact person..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200/50 dark:border-slate-700/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs shadow-sm"
          />
        </div>
        {viewMode === 'table' && (
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200/50 dark:border-slate-700/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs font-bold shadow-sm"
          >
            <option value="">All Stages</option>
            {stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Main View Area */}
      {viewMode === 'table' ? (
        /* Leads Table View */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-gray-200/50 dark:border-slate-700/50 text-gray-405 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150/50 dark:divide-slate-700/50">
                {loading && filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-gray-505 dark:text-gray-400">
                      <div className="flex justify-center items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-medium">Loading opportunities...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/20 transition duration-150 text-xs">
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">{lead.companyName}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{lead.contactName}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{lead.email || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider uppercase ${
                          lead.stage === 'Closed Won' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                          lead.stage === 'Closed Lost' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                          lead.stage === 'Negotiation' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          'bg-blue-500/10 text-blue-650 dark:text-blue-400'
                        }`}>
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-blue-650 dark:text-blue-400 font-display">
                        ${(lead.dealValue || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end space-x-1">
                        <button
                          onClick={() => navigate(`/leads/${lead._id}`)}
                          className="p-1.5 text-blue-650 hover:bg-blue-500/10 rounded-lg transition"
                          title="View Opportunity"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/leads/${lead._id}?edit=true`)}
                          className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Edit Opportunity"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          title="Delete Lead"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-xs text-gray-450 dark:text-gray-500 font-medium">
                      No matching sales leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {stages.map((stg) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stg);
            return (
              <div
                key={stg}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stg)}
                className="bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl p-4 min-h-[480px] border border-gray-150/40 dark:border-slate-800/30 flex flex-col space-y-3.5 transition-colors duration-250 select-none"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-1 border-b border-gray-200/50 dark:border-slate-800/50">
                  <h3 className="text-[10px] font-extrabold text-gray-505 dark:text-gray-400 uppercase tracking-wider truncate w-32">{stg}</h3>
                  <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 rounded-md text-[9px] font-bold">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex flex-col space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead._id)}
                      className="bg-white dark:bg-slate-800 border border-gray-200/40 dark:border-slate-700/40 rounded-xl p-3.5 shadow-sm hover-lift transition cursor-grab active:cursor-grabbing flex flex-col space-y-2.5"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-gray-905 dark:text-white tracking-tight line-clamp-1">{lead.companyName}</h4>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{lead.contactName}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] font-extrabold text-blue-650 dark:text-blue-400 font-display">
                          ${(lead.dealValue || 0).toLocaleString()}
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 rounded text-[9px] font-bold">
                          {lead.industry}
                        </span>
                      </div>

                      <div className="flex items-center justify-end space-x-1 pt-2 border-t border-gray-50 dark:border-slate-750/30">
                        <button
                          onClick={() => navigate(`/leads/${lead._id}`)}
                          className="p-1 text-blue-600 hover:bg-blue-500/10 rounded-md transition"
                          title="View"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => navigate(`/leads/${lead._id}?edit=true`)}
                          className="p-1 text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded-md transition"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200/50 dark:border-slate-800/50 rounded-xl p-6 text-center text-[10px] text-gray-400 font-medium">
                      Drag leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Lead Modal Form */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create New Sales Opportunity"
          size="lg"
        >
          <form onSubmit={handleCreateLead} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="e.g. Apex Industrial Solutions"
                  className="w-full px-3 py-2.5 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2.5 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2.5 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 10-digit number"
                  className="w-full px-3 py-2.5 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Deal Value ($)
                </label>
                <input
                  type="number"
                  name="dealValue"
                  value={formData.dealValue}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2.5 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Industry
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium"
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Stage
                </label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium"
                >
                  {stages.map((stg) => (
                    <option key={stg} value={stg}>{stg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Source
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium"
                >
                  {sources.map((src) => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Details of conversation or specific requirements..."
                className="w-full px-3 py-2.5 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t border-gray-100 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold border border-gray-250 dark:border-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-750 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-blue-650 hover:bg-blue-705 text-white rounded-lg transition shadow-md hover-lift"
              >
                Create Lead
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Leads;
