import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`${sizes[size] || sizes.md} border-cyan-500 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-xs font-semibold text-slate-400">{text}</p>}
    </div>
  );
};

export const EmptyState = ({ message, description, actionText, onAction }) => {
  return (
    <div className="bg-slate-900 border border-dashed border-slate-800 p-12 text-center rounded-2xl text-slate-400 space-y-3">
      <p className="font-bold text-lg text-slate-300">{message || 'No items found'}</p>
      {description && <p className="text-xs text-slate-500 max-w-sm mx-auto">{description}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-400 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
