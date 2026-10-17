import React from 'react';

export const PostJobModal = ({ isOpen, onClose, onSubmit, jobForm, setJobForm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <form
        onSubmit={onSubmit}
        className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm space-y-4"
      >
        <h2 className="text-xl font-extrabold text-white">Post New Referral / Job</h2>
        <input
          type="text"
          placeholder="Job Title (e.g. SDE Intern)"
          required
          value={jobForm.title}
          onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
        />
        <input
          type="text"
          placeholder="Company Name"
          required
          value={jobForm.company}
          onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
        />
        <input
          type="text"
          placeholder="Required Skills"
          value={jobForm.skills}
          onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
        />
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-400 font-bold hover:text-white text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJobModal;
