import React, { useState } from 'react';

const Home = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosts([{
      id: Date.now(),
      author: user?.name || "User",
      role: user?.role === 'alumni' ? "Alumni" : "Student",
      branch: user?.branch || "CSE",
      content: newPost
    }, ...posts]);
    setNewPost("");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Profile Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4 h-fit shadow-xl">
        <div className="w-20 h-20 bg-cyan-500 text-slate-950 text-3xl font-black flex items-center justify-center rounded-full mx-auto shadow-lg shadow-cyan-500/20">
          {user?.name ? user.name[0].toUpperCase() : '?'}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">{user?.name || "Please Login"}</h2>
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mt-1">
            {user ? `${user.role} | ${user.branch || 'CSE'}` : 'Guest User'}
          </p>
        </div>
      </div>

      {/* Main Feed Post Area */}
      <div className="md:col-span-2 space-y-6">
        <form onSubmit={handlePostSubmit} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={user ? `Kya chal raha hai ${user.name}? Post daalo ya doubt poocho...` : "Post daalne ke liye pehle Login karo!"}
            disabled={!user}
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-100 placeholder-slate-500 font-medium resize-none"
            rows="3"
          ></textarea>
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={!user}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 font-black rounded-xl shadow-lg transition cursor-pointer"
            >
              POST
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-slate-900 p-12 text-center rounded-2xl border border-dashed border-slate-800 text-slate-500 font-bold">
              Abhi koi dynamic post nahi hai. Pehli post tum hi daalo bhai! 🚀
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-white text-lg">{post.author}</span>
                  <span className="text-xs bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30 px-3 py-1 rounded-full uppercase">
                    {post.role} | {post.branch}
                  </span>
                </div>
                <p className="text-slate-300 font-medium leading-relaxed">{post.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Topics */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-4 shadow-xl">
        <h3 className="font-extrabold text-white">Trending Topics</h3>
        <div className="flex flex-wrap gap-2">
          <span className="bg-slate-800 text-cyan-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700">#PlacementPrep</span>
          <span className="bg-slate-800 text-cyan-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700">#WebDev</span>
        </div>
      </div>
    </div>
  );
};

export default Home;