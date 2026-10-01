import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', light = false }) => {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* Route node visual: dot - line - dot */}
      <div className={`relative flex items-center justify-center w-7 h-7 rounded-lg ${
        light ? 'bg-white/10 text-emerald-400' : 'bg-[#0E9F7A]/10 text-[#0E9F7A]'
      } transition-smooth group-hover:scale-105`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="19" r="2.5" />
          <circle cx="19" cy="5" r="2.5" />
          <path d="M7 17L17 7" />
          <path d="M11 17h6v-6" />
        </svg>
      </div>

      <span className={`text-xl font-bold tracking-tight font-sans ${
        light ? 'text-white' : 'text-[#0B1320]'
      }`}>
        NAVIX<span className="text-[#0E9F7A]">.</span>
      </span>
    </Link>
  );
};
