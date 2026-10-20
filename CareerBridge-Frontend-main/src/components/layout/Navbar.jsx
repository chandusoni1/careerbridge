import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext, useTheme } from '../../stores';
import { searchApi } from '../../services/search.api';
import { notificationsApi } from '../../services/notifications.api';
import { UserAvatar } from '../common/UserAvatar';

export const Navbar = ({ user: propUser, setUser: propSetUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuthContext();
  const user = propUser || auth.user;
  const { theme, toggleTheme } = useTheme();

  // Poll for notifications if logged in
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      if (document.hidden) return;
      try {
        const [list, countRes] = await Promise.all([
          notificationsApi.getNotifications(),
          notificationsApi.getUnreadCount(),
        ]);
        if (Array.isArray(list)) setNotifications(list);
        if (countRes) setUnreadCount(countRes.unreadCount || 0);
      } catch (err) {
        // Silent catch for background notification poll
      }
    };

    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, [user]);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delay = setTimeout(async () => {
      try {
        const results = await searchApi.searchGlobal(searchQuery.trim());
        setSearchResults(results);
      } catch {
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleLogout = () => {
    if (propSetUser) propSetUser(null);
    auth.logout();
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { to: '/home', label: 'Feed' },
    { to: '/network', label: 'Network' },
    { to: '/directory', label: 'Directory' },
    { to: '/jobs', label: 'Jobs & Referrals' },
    { to: '/messages', label: 'Messages 💬' },
    { to: '/ai-studio', label: 'AI Studio 🤖' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white px-4 md:px-8 py-3.5 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        {/* Logo */}
        <div className="font-extrabold text-2xl text-cyan-400 tracking-wider shrink-0">
          <Link to={user ? '/home' : '/login'}>CareerBridge 🚀</Link>
        </div>

        {/* Global Search Bar (when user logged in) */}
        {user && (
          <div className="relative flex-1 max-w-xs md:max-w-md hidden sm:block">
            <input
              type="text"
              placeholder="Search members, jobs, posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            {/* Instant Search Results Dropdown */}
            {searchResults && (
              <div className="absolute top-10 left-0 w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50 max-h-80 overflow-y-auto">
                {searchResults.users?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">
                      Members
                    </span>
                    <div className="space-y-1 mt-1">
                      {searchResults.users.map((u) => (
                        <Link
                          key={u._id}
                          to={`/profile/${u._id}`}
                          onClick={() => setSearchQuery('')}
                          className="flex items-center gap-2.5 p-2 hover:bg-slate-800 rounded-xl text-xs transition"
                        >
                          <UserAvatar
                            src={u.profilePhoto}
                            name={u.name}
                            size="sm"
                          />
                          <div className="overflow-hidden">
                            <span className="font-bold text-white block truncate">{u.name}</span>
                            <span className="text-slate-400 text-[11px] block truncate">
                              {u.headline || `${u.role ? u.role.toUpperCase() : 'Member'} • ${u.company || u.college || 'CareerBridge'}`}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.jobs?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                      Jobs
                    </span>
                    <div className="space-y-1 mt-1">
                      {searchResults.jobs.map((j) => (
                        <Link
                          key={j._id}
                          to="/jobs"
                          onClick={() => setSearchQuery('')}
                          className="flex items-center gap-2.5 p-2 hover:bg-slate-800 rounded-xl text-xs transition"
                        >
                          <UserAvatar
                            src={j.postedBy?.profilePhoto}
                            name={j.company || j.title}
                            size="sm"
                          />
                          <div className="overflow-hidden">
                            <div className="font-bold text-white truncate">{j.title}</div>
                            <div className="text-slate-400 text-[11px] truncate">{j.company}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {(!searchResults.users?.length && !searchResults.jobs?.length) && (
                  <div className="text-slate-500 text-xs py-2 text-center">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-5 text-xs font-bold text-slate-300">
          {user ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`transition ${
                    location.pathname === link.to
                      ? 'text-cyan-400 font-extrabold'
                      : 'hover:text-cyan-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Notifications Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-300 hover:text-cyan-400 transition cursor-pointer"
                  title="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-10 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-black text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-cyan-400 font-bold hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="text-slate-500 text-xs py-4 text-center">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n._id}
                            className={`p-2.5 rounded-xl border text-xs ${
                              n.read
                                ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                                : 'bg-cyan-500/10 border-cyan-500/30 text-slate-200 font-semibold'
                            }`}
                          >
                            <p className="text-[11px] leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-slate-500">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Link & Logout */}
              <div className="flex items-center space-x-3 border-l border-slate-700 pl-4">
                <Link
                  to="/profile"
                  className="text-cyan-400 font-black text-xs hover:underline flex items-center gap-2"
                >
                  <UserAvatar
                    src={user?.profilePhoto}
                    name={user?.name}
                    size="xs"
                    className="border border-cyan-500/40"
                  />
                  <span>{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-xl transition cursor-pointer text-xs"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 font-bold rounded-xl text-slate-300 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 font-black rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700/60 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <>
                <span className="text-sm">☀️</span>
                <span className="hidden xl:inline text-[11px] text-slate-300 font-bold">Light</span>
              </>
            ) : (
              <>
                <span className="text-sm">🌙</span>
                <span className="hidden xl:inline text-[11px] text-slate-700 font-bold">Dark</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-cyan-400 p-1 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs font-bold text-slate-300">
          {user ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`block py-1.5 hover:text-cyan-400 ${
                    location.pathname === link.to ? 'text-cyan-400 font-extrabold' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="text-cyan-400 font-bold flex items-center gap-2 text-xs"
                >
                  <UserAvatar
                    src={user?.profilePhoto}
                    name={user?.name}
                    size="xs"
                  />
                  <span>{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex-1 text-center py-2 bg-slate-800 rounded-xl"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="flex-1 text-center py-2 bg-cyan-500 text-slate-950 font-black rounded-xl"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Theme Toggle */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-xs">Theme: {theme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-amber-300 font-bold text-xs flex items-center gap-1.5"
            >
              {theme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
