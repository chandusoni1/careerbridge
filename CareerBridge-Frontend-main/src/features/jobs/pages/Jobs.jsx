import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../jobs.api';
import { LoadingSpinner, EmptyState } from '../../../components/feedback';

export const Jobs = ({ user }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'saved'
  const [showModal, setShowModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterWorkplace, setFilterWorkplace] = useState('');
  const [filterType, setFilterType] = useState('');

  const [form, setForm] = useState({
    title: '',
    company: '',
    location: 'Bangalore, India',
    type: 'Job',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    description: '',
    skillsRequired: '',
    salary: '₹8-12 LPA',
    deadline: '',
    applicationUrl: '',
  });

  const loadJobsData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchKeyword) params.search = searchKeyword;
      if (filterWorkplace) params.workplaceType = filterWorkplace;
      if (filterType) params.type = filterType;

      const [allJobs, saved] = await Promise.all([
        jobsApi.getJobs(params),
        jobsApi.getSavedJobs().catch(() => []),
      ]);

      if (Array.isArray(allJobs)) setJobs(allJobs);
      if (Array.isArray(saved)) setSavedJobs(saved);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobsData();
  }, [searchKeyword, filterWorkplace, filterType]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.description) return;

    try {
      const skills = form.skillsRequired
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await jobsApi.createJob({
        ...form,
        skillsRequired: skills,
      });

      setShowModal(false);
      setForm({
        title: '',
        company: '',
        location: 'Bangalore, India',
        type: 'Job',
        workplaceType: 'On-site',
        employmentType: 'Full-time',
        description: '',
        skillsRequired: '',
        salary: '',
        deadline: '',
        applicationUrl: '',
      });
      loadJobsData();
    } catch (err) {
      alert(err.message || 'Failed to publish job opening');
    }
  };

  const handleApply = async (jobId) => {
    try {
      const res = await jobsApi.applyJob(jobId, user?._id);
      alert(res.message || 'Application submitted successfully! 🎉');
      loadJobsData();
    } catch (err) {
      alert(err.message || 'Failed to apply');
    }
  };

  const handleToggleSave = async (jobId) => {
    try {
      await jobsApi.toggleSaveJob(jobId);
      loadJobsData();
    } catch (err) {
      console.error('Failed to bookmark job:', err);
    }
  };

  const handleMessagePoster = (poster) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const posterId = poster?._id || poster;
    if (!posterId) {
      alert('Poster contact details not available.');
      return;
    }
    if (posterId === user._id) {
      alert('You are the poster of this opportunity.');
      return;
    }
    navigate(`/messages?userId=${posterId}`);
  };

  const isAlumni = user?.role === 'alumni' || user?.role === 'admin';
  const displayedJobs = activeTab === 'saved' ? savedJobs : jobs;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            Career Opportunities & Referrals 💼
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Browse verified openings from alumni network and request direct referrals
          </p>
        </div>

        {isAlumni && (
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            + Post Opening / Referral
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-3 items-center justify-between shadow-xl">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by role, company, or skills (e.g. SDE, Google, React)..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-medium"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterWorkplace}
            onChange={(e) => setFilterWorkplace(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
          >
            <option value="">All Workplace Types</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
          >
            <option value="">All Categories</option>
            <option value="Job">Full Job</option>
            <option value="Internship">Internship</option>
            <option value="Referral">Direct Referral</option>
          </select>
        </div>

        <div className="flex gap-2 border-l border-slate-800 pl-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-950 text-slate-400'
            }`}
          >
            All Openings ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-950 text-slate-400'
            }`}
          >
            Saved Bookmarks ({savedJobs.length})
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching opportunities..." />
      ) : displayedJobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Try adjusting your search criteria or workplace filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedJobs.map((j) => {
            const hasApplied = j.applicants?.some(
              (app) => (app.student?._id || app.student) === user?._id
            );
            const isSaved = savedJobs.some((s) => (s._id || s) === j._id);

            return (
              <div
                key={j._id}
                className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-extrabold text-white text-base">{j.title}</h3>
                      <p className="text-xs text-cyan-400 font-bold mt-0.5">
                        {j.company} • {j.location}
                      </p>
                    </div>

                    <div className="flex gap-1.5">
                      <span className="text-[11px] font-black uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                        {j.type}
                      </span>
                      <button
                        onClick={() => handleToggleSave(j._id)}
                        className={`text-xs px-2 py-0.5 rounded-lg border cursor-pointer ${
                          isSaved
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                        title="Bookmark Job"
                      >
                        {isSaved ? '★' : '☆'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 font-semibold pt-1">
                    <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      🏢 {j.workplaceType || 'On-site'}
                    </span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      ⏰ {j.employmentType || 'Full-time'}
                    </span>
                    {j.salary && (
                      <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-emerald-400">
                        💰 {j.salary}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium line-clamp-3 pt-2">
                    {j.description}
                  </p>

                  {j.skillsRequired && j.skillsRequired.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {j.skillsRequired.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-500">
                    Posted by: <strong className="text-slate-400">{j.postedBy?.name || 'Alumni'}</strong>
                  </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {j.postedBy && (
                        <button
                          type="button"
                          onClick={() => handleMessagePoster(j.postedBy)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                          title="Direct message recruiter or alumni poster"
                        >
                          <span>💬</span>
                          <span>Message</span>
                        </button>
                      )}
                      {j.applicationUrl && (
                        <a
                          href={j.applicationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
                        >
                          Apply Link ↗
                        </a>
                      )}
                      <button
                        onClick={() => handleApply(j._id)}
                        disabled={hasApplied}
                        className={`px-4 py-1.5 rounded-xl font-bold text-xs transition ${
                          hasApplied
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        }`}
                      >
                        {hasApplied ? 'Applied ✓' : 'Apply / Request Referral'}
                      </button>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Opening Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h3 className="text-lg font-black text-white">Post Opportunity or Referral Opening</h3>

            <form onSubmit={handlePostJob} className="space-y-3 text-xs font-bold text-slate-300">
              <div>
                <label className="block mb-1 text-slate-400">Job Title / Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Associate Software Engineer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad, India"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1 text-slate-400">Category</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  >
                    <option value="Job">Job</option>
                    <option value="Internship">Internship</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Workplace</label>
                  <select
                    value={form.workplaceType}
                    onChange={(e) => setForm({ ...form, workplaceType: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Employment</label>
                  <select
                    value={form.employmentType}
                    onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-400">Job Description & Eligibility</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Responsibilities, requirements, eligible batch years..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                ></textarea>
              </div>

              <div>
                <label className="block mb-1 text-slate-400">Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="Java, Spring Boot, React, SQL"
                  value={form.skillsRequired}
                  onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Salary (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹10-14 LPA"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Application URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://company.careers/..."
                    value={form.applicationUrl}
                    onChange={(e) => setForm({ ...form, applicationUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 text-slate-950 font-black rounded-xl hover:bg-cyan-400"
                >
                  Publish Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
