'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { Compass, Menu, X, ArrowRight, Lock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthToast, setShowAuthToast] = useState(false);

  const handleSignInClick = () => {
    setShowAuthToast(true);
    setTimeout(() => setShowAuthToast(false), 3000);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo light />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/plan" className="hover:text-emerald-400 transition-smooth">
            Plan Trip
          </Link>
          <a href="#how-it-works" className="hover:text-emerald-400 transition-smooth">
            How It Works
          </a>
          <a href="#example-journey" className="hover:text-emerald-400 transition-smooth">
            Explore Demo
          </a>
          <a href="#why-navix" className="hover:text-emerald-400 transition-smooth">
            About
          </a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleSignInClick}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-smooth flex items-center gap-1.5"
            title="Authentication available in Phase 9"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            Sign In
          </button>

          <Link
            href="/plan"
            className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg transition-smooth shadow-lg shadow-emerald-500/10"
          >
            <Compass className="w-4 h-4" />
            Plan a Trip
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Auth Toast Notice */}
      {showAuthToast && (
        <div className="absolute top-16 right-4 z-50 bg-slate-900 border border-emerald-500/40 text-slate-200 text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>JWT Authentication will be enabled in Phase 9.</span>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/plan"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-emerald-400 py-2 text-sm font-medium"
          >
            Plan Trip
          </Link>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-emerald-400 py-2 text-sm font-medium"
          >
            How It Works
          </a>
          <a
            href="#example-journey"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-emerald-400 py-2 text-sm font-medium"
          >
            Explore Demo
          </a>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleSignInClick}
              className="w-full text-center text-xs font-semibold text-slate-400 py-2 border border-slate-800 rounded-lg"
            >
              Sign In (Phase 9)
            </button>
            <Link
              href="/plan"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-xs font-bold bg-emerald-500 text-slate-950 py-2.5 rounded-lg flex items-center justify-center gap-2"
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
