// frontend/src/pages/Team.jsx
import React, { useEffect, useState } from 'react';
import { Plus, Mail, Phone, Trash2 } from 'lucide-react';
import teamService from '../services/teamService';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

function Team() {
  const [members, setMembers] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state for new team member
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'BDA',
    team: '',
  });

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [membersRes, perfRes, teamsRes] = await Promise.all([
        teamService.getMembers(),
        teamService.getTeamPerformance(),
        teamService.getTeams(),
      ]);
      setMembers(membersRes.members || []);
      setPerformance(perfRes.performance || []);
      setTeams(teamsRes.teams || []);
      
      // Select first team by default if teams exist
      if (teamsRes.teams && teamsRes.teams.length > 0) {
        setFormData((prev) => ({ ...prev, team: teamsRes.teams[0]._id }));
      }
    } catch (error) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await teamService.deleteMember(id);
        setMembers(members.filter((m) => m._id !== id));
        toast.success('Member removed successfully');
      } catch (error) {
        toast.error('Failed to remove member');
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

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await teamService.addMember(formData);
      setMembers([...members, response.member]);
      setShowModal(false);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'BDA',
        team: teams.length > 0 ? teams[0]._id : '',
      });
      toast.success('Team member added successfully! Temporary Password: TempPass@123');
      fetchTeamData(); // Refresh list to get proper populated fields
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">Team Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">Manage team members, roles, and track conversions and revenue metrics.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-505 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-indigo-550/10 transition text-xs font-semibold hover-lift self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Member</span>
        </button>
      </div>

      {/* Loading Spinner */}
      {loading && members.length === 0 ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div key={member._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 shadow-sm hover-lift transition duration-250 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10">
                        <span className="text-white font-bold text-sm">{member.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-905 dark:text-white tracking-tight">{member.name}</h3>
                        <span className={`inline-block px-2 py-0.5 mt-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                          member.role === 'Manager' ? 'bg-purple-500/10 text-purple-650 dark:text-purple-400' :
                          member.role === 'TeamLead' ? 'bg-amber-500/10 text-amber-650 dark:text-amber-400' :
                          'bg-blue-500/10 text-blue-650 dark:text-blue-400'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMember(member._id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-slate-700/50 rounded-lg transition"
                      title="Remove Member"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="space-y-2 mt-5 pt-4 border-t border-gray-100 dark:border-slate-700/50">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <Mail size={14} className="text-gray-400" />
                      <span className="truncate font-medium">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Phone size={14} className="text-gray-400" />
                        <span className="font-medium">{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Metrics Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 shadow-sm transition-colors duration-200">
            <h2 className="text-sm font-bold text-gray-405 dark:text-white uppercase tracking-wider mb-6 font-display">Performance Tracking</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-700/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-750/30 border-b border-gray-150 dark:border-slate-700/50 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-3.5">Team Member</th>
                    <th className="px-6 py-3.5">Leads Assigned</th>
                    <th className="px-6 py-3.5">Deals Won</th>
                    <th className="px-6 py-3.5">Conversion</th>
                    <th className="px-6 py-3.5 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {performance.length > 0 ? (
                    performance.map((perf) => (
                      <tr key={perf.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition text-xs">
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{perf.name}</td>
                        <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-400">{perf.totalLeads}</td>
                        <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-400">{perf.closedDeals}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md text-[10px] font-bold">
                            {perf.conversionRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-gray-950 dark:text-gray-105 text-right text-blue-600 dark:text-blue-400 font-display">
                          ${(perf.revenue || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-xs text-gray-450 dark:text-gray-500 font-medium">
                        No performance statistics currently available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Team Member Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add New Team Member"
          size="md"
        >
          <form onSubmit={handleAddMember} className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Michael Scott"
                className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g. michael@mfg.com"
                className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                required
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
                placeholder="e.g. 10 digit number"
                className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Organization Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium"
              >
                <option value="BDA">BDA (Business Development Associate)</option>
                <option value="TeamLead">Team Lead</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            {teams.length > 0 && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  Assigned Team
                </label>
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-250 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium"
                >
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.department})</option>
                  ))}
                </select>
              </div>
            )}

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
                className="px-5 py-2 text-xs font-semibold bg-blue-650 hover:bg-blue-700 text-white rounded-lg transition shadow-md hover-lift"
              >
                Add Member
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Team;
