import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { Compass, MapPin, Sparkles, BookOpen, Bookmark } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B192C] text-stone-300 border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-5">
            <Logo light={true} />
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              NAVIX is India&apos;s budget-first multi-modal travel platform. We connect trains, buses, stays, and local experiences from your hometown to anywhere in India — mathematically bounded by your total budget.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-900/40 border border-emerald-500/40 rounded-full text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plan India, your way.</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/explore" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>All Destinations</span>
                </Link>
              </li>
              <li>
                <Link href="/plan" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-teal-400" />
                  <span>Trip Planner</span>
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Travel Stories</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                  <span>My Saved Trips</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Guaranteed Demo Corridors */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Featured Corridors</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/plan?origin=Sangli&destination=Manali&budget=40000&travellers=2" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span className="font-semibold text-stone-300">Sangli → Manali</span>
                  <span className="text-[10px] text-emerald-400 font-mono">(Flagship 6-Day)</span>
                </Link>
              </li>
              <li>
                <Link href="/plan?origin=Pune&destination=Goa&budget=25000&travellers=2" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span className="font-semibold text-stone-300">Pune → Goa</span>
                  <span className="text-[10px] text-emerald-400 font-mono">(Fast Coastal Demo)</span>
                </Link>
              </li>
              <li>
                <Link href="/plan?origin=Mumbai&destination=Jaipur&budget=30000&travellers=2" className="hover:text-emerald-400 transition-colors">
                  Mumbai → Jaipur
                </Link>
              </li>
              <li>
                <Link href="/plan?origin=Bengaluru&destination=Mysuru&budget=12000&travellers=2" className="hover:text-emerald-400 transition-colors">
                  Bengaluru → Mysuru
                </Link>
              </li>
              <li>
                <Link href="/plan?origin=Kolkata&destination=Darjeeling&budget=28000&travellers=2" className="hover:text-emerald-400 transition-colors">
                  Kolkata → Darjeeling
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">NAVIX Guarantee</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Deterministic budget constraint:
              <br />
              <span className="font-mono text-emerald-400 text-[11px]">Total ≤ Max Budget</span>
            </p>
            <p className="text-[11px] text-stone-500">
              No hidden booking charges. No broken itineraries.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 NAVIX Travel Technologies Inc. Designed & engineered for Indian travelers.</p>
          <div className="flex items-center gap-6">
            <Link href="/explore" className="hover:text-stone-300 transition-colors">Explore</Link>
            <Link href="/stories" className="hover:text-stone-300 transition-colors">Stories</Link>
            <Link href="/plan" className="hover:text-stone-300 transition-colors">Planner</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
