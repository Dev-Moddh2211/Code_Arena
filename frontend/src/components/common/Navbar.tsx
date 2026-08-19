import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Star,
  History,
  LogOut,
  User as UserIcon,
  ChevronDown,
  LayoutDashboard,
  Search,
  Flame,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/problems?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Problems', path: '/problems' },
    { name: 'Sheets', path: '/sheets' },
    { name: 'Submissions', path: '/submissions' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#282828] bg-[#1a1a1a] text-slate-200">
      <div className="mx-auto flex h-13 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        {/* Left: Brand & Navigation Links */}
        <div className="flex items-center gap-6">
          <Logo size="md" />

          {/* Navigation Links - LeetCode Style */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path === '/problems' && location.pathname.startsWith('/problems/'));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-md font-normal transition-colors relative ${
                    isActive
                      ? 'text-white font-medium after:absolute after:bottom-[-9px] after:left-3 after:right-3 after:h-[2px] after:bg-[#FFA116] after:rounded-full'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-amber-400 hover:text-amber-300 font-normal transition-colors ${
                  location.pathname.startsWith('/admin') ? 'font-medium' : ''
                }`}
              >
                <Shield className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right: Search, Streak, Notifications, Profile / Auth */}
        <div className="flex items-center gap-3">
          {/* LeetCode-style Search Pill */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems..."
              className="h-8 w-44 lg:w-56 rounded-full bg-[#282828] pl-8 pr-3 text-xs text-neutral-200 placeholder-neutral-500 border border-transparent focus:border-[#404040] focus:bg-[#323232] focus:outline-none transition-all"
            />
          </form>

          {/* Streak Counter */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
            title="Daily Practice Streak: 0 days"
          >
            <Flame className="h-4 w-4 text-[#FFA116]" />
            <span className="font-mono text-xs">0</span>
          </div>

          {/* Notification Bell */}
          <button
            className="relative p-1.5 text-neutral-400 hover:text-neutral-200 rounded-full hover:bg-[#282828] transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#FFA116]" />
          </button>

          {/* Premium / Pro Pill Badge */}
          <Link
            to="/sheets"
            className="hidden lg:flex items-center gap-1.5 rounded-full bg-[#ffa116]/15 hover:bg-[#ffa116]/25 border border-[#ffa116]/30 px-3 py-1 text-xs font-semibold text-[#ffa116] transition-colors"
          >
            <Sparkles className="h-3 w-3 text-[#ffa116]" />
            <span>Interview Prep</span>
          </Link>

          {/* User Menu / Auth Buttons */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 rounded-full p-0.5 hover:ring-2 hover:ring-[#404040] transition-all"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/90 text-white font-bold text-xs uppercase shadow-sm">
                  {user.username.slice(0, 1)}
                </div>
                <ChevronDown className="h-3 w-3 text-neutral-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#2e2e2e] bg-[#222222] p-1.5 shadow-2xl text-xs z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#2e2e2e]">
                    <p className="font-semibold text-white">{user.username}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#2e2e2e] rounded-lg text-neutral-300 transition-colors"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-neutral-400" /> Dashboard
                    </Link>
                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#2e2e2e] rounded-lg text-neutral-300 transition-colors"
                    >
                      <UserIcon className="h-3.5 w-3.5 text-neutral-400" /> Public Profile
                    </Link>
                    <Link
                      to="/favorites"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#2e2e2e] rounded-lg text-neutral-300 transition-colors"
                    >
                      <Star className="h-3.5 w-3.5 text-[#FFA116]" /> Bookmarks
                    </Link>
                    <Link
                      to="/submissions"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#2e2e2e] rounded-lg text-neutral-300 transition-colors"
                    >
                      <History className="h-3.5 w-3.5 text-sky-400" /> My Submissions
                    </Link>
                  </div>
                  <div className="border-t border-[#2e2e2e] pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-500/10 text-rose-400 rounded-lg text-left transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-neutral-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-[#282828] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-[#FFA116] hover:bg-[#ffb038] text-neutral-900 px-3.5 py-1.5 text-xs font-bold transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
