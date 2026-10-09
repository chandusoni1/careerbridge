import React, { useState, useEffect } from 'react';
import { apibase } from '../config';

const AlumniDirectory = () => {
  const [dbUsers, setDbUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All");

  useEffect(() => {
    fetch(`${apibase}/auth/users`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbUsers(data);
      })
      .catch(err => console.error("Database Fetch Error:", err));
  }, []);

  const filteredUsers = dbUsers.filter((u) => {
    const matchesSearch = (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = selectedBranch === "All" || u.branch === selectedBranch;

    return matchesSearch && matchesBranch;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-white">Alumni Directory 👥</h1>
        <span className="text-xs font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-full">
          Total Registered Users: {filteredUsers.length}
        </span>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <input 
          type="text"
          placeholder="Search by Name or Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 font-medium focus:outline-none focus:border-cyan-500"
        />

        <div className="flex gap-4 items-center">
          <label className="text-xs font-bold text-slate-400 uppercase">Branch Filter:</label>
          <select 
            value={selectedBranch} 
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2 border border-slate-800 rounded-xl bg-slate-950 font-bold text-slate-200 text-sm focus:outline-none"
          >
            <option value="All">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EE">Electrical</option>
            <option value="ME">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-slate-900 rounded-2xl border border-dashed border-slate-800 text-slate-500 font-bold">
            No matching users found in MongoDB!
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div key={u._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-center space-y-3 hover:border-slate-700 transition">
              <div className="w-16 h-16 bg-cyan-500 text-slate-950 text-2xl font-black rounded-full mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/20">
                {u.name ? u.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">{u.name}</h2>
                <p className="text-xs font-bold text-cyan-400 uppercase mt-1">
                  {u.role} | {u.branch || 'CSE'}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">{u.email}</p>
              </div>
              <button onClick={() => alert(`${u.name} ko message request bhej di!`)} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-xl border border-slate-700 transition cursor-pointer">
                MESSAGE
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlumniDirectory;