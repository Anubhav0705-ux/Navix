'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { getCurrentUser, logoutSession } from '@/services/auth';
import { UserResponse } from '@/types';
import {
  Menu, X, Compass, BookOpen, Bookmark,
  LogOut, Search, MapPin, ChevronRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(() => {
    if (typeof window !== 'undefined') {
      return getCurrentUser();
    }
    return null;
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setCurrentUser(getCurrentUser());
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  const handleLogout = () => {
    logoutSession();
    setCurrentUser(null);
    router.push('/');
  };

  const navLinks = [
    { label: 'Explore', href: '/explore', icon: MapPin },
    { label: 'Plan Trip', href: '/plan', icon: Compass },
    { label: 'Stories', href: '/stories', icon: BookOpen },
    { label: 'My Trips', href: '/dashboard', icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FFF9F2]/90 backdrop-blur-md border-b border-[#EADBCE]/80 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Logo light={false} />
          <span className="hidden sm:inline-flex items-center text-[10px] font-bold tracking-widest uppercase text-[#F46F58] bg-[#F46F58]/10 px-2.5 py-0.5 rounded-full border border-[#F46F58]/20">
            India Travel
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#475569]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 transition-colors duration-200 py-1.5 text-xs uppercase tracking-wider font-bold ${
                  isActive
                    ? 'text-[#246BCE] border-b-2 border-[#246BCE]'
                    : 'hover:text-[#193451]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#246BCE]' : 'text-[#64748B]'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons / Auth */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/explore"
            aria-label="Search destinations"
            className="p-2 text-[#64748B] hover:text-[#193451] hover:bg-black/5 rounded-full transition-colors"
          >
            <Search className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            aria-label="Saved trips"
            className="p-2 text-[#64748B] hover:text-[#193451] hover:bg-black/5 rounded-full transition-colors relative"
          >
            <Bookmark className="w-4 h-4" />
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#EADBCE]">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-xs font-bold text-[#193451] bg-white hover:bg-[#F7EFE4] border border-[#EADBCE] px-3.5 py-1.5 rounded-full transition-colors shadow-xs"
              >
                <div className="w-5 h-5 rounded-full bg-[#246BCE] text-white flex items-center justify-center text-[10px] font-black">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <span>{currentUser.name || 'Traveler'}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[#64748B] hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-3 border-l border-[#EADBCE]">
              <Link
                href="/login"
                className="text-xs font-bold text-[#475569] hover:text-[#193451] px-3 py-1.5 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-bold text-white bg-[#246BCE] hover:bg-[#1A56A8] px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-[#246BCE]/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/explore"
            aria-label="Search"
            className="p-2 text-[#64748B] hover:bg-black/5 rounded-full"
          >
            <Search className="w-5 h-5" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#193451] hover:bg-black/5 rounded-xl"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFF9F2] border-b border-[#EADBCE] px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl font-bold text-sm ${
                    isActive ? 'bg-[#246BCE]/10 text-[#246BCE] border border-[#246BCE]/20' : 'text-[#475569] hover:bg-white hover:text-[#193451]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#246BCE]' : 'text-[#64748B]'}`} />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#64748B]" />
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#EADBCE]">
            {currentUser ? (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#246BCE] text-white flex items-center justify-center text-xs font-black">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#193451]">{currentUser.name}</div>
                    <div className="text-[10px] text-[#64748B]">{currentUser.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-bold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 text-xs font-bold text-[#193451] bg-white hover:bg-[#F7EFE4] border border-[#EADBCE] rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 text-xs font-bold text-white bg-[#246BCE] hover:bg-[#1A56A8] rounded-xl"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
