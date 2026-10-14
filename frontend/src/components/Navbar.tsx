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

interface NavbarProps {
  transparentOnHero?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ transparentOnHero = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

  useEffect(() => {
    if (!transparentOnHero) return;

    const handleScroll = () => {
      const scrolled = window.scrollY > 60;
      setIsScrolled(scrolled);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparentOnHero]);

  const handleLogout = () => {
    logoutSession();
    setCurrentUser(null);
    router.push('/');
  };

  const isTransparent = transparentOnHero && !isScrolled;

  const navLinks = [
    { label: 'Explore', href: '/explore', icon: MapPin },
    { label: 'Plan Trip', href: '/plan', icon: Compass },
    { label: 'Stories', href: '/stories', icon: BookOpen },
    { label: 'My Trips', href: '/dashboard', icon: Bookmark },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        isTransparent
          ? 'bg-gradient-to-b from-[#0C1820]/80 via-[#0C1820]/40 to-transparent border-b border-white/10 text-white'
          : 'bg-[#FBF7F1]/95 backdrop-blur-md border-b border-[#EBDCC7]/80 shadow-xs text-[#142A38]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Logo light={isTransparent} />
          <span
            className={`hidden sm:inline-flex items-center text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full border transition-colors ${
              isTransparent
                ? 'text-white/90 bg-white/15 border-white/20'
                : 'text-[#1F6E78] bg-[#1F6E78]/10 border-[#1F6E78]/20'
            }`}
          >
            India Travel
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          className={`hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider transition-colors ${
            isTransparent ? 'text-white/90' : 'text-[#66757F]'
          }`}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 transition-colors duration-200 py-1.5 ${
                  isActive
                    ? isTransparent
                      ? 'text-white border-b-2 border-white'
                      : 'text-[#1F6E78] border-b-2 border-[#1F6E78]'
                    : isTransparent
                    ? 'hover:text-white'
                    : 'hover:text-[#142A38]'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive
                      ? isTransparent
                        ? 'text-white'
                        : 'text-[#1F6E78]'
                      : isTransparent
                      ? 'text-white/70'
                      : 'text-[#8E9BA4]'
                  }`}
                />
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
            className={`p-2 rounded-full transition-colors ${
              isTransparent
                ? 'text-white/80 hover:text-white hover:bg-white/10'
                : 'text-[#64748B] hover:text-[#193451] hover:bg-black/5'
            }`}
          >
            <Search className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            aria-label="Saved trips"
            className={`p-2 rounded-full transition-colors relative ${
              isTransparent
                ? 'text-white/80 hover:text-white hover:bg-white/10'
                : 'text-[#64748B] hover:text-[#193451] hover:bg-black/5'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </Link>

          {currentUser ? (
            <div
              className={`flex items-center gap-2.5 pl-3 border-l ${
                isTransparent ? 'border-white/20' : 'border-[#EADBCE]'
              }`}
            >
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors shadow-xs ${
                  isTransparent
                    ? 'text-white bg-white/20 hover:bg-white/30 border border-white/30'
                    : 'text-[#193451] bg-white hover:bg-[#F7EFE4] border border-[#EADBCE]'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#246BCE] text-white flex items-center justify-center text-[10px] font-black">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <span>{currentUser.name || 'Traveler'}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={`p-1.5 rounded-full transition-colors ${
                  isTransparent
                    ? 'text-white/70 hover:text-rose-400 hover:bg-white/10'
                    : 'text-[#64748B] hover:text-rose-600 hover:bg-rose-50'
                }`}
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className={`flex items-center gap-3 pl-3 border-l ${
                isTransparent ? 'border-white/20' : 'border-[#EADBCE]'
              }`}
            >
              <Link
                href="/login"
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                  isTransparent
                    ? 'text-white/90 hover:text-white'
                    : 'text-[#475569] hover:text-[#193451]'
                }`}
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
            className={`p-2 rounded-full ${
              isTransparent ? 'text-white hover:bg-white/10' : 'text-[#64748B] hover:bg-black/5'
            }`}
          >
            <Search className="w-5 h-5" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl ${
              isTransparent ? 'text-white hover:bg-white/10' : 'text-[#193451] hover:bg-black/5'
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFF9F2] text-[#193451] border-b border-[#EADBCE] px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
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
                    isActive
                      ? 'bg-[#246BCE]/10 text-[#246BCE] border border-[#246BCE]/20'
                      : 'text-[#475569] hover:bg-white hover:text-[#193451]'
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
