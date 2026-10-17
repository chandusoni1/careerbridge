import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl w-full max-w-md space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          {title && <h3 className="text-xl font-extrabold text-white">{title}</h3>}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-lg p-1 ml-auto"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    primary: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  };

  return (
    <span
      className={`text-xs font-bold border px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
};
