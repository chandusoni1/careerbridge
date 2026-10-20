import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateSignup } from '../auth.schema';
import {
  COLLEGES,
  BRANCHES,
  ACADEMIC_YEARS,
  GRADUATION_YEARS,
  COMPANIES,
} from '../../../constants';

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    college: 'CSIT',
    branch: 'CSE',
    academicYear: '3rd Year',
    passingYear: '2024',
    company: '',
    companyLocation: '',
    jobRole: 'Software Engineer',
    collegeIdCard: null,
  });

  const [idCardPreview, setIdCardPreview] = useState(null);
  const [idCardFileMeta, setIdCardFileMeta] = useState(null);
  const [idCardError, setIdCardError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleIdCardChange = (e) => {
    setIdCardError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setIdCardError('Unsupported format! Please upload a JPG, PNG, or PDF file.');
      return;
    }

    const maxSize = 8 * 1024 * 1024; // 8MB limit
    if (file.size > maxSize) {
      setIdCardError('File size exceeds the 8MB limit. Please upload a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const fileData = {
        dataUrl: result,
        name: file.name,
        type: file.type,
        size: file.size,
      };
      setFormData((prev) => ({ ...prev, collegeIdCard: fileData }));
      setIdCardFileMeta({ name: file.name, size: (file.size / (1024 * 1024)).toFixed(2) + ' MB', type: file.type });
      if (file.type.startsWith('image/')) {
        setIdCardPreview(result);
      } else {
        setIdCardPreview('pdf');
      }
    };
    reader.onerror = () => {
      setIdCardError('Failed to read ID card file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveIdCard = () => {
    setFormData((prev) => ({ ...prev, collegeIdCard: null }));
    setIdCardPreview(null);
    setIdCardFileMeta(null);
    setIdCardError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');

    const { errors, isValid } = validateSignup(formData);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    try {
      await signup(formData);
      setSuccessMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      setSubmitError(error.message || 'Signup failed! Please check your details.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-73px)] bg-slate-950 py-10 relative overflow-hidden px-4">
      {/* Background Glows */}
      <div className="absolute w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl -top-10 -right-10 pointer-events-none"></div>
      <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -bottom-10 -left-10 pointer-events-none"></div>

      <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Join CareerBridge 🚀
          </h2>
          <p className="text-xs font-semibold text-slate-400">
            Create your account to connect with students, alumni, and job opportunities
          </p>
        </div>

        {submitError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
            ⚠️ {submitError}
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
            🎉 {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-300">
          {/* Role Selector Tabs */}
          <div>
            <label className="block mb-2 uppercase tracking-wider text-slate-400">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`py-3 rounded-xl border text-center font-black transition cursor-pointer ${
                  formData.role === 'student'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'alumni' })}
                className={`py-3 rounded-xl border text-center font-black transition cursor-pointer ${
                  formData.role === 'alumni'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                💼 Alumni
              </button>
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Yash Kumar"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
              />
              {fieldErrors.name && (
                <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block mb-1.5 uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@college.edu"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
              />
              {fieldErrors.email && (
                <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="uppercase tracking-wider text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-cyan-400 text-[11px] hover:underline"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
              />
              {fieldErrors.password && (
                <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block mb-1.5 uppercase tracking-wider text-slate-400">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-rose-400 text-[11px] mt-1">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Role-Specific Dynamic Fields */}
          {formData.role === 'student' ? (
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-4">
              <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-extrabold">
                Student Academic Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">College / Institute</label>
                  <select
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    {COLLEGES.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-400">Branch</label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    {BRANCHES.map((br) => (
                      <option key={br} value={br}>
                        {br}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-400">Current Year</label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    {ACADEMIC_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-4">
              <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-extrabold">
                Alumni Career & Institute Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">College / Institute</label>
                  <select
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    {COLLEGES.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-400">Year of Passing</label>
                  <select
                    name="passingYear"
                    value={formData.passingYear}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    {GRADUATION_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-400">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. Google or TCS"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                  {fieldErrors.company && (
                    <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.company}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-slate-400">Company Location</label>
                  <input
                    type="text"
                    name="companyLocation"
                    placeholder="e.g. Bangalore, India"
                    value={formData.companyLocation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                  {fieldErrors.companyLocation && (
                    <p className="text-rose-400 text-[11px] mt-1">
                      {fieldErrors.companyLocation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mandatory College ID Verification Section */}
          <div className="p-5 bg-slate-950/90 border-2 border-cyan-500/30 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs">🪪</span>
                  College ID Verification
                  <span className="text-[10px] uppercase tracking-wider bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                    Mandatory
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Institutional verification for CSIT and CSIP students and alumni
                </p>
              </div>
            </div>

            {/* College Selector (CSIT / CSIP) */}
            <div>
              <label className="block mb-1.5 uppercase tracking-wider text-slate-300 text-[11px]">
                Select Institutional College <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {COLLEGES.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setFormData({ ...formData, college: col })}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                      formData.college === col
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>🏛️</span>
                    <span>{col} College</span>
                    {formData.college === col && <span className="text-cyan-400 text-xs">✓</span>}
                  </button>
                ))}
              </div>
              {fieldErrors.college && (
                <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.college}</p>
              )}
            </div>

            {/* Upload Area */}
            <div>
              <label className="block mb-1.5 uppercase tracking-wider text-slate-300 text-[11px]">
                Upload Official College ID Card <span className="text-rose-400">*</span>
              </label>

              {!idCardPreview ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-900/60 rounded-xl p-5 text-center cursor-pointer transition group">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xl group-hover:scale-110 transition">
                    📁
                  </div>
                  <span className="text-xs font-bold text-slate-200 mt-2">
                    Click to browse or drag & drop ID Card
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Supports JPG, JPEG, PNG, or PDF (Max 8MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handleIdCardChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {idCardFileMeta?.type === 'application/pdf' ? '📄' : '🖼️'}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-200 truncate">
                          {idCardFileMeta?.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {idCardFileMeta?.size} • {idCardFileMeta?.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer transition border border-slate-700">
                        Replace
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,application/pdf"
                          onChange={handleIdCardChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveIdCard}
                        className="px-2.5 py-1 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg cursor-pointer transition border border-rose-500/30"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* ID Card Visual Preview */}
                  {idCardPreview !== 'pdf' ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center max-h-48">
                      <img
                        src={idCardPreview}
                        alt="College ID Preview"
                        className="max-h-48 object-contain w-full"
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center">
                      <p className="text-xs text-cyan-400 font-bold">
                        📄 PDF Document Attached ({idCardFileMeta?.name})
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        PDF will be securely reviewed by verification personnel.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {idCardError && (
                <p className="text-rose-400 text-[11px] mt-1.5 flex items-center gap-1 font-semibold">
                  ⚠️ {idCardError}
                </p>
              )}
              {fieldErrors.collegeIdCard && (
                <p className="text-rose-400 text-[11px] mt-1.5 flex items-center gap-1 font-semibold">
                  ⚠️ {fieldErrors.collegeIdCard}
                </p>
              )}
            </div>

            {/* Privacy & Verification Notice */}
            <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-[11px] text-slate-300 space-y-1">
              <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                <span>🔒</span> Institutional Verification Notice
              </p>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Your ID card is securely stored in encrypted institutional storage and is strictly used by college administrators to verify student/alumni credentials. It will <strong>never</strong> be displayed on your public profile or shared with third parties.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer text-sm disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
