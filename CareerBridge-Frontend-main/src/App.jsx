import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import AlumniDirectory from './pages/AlumniDirectory';
import Jobs from './pages/Jobs';
import ComprehensiveDashboard from './pages/ComprehensiveDashboard';
import AIStudio from './pages/AIStudio'; // AI Studio Import

function Navigation({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xl">
      <div className="font-extrabold text-2xl text-cyan-400 tracking-wider">
        <Link to={user ? "/home" : "/login"}>CareerBridge 🚀</Link>
      </div>

      <div className="flex items-center space-x-8 text-sm font-bold text-slate-300">
        {user ? (
          <>
            <Link to="/home" className={`transition ${location.pathname === '/home' ? 'text-cyan-400 font-extrabold' : 'hover:text-cyan-400'}`}>Feed</Link>
            <Link to="/directory" className={`transition ${location.pathname === '/directory' ? 'text-cyan-400 font-extrabold' : 'hover:text-cyan-400'}`}>Directory</Link>
            <Link to="/jobs" className={`transition ${location.pathname === '/jobs' ? 'text-cyan-400 font-extrabold' : 'hover:text-cyan-400'}`}>Jobs & Referrals</Link>
            <Link to="/ai-studio" className={`transition ${location.pathname === '/ai-studio' ? 'text-cyan-400 font-extrabold' : 'hover:text-cyan-400'}`}>AI Studio 🤖</Link>
            <Link to="/dashboard" className={`transition ${location.pathname === '/dashboard' ? 'text-cyan-400 font-extrabold' : 'hover:text-cyan-400'}`}>Dashboard</Link>
            
            <div className="flex items-center space-x-4 border-l border-slate-700 pl-6">
              <span className="text-cyan-400 font-extrabold text-base">👤 {user.name}</span>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className={`px-5 py-2 font-black rounded-xl transition shadow-lg ${location.pathname === '/login' ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}>
              Login
            </Link>
            <Link to="/signup" className={`px-5 py-2 font-black rounded-xl transition shadow-lg ${location.pathname === '/signup' ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <Router>
      <Navigation user={user} setUser={setUser} />
      <main className="bg-slate-950 text-slate-100 min-h-[calc(100vh-73px)]">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/home" /> : <Navigate to="/login" />} />
          <Route path="/login" element={user ? <Navigate to="/home" /> : <Login setUser={setUser} />} />
          <Route path="/signup" element={user ? <Navigate to="/home" /> : <Signup />} />
          
          <Route path="/home" element={user ? <Home user={user} /> : <Navigate to="/login" />} />
          <Route path="/directory" element={user ? <AlumniDirectory /> : <Navigate to="/login" />} />
          <Route path="/jobs" element={user ? <Jobs user={user} /> : <Navigate to="/login" />} />
          <Route path="/ai-studio" element={user ? <AIStudio user={user} /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <ComprehensiveDashboard user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;