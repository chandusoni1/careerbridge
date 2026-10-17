import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';

export const AdminPanel = () => {
  const [stats, setStats] = useState({ students: 0, alumni: 0, jobs: 0 });

  useEffect(() => {
    apiClient
      .get('/admin/stats')
      .then((data) => setStats(data))
      .catch((err) => console.log('Admin stats fetch error:', err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">System Admin Control Center 🛠️</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl border-t-4 border-t-blue-500">
            <h3 className="text-slate-400 font-semibold text-sm">Total Students</h3>
            <p className="text-3xl font-black mt-2 text-cyan-400">{stats.students}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl border-t-4 border-t-emerald-500">
            <h3 className="text-slate-400 font-semibold text-sm">Verified Alumni</h3>
            <p className="text-3xl font-black mt-2 text-emerald-400">{stats.alumni}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl border-t-4 border-t-purple-500">
            <h3 className="text-slate-400 font-semibold text-sm">Active Listings</h3>
            <p className="text-3xl font-black mt-2 text-purple-400">{stats.jobs}</p>
          </div>
        </div>

        {/* Control Management Options */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-lg font-bold border-b border-slate-800 pb-2">Admin Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition cursor-pointer text-sm">
              Verify Alumni Profiles
            </button>
            <button className="px-4 py-2 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition cursor-pointer text-sm">
              Moderate Content & Posts
            </button>
            <button className="px-4 py-2 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition cursor-pointer text-sm border border-slate-700">
              System Activity Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
