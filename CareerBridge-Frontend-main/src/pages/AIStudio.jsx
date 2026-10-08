import React, { useState } from 'react';

const AIStudio = () => {
  const [activeTab, setActiveTab] = useState('resume');
  const [formData, setFormData] = useState({
    name: 'Chandresh',
    role: 'Full Stack Developer',
    skills: 'React, Node.js, Express, MongoDB, Tailwind CSS',
  });
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    try {
      const endpoint = activeTab === 'resume' ? 'build-resume' : 'build-portfolio';
      const res = await fetch(`http://localhost:5000/api/ai/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.resume || data.code);
      } else {
        throw new Error();
      }
    } catch (err) {
      // Local Instant Generation Fallback
      if (activeTab === 'resume') {
        setResult(`# ${formData.name || 'Chandresh'}\n**Target Role:** ${formData.role}\n\n## Technical Skills\n${formData.skills}`);
      } else {
        setResult(`<!DOCTYPE html><html><head><title>${formData.name} - Portfolio</title></head><body style="background:#0f172a;color:#fff;font-family:sans-serif;padding:2rem;"><h1>${formData.name}</h1><h3>${formData.role}</h3><p>${formData.skills}</p></body></html>`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-cyan-400">AI Studio</h1>
        <p className="text-slate-400">Generate your Resume or Portfolio with AI assistance</p>

        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'resume' ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Resume Builder
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'portfolio' ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Portfolio Builder
          </button>
        </div>

        <div className="space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Skills</label>
            <textarea
              rows="3"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>
          <button
            onClick={handleGenerate}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition"
          >
            Generate {activeTab === 'resume' ? 'Resume' : 'Portfolio'}
          </button>
        </div>

        {result && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-3 text-cyan-400">Generated Result:</h2>
            <pre className="whitespace-pre-wrap bg-slate-950 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStudio;