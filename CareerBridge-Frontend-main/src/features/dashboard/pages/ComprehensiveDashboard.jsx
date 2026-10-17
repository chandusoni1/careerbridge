import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../../../services/user.api';
import { jobsApi } from '../../../services/jobs.api';
import { MetricCard } from '../components/MetricCard';
import { LoadingSpinner } from '../../../components/feedback';

export const ComprehensiveDashboard = ({ user }) => {
  const [summary, setSummary] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([userApi.getDashboardSummary(), jobsApi.getJobs()])
      .then(([summaryData, jobsData]) => {
        if (isMounted) {
          setSummary(summaryData);
          if (Array.isArray(jobsData)) setJobs(jobsData.slice(0, 4));
        }
      })
      .catch((err) => {
        console.error('Failed to load dashboard data:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <LoadingSpinner text="Compiling dashboard analytics..." />;

  const isAlumni = user?.role === 'alumni';

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Personalized Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-slate-900 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -top-10 -right-10 pointer-events-none"></div>
        <div className="space-y-2 z-10">
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            Welcome back, {user?.name || 'Member'}! 👋
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-semibold">
            {isAlumni
              ? 'Alumni Career Leadership, Mentorship & Opportunity Hub'
              : 'Student Career Acceleration, Alumni Network & AI Tools'}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 z-10">
          <span className="uppercase text-[11px] font-black tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-xl">
            {isAlumni ? '💼 Alumni Mode' : '🎓 Student Mode'}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            Profile Completion: <strong className="text-cyan-400">{summary?.profileCompletion || 75}%</strong>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl">
        <div className="flex justify-between items-center text-xs font-bold text-slate-300">
          <span>Profile Strength Score</span>
          <span className="text-cyan-400">{summary?.profileCompletion || 75}% Complete</span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${summary?.profileCompletion || 75}%` }}
          ></div>
        </div>
        {(summary?.profileCompletion || 0) < 100 && (
          <p className="text-[11px] text-slate-500">
            Tip: Complete your experience, projects, and skills to get higher visibility for referrals.
          </p>
        )}
      </div>

      {/* Real Analytics Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Connections"
          value={summary?.connectionsCount || 0}
          gradient="from-cyan-500 to-blue-500"
        />
        <MetricCard
          title={isAlumni ? 'Jobs Posted' : 'Applications Sent'}
          value={isAlumni ? summary?.jobsPostedCount || 0 : summary?.applicationsCount || 0}
          gradient="from-blue-500 to-indigo-500"
        />
        <MetricCard
          title="Received Requests"
          value={summary?.receivedRequestsCount || 0}
          gradient="from-emerald-500 to-teal-500"
        />
        <MetricCard
          title="Sent Requests"
          value={summary?.sentRequestsCount || 0}
          gradient="from-purple-500 to-indigo-500"
        />
      </div>

      {/* Shortcuts & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Tools */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="font-extrabold text-white text-sm">Productivity Shortcuts</h3>
          <div className="space-y-3">
            <Link
              to="/ai-studio"
              className="block p-3.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition"
            >
              🤖 AI Resume & Portfolio Builder ↗
            </Link>
            <Link
              to="/network"
              className="block p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 text-xs font-bold hover:border-slate-700 transition"
            >
              👥 Manage Connection Requests ↗
            </Link>
            <Link
              to="/jobs"
              className="block p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 text-xs font-bold hover:border-slate-700 transition"
            >
              💼 {isAlumni ? 'Post a New Opportunity' : 'Explore Referral Openings'} ↗
            </Link>
            <Link
              to="/profile"
              className="block p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 text-xs font-bold hover:border-slate-700 transition"
            >
              ✏️ Update Professional Profile ↗
            </Link>
          </div>
        </div>

        {/* Recent Recommended Opportunities */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-white text-sm">Recommended Openings & Referrals</h3>
            <Link to="/jobs" className="text-xs font-bold text-cyan-400 hover:underline">
              View All ↗
            </Link>
          </div>

          <div className="space-y-3">
            {jobs.length === 0 ? (
              <p className="text-slate-500 text-xs font-semibold py-4">
                No active jobs currently listed. Check back soon!
              </p>
            ) : (
              jobs.map((j) => (
                <div
                  key={j._id}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-extrabold text-white text-xs">{j.title}</h4>
                    <p className="text-[11px] text-slate-400">
                      {j.company} • {j.location} • <span className="text-cyan-400 font-semibold">{j.type}</span>
                    </p>
                  </div>
                  <Link
                    to="/jobs"
                    className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-xs font-bold hover:bg-cyan-500 hover:text-slate-950 transition"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveDashboard;
