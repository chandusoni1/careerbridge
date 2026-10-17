import React from 'react';

export const UserTable = ({ users }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-800 text-left text-slate-400 uppercase text-xs">
            <th className="py-3 px-4 border-b border-slate-700">Naam</th>
            <th className="py-3 px-4 border-b border-slate-700">Email</th>
            <th className="py-3 px-4 border-b border-slate-700">Role</th>
          </tr>
        </thead>
        <tbody className="text-slate-200 text-sm">
          {users.map((user) => (
            <tr key={user._id || user.id} className="hover:bg-slate-800/50 border-b border-slate-800 transition">
              <td className="py-3 px-4 font-semibold">{user.name}</td>
              <td className="py-3 px-4 text-slate-400">{user.email}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                    user.role === 'alumni'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  {user.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
