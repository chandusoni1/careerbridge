import React from 'react';

export const MetricCard = ({ title, value, gradient = 'from-cyan-500 to-blue-500' }) => (
  <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-3 hover:border-slate-700 hover:scale-105 transition-all duration-300">
    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{title}</p>
    <div className="flex justify-between items-end">
      <p className="text-4xl font-black text-white">{value}</p>
      <div className={`w-3 h-8 rounded-full bg-gradient-to-b ${gradient}`}></div>
    </div>
  </div>
);

export default MetricCard;
