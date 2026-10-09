import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {apibase } from '../config';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       const response = await fetch(`${apibase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/home');
      } else {
        alert(data.message || "Invalid Credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Backend server offline hai ya connect nahi ho raha!");
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-73px)] bg-slate-950 relative overflow-hidden">
      {/* Background Animated Glow Spheres */}
      <div className="absolute w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -top-10 -left-10 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -bottom-10 -right-10 animate-pulse"></div>

      <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-10 rounded-3xl shadow-2xl w-96 space-y-6 hover:border-slate-700 transition-all duration-300">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Welcome Back! 🚀</h2>
          <p className="text-xs font-semibold text-slate-400">CareerBridge Account Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email Address"
              required
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              required
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-90 text-white font-extrabold rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 font-medium">
          Account nahi hai? <Link to="/signup" className="text-cyan-400 font-bold hover:underline">Register Now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
