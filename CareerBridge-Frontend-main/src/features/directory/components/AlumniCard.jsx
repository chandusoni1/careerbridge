import React from 'react';
import { getInitials } from '../../../utils';

export const AlumniCard = ({ user, onMessage }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-center space-y-3 hover:border-slate-700 transition">
      <div className="w-16 h-16 bg-cyan-500 text-slate-950 text-2xl font-black rounded-full mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/20">
        {getInitials(user?.name)}
      </div>
      <div>
        <h2 className="text-lg font-extrabold text-white">{user?.name}</h2>
        <p className="text-xs font-bold text-cyan-400 uppercase mt-1">
          {user?.role} | {user?.branch || 'CSE'}
        </p>
        <p className="text-xs text-slate-500 font-medium mt-1">{user?.email}</p>
      </div>
      <button
        onClick={() => onMessage ? onMessage(user) : alert(`${user.name} ko message request bhej di!`)}
        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-xl border border-slate-700 transition cursor-pointer text-xs uppercase"
      >
        MESSAGE
      </button>
    </div>
  );
};

export default AlumniCard;
