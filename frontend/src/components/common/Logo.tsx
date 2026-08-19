import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-9 w-9',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-xl',
  };

  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      {/* Sleek LeetCode / Terminal inspired geometric mark */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full transform group-hover:scale-105 transition-transform duration-200"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA116" />
              <stop offset="100%" stopColor="#FF6B00" />
            </linearGradient>
            <linearGradient id="logo-accent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
          {/* Base stylized arena bracket */}
          <path
            d="M9 7L3 16L9 25"
            stroke="url(#logo-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Accent closing diamond / slash */}
          <path
            d="M23 7L29 16L23 25"
            stroke="url(#logo-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Center core pulse */}
          <circle cx="16" cy="16" r="3" fill="url(#logo-gradient)" />
          <path
            d="M13 16H19"
            stroke="url(#logo-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className={`font-bold tracking-tight flex items-center select-none ${textSizes[size]}`}>
          <span className="text-white">Code</span>
          <span className="text-[#FFA116] ml-0.5">Arena</span>
        </div>
      )}
    </Link>
  );
};
