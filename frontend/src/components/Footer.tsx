import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { Compass, MapPin, Sparkles, BookOpen, Send, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#101419] text-slate-300 border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-5">
            <Logo light={true} />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              NAVIX is the algorithmic, budget-first travel planning platform for India. Tell us your budget — we will build the journey.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0FA77A]/10 border border-[#0FA77A]/30 rounded-full text-xs font-semibold text-[#0FA77A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Go farther. Spend smarter.</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/plan" className="hover:text-[#0FA77A] transition-smooth flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#0FA77A]" />
                  <span>Trip Planner</span>
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-[#0FA77A] transition-smooth flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#4D7CFE]" />
                  <span>Travel Stories</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#0FA77A] transition-smooth">
                  Saved Trips
                </Link>
              </li>
            </ul>
          </div>

          {/* Destinations */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Popular Hubs</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/plan?origin=Sangli&destination=Old+Manali" className="hover:text-[#0FA77A] transition-smooth flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0FA77A]" />
                  <span>Old Manali</span>
                </Link>
              </li>
              <li>
                <Link href="/plan?origin=Sangli&destination=Delhi" className="hover:text-[#0FA77A] transition-smooth flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#4D7CFE]" />
                  <span>Delhi ISBT</span>
                </Link>
              </li>
              <li>
                <Link href="/plan?origin=Sangli&destination=Pune" className="hover:text-[#0FA77A] transition-smooth flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FF6B5D]" />
                  <span>Pune Heritage</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Input */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Travel Dispatch</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Travel ideas worth leaving home for. Delivered weekly.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0FA77A] w-full"
              />
              <button
                type="submit"
                className="bg-[#0FA77A] hover:bg-[#0B8465] text-white p-2 rounded-xl transition-smooth flex-shrink-0"
                title="Subscribe"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p className="flex items-center gap-1.5">
            <span>&copy; {new Date().getFullYear()} NAVIX Travel. Built with</span>
            <Heart className="w-3.5 h-3.5 text-[#FF6B5D] fill-[#FF6B5D]" />
            <span>for budget explorers across India.</span>
          </p>

          <p className="text-[11px] font-mono text-slate-400 bg-white/5 px-3 py-1 rounded-md border border-white/10">
            Powered by NAVIX Multi-Modal Engine &bull; Demo Dataset
          </p>
        </div>
      </div>
    </footer>
  );
};
