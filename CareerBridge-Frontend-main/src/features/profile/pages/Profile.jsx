import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userApi } from '../../../services/user.api';
import { connectionsApi } from '../../../services/connections.api';
import { LoadingSpinner } from '../../../components/feedback';
import { useAuthContext } from '../../../stores';

export const Profile = ({ user: currentUser }) => {
  const { id } = useParams();
  const isOwnProfile = !id || id === currentUser?._id;
  const { updateUser } = useAuthContext();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  // Resubmission modal state
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [resubmitFile, setResubmitFile] = useState(null);
  const [resubmitPreview, setResubmitPreview] = useState(null);
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitError, setResubmitError] = useState('');
  const [resubmitSuccess, setResubmitSuccess] = useState('');

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
    profilePhoto: '',
    coverPhoto: '',
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
          profilePhoto: data.profilePhoto || '',
          coverPhoto: data.coverPhoto || '',
          education: Array.isArray(data.education) ? data.education : [],
          experience: Array.isArray(data.experience) ? data.experience : [],
          projects: Array.isArray(data.projects) ? data.projects : [],
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

  // Profile Photo Upload Handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Profile photo size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profilePhoto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePhoto: '' }));
  };

  // Cover Photo Upload Handler
  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('Cover photo size must be less than 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, coverPhoto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    setFormData((prev) => ({ ...prev, coverPhoto: '' }));
  };

  // Education Management Handlers
  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institute: '',
          degree: '',
          branch: '',
          startYear: new Date().getFullYear() - 2,
          endYear: new Date().getFullYear(),
          achievements: '',
        },
      ],
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const handleRemoveEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Experience Management Handlers
  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: '',
          title: '',
          location: '',
          employmentType: 'Full-time',
          isCurrent: true,
          startDate: '',
          endDate: '',
          responsibilities: '',
        },
      ],
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const handleRemoveExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
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
      if (isOwnProfile && res.user && updateUser) {
        updateUser(res.user);
      }
      setIsEditing(false);
      setSaveSuccess('Profile updated successfully! ✨');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Resubmit ID Card handler
  const handleResubmitIdCard = async (e) => {
    e.preventDefault();
    if (!resubmitFile) {
      setResubmitError('Please select your ID card file.');
      return;
    }
    setResubmitting(true);
    setResubmitError('');
    try {
      await userApi.resubmitCollegeId(resubmitFile);
      setResubmitSuccess('ID card resubmitted successfully! It is now under review.');
      setTimeout(() => {
        setShowResubmitModal(false);
        setResubmitSuccess('');
        loadProfile();
      }, 1500);
    } catch (err) {
      setResubmitError(err.message || 'Resubmission failed.');
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile details..." />;
  if (!profile) return <div className="p-8 text-center text-slate-400">User profile not found.</div>;

  const currentCover = isEditing ? formData.coverPhoto : profile.coverPhoto;
  const currentAvatar = isEditing ? formData.profilePhoto : profile.profilePhoto;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-2xl text-center">
          {saveSuccess}
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Cover Photo / Banner */}
        <div className="h-44 md:h-52 relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-cyan-900">
          {currentCover ? (
            <img
              src={currentCover}
              alt="Cover Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl font-black">
              CareerBridge
            </div>
          )}

          {/* Cover Photo controls when editing */}
          {isOwnProfile && isEditing && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <label className="px-3 py-1.5 bg-slate-950/80 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer backdrop-blur-md border border-slate-700/80 flex items-center gap-1.5 shadow-lg transition">
                <span>🖼️</span>
                <span>{currentCover ? 'Change Cover' : 'Upload Cover'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
              {currentCover && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold cursor-pointer backdrop-blur-md border border-rose-800/80 shadow-lg transition"
                >
                  Remove Cover
                </button>
              )}
            </div>
          )}
        </div>

        <div className="px-6 md:px-8 pb-8 pt-0 relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6 -mt-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar with Upload Action */}
            <div className="relative group">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-slate-900 bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-4xl flex items-center justify-center shadow-xl overflow-hidden shrink-0">
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.name ? profile.name[0].toUpperCase() : 'U'
                )}
              </div>

              {isOwnProfile && isEditing && (
                <div className="absolute inset-0 rounded-full bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition backdrop-blur-xs">
                  <label className="cursor-pointer text-cyan-400 font-black text-[11px] hover:underline flex items-center gap-1">
                    <span>📷 Change</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {currentAvatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-rose-400 text-[10px] font-bold hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-white">{profile.name}</h1>
                <span className="text-[11px] font-extrabold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-0.5 rounded-full">
                  {profile.role}
                </span>

                {/* Institutional Verification Status Badge */}
                {profile.verificationStatus === 'verified' || profile.isVerified ? (
                  <span className="text-[11px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-0.5 rounded-full flex items-center gap-1">
                    <span>✓</span> Verified {profile.college || 'CSIT'} Member
                  </span>
                ) : profile.verificationStatus === 'rejected' || profile.verificationStatus === 'resubmission_required' ? (
                  <span className="text-[11px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/30 px-3 py-0.5 rounded-full flex items-center gap-1">
                    <span>⚠️</span> Verification Rejected
                  </span>
                ) : (
                  <span className="text-[11px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-0.5 rounded-full flex items-center gap-1">
                    <span>⏳</span> Verification Under Review
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-300 mt-1">
                {profile.headline || `${profile.role?.toUpperCase()} at ${profile.company || profile.college || 'CareerBridge'}`}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                📍 {profile.location || 'India'} • 🏛️ {profile.college || 'CSIT'} • 👥 {profile.connections?.length || 0} connections
              </p>

              {/* Notice if Verification is rejected with Resubmission CTA */}
              {isOwnProfile && (profile.verificationStatus === 'rejected' || profile.verificationStatus === 'resubmission_required') && (
                <div className="mt-3 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-rose-300 font-bold">
                      Your institutional ID verification was rejected. Reason: {profile.verificationDecision?.reason || 'Legibility or format issue'}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowResubmitModal(true)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-black shadow-md cursor-pointer shrink-0"
                    >
                      Resubmit ID Card 🪪
                    </button>
                  </div>
                </div>
              )}
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
        <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-8 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-xl font-black text-white">
              Edit Profile Details
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              Update your career, education, and social info
            </span>
          </div>

          {saveError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl">
              ⚠️ {saveError}
            </div>
          )}

          {/* Basic Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider">
              1. Basic & Contact Info
            </h3>

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
          </div>

          {/* Experience Management Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider">
                  2. Work Experience
                </h3>
                <p className="text-[11px] text-slate-400">
                  Add internships, full-time roles, or professional positions
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <span>+</span> Add Experience
              </button>
            </div>

            {formData.experience.length === 0 ? (
              <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-center text-xs text-slate-500">
                No experience records added yet. Click "+ Add Experience" above.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 relative group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-300">
                        Experience #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="text-rose-400 hover:text-rose-300 text-xs font-bold px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Company Name *</label>
                        <input
                          type="text"
                          required
                          value={exp.company || ''}
                          onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                          placeholder="e.g. Microsoft or TCS"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Job Title / Role *</label>
                        <input
                          type="text"
                          required
                          value={exp.title || ''}
                          onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                          placeholder="e.g. Frontend Engineer"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location || ''}
                          onChange={(e) => handleExperienceChange(idx, 'location', e.target.value)}
                          placeholder="e.g. Bangalore, India"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Start Date / Year</label>
                        <input
                          type="text"
                          value={exp.startDate || ''}
                          onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)}
                          placeholder="e.g. Jan 2023"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">End Date / Year</label>
                        <input
                          type="text"
                          disabled={exp.isCurrent}
                          value={exp.isCurrent ? 'Present' : (exp.endDate || '')}
                          onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)}
                          placeholder={exp.isCurrent ? 'Present' : 'e.g. Dec 2024'}
                          className={`w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs ${
                            exp.isCurrent ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id={`currentWork-${idx}`}
                        checked={Boolean(exp.isCurrent)}
                        onChange={(e) => handleExperienceChange(idx, 'isCurrent', e.target.checked)}
                        className="rounded border-slate-800 text-cyan-500 focus:ring-0"
                      />
                      <label htmlFor={`currentWork-${idx}`} className="text-xs text-slate-300 font-semibold cursor-pointer">
                        I am currently working here
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Responsibilities & Achievements</label>
                      <textarea
                        rows="2"
                        value={exp.responsibilities || ''}
                        onChange={(e) => handleExperienceChange(idx, 'responsibilities', e.target.value)}
                        placeholder="Key responsibilities, team impact, and tech stacks used..."
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education Management Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider">
                  3. Education & Institutional Records
                </h3>
                <p className="text-[11px] text-slate-400">
                  Degrees, diplomas, and college records
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <span>+</span> Add Education
              </button>
            </div>

            {formData.education.length === 0 ? (
              <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-center text-xs text-slate-500">
                No education records added yet. Click "+ Add Education" above.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 relative group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-300">
                        Education #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="text-rose-400 hover:text-rose-300 text-xs font-bold px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Institute / College Name *</label>
                        <input
                          type="text"
                          required
                          value={edu.institute || ''}
                          onChange={(e) => handleEducationChange(idx, 'institute', e.target.value)}
                          placeholder="e.g. CSIT Durg"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Degree *</label>
                        <input
                          type="text"
                          required
                          value={edu.degree || ''}
                          onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                          placeholder="e.g. B.Tech or Diploma"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Branch / Specialization</label>
                        <input
                          type="text"
                          value={edu.branch || ''}
                          onChange={(e) => handleEducationChange(idx, 'branch', e.target.value)}
                          placeholder="e.g. CSE / IT"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Start Year</label>
                        <input
                          type="number"
                          value={edu.startYear || ''}
                          onChange={(e) => handleEducationChange(idx, 'startYear', e.target.value)}
                          placeholder="e.g. 2021"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Graduation Year</label>
                        <input
                          type="number"
                          value={edu.endYear || ''}
                          onChange={(e) => handleEducationChange(idx, 'endYear', e.target.value)}
                          placeholder="e.g. 2025"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider">
              4. Professional Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Portfolio / Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://mywebsite.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving Profile...' : 'Save All Changes'}
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
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-white text-sm">{exp.title}</h4>
                      {exp.isCurrent && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cyan-400 font-bold">
                      {exp.company} • {exp.location || 'Remote'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {exp.startDate || 'Started'} — {exp.isCurrent ? 'Present' : exp.endDate || 'Finished'}
                    </p>
                    {exp.responsibilities && (
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                        {exp.responsibilities}
                      </p>
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
                    <p className="text-xs text-cyan-400 font-bold">
                      {edu.degree} {edu.branch ? `— ${edu.branch}` : ''}
                    </p>
                    <p className="text-xs text-slate-400">
                      {edu.startYear || 'N/A'} — {edu.endYear || 'N/A'}
                    </p>
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

      {/* Resubmit College ID Card Modal */}
      {showResubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>🪪</span> Resubmit College ID Card
              </h3>
              <button
                type="button"
                onClick={() => setShowResubmitModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a clear, legitimate image or scan of your official CSIT/CSIP ID card. Your submission will be routed to college administrators for expedited review.
            </p>

            {resubmitError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl">
                ⚠️ {resubmitError}
              </div>
            )}

            {resubmitSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl">
                🎉 {resubmitSuccess}
              </div>
            )}

            <form onSubmit={handleResubmitIdCard} className="space-y-4">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950 rounded-xl p-5 text-center cursor-pointer transition">
                {resubmitPreview ? (
                  <div className="space-y-2">
                    <img
                      src={resubmitPreview}
                      alt="ID Preview"
                      className="max-h-36 object-contain rounded-lg mx-auto"
                    />
                    <span className="text-[11px] text-cyan-400 font-bold block">
                      Click to replace selected image
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl mb-1">📁</span>
                    <span className="text-xs font-bold text-slate-200">
                      Select ID Card Image or PDF
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      JPG, PNG, or PDF up to 8MB
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      setResubmitFile({
                        dataUrl: reader.result,
                        name: f.name,
                        type: f.type,
                        size: f.size,
                      });
                      if (f.type.startsWith('image/')) {
                        setResubmitPreview(reader.result);
                      } else {
                        setResubmitPreview(null);
                      }
                    };
                    reader.readAsDataURL(f);
                  }}
                  className="hidden"
                />
              </label>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowResubmitModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resubmitting || !resubmitFile}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {resubmitting ? 'Submitting...' : 'Confirm Resubmission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
