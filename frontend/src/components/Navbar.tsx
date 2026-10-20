'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { getCurrentUser, logoutSession, subscribeAuth } from '@/services/auth';
import { UserResponse } from '@/types';
import {
  Menu, X, Compass, BookOpen, Bookmark,
  LogOut, MapPin, ChevronDown, Shield
} from 'lucide-react';

interface NavbarProps {
  transparentOnHero?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ transparentOnHero = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const currentUser = useSyncExternalStore(subscribeAuth, getCurrentUser, () => null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menus on route transitions
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
  }

  // Handle scroll effect when transparentOnHero is enabled
  useEffect(() => {
    if (!transparentOnHero) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparentOnHero]);

  // Dismiss dropdown on outside click or Escape key
  useEffect(() => {
    if (!accountDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountDropdownOpen]);

  const handleLogout = () => {
    logoutSession();
    setAccountDropdownOpen(false);
    router.push('/');
  };

  const isTransparent = transparentOnHero && !isScrolled;

  // Guest sees ONLY Explore and Stories as public navigation destinations
  const guestNavLinks = [
    { label: 'Explore', href: '/explore', icon: MapPin },
    { label: 'Stories', href: '/stories', icon: BookOpen },
  ];

  // Authenticated user sees Explore, Stories, and prominent Plan a Trip action
  const authenticatedNavLinks = [
    { label: 'Explore', href: '/explore', icon: MapPin },
    { label: 'Stories', href: '/stories', icon: BookOpen },
    { label: 'Plan a Trip', href: '/plan', icon: Compass, isAction: true },
  ];

  const activeNavLinks = currentUser ? authenticatedNavLinks : guestNavLinks;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-gradient-to-b from-[#0C1820]/85 via-[#0C1820]/45 to-transparent border-b border-white/10 text-white'
          : 'bg-[#FBF7F1]/95 backdrop-blur-md border-b border-[#EBDCC7]/90 shadow-xs text-[#142A38]'
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
          aria-label="Main Navigation"
        >
          {activeNavLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;

            if ('isAction' in link && link.isAction) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer ${
                    isTransparent
                      ? 'bg-[#1F6E78] hover:bg-[#16555E] text-white shadow-[#1F6E78]/30'
                      : 'bg-[#1F6E78] hover:bg-[#16555E] text-white shadow-[#1F6E78]/25'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 transition-colors duration-200 py-1.5 relative cursor-pointer ${
                  isActive
                    ? isTransparent
                      ? 'text-white font-black'
                      : 'text-[#1F6E78] font-black'
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
                {isActive && (
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                      isTransparent ? 'bg-white' : 'bg-[#1F6E78]'
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Account Action */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            /* Authenticated Account Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={accountDropdownOpen}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all border cursor-pointer ${
                  isTransparent
                    ? 'bg-white/15 hover:bg-white/25 border-white/25 text-white'
                    : 'bg-white hover:bg-[#F5ECE1] border-[#EBDCC7] text-[#142A38] shadow-xs'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#1F6E78] text-white flex items-center justify-center text-xs font-black shadow-xs">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'T'}
                </div>
                <span className="text-xs font-bold max-w-[120px] truncate">
                  {currentUser.name?.split(' ')[0] || 'Traveler'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    accountDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {accountDropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 bg-white border border-[#EBDCC7] rounded-2xl shadow-xl p-2.5 z-50 text-[#142A38] animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* User Profile Header */}
                  <div className="px-3 py-2.5 border-b border-[#F0E4D5] mb-1">
                    <p className="text-xs font-bold text-[#142A38] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-[#66757F] truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1F6E78]/10 text-[#1F6E78]">
                      {currentUser.role === 'admin' ? 'Administrator' : 'Traveler Member'}
                    </span>
                  </div>

                  {/* Dropdown Links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#142A38] hover:bg-[#FBF7F1] hover:text-[#1F6E78] transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-[#1F6E78]" />
                      <span>My Trips & Itineraries</span>
                    </Link>

                    {currentUser.role === 'admin' && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#142A38] hover:bg-[#FBF7F1] hover:text-[#1F6E78] transition-colors cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-[#D8A64B]" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-[#F0E4D5] mt-1.5 pt-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged-out Guest Login Button */
            <Link
              href="/login"
              className={`text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                isTransparent
                  ? 'text-white bg-white/20 hover:bg-white/30 border border-white/30 shadow-xs'
                  : 'text-white bg-[#1F6E78] hover:bg-[#16555E] shadow-xs hover:shadow-md hover:shadow-[#1F6E78]/20'
              }`}
            >
              Log in
            </Link>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isTransparent
                ? 'text-white hover:bg-white/10'
                : 'text-[#142A38] hover:bg-black/5'
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFF9F2] text-[#142A38] border-b border-[#EBDCC7] px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {currentUser && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#EBDCC7] shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#1F6E78] text-white flex items-center justify-center text-sm font-black">
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'T'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#142A38] truncate">{currentUser.name}</p>
                <p className="text-[11px] text-[#66757F] truncate">{currentUser.email}</p>
              </div>
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            {activeNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1F6E78]/10 text-[#1F6E78] border border-[#1F6E78]/20'
                      : 'text-[#66757F] hover:bg-white hover:text-[#142A38]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#1F6E78]' : 'text-[#8E9BA4]'}`} />
                    <span>{link.label}</span>
                  </div>
                </Link>
              );
            })}

            {currentUser && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  pathname === '/dashboard'
                    ? 'bg-[#1F6E78]/10 text-[#1F6E78] border border-[#1F6E78]/20'
                    : 'text-[#66757F] hover:bg-white hover:text-[#142A38]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="w-4 h-4 text-[#8E9BA4]" />
                  <span>My Trips</span>
                </div>
              </Link>
            )}
          </nav>

          <div className="pt-2 border-t border-[#EBDCC7]">
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 px-4 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-white bg-[#1F6E78] hover:bg-[#16555E] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
