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
      <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl ${
        light ? 'bg-white/15 text-white' : 'bg-[#246BCE]/10 text-[#246BCE]'
      } transition-all duration-300 group-hover:scale-105 shadow-xs`}>
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="19" r="2.5" />
          <circle cx="19" cy="5" r="2.5" />
          <path d="M7 17L17 7" />
          <path d="M11 17h6v-6" />
        </svg>
      </div>

      <span className={`text-xl font-black tracking-tight font-sans ${
        light ? 'text-white' : 'text-[#193451]'
      }`}>
        NAVIX<span className="text-[#F46F58]">.</span>
      </span>
    </Link>
  );
};
