'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { getCurrentUser, logoutSession } from '@/services/auth';
import { UserResponse } from '@/types';
import {
  Menu, X, ArrowRight, User as UserIcon, LogOut,
  LayoutDashboard, Shield, BookOpen, Compass
} from 'lucide-react';

interface NavbarProps {
  transparentOnTop?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ transparentOnTop = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(() => getCurrentUser());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logoutSession();
    setCurrentUser(null);
    router.push('/');
  };

  const isHome = pathname === '/';
  const isTransparent = isHome && transparentOnTop && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent text-white border-b border-white/10'
          : 'bg-[#101419]/95 backdrop-blur-md text-white border-b border-white/10 shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo light={true} />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Link
            href="/plan"
            className="hover:text-[#0FA77A] transition-smooth flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-[#0FA77A]" />
            <span>Plan Trip</span>
          </Link>
          <Link
            href="/stories"
            className="hover:text-[#0FA77A] transition-smooth flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#4D7CFE]" />
            <span>Stories</span>
          </Link>
          <Link
            href="/#corridors"
            className="hover:text-[#0FA77A] transition-smooth"
          >
            Corridors
          </Link>
          <Link
            href="/#how-it-thinks"
            className="hover:text-[#0FA77A] transition-smooth"
          >
            How It Works
          </Link>
          {currentUser && (
            <Link
              href="/dashboard"
              className="hover:text-[#0FA77A] transition-smooth flex items-center gap-1 text-[#4D7CFE]"
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Saved Trips
            </Link>
          )}
          {currentUser?.role.toLowerCase() === 'admin' && (
            <Link
              href="/admin"
              className="text-[#0FA77A] font-bold hover:underline flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>
          )}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <UserIcon className="w-3.5 h-3.5 text-[#0FA77A]" />
                {currentUser.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition-smooth p-1.5"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-smooth px-3 py-1.5"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/plan"
            className="inline-flex items-center justify-center text-xs font-bold bg-[#0FA77A] hover:bg-[#0B8465] text-white px-5 py-2.5 rounded-xl transition-smooth shadow-md gap-1.5"
          >
            <span>Plan a Trip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#101419] border-b border-white/10 px-4 pt-3 pb-6 space-y-3 shadow-2xl">
          <Link
            href="/plan"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-white hover:text-[#0FA77A] py-2 text-sm font-bold uppercase tracking-wider"
          >
            Plan a Trip
          </Link>
          <Link
            href="/stories"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-white hover:text-[#0FA77A] py-2 text-sm font-bold uppercase tracking-wider"
          >
            Travel Stories
          </Link>
          {currentUser && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#4D7CFE] hover:text-white py-2 text-sm font-bold uppercase tracking-wider"
            >
              Saved Trips
            </Link>
          )}
          {currentUser?.role.toLowerCase() === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#0FA77A] font-bold py-2 text-sm uppercase tracking-wider"
            >
              Admin Dashboard
            </Link>
          )}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="w-full text-center text-xs font-semibold text-rose-400 py-2.5 border border-white/10 rounded-xl bg-white/5"
              >
                Sign Out ({currentUser.name})
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-bold uppercase tracking-wider text-white py-2.5 border border-white/20 rounded-xl bg-white/5"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/plan"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-xs font-bold bg-[#0FA77A] text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-md"
            >
              <span>Build My Trip</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
