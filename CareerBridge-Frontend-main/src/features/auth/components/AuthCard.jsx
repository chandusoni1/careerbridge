import React from 'react';

export const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-[420px] space-y-6">
      {(title || subtitle) && (
        <div className="text-center space-y-1">
          {title && (
            <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-xs font-semibold text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default AuthCard;
