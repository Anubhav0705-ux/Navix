'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { Menu, X, ArrowRight, Lock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthToast, setShowAuthToast] = useState(false);

  const handleSignInClick = () => {
    setShowAuthToast(true);
    setTimeout(() => setShowAuthToast(false), 3000);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#F7F5F0]/90 backdrop-blur-md border-b border-[#E7E5E0] text-[#0B1320]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo light={false} />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#667085]">
          <Link href="/plan" className="hover:text-[#0B1320] transition-smooth">
            Plan
          </Link>
          <a href="#how-it-works" className="hover:text-[#0B1320] transition-smooth">
            How it Works
          </a>
          <a href="#example-journey" className="hover:text-[#0B1320] transition-smooth">
            Explore
          </a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-5">
          <button
            onClick={handleSignInClick}
            className="text-xs font-semibold text-[#667085] hover:text-[#0B1320] transition-smooth flex items-center gap-1.5"
            title="Authentication available in Phase 9"
          >
            <Lock className="w-3.5 h-3.5 text-[#667085]" />
            Sign In
          </button>

          <Link
            href="/plan"
            className="inline-flex items-center justify-center text-xs font-bold bg-[#0E9F7A] hover:bg-[#0B8465] text-white px-4 py-2 rounded-lg transition-smooth shadow-sm"
          >
            Plan a Trip
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#667085] hover:text-[#0B1320] rounded-lg focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Auth Toast Notice */}
      {showAuthToast && (
        <div className="absolute top-16 right-4 z-50 bg-[#0B1320] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#0E9F7A]" />
          <span>User authentication will be enabled in Phase 9.</span>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E7E5E0] px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <Link
            href="/plan"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#0B1320] hover:text-[#0E9F7A] py-2 text-sm font-medium"
          >
            Plan
          </Link>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#0B1320] hover:text-[#0E9F7A] py-2 text-sm font-medium"
          >
            How it Works
          </a>
          <a
            href="#example-journey"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#0B1320] hover:text-[#0E9F7A] py-2 text-sm font-medium"
          >
            Explore
          </a>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleSignInClick}
              className="w-full text-center text-xs font-semibold text-[#667085] py-2 border border-[#E7E5E0] rounded-lg"
            >
              Sign In
            </button>
            <Link
              href="/plan"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-xs font-bold bg-[#0E9F7A] text-white py-2.5 rounded-lg flex items-center justify-center gap-2"
            >
              <span>Plan a Trip</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
