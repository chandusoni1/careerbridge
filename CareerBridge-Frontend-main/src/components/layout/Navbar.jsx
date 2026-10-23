import React, { useState, useEffect, useRef } from 'react';
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
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuthContext();
  const user = propUser || auth.user;
  const { theme, themePreference, setThemePreference } = useTheme();

  // Refs for Smart Menu outside-click detection
  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileToggleRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);
  const themeMenuRef = useRef(null);

  // Close menus on route navigation
  useEffect(() => {
    setIsOpen(false);
    setShowNotifications(false);
    setSearchResults(null);
    setShowThemeMenu(false);
  }, [location.pathname]);

  // SMART MENU BEHAVIOR (Feature 2):
  // 1. Toggles on button click
  // 2. Closes on click outside
  // 3. Closes on page scroll
  // 4. Closes on Escape key press
  // 5. Cleans up event listeners properly
  useEffect(() => {
    const hasOpenMenu =
      isOpen || showNotifications || Boolean(searchResults) || showThemeMenu;

    if (!hasOpenMenu) return;

    const handleClickOutside = (e) => {
      // Mobile menu outside click check (exclude toggle button to allow toggle)
      if (
        isOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        mobileToggleRef.current &&
        !mobileToggleRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }

      // Notifications dropdown outside click
      if (
        showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }

      // Search results dropdown outside click
      if (
        searchResults &&
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setSearchResults(null);
      }

      // Theme menu dropdown outside click
      if (
        showThemeMenu &&
        themeMenuRef.current &&
        !themeMenuRef.current.contains(e.target)
      ) {
        setShowThemeMenu(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
      if (showNotifications) setShowNotifications(false);
      if (searchResults) setSearchResults(null);
      if (showThemeMenu) setShowThemeMenu(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isOpen) setIsOpen(false);
        if (showNotifications) setShowNotifications(false);
        if (searchResults) setSearchResults(null);
        if (showThemeMenu) setShowThemeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showNotifications, searchResults, showThemeMenu]);

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
      } catch {
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

  const getThemeIcon = () => {
    if (themePreference === 'system') return '💻';
    if (themePreference === 'light') return '☀️';
    return '🌙';
  };

  const getThemeLabel = () => {
    if (themePreference === 'system') return `System (${theme === 'dark' ? 'Dark' : 'Light'})`;
    if (themePreference === 'light') return 'Light';
    return 'Dark';
  };

  return (
    <nav
      ref={navRef}
      className="bg-slate-900 border-b border-slate-800 text-white px-4 md:px-8 py-3.5 sticky top-0 z-50 shadow-xl"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        {/* Logo */}
        <div className="font-extrabold text-2xl text-cyan-400 tracking-wider shrink-0">
          <Link to={user ? '/home' : '/login'}>CareerBridge 🚀</Link>
        </div>

        {/* Global Live Search Bar */}
        {user && (
          <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search alumni, students, skills, jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-9 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-500">
                🔍
              </span>
              {isSearching && (
                <span className="absolute right-3 top-2.5 text-xs text-cyan-400 animate-spin">
                  ⏳
                </span>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults && (
              <div className="absolute left-0 right-0 top-11 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 space-y-3 z-50 max-h-96 overflow-y-auto animate-fade-in">
                {searchResults.users?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      People
                    </span>
                    <div className="mt-1 space-y-1">
                      {searchResults.users.map((u) => (
                        <Link
                          key={u._id}
                          to={`/profile/${u._id}`}
                          onClick={() => {
                            setSearchResults(null);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800/80 transition text-xs"
                        >
                          <UserAvatar
                            src={u.profilePhoto}
                            name={u.name}
                            size="sm"
                          />
                          <div className="overflow-hidden">
                            <div className="font-bold text-white truncate flex items-center gap-1">
                              <span>{u.name}</span>
                              <span className="text-[10px] font-medium text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded">
                                {u.role}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px] truncate">
                              {u.headline || u.company || u.college || 'CareerBridge Member'}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.jobs?.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Jobs & Referrals
                    </span>
                    <div className="mt-1 space-y-1">
                      {searchResults.jobs.map((j) => (
                        <Link
                          key={j._id}
                          to="/jobs"
                          onClick={() => {
                            setSearchResults(null);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800/80 transition text-xs"
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

                {!searchResults.users?.length && !searchResults.jobs?.length && (
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
              <div ref={notificationsRef} className="relative">
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative p-2 text-slate-300 hover:text-cyan-400 transition cursor-pointer"
                  title="Notifications"
                  aria-label="Toggle notifications menu"
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
                  <div className="absolute right-0 top-10 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-black text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-cyan-400 font-bold hover:underline cursor-pointer"
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

          {/* Feature 6: Theme Selector (System Default / Light / Dark) */}
          <div ref={themeMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowThemeMenu((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700/60 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title={`Current Theme: ${getThemeLabel()}. Click to change.`}
              aria-label="Theme selector"
            >
              <span className="text-sm">{getThemeIcon()}</span>
              <span className="hidden xl:inline text-[11px] text-slate-300 font-bold">
                {themePreference === 'system' ? 'System' : themePreference === 'light' ? 'Light' : 'Dark'}
              </span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {/* Theme Selector Dropdown Menu */}
            {showThemeMenu && (
              <div className="absolute right-0 top-11 w-44 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1 animate-fade-in text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setThemePreference('system');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                    themePreference === 'system'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>💻</span>
                    <span>System Default</span>
                  </span>
                  {themePreference === 'system' && <span>✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setThemePreference('light');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                    themePreference === 'light'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>☀️</span>
                    <span>Light Mode</span>
                  </span>
                  {themePreference === 'light' && <span>✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setThemePreference('dark');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                    themePreference === 'dark'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🌙</span>
                    <span>Dark Mode</span>
                  </span>
                  {themePreference === 'dark' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          ref={mobileToggleRef}
          className="lg:hidden text-cyan-400 p-1 cursor-pointer focus:outline-none"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle Navigation Menu"
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

      {/* Mobile Drawer Menu (Smart open/close) */}
      {isOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs font-bold text-slate-300 animate-fade-in"
        >
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
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold cursor-pointer"
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

          {/* Mobile Theme Selector (System / Light / Dark) */}
          <div className="pt-2.5 border-t border-slate-800 space-y-1.5">
            <span className="text-slate-400 text-[11px] block">
              Appearance Theme: <span className="text-cyan-400 font-bold">{getThemeLabel()}</span>
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setThemePreference('system');
                  setIsOpen(false);
                }}
                className={`py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition ${
                  themePreference === 'system'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>💻</span>
                <span>System</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setThemePreference('light');
                  setIsOpen(false);
                }}
                className={`py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition ${
                  themePreference === 'light'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>☀️</span>
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setThemePreference('dark');
                  setIsOpen(false);
                }}
                className={`py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition ${
                  themePreference === 'dark'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>🌙</span>
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
