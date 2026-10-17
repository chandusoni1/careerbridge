import React from 'react';

export const Input = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-medium transition ${
          error ? 'border-rose-500 focus:border-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
    </div>
  );
};

export default Input;
