import React, { useState, useEffect, useRef } from 'react';
import { postsApi } from '../../../services/posts.api';
import { LoadingSpinner, EmptyState } from '../../../components/feedback';
import { UserAvatar } from '../../../components/common/UserAvatar';

export const Home = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [posting, setPosting] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');

  const fetchFeed = async (tag = '') => {
    try {
      setLoading(true);
      const data = await postsApi.getPosts(tag ? { tag } : {});
      if (data && Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Feed fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(selectedTag);
  }, [selectedTag]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 8MB to stay safely within json parser limits
    const MAX_SIZE = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('Please select a file smaller than 8 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    let type = 'document';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type,
        dataUrl: event.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newContent.trim() && !selectedFile) return;

    setPosting(true);
    try {
      const mediaList = selectedFile
        ? [
          {
            url: selectedFile.dataUrl,
            type: selectedFile.type,
            name: selectedFile.name,
          },
        ]
        : [];

      // Extract hashtags
      const tags = (newContent.match(/#[a-zA-Z0-9_]+/g) || []).map((t) =>
        t.replace('#', '')
      );

      const created = await postsApi.createPost({
        content: newContent,
        media: mediaList,
        tags,
      });

      setPosts([created, ...posts]);
      setNewContent('');
      handleRemoveFile();
    } catch (err) {
      console.error('Failed to post:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await postsApi.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            const hasLiked = p.likes?.some(
              (id) => id === user?._id || id?._id === user?._id
            );
            const updatedLikes = hasLiked
              ? p.likes.filter((id) => (id?._id || id) !== user?._id)
              : [...(p.likes || []), user?._id];
            return { ...p, likes: updatedLikes };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    try {
      const newComment = await postsApi.addComment(postId, commentText);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), newComment] }
            : p
        )
      );
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await postsApi.deleteComment(postId, commentId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
              ...p,
              comments: p.comments.filter((c) => c._id !== commentId),
            }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleShare = async (postId) => {
    try {
      await postsApi.sharePost(postId);
      navigator.clipboard?.writeText?.(window.location.href);
      setShareFeedback(`Post link copied to clipboard! 📋`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, sharesCount: (p.sharesCount || 0) + 1 }
            : p
        )
      );
      setTimeout(() => setShareFeedback(''), 3000);
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Left Sidebar: User Mini Profile Card */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center space-y-4 shadow-xl">
          <UserAvatar
            src={user?.profilePhoto}
            name={user?.name}
            size="2xl"
            className="mx-auto border-2 border-slate-700/60"
          />
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {user?.name || 'Guest User'}
            </h2>
            <p className="text-xs font-semibold text-cyan-400 mt-1">
              {user?.headline || `${user?.role?.toUpperCase()} | ${user?.branch || user?.company || 'Member'}`}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex justify-around text-xs font-semibold text-slate-400">
            <div>
              <div className="text-white font-extrabold text-base">
                {user?.connections?.length || 0}
              </div>
              <div>Connections</div>
            </div>
            <div>
              <div className="text-white font-extrabold text-base">
                {user?.role === 'alumni' ? 'Alumni' : 'Student'}
              </div>
              <div>Network</div>
            </div>
          </div>
        </div>

        {/* Trending Tags Widget */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="font-extrabold text-white text-sm">Trending Discussions</h3>
          <div className="flex flex-wrap gap-2">
            {['All', 'PlacementPrep', 'WebDev', 'Referrals', 'AI', 'Internship'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === 'All' ? '' : tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${(tag === 'All' && !selectedTag) || selectedTag === tag
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed Column */}
      <div className="md:col-span-2 space-y-6">
        {shareFeedback && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold text-center animate-fade-in">
            {shareFeedback}
          </div>
        )}

        {/* Post Composer Card */}
        <form
          onSubmit={handleCreatePost}
          className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-3"
        >
          <div className="flex gap-3 items-start">
            <UserAvatar
              src={user?.profilePhoto}
              name={user?.name}
              size="md"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={
                user
                  ? `Share an update, referral doubt, or project #${user.name}...`
                  : 'Log in to start posting!'
              }
              disabled={!user}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-cyan-500 text-slate-100 placeholder-slate-500 font-medium resize-none text-sm"
              rows="3"
            ></textarea>
          </div>

          {/* Selected File Preview Box */}
          {selectedFile && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3 overflow-hidden">
                {selectedFile.type === 'image' && (
                  <img
                    src={selectedFile.dataUrl}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-xl border border-slate-800 shrink-0"
                  />
                )}
                {selectedFile.type === 'video' && (
                  <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-xl shrink-0">
                    🎬
                  </div>
                )}
                {selectedFile.type === 'document' && (
                  <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-xl shrink-0">
                    📄
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-200 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-cyan-400 font-semibold">
                    {selectedFile.size} • {selectedFile.type.toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="px-2.5 py-1 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                title="Remove attachment"
              >
                ✕ Remove
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*,.pdf,.doc,.docx"
              className="hidden"
            />

            {/* Browse Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition"
            >
              📁 Browse
            </button>

            <button
              type="submit"
              disabled={!user || posting || (!newContent.trim() && !selectedFile)}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-black rounded-xl shadow-lg shadow-cyan-500/10 transition cursor-pointer text-xs"
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

        {/* Posts Stream */}
        {loading ? (
          <LoadingSpinner text="Loading feed posts..." />
        ) : posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="Be the first to share an opportunity, question, or career update with the community!"
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const isLiked = post.likes?.some(
                (id) => id === user?._id || id?._id === user?._id
              );
              const isAuthor =
                post.author?._id === user?._id || post.author === user?._id;

              return (
                <div
                  key={post._id}
                  className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4 hover:border-slate-700/80 transition"
                >
                  {/* Post Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <UserAvatar
                        src={post.author?.profilePhoto}
                        name={post.author?.name}
                        size="md"
                      />
                      <div>
                        <div className="font-extrabold text-white text-sm">
                          {post.author?.name || 'Community Member'}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {post.author?.headline ||
                            `${post.author?.role === 'alumni' ? 'Alumni' : 'Student'} • ${post.author?.company || post.author?.branch || 'CareerBridge'
                            }`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      {isAuthor && (
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="text-slate-500 hover:text-rose-400 text-xs p-1"
                          title="Delete Post"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Text */}
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {post.content}
                  </p>

                  {/* Media Rendering */}
                  {post.media && post.media.length > 0 && (
                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                      {post.media.map((m, idx) => (
                        <div key={idx}>
                          {m.type === 'image' && (
                            <img
                              src={m.url}
                              alt="Post media"
                              className="w-full max-h-96 object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          {m.type === 'video' && (
                            <video
                              src={m.url}
                              controls
                              className="w-full max-h-96"
                            />
                          )}
                          {m.type === 'document' && (
                            <a
                              href={m.url}
                              download={m.name || 'document'}
                              target="_blank"
                              rel="noreferrer"
                              className="block p-4 text-cyan-400 hover:underline text-xs font-bold"
                            >
                              📄 Download Document: {m.name || 'Attached Document'} ↗
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded-md"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Engagement Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-bold text-slate-400">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${isLiked
                        ? 'text-rose-400 bg-rose-500/10'
                        : 'hover:text-cyan-400 hover:bg-slate-800'
                        }`}
                    >
                      {isLiked ? '❤️' : '🤍'} {post.likes?.length || 0} Likes
                    </button>

                    <button
                      onClick={() =>
                        setActiveCommentPostId(
                          activeCommentPostId === post._id ? null : post._id
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-cyan-400 hover:bg-slate-800 transition cursor-pointer"
                    >
                      💬 {post.comments?.length || 0} Comments
                    </button>

                    <button
                      onClick={() => handleShare(post._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-cyan-400 hover:bg-slate-800 transition cursor-pointer"
                    >
                      ↗️ {post.sharesCount || 0} Share
                    </button>
                  </div>

                  {/* Comments Section */}
                  {activeCommentPostId === post._id && (
                    <div className="pt-3 border-t border-slate-800/60 space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post._id);
                          }}
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-400"
                        >
                          Send
                        </button>
                      </div>

                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {post.comments.map((c) => (
                            <div
                              key={c._id}
                              className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl flex justify-between items-start text-xs"
                            >
                              <div>
                                <span className="font-extrabold text-slate-200 mr-2">
                                  {c.author?.name || 'Member'}:
                                </span>
                                <span className="text-slate-300">{c.text}</span>
                              </div>
                              {(c.author?._id === user?._id || user?.role === 'admin') && (
                                <button
                                  onClick={() => handleDeleteComment(post._id, c._id)}
                                  className="text-slate-500 hover:text-rose-400 ml-2"
                                  title="Delete comment"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Opportunities & Community */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="font-extrabold text-white text-sm">Quick Actions</h3>
          <div className="space-y-2">
            <a
              href="/ai-studio"
              className="block p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition"
            >
              🤖 Build Resume / Portfolio
            </a>
            <a
              href="/jobs"
              className="block p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold hover:border-slate-700 transition"
            >
              💼 Browse Jobs & Referrals
            </a>
            <a
              href="/network"
              className="block p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold hover:border-slate-700 transition"
            >
              👥 Manage Connections
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
