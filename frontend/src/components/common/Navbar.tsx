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
  Github,
  Linkedin,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Problems', path: '/problems' },
    { name: 'Sheets', path: '/sheets' },
    { name: 'Daily Challenge', path: '/daily-challenge' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[#1b2436] bg-[#080c14]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Main Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-white tracking-tight">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white font-mono text-xs font-bold shadow-sm">
              CA
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-100">Code Arena</span>
          </Link>

          {/* Links - compact, natural spacing */}
          <div className="hidden md:flex items-center gap-1 text-xs font-medium">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-2.5 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-amber-400 hover:bg-amber-500/10 transition-colors ${
                  location.pathname.startsWith('/admin') ? 'bg-amber-500/10 font-semibold border border-amber-500/20' : ''
                }`}
              >
                <Shield className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Social Links */}
          <div className="hidden sm:flex items-center gap-1 mr-1 border-r border-slate-800 pr-2">
            <a
              href="https://github.com/Dev-Moddh2211/Code_Arena"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="GitHub Repository"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/dev-ashishkumar-moddh-28a505215"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-slate-400 hover:text-[#0a66c2] hover:bg-slate-800 transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-white font-bold text-[10px] uppercase">
                  {user.username.slice(0, 1)}
                </div>
                <span>{user.username}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-slate-700 bg-[#0d131f] p-1 shadow-2xl text-xs z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white">{user.username}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800/80 rounded-lg text-slate-300"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                  </Link>
                  <Link
                    to={`/profile/${user.username}`}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800/80 rounded-lg text-slate-300"
                  >
                    <UserIcon className="h-3.5 w-3.5" /> Public Profile
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800/80 rounded-lg text-slate-300"
                  >
                    <Star className="h-3.5 w-3.5 text-amber-400" /> Bookmarks
                  </Link>
                  <Link
                    to="/submissions"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800/80 rounded-lg text-slate-300"
                  >
                    <History className="h-3.5 w-3.5 text-blue-400" /> My Submissions
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-500/10 text-rose-400 rounded-lg text-left mt-1 border-t border-slate-800"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-500 shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
