import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'easy' | 'medium' | 'hard' | 'neutral' | 'accent' | 'draft' | 'published' | 'archived';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    hard: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
    accent: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    archived: 'bg-slate-800/60 text-slate-500 border-slate-800',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-sans capitalize ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
