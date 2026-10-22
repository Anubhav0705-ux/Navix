'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, MapPin, Navigation, ArrowRight, Home } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7F1] text-[#142A38] selection:bg-[#1F6E78]/20 selection:text-[#1F6E78]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-20">
        <div className="w-full max-w-3xl mx-auto text-center space-y-8 animate-in fade-in duration-300">
          {/* Visual Route Beacon with Topographic SVG Trail */}
          <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
            {/* Ambient concentric radar rings */}
            <div className="absolute inset-0 rounded-full border-2 border-[#1F6E78]/15 animate-ping opacity-25" />
            <div className="absolute -inset-3 rounded-full border border-dashed border-[#C85A32]/25" />

            {/* Central Compass Card */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white shadow-xl border border-[#EBDCC7] flex items-center justify-center text-[#1F6E78] relative z-10">
              <Compass className="w-10 h-10 sm:w-12 sm:h-12 animate-spin-slow text-[#1F6E78]" />
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#C85A32] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                ?
              </div>
            </div>
          </div>

          {/* Editorial Route Loss Notice */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C85A32]/10 text-[#C85A32] rounded-full text-xs font-bold uppercase tracking-widest border border-[#C85A32]/20">
              <MapPin className="w-3.5 h-3.5" />
              <span>Waypoint Not Found • 404</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-editorial text-[#142A38] tracking-tight max-w-xl mx-auto">
              Looks like you&apos;ve wandered off the map.
            </h1>

            <p className="text-xs sm:text-sm text-[#66757F] max-w-lg mx-auto leading-relaxed">
              Even the best journeys take a wrong turn. The transit node, trail, or destination waypoint you were heading towards hasn&apos;t been charted yet. Let&apos;s get you back on route.
            </p>
          </div>

          {/* Dotted Route Waypoint Diagram */}
          <div className="py-2 flex items-center justify-center gap-2 text-xs text-[#8E9BA4] font-mono">
            <span className="px-2.5 py-1 bg-white rounded-lg border border-[#EBDCC7] text-[#142A38] font-bold">
              Origin: You
            </span>
            <span className="text-[#1F6E78] font-bold tracking-widest">······ ➔</span>
            <span className="px-2.5 py-1 bg-rose-50 rounded-lg border border-rose-200 text-rose-700 font-bold">
              Unmapped Coordinates
            </span>
          </div>

          {/* Navigation Recovery Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-md mx-auto">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#1F6E78]/25 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#F4EBE0] text-[#142A38] font-bold text-xs uppercase tracking-wider rounded-xl border border-[#EBDCC7] transition-all shadow-xs cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#1F6E78]" />
              <span>Explore Destinations</span>
            </Link>

            <Link
              href="/plan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#F4EBE0] text-[#142A38] font-bold text-xs uppercase tracking-wider rounded-xl border border-[#EBDCC7] transition-all shadow-xs cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-[#C85A32]" />
              <span>Plan a Trip</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
