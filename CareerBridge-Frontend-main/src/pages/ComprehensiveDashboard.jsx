import React, { useState, useEffect } from 'react';

const ComprehensiveDashboard = ({ user }) => {
  const [stats, setStats] = useState({ connections: 0, applications: 0, referrals: 0, mentorships: 0 });

  useEffect(() => {
    if (user) {
      setStats({
        connections: user.connections?.length || 12,
        applications: 4,
        referrals: 2,
        mentorships: 3
      });
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-slate-900 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl flex justify-between items-center">
        <div className="absolute w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -top-10 -right-10"></div>
        <div className="space-y-2 z-10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-slate-400 text-sm font-semibold">
            CareerBridge Overview & Analytics Center
          </p>
        </div>
        <span className="z-10 uppercase text-xs font-black tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-xl">
          {user?.role || 'Student'} Mode
        </span>
      </div>

      {/* Analytics Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Connections" value={stats.connections} gradient="from-cyan-500 to-blue-500" />
        <MetricCard title="Applications" value={stats.applications} gradient="from-blue-500 to-indigo-500" />
        <MetricCard title="Referrals Received" value={stats.referrals} gradient="from-emerald-500 to-teal-500" />
        <MetricCard title="Mentorship Sessions" value={stats.mentorships} gradient="from-purple-500 to-indigo-500" />
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, gradient }) => (
  <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-3 hover:border-slate-700 hover:scale-105 transition-all duration-300">
    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{title}</p>
    <div className="flex justify-between items-end">
      <p className="text-4xl font-black text-white">{value}</p>
      <div className={`w-3 h-8 rounded-full bg-gradient-to-b ${gradient}`}></div>
    </div>
  </div>
);

export default ComprehensiveDashboard;