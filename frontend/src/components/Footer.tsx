import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { Compass, MapPin, Sparkles, BookOpen, Bookmark } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#193451] text-[#E2E8F0] border-t border-[#12283E] pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-5">
            <Logo light={true} />
            <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm">
              NAVIX is India&apos;s budget-first multi-modal travel platform. We connect trains, buses, stays, and curated regional experiences from Tier-2 and Tier-3 cities to anywhere in India — mathematically bounded by your budget.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/15 rounded-full text-xs font-bold text-[#F7C963]">
              <Sparkles className="w-3.5 h-3.5 text-[#F7C963]" />
              <span>Go further. Plan smarter.</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-xs text-[#CBD5E1]">
              <li>
                <Link href="/explore" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F46F58]" />
                  <span>All Destinations</span>
                </Link>
              </li>
              <li>
                <Link href="/plan" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Trip Planner</span>
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#F7C963]" />
                  <span>Travel Stories</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-[#BFE8D6]" />
                  <span>My Saved Trips</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Guaranteed Demo Corridors */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Popular Corridors</h4>
            <ul className="space-y-2.5 text-xs text-[#CBD5E1]">
              <li>
                <Link href="/plan?origin=Sangli&destination=Manali&budget=40000&travellers=2" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="font-semibold text-white">Sangli → Manali</span>
                  <span className="text-[10px] text-[#F7C963] font-mono">(Himalayan)</span>
                </Link>
              </li>
              <li>
                <Link href="/plan?origin=Pune&destination=Goa&budget=25000&travellers=2" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="font-semibold text-white">Pune → Goa</span>
                  <span className="text-[10px] text-[#BFE8D6] font-mono">(Coastal)</span>
                </Link>
              </li>
              <li>
                <Link href="/plan?origin=Mumbai&destination=Jaipur&budget=28000&travellers=2" className="hover:text-white transition-colors">
                  Mumbai → Jaipur (Royal Heritage)
                </Link>
              </li>
              <li>
                <Link href="/plan?origin=Delhi&destination=Rishikesh&budget=20000&travellers=2" className="hover:text-white transition-colors">
                  Delhi → Rishikesh (Ganga Foothills)
                </Link>
              </li>
              <li>
                <Link href="/plan?origin=Bengaluru&destination=Mysuru&budget=12000&travellers=2" className="hover:text-white transition-colors">
                  Bengaluru → Mysuru (Palace Heritage)
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">The NAVIX Guarantee</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Strict mathematical budget guarantee:
              <br />
              <span className="text-[#F7C963] text-[11px] font-bold block pt-1">Total Trip Cost ≤ Max Budget</span>
            </p>
            <p className="text-[11px] text-[#94A3B8]">
              Verified multi-modal transfers. Zero hidden surprises.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>© 2026 NAVIX Travel Technologies. Designed & engineered for India.</p>
          <div className="flex items-center gap-6">
            <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
            <Link href="/stories" className="hover:text-white transition-colors">Stories</Link>
            <Link href="/plan" className="hover:text-white transition-colors">Planner</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
