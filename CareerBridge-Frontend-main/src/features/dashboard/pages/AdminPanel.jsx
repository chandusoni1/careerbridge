import React, { useState, useEffect } from 'react';
import { userApi } from '../../../services/user.api';
import { apiClient } from '../../../services/apiClient';
import { LoadingSpinner } from '../../../components/feedback';

export const AdminPanel = () => {
  const [stats, setStats] = useState({ students: 0, alumni: 0, jobs: 0 });
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications' | 'stats'
  const [verifications, setVerifications] = useState([]);
  const [loadingVerifications, setLoadingVerifications] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [idCardData, setIdCardData] = useState(null);
  const [loadingIdCard, setLoadingIdCard] = useState(false);
  const [decisionReason, setDecisionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadStats = async () => {
    try {
      const data = await apiClient.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.log('Admin stats fetch error:', err);
    }
  };

  const loadVerifications = async () => {
    try {
      setLoadingVerifications(true);
      const res = await userApi.getAdminVerifications();
      if (res && res.users) {
        setVerifications(res.users);
      }
    } catch (err) {
      console.error('Failed to load pending verifications:', err);
    } finally {
      setLoadingVerifications(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadVerifications();
  }, []);

  const handleInspectIdCard = async (user) => {
    setSelectedUser(user);
    setIdCardData(null);
    setLoadingIdCard(true);
    setDecisionReason('');
    setActionMessage('');
    try {
      const res = await userApi.getAdminCollegeIdCard(user._id);
      if (res && res.collegeIdCard) {
        setIdCardData(res.collegeIdCard);
      }
    } catch (err) {
      setActionMessage('Failed to securely fetch ID card: ' + (err.message || 'Access error'));
    } finally {
      setLoadingIdCard(false);
    }
  };

  const handleMakeDecision = async (status) => {
    if (!selectedUser) return;
    if ((status === 'rejected' || status === 'resubmission_required') && !decisionReason.trim()) {
      alert('Please specify a reason for rejection or resubmission request.');
      return;
    }

    setActionLoading(true);
    try {
      await userApi.decideVerification(selectedUser._id, {
        status,
        reason: decisionReason.trim() || undefined,
      });

      setActionMessage(
        `Verification updated to ${status === 'verified' ? 'Approved ✓' : status === 'rejected' ? 'Rejected' : 'Resubmission Requested'}!`
      );

      setTimeout(() => {
        setSelectedUser(null);
        setIdCardData(null);
        setDecisionReason('');
        loadVerifications();
        loadStats();
      }, 1200);
    } catch (err) {
      alert(err.message || 'Failed to update verification decision');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-white space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              <span>🏛️</span> Institutional Admin Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Verify CSIT & CSIP student and alumni identity credentials and moderate platform access
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('verifications')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'verifications'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Pending Verifications ({verifications.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              System Overview
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl border-t-4 border-t-amber-500">
            <h3 className="text-slate-400 font-bold text-xs uppercase">Pending Review</h3>
            <p className="text-2xl font-black mt-1 text-amber-400">{verifications.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl border-t-4 border-t-cyan-500">
            <h3 className="text-slate-400 font-bold text-xs uppercase">Total Students</h3>
            <p className="text-2xl font-black mt-1 text-cyan-400">{stats.students || 0}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl border-t-4 border-t-emerald-500">
            <h3 className="text-slate-400 font-bold text-xs uppercase">Verified Alumni</h3>
            <p className="text-2xl font-black mt-1 text-emerald-400">{stats.alumni || 0}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl border-t-4 border-t-purple-500">
            <h3 className="text-slate-400 font-bold text-xs uppercase">Active Listings</h3>
            <p className="text-2xl font-black mt-1 text-purple-400">{stats.jobs || 0}</p>
          </div>
        </div>

        {/* Tab 1: College ID Verification Review Queue */}
        {activeTab === 'verifications' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🪪</span> College ID Verification Requests
                </h2>
                <p className="text-xs text-slate-400">
                  Submissions requiring manual review or confirmation against registered institution details
                </p>
              </div>
              <button
                onClick={loadVerifications}
                className="text-xs text-cyan-400 hover:underline font-bold"
              >
                Refresh List ⟳
              </button>
            </div>

            {loadingVerifications ? (
              <LoadingSpinner text="Loading pending verification requests..." />
            ) : verifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <div className="text-3xl">🎉</div>
                <p className="text-sm font-bold text-slate-300">
                  Verification queue is all clear!
                </p>
                <p className="text-xs text-slate-500">
                  No student or alumni registrations are currently awaiting ID card review.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Applicant</th>
                      <th className="p-3.5">College</th>
                      <th className="p-3.5">Role & Details</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Submission Date</th>
                      <th className="p-3.5 rounded-r-xl text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {verifications.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5">
                          <p className="font-bold text-white text-xs">{u.name}</p>
                          <p className="text-slate-400 text-[11px]">{u.email}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 font-extrabold border border-cyan-500/20">
                            {u.college || 'CSIT'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <p className="capitalize font-bold text-slate-200">{u.role}</p>
                          <p className="text-[11px] text-slate-400">
                            {u.role === 'student'
                              ? `${u.branch || 'CSE'} • ${u.academicYear || 'Year'}`
                              : `${u.company || 'Alumni'} • Class of ${u.passingYear || u.graduationYear || 'N/A'}`}
                          </p>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                            {u.verificationStatus || 'under_review'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleInspectIdCard(u)}
                            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-lg transition cursor-pointer shadow-sm text-xs"
                          >
                            Inspect ID 🪪
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: System Stats & Management */}
        {activeTab === 'stats' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <h2 className="text-lg font-bold border-b border-slate-800 pb-2">Administrative Controls</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab('verifications')}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition cursor-pointer text-xs"
              >
                Review Pending ID Cards ({verifications.length})
              </button>
              <button
                onClick={loadStats}
                className="px-4 py-2 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition cursor-pointer text-xs border border-slate-700"
              >
                Re-sync System Metrics ⟳
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ID Card Review & Decision Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl max-w-2xl w-full space-y-5 shadow-2xl my-8">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🪪</span> Verification Review: {selectedUser.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify submitted institutional document against applicant details
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            {actionMessage && (
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-xl">
                {actionMessage}
              </div>
            )}

            {/* Applicant Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Role</span>
                <span className="font-bold text-white capitalize">{selectedUser.role}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">College</span>
                <span className="font-bold text-cyan-400">{selectedUser.college || 'CSIT'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Email</span>
                <span className="font-bold text-white truncate block">{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Year / Batch</span>
                <span className="font-bold text-white">
                  {selectedUser.academicYear || selectedUser.passingYear || 'N/A'}
                </span>
              </div>
            </div>

            {/* Document Viewer */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Submitted College ID Document:</span>
                {idCardData?.format && (
                  <span className="text-[10px] uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                    {idCardData.format}
                  </span>
                )}
              </span>

              {loadingIdCard ? (
                <div className="h-48 flex items-center justify-center">
                  <LoadingSpinner text="Retrieving protected ID document..." />
                </div>
              ) : idCardData?.url ? (
                idCardData.format === 'application/pdf' || idCardData.name?.endsWith('.pdf') ? (
                  <div className="p-6 bg-slate-900 rounded-xl text-center space-y-3">
                    <p className="text-sm font-bold text-cyan-400">📄 PDF ID Document Attached</p>
                    <p className="text-xs text-slate-400">{idCardData.name}</p>
                    <a
                      href={idCardData.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-400"
                    >
                      Open PDF in Secure Viewer ↗
                    </a>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-auto flex items-center justify-center bg-slate-900/60 rounded-xl p-2">
                    <img
                      src={idCardData.url}
                      alt="College ID Card"
                      className="max-h-72 object-contain rounded-lg"
                    />
                  </div>
                )
              ) : (
                <div className="p-6 text-center text-rose-400 text-xs font-bold">
                  ⚠️ ID card document could not be loaded or was not attached.
                </div>
              )}
            </div>

            {/* Decision Reason Input (for reject / resubmit) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Decision Notes / Rejection Reason (Required for rejection or resubmission):
              </label>
              <input
                type="text"
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="e.g. ID card photo is blurry / Name does not match enrollment record"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleMakeDecision('resubmission_required')}
                className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 rounded-xl font-bold text-xs cursor-pointer transition disabled:opacity-50"
              >
                Request Resubmission 🔄
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleMakeDecision('rejected')}
                className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 rounded-xl font-bold text-xs cursor-pointer transition disabled:opacity-50"
              >
                Reject Verification ✕
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleMakeDecision('verified')}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Approve & Verify ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
