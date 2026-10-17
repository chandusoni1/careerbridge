import React from 'react';
import { BRANCHES } from '../../../constants';

export const DirectoryFilter = ({
  searchQuery,
  onSearchChange,
  selectedBranch,
  onBranchChange,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
      <input
        type="text"
        placeholder="Search by Name or Email..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 font-medium focus:outline-none focus:border-cyan-500 text-sm"
      />

      <div className="flex gap-4 items-center">
        <label className="text-xs font-bold text-slate-400 uppercase">Branch Filter:</label>
        <select
          value={selectedBranch}
          onChange={(e) => onBranchChange(e.target.value)}
          className="px-4 py-2 border border-slate-800 rounded-xl bg-slate-950 font-bold text-slate-200 text-sm focus:outline-none"
        >
          <option value="All">All Branches</option>
          {BRANCHES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DirectoryFilter;
