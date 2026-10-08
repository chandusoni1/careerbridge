import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'student',
    branch: 'CSE',
    graduationYear: '2025',
    company: 'Other'
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if(response.ok) {
        alert("Account ban gaya bhai! Ab login kar le 🎉");
        navigate('/login');
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error(error);
      alert("Backend se connect nahi ho paya!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-73px)] bg-slate-950 py-10 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl -top-10 -right-10 pointer-events-none"></div>
      <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -bottom-10 -left-10 pointer-events-none"></div>

      <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl w-[420px] space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Join CareerBridge 🚀</h2>
          <p className="text-xs font-semibold text-slate-400">Naya account banao aur network karo</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-300">
          <div>
            <label className="block mb-1.5 uppercase tracking-wider text-slate-400">Poora Naam</label>
            <input 
              type="text" 
              name="name" 
              placeholder="Yash Kumar" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-medium" 
            />
          </div>

          <div>
            <label className="block mb-1.5 uppercase tracking-wider text-slate-400">Email ID</label>
            <input 
              type="email" 
              name="email" 
              placeholder="yash@example.com" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-medium" 
            />
          </div>
          
          <div>
            <label className="block mb-1.5 uppercase tracking-wider text-slate-400">Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-medium" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 uppercase tracking-wider text-slate-400">Role Select Karo</label>
              <select name="role" onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none font-bold">
                <option value="student">Student</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 uppercase tracking-wider text-slate-400">Branch Select Karo</label>
              <select name="branch" onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none font-bold">
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EE">Electrical</option>
                <option value="ME">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="AI/DS">AI / DS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 uppercase tracking-wider text-slate-400">Graduation Year</label>
            <select name="graduationYear" onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none font-bold">
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          {formData.role === 'alumni' && (
            <div>
              <label className="block mb-1.5 uppercase tracking-wider text-slate-400">Company Name</label>
              <select name="company" onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none font-bold">
                <option value="TCS">TCS</option>
                <option value="Infosys">Infosys</option>
                <option value="Amazon">Amazon</option>
                <option value="Google">Google</option>
                <option value="Wipro">Wipro</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Startup">Startup / Other</option>
              </select>
            </div>
          )}
          
          <button type="submit" className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition cursor-pointer mt-2">
            Sign Up
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 font-medium">
          Pehle se account hai? <Link to="/login" className="text-cyan-400 font-bold hover:underline">Login kar le</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
