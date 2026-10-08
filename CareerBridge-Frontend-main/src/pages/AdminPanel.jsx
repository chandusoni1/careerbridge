import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [stats, setStats] = useState({ students: 0, alumni: 0, jobs: 0 });

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">System Admin Control Center 🛠️</h1>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow border-t-4 border-blue-500">
            <h3 className="text-gray-500 font-semibold">Total Students</h3>
            <p className="text-3xl font-bold mt-2">{stats.students}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-t-4 border-green-500">
            <h3 className="text-gray-500 font-semibold">Verified Alumni</h3>
            <p className="text-3xl font-bold mt-2">{stats.alumni}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-t-4 border-purple-500">
            <h3 className="text-gray-500 font-semibold">Active Listings</h3>
            <p className="text-3xl font-bold mt-2">{stats.jobs}</p>
          </div>
        </div>

        {/* Control Management Options */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Admin Actions</h2>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Verify Alumni Profiles</button>
            <button className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700">Moderate Content & Posts</button>
            <button className="px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800">System Activity Logs</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;