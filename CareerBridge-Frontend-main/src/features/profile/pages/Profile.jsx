import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userApi } from '../../../services/user.api';
import { connectionsApi } from '../../../services/connections.api';
import { LoadingSpinner } from '../../../components/feedback';

export const Profile = ({ user: currentUser }) => {
  const { id } = useParams();
  const isOwnProfile = !id || id === currentUser?._id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Form State for Editing
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    about: '',
    location: '',
    phone: '',
    isPhonePublic: false,
    isEmailPublic: false,
    skills: '',
    linkedin: '',
    github: '',
    website: '',
    education: [],
    experience: [],
    projects: [],
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = isOwnProfile
        ? await userApi.getMyProfile()
        : await userApi.getUserById(id);

      setProfile(data);
      if (data) {
        setFormData({
          name: data.name || '',
          headline: data.headline || '',
          about: data.about || data.bio || '',
          location: data.location || '',
          phone: data.phone || '',
          isPhonePublic: Boolean(data.isPhonePublic),
          isEmailPublic: Boolean(data.isEmailPublic),
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
          linkedin: data.linkedin || '',
          github: data.github || '',
          website: data.website || '',
          education: data.education || [],
          experience: data.experience || [],
          projects: data.projects || [],
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        skills: skillsArray,
      };

      const res = await userApi.updateMyProfile(payload);
      setProfile(res.user);
      setIsEditing(false);
      setSaveSuccess('Profile updated successfully! ✨');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institute: 'Institute Name',
          degree: 'B.Tech',
          branch: 'CSE',
          startYear: 2022,
          endYear: 2026,
          achievements: '',
        },
      ],
    }));
  };

  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: 'Company Name',
          title: 'Role / Title',
          location: 'Location',
          isCurrent: true,
          startDate: '2023',
          responsibilities: '',
        },
      ],
    }));
  };

  const handleAddProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: 'Project Title',
          description: 'Project description and impact',
          techStack: ['React', 'Node.js'],
          repoUrl: '',
          liveUrl: '',
        },
      ],
    }));
  };

  if (loading) return <LoadingSpinner text="Loading profile details..." />;
  if (!profile) return <div className="p-8 text-center text-slate-400">User profile not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-2xl text-center">
          {saveSuccess}
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Cover Gradient */}
        <div className="h-36 bg-gradient-to-r from-blue-900 via-indigo-900 to-cyan-900 relative"></div>

        <div className="px-6 md:px-8 pb-8 pt-0 relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6 -mt-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-28 h-28 rounded-full border-4 border-slate-900 bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-4xl flex items-center justify-center shadow-xl shrink-0">
              {profile.name ? profile.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-white">{profile.name}</h1>
                <span className="text-[11px] font-extrabold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-0.5 rounded-full">
                  {profile.role}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-300 mt-1">
                {profile.headline || `${profile.role?.toUpperCase()} at ${profile.company || profile.college || 'CareerBridge'}`}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                📍 {profile.location || 'India'} • 👥 {profile.connections?.length || 0} connections
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition cursor-pointer"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile ✏️'}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => connectionsApi.sendRequest(profile._id)}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
                >
                  + Connect
                </button>
                <a
                  href={`/messages?userId=${profile._id}`}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                >
                  Message 💬
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editing Form OR Profile Details Display */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-xl">
          <h2 className="text-xl font-black text-white border-b border-slate-800 pb-3">
            Edit Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Headline</label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g. Software Engineer @ Google"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">About / Bio</label>
            <textarea
              rows="3"
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              placeholder="Tell others about your background, career focus, and achievements..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Skills (comma separated)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="React, Node.js, Express, MongoDB, Tailwind CSS, Python"
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">GitHub URL</label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Portfolio / Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* About Section */}
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-3 shadow-xl">
            <h3 className="text-lg font-black text-white">About</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {profile.about || profile.bio || 'No summary provided yet.'}
            </p>
          </div>

          {/* Skills Section */}
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-white">Skills</h3>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs rounded-xl"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs">No skills listed yet.</p>
            )}
          </div>

          {/* Experience Section */}
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-white">Experience</h3>
            {profile.experience && profile.experience.length > 0 ? (
              <div className="space-y-4">
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                    <h4 className="font-extrabold text-white text-sm">{exp.title}</h4>
                    <p className="text-xs text-cyan-400 font-bold">{exp.company} • {exp.location || 'Remote'}</p>
                    <p className="text-xs text-slate-400">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</p>
                    {exp.responsibilities && (
                      <p className="text-xs text-slate-300 mt-2">{exp.responsibilities}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs">No experience records yet.</p>
            )}
          </div>

          {/* Education Section */}
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-white">Education</h3>
            {profile.education && profile.education.length > 0 ? (
              <div className="space-y-4">
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                    <h4 className="font-extrabold text-white text-sm">{edu.institute}</h4>
                    <p className="text-xs text-cyan-400 font-bold">{edu.degree} - {edu.branch}</p>
                    <p className="text-xs text-slate-400">{edu.startYear} - {edu.endYear}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs">No education records yet.</p>
            )}
          </div>

          {/* Public Links */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-wrap gap-4 text-xs font-bold text-slate-300">
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                🔗 LinkedIn
              </a>
            )}
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                💻 GitHub
              </a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                🌐 Portfolio
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
