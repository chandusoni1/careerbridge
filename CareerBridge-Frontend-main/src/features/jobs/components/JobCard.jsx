import React from 'react';

export const JobCard = ({ job, onApply }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-white">{job.title}</h2>
        <p className="text-xs text-slate-400 font-bold mt-1">
          Posted by: {job.poster || job.postedBy?.name || 'Alumni'} {job.company ? `(${job.company})` : ''}
        </p>
        <span className="inline-block mt-3 bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-bold px-3 py-1 rounded-lg">
          Skills: {job.skills || 'General'}
        </span>
      </div>
      <button
        onClick={() => onApply(job.id || job._id)}
        disabled={job.applied}
        className={`px-5 py-2.5 font-extrabold text-sm rounded-xl transition cursor-pointer w-full sm:w-auto text-center ${
          job.applied
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
        }`}
      >
        {job.applied ? 'Requested' : 'APPLY / DM ALUMNI'}
      </button>
    </div>
  );
};

export default JobCard;
