import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { Heart, Compass, MapPin, Sparkles, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFFFFF] text-[#667085] border-t border-[#E7E5E0] pt-14 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Info & Mission Statement */}
          <div className="space-y-4 md:col-span-4">
            <Logo light={false} />
            <p className="text-sm text-[#667085] leading-relaxed max-w-sm">
              Connecting Tier-2 &amp; Tier-3 Indian cities to incredible budget destinations. We solve your whole journey under one total budget cap.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0E9F7A]/10 border border-[#0E9F7A]/20 rounded-full text-xs font-semibold text-[#0E9F7A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Built for budget travelers exploring India</span>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#0B1320] uppercase tracking-wider">Planner</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/plan" className="hover:text-[#0E9F7A] transition-smooth flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#0E9F7A]" />
                  <span>Start Planning</span>
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#0E9F7A] transition-smooth">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#0E9F7A] transition-smooth">
                  Saved Trips
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-[#0B1320] uppercase tracking-wider">Stories &amp; Community</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/stories" className="hover:text-[#0E9F7A] transition-smooth flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#4C8BF5]" />
                  <span>Travel Stories &amp; Guides</span>
                </Link>
              </li>
              <li>
                <Link href="/stories/old-manali-under-20k" className="hover:text-[#0E9F7A] transition-smooth">
                  Old Manali under ₹20k
                </Link>
              </li>
              <li>
                <Link href="/stories/pune-heritage-weekend" className="hover:text-[#0E9F7A] transition-smooth">
                  Pune Heritage Weekend
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-[#0B1320] uppercase tracking-wider">Popular Corridors</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/plan?origin=Sangli&destination=Old+Manali" className="hover:text-[#0E9F7A] transition-smooth flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0E9F7A]" />
                  <span>Sangli &rarr; Old Manali</span>
                </Link>
              </li>
              <li>
                <Link href="/plan?origin=Miraj&destination=Manali" className="hover:text-[#0E9F7A] transition-smooth flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#4C8BF5]" />
                  <span>Miraj &rarr; Manali</span>
                </Link>
              </li>
              <li>
                <Link href="/plan?origin=Pune&destination=Delhi" className="hover:text-[#0E9F7A] transition-smooth flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#667085]" />
                  <span>Pune &rarr; Delhi</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E7E5E0] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#667085] gap-4">
          <p className="flex items-center gap-1">
            <span>&copy; {new Date().getFullYear()} NAVIX Travel. Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for real Indian journeys.</span>
          </p>
          <p className="italic font-serif text-[#0B1320] text-xs">
            &ldquo;Travel smarter. Explore more.&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
};
