import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#101923] text-[#E2E8F0] border-t border-[#1E293B] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
          {/* Brand & Editorial Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Logo light={true} />
            <span className="hidden sm:inline text-white/30 text-sm">|</span>
            <p className="text-sm text-[#94A3B8] font-medium">
              Discover India. Plan your journey.
            </p>
          </div>

          {/* Essential Navigation Links */}
          <nav className="flex items-center gap-6 text-xs uppercase tracking-wider font-bold text-[#CBD5E1]">
            <Link href="/explore" className="hover:text-white transition-colors">
              Explore
            </Link>
            <Link href="/plan" className="hover:text-white transition-colors">
              Plan Trip
            </Link>
            <Link href="/stories" className="hover:text-white transition-colors">
              Stories
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              My Trips
            </Link>
          </nav>
        </div>

        {/* Minimal Copyright & Legal Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <p>© 2026 NAVIX Project. Built for India.</p>
            <span className="hidden sm:inline text-white/20">|</span>
            <Link href="/privacy" className="hover:text-[#94A3B8] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#94A3B8] transition-colors">
              Terms of Service
            </Link>
          </div>
          <p className="text-[11px] text-[#475569]">
            Algorithmic multimodal routing under budget constraints.
          </p>
        </div>
      </div>
    </footer>
  );
};
