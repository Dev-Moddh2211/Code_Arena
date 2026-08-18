import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#1b2436] bg-[#080c14] py-8 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">
            CA
          </div>
          <span className="font-semibold text-slate-200">Code Arena</span>
          <span className="text-slate-600">·</span>
          <span>Open-Source Online Judge & DSA Platform</span>
        </div>

        {/* Center / Nav */}
        <div className="flex items-center gap-5 text-slate-400">
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-800 bg-[#0d131f] text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title="GitHub Repository"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="font-mono text-[11px]">GitHub</span>
          </a>

          <a
            href="https://www.linkedin.com/in/dev-ashishkumar-moddh-28a505215"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-800 bg-[#0d131f] text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title="LinkedIn Profile"
          >
            <Linkedin className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-mono text-[11px]">LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
