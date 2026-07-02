// frontend/src/pages/Communications.jsx
import React, { useEffect, useState } from 'react';
import { Plus, Phone, Mail, Calendar, Trash2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import Modal from '../components/Modal';

function Communications() {
  const [communications, setCommunications] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    lead: '',
    type: 'Call',
    subject: '',
    description: '',
    communicatedWith: '',
    nextFollowUp: '',
  });

  const types = ['Call', 'Email', 'Meeting', 'Note', 'Follow-up'];

  useEffect(() => {
    fetchCommunications();
    fetchLeads();
  }, []);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/communications');
      setCommunications(response.data.communications || []);
    } catch (error) {
      toast.error('Failed to load communications');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await api.get('/api/leads');
      setLeads(response.data.leads || []);
      if (response.data.leads && response.data.leads.length > 0) {
        setFormData((prev) => ({ ...prev, lead: response.data.leads[0]._id }));
      }
    } catch (error) {
      console.error('Failed to load leads for reference');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this communication log?')) {
      try {
        await api.delete(`/api/communications/${id}`);
        setCommunications(communications.filter((c) => c._id !== id));
        toast.success('Communication log removed');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogCommunication = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/api/communications', formData);
      setCommunications([response.data.communication, ...communications]);
      setShowModal(false);
      setFormData({
        lead: leads.length > 0 ? leads[0]._id : '',
        type: 'Call',
        subject: '',
        description: '',
        communicatedWith: '',
        nextFollowUp: '',
      });
      toast.success('Communication logged successfully');
      fetchCommunications(); // Refresh to ensure proper population of fields
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to log communication');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Call':
        return <Phone size={18} className="text-green-600 dark:text-green-400" />;
      case 'Email':
        return <Mail size={18} className="text-blue-600 dark:text-blue-400" />;
      case 'Meeting':
        return <Calendar size={18} className="text-purple-600 dark:text-purple-400" />;
      default:
        return <Mail size={18} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      Call: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      Email: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Meeting: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      Note: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
      'Follow-up': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">Communications Log</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">Track all customer calls, emails, presentations, and follow-ups.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-505 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-indigo-550/10 transition text-xs font-semibold hover-lift self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Log Interaction</span>
        </button>
      </div>

      {/* Communications List */}
      <div className="space-y-4">
        {loading && communications.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : communications.length > 0 ? (
          communications.map((comm) => (
            <div key={comm._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 shadow-sm hover-lift transition duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-750/30 rounded-xl">
                    {getTypeIcon(comm.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate tracking-tight">{comm.subject}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${getTypeBadgeColor(comm.type)}`}>
                        {comm.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap font-medium">{comm.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                      <span>Recipient: <strong className="text-gray-700 dark:text-gray-300">{comm.communicatedWith}</strong></span>
                      {comm.lead && (
                        <span className="flex items-center space-x-1">
                          <span>Company:</span>
                          <span className="text-blue-600 dark:text-blue-400 font-bold">{comm.lead.companyName || 'N/A'}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Calendar size={12} className="text-gray-400" />
                        <span>{formatDistanceToNow(new Date(comm.createdAt), { addSuffix: true })}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(comm._id)}
                  className="p-1.5 text-red-500 hover:text-red-705 hover:bg-red-50 dark:hover:bg-slate-700/50 rounded-lg transition ml-2 self-start"
                  title="Remove Log"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {comm.nextFollowUp && (
                <div className="mt-4 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 flex items-center space-x-2 text-xs text-amber-700 dark:text-amber-300 font-semibold">
                  <ArrowRight size={13} className="text-amber-500 animate-pulse" />
                  <span>
                    Scheduled Follow-up: <strong className="text-amber-600 dark:text-amber-400">{new Date(comm.nextFollowUp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-16 text-center shadow-sm">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">No client interactions logged yet. Log your first conversation to populate this screen!</p>
          </div>
        )}
      </div>

      {/* Log Communication Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Log Client Interaction"
          size="md"
        >
          <form onSubmit={handleLogCommunication} className="space-y-4 pt-2">
            {leads.length > 0 ? (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Associate with Sales Lead <span className="text-red-500">*</span>
                </label>
                <select
                  name="lead"
                  value={formData.lead}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium"
                  required
                >
                  {leads.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.companyName} ({l.contactName})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 bg-red-500/5 text-red-600 dark:text-red-400 border border-red-500/10 rounded-lg text-xs font-semibold">
                Warning: No active sales leads available. Please create a lead first!
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Interaction Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium"
                >
                  {types.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Communicated With <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="communicatedWith"
                  value={formData.communicatedWith}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Subject Header <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="e.g. Discussed pricing model updates"
                className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Detailed Log Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Summary of the conversation details, agreement items, or feedback..."
                className="w-full px-3 py-2.5 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Next Scheduled Follow-up
              </label>
              <input
                type="date"
                name="nextFollowUp"
                value={formData.nextFollowUp}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
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
                disabled={leads.length === 0}
                className="px-5 py-2 text-xs font-semibold bg-blue-650 hover:bg-blue-700 text-white rounded-lg transition shadow-md hover-lift disabled:opacity-50"
              >
                Log Interaction
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Communications;
