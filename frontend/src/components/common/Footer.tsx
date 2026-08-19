import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#282828] bg-[#1a1a1a] py-8 text-xs text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-400">Online Judge & Algorithmic Interview Platform</span>
        </div>

        {/* Center / Nav */}
        <div className="flex items-center gap-5 text-neutral-400">
          <Link to="/problems" className="hover:text-white transition-colors">Problems</Link>
          <Link to="/sheets" className="hover:text-white transition-colors">Sheets</Link>
          <Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
        </div>

        {/* Right: Social Profiles */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Dev-Moddh2211/Code_Arena"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#2e2e2e] bg-[#222222] text-neutral-300 hover:text-white hover:border-[#404040] transition-colors"
            title="GitHub Repository"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium">GitHub</span>
          </a>

          <a
            href="https://www.linkedin.com/in/dev-ashishkumar-moddh-28a505215"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#2e2e2e] bg-[#222222] text-neutral-300 hover:text-[#0a66c2] hover:border-[#404040] transition-colors"
            title="LinkedIn Profile"
          >
            <Linkedin className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-[11px] font-medium">LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
