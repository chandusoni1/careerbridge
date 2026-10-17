import React, { useState, useEffect } from 'react';
import { userApi } from '../../../services/user.api';
import { aiApi } from '../../../services/ai.api';
import { LoadingSpinner } from '../../../components/feedback';

export const AIStudio = ({ user }) => {
  const [activeTab, setActiveTab] = useState('resume'); // 'resume' | 'portfolio'
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern'); // 'modern' | 'classic' | 'minimal' | 'technical'

  // Profile data prefill
  const [resumeData, setResumeData] = useState({
    name: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    about: '',
    skills: '',
    education: [],
    experience: [],
    projects: [],
  });

  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [generatedPortfolioHTML, setGeneratedPortfolioHTML] = useState('');

  useEffect(() => {
    let isMounted = true;
    userApi
      .getMyProfile()
      .then((profile) => {
        if (isMounted && profile) {
          const initial = {
            name: profile.name || user?.name || 'Candidate Name',
            headline: profile.headline || 'Software Engineer',
            email: profile.email || '',
            phone: profile.phone || '',
            location: profile.location || 'India',
            about: profile.about || profile.bio || 'Passionate engineer building scalable applications.',
            skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : 'React, Node.js, Express, MongoDB, Tailwind CSS',
            education: profile.education || [],
            experience: profile.experience || [],
            projects: profile.projects || [],
          };
          setResumeData(initial);
          handleGenerateResume(initial, 'modern');
          handleGeneratePortfolio(initial);
        }
      })
      .catch((err) => {
        console.error('Failed to prefill from profile:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGenerateResume = async (data = resumeData, tpl = selectedTemplate) => {
    try {
      const skillsArray = typeof data.skills === 'string'
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : data.skills;

      const res = await aiApi.buildResume({
        ...data,
        skills: skillsArray,
        template: tpl,
      });

      if (res && res.resume) {
        setGeneratedMarkdown(res.resume);
      }
    } catch (err) {
      console.error('Failed to generate resume:', err);
    }
  };

  const handleGeneratePortfolio = async (data = resumeData) => {
    try {
      const skillsArray = typeof data.skills === 'string'
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : data.skills;

      const res = await aiApi.buildPortfolio({
        ...data,
        skills: skillsArray,
      });

      if (res && res.code) {
        setGeneratedPortfolioHTML(res.code);
      }
    } catch (err) {
      console.error('Failed to generate portfolio:', err);
    }
  };

  const handleEnhanceSummary = async () => {
    setEnhancing(true);
    try {
      const res = await aiApi.enhanceSection(
        'summary',
        resumeData.about,
        resumeData.headline
      );
      if (res && res.enhanced) {
        const updated = { ...resumeData, about: res.enhanced };
        setResumeData(updated);
        handleGenerateResume(updated);
      }
    } catch (err) {
      alert(err.message || 'Enhancement failed');
    } finally {
      setEnhancing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPortfolio = () => {
    const blob = new Blob([generatedPortfolioHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(resumeData.name || 'portfolio').toLowerCase().replace(/\s+/g, '_')}_portfolio.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner text="Connecting profile data to AI Studio..." />;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Studio Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            AI Career Studio 🤖
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Build ATS-friendly Resumes and Customized Portfolios directly from your profile data
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'resume'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}
          >
            📄 Resume Builder
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'portfolio'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}
          >
            🌐 Portfolio Builder
          </button>
        </div>
      </div>

      {/* Mode 1: Resume Builder */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form Controls (Print Hidden) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl print:hidden">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-extrabold text-white text-sm">Resume Parameters</h3>
              <button
                type="button"
                onClick={handleEnhanceSummary}
                disabled={enhancing}
                className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold px-3 py-1 rounded-xl hover:bg-cyan-500/20"
              >
                {enhancing ? 'AI Enhancing...' : '✨ Enhance Summary'}
              </button>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Layout Template</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['modern', 'classic', 'minimal', 'technical'].map((tpl) => (
                  <button
                    key={tpl}
                    onClick={() => {
                      setSelectedTemplate(tpl);
                      handleGenerateResume(resumeData, tpl);
                    }}
                    className={`py-2 px-3 rounded-xl capitalize font-bold border ${
                      selectedTemplate === tpl
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={resumeData.name}
                  onChange={(e) => {
                    const updated = { ...resumeData, name: e.target.value };
                    setResumeData(updated);
                    handleGenerateResume(updated);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Target Role / Headline</label>
                <input
                  type="text"
                  value={resumeData.headline}
                  onChange={(e) => {
                    const updated = { ...resumeData, headline: e.target.value };
                    setResumeData(updated);
                    handleGenerateResume(updated);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Professional Summary</label>
                <textarea
                  rows="3"
                  value={resumeData.about}
                  onChange={(e) => {
                    const updated = { ...resumeData, about: e.target.value };
                    setResumeData(updated);
                    handleGenerateResume(updated);
                  }}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={resumeData.skills}
                  onChange={(e) => {
                    const updated = { ...resumeData, skills: e.target.value };
                    setResumeData(updated);
                    handleGenerateResume(updated);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs shadow-lg transition"
              >
                🖨️ Print / Save as PDF
              </button>
            </div>
          </div>

          {/* Right Preview Card (Print Target) */}
          <div className="lg:col-span-7 bg-white text-slate-900 p-8 md:p-12 rounded-3xl shadow-2xl font-sans min-h-[700px] border border-slate-200">
            <div className="prose max-w-none text-slate-900 leading-relaxed whitespace-pre-wrap font-sans text-sm">
              {generatedMarkdown}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Portfolio Builder */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-xl">
            <span className="text-xs font-bold text-slate-300">
              Interactive HTML Portfolio generated from your projects, skills & bio
            </span>
            <button
              onClick={handleDownloadPortfolio}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
            >
              📥 Download HTML Portfolio
            </button>
          </div>

          <div className="border border-slate-800 rounded-3xl overflow-hidden shadow-2xl bg-slate-950 h-[650px]">
            <iframe
              title="Portfolio Preview"
              srcDoc={generatedPortfolioHTML}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStudio;
