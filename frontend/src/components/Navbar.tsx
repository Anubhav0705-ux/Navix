'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { getCurrentUser, logoutSession } from '@/services/auth';
import { UserResponse } from '@/types';
import { Menu, X, ArrowRight, User as UserIcon, LogOut, LayoutDashboard, Shield, BookOpen } from 'lucide-react';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(() => getCurrentUser());

  const handleLogout = () => {
    logoutSession();
    setCurrentUser(null);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#F7F5F0]/90 backdrop-blur-md border-b border-[#E7E5E0] text-[#0B1320]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo light={false} />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#667085]">
          <Link href="/plan" className="hover:text-[#0B1320] transition-smooth">
            Plan
          </Link>
          <Link href="/stories" className="hover:text-[#0B1320] transition-smooth flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#0E9F7A]" />
            <span>Stories</span>
          </Link>
          <Link href="/#how-it-works" className="hover:text-[#0B1320] transition-smooth">
            How it Works
          </Link>
          <Link href="/#example-journey" className="hover:text-[#0B1320] transition-smooth">
            Explore
          </Link>
          {currentUser && (
            <Link href="/dashboard" className="hover:text-[#0B1320] transition-smooth flex items-center gap-1">
              <LayoutDashboard className="w-3.5 h-3.5 text-[#4C8BF5]" /> Saved Trips
            </Link>
          )}
          {currentUser?.role.toLowerCase() === 'admin' && (
            <Link href="/admin" className="text-[#0E9F7A] font-bold hover:underline flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>
          )}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#0B1320] flex items-center gap-1.5 bg-white border border-[#E7E5E0] px-3 py-1.5 rounded-lg shadow-sm">
                <UserIcon className="w-3.5 h-3.5 text-[#0E9F7A]" />
                {currentUser.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-[#667085] hover:text-red-600 transition-smooth p-1.5"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold text-[#667085] hover:text-[#0B1320] transition-smooth px-3 py-1.5"
            >
              Sign In
            </Link>
          )}

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
          <Link
            href="/stories"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#0B1320] hover:text-[#0E9F7A] py-2 text-sm font-medium"
          >
            Travel Stories
          </Link>
          {currentUser && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#0B1320] hover:text-[#0E9F7A] py-2 text-sm font-medium"
            >
              Saved Trips
            </Link>
          )}
          {currentUser?.role.toLowerCase() === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#0E9F7A] font-bold py-2 text-sm"
            >
              Admin Dashboard
            </Link>
          )}
          <div className="pt-2 flex flex-col gap-2">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="w-full text-center text-xs font-semibold text-red-600 py-2 border border-[#E7E5E0] rounded-lg"
              >
                Sign Out ({currentUser.name})
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-semibold text-[#0B1320] py-2 border border-[#E7E5E0] rounded-lg"
              >
                Sign In
              </Link>
            )}
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
