import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', light = false }) => {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 group ${className}`}>
      {/* Visual Route Node Symbol */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 group-hover:border-emerald-400 transition-smooth">
        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="18" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <path d="M8.2 16.2L15.8 7.8" />
          <path d="M12 12l2.5 2.5" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`text-xl font-black tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
          NAVIX<span className="text-emerald-400">.</span>
        </span>
      </div>
    </Link>
  );
};
