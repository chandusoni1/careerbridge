import React, { useState } from 'react';

const Jobs = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', company: '', skills: '' });

  const handlePostJob = (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company) return;
    setJobs([{
      id: Date.now(),
      title: jobForm.title,
      poster: `${user?.name || 'User'} (${jobForm.company})`,
      skills: jobForm.skills || 'React, Node.js',
      applied: false
    }, ...jobs]);
    setJobForm({ title: '', company: '', skills: '' });
    setShowModal(false);
  };

  const handleApply = (id) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, applied: true } : j));
    alert("Referral Application Success! Alumni notification sent.");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Job & Referral Board 💼</h1>
          <p className="text-xs font-bold text-slate-400 mt-1">Request internal referrals directly from verified alumni</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg transition cursor-pointer">
          + Post a Job
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50">
          <form onSubmit={handlePostJob} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl w-96 space-y-4">
            <h2 className="text-xl font-extrabold text-white">Post New Referral / Job</h2>
            <input 
              type="text" 
              placeholder="Job Title (e.g. SDE Intern)" 
              required 
              value={jobForm.title} 
              onChange={e => setJobForm({...jobForm, title: e.target.value})} 
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none" 
            />
            <input 
              type="text" 
              placeholder="Company Name" 
              required 
              value={jobForm.company} 
              onChange={e => setJobForm({...jobForm, company: e.target.value})} 
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none" 
            />
            <input 
              type="text" 
              placeholder="Required Skills" 
              value={jobForm.skills} 
              onChange={e => setJobForm({...jobForm, skills: e.target.value})} 
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none" 
            />
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 font-bold">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl">Post</button>
            </div>
          </form>
        </div>
      )}

      {/* Job Feed */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-800 p-12 text-center rounded-2xl text-slate-500 font-bold">
            Abhi koi active job listing nahi hai. Above button se new referral post create karo!
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-white">{job.title}</h2>
                <p className="text-xs text-slate-400 font-bold mt-1">Posted by: {job.poster}</p>
                <span className="inline-block mt-3 bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-bold px-3 py-1 rounded-lg">
                  Skills: {job.skills}
                </span>
              </div>
              <button 
                onClick={() => handleApply(job.id)} 
                disabled={job.applied}
                className={`px-5 py-2.5 font-extrabold text-sm rounded-xl transition cursor-pointer ${job.applied ? 'bg-slate-800 text-slate-500' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'}`}
              >
                {job.applied ? 'Requested' : 'APPLY / DM ALUMNI'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Jobs;