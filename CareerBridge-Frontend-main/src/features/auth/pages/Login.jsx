import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateLogin } from '../auth.schema';

export const Login = ({ setUser: propSetUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const { errors, isValid } = validateLogin(formData);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    try {
      const data = await login({
        email: formData.email,
        password: formData.password,
      });
      if (propSetUser) propSetUser(data.user);
      navigate('/home');
    } catch (err) {
      setSubmitError(err.message || 'Invalid Credentials or server offline!');
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-73px)] bg-slate-950 relative overflow-hidden px-4 py-8">
      {/* Background Animated Glow Spheres */}
      <div className="absolute w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -top-10 -left-10 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -bottom-10 -right-10 animate-pulse"></div>

      <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 hover:border-slate-700 transition-all duration-300">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Welcome Back! 🚀
          </h2>
          <p className="text-xs font-semibold text-slate-400">
            Sign in to access student and alumni networking
          </p>
        </div>

        {submitError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
            ⚠️ {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@college.edu"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium text-sm"
            />
            {fieldErrors.email && (
              <p className="text-xs text-rose-500 mt-1 font-semibold">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium text-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 text-xs font-bold cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-500 mt-1 font-semibold">{fieldErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer text-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-cyan-400 hover:underline font-bold">
              Sign Up here
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Reset Password</h3>
            <p className="text-xs text-slate-400">
              Enter your registered email address to receive password reset instructions.
            </p>
            {forgotSent ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
                ✓ If this account exists, password reset instructions have been sent!
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="name@college.edu"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-400"
                >
                  Send Reset Link
                </button>
              </form>
            )}
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSent(false);
              }}
              className="w-full py-2 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
