'use client';

import React from 'react';
import { Compass, MapPin, Sparkles, Ticket, ShieldCheck } from 'lucide-react';

export const TravelCollage: React.FC = () => {
  return (
    <div
      data-testid="travel-collage"
      className="relative w-full h-full min-h-[580px] bg-gradient-to-br from-[#0C1E34] via-[#122E4E] to-[#081524] p-8 sm:p-10 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Background Decorative Rings & Ambient Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#1F6E78]/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#D8A64B]/15 blur-3xl pointer-events-none" />

      {/* Subtle Dotted Journey Route SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 50 120 Q 220 80, 260 220 T 400 380 T 160 520"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        <circle cx="50" cy="120" r="4" fill="#D8A64B" />
        <circle cx="260" cy="220" r="4" fill="#1F6E78" />
        <circle cx="400" cy="380" r="4" fill="#E96E55" />
      </svg>

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#D8A64B]" />
          <span>India Multi-Modal Discovery</span>
        </div>

        {/* Compass Marker */}
        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80">
          <Compass className="w-4 h-4 animate-[spin_20s_linear_infinite]" />
        </div>
      </div>

      {/* Centerpiece: Art-Directed Curated Postcards Collage */}
      <div className="relative z-10 flex-1 my-6 flex items-center justify-center">
        <div className="relative w-full max-w-[420px] h-[340px]">

          {/* Postcard 1: Manali Himalayan Trails (Offset Back Left) */}
          <div className="absolute top-2 left-2 w-44 sm:w-48 bg-white p-2 rounded-2xl shadow-2xl transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 cursor-pointer group">
            <div className="relative h-28 sm:h-32 rounded-xl overflow-hidden bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/home/manali.webp"
                alt="Manali Himalayan Peaks"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-[#D8A64B]" />
                <span>Manali</span>
              </div>
            </div>
            <div className="pt-2 px-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#142A38] font-editorial">Himalayan Valleys</span>
              <span className="text-[9px] font-mono text-[#66757F]">Himachal</span>
            </div>
          </div>

          {/* Postcard 2: Goa Beach & Coastline (Prominent Middle Right) */}
          <div className="absolute top-8 right-2 w-48 sm:w-52 bg-white p-2.5 rounded-2xl shadow-2xl transform rotate-4 hover:rotate-0 hover:scale-105 transition-all duration-300 z-20 cursor-pointer group border border-white/40">
            <div className="relative h-32 sm:h-36 rounded-xl overflow-hidden bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/home/goa.webp"
                alt="Goa Coastal Shoreline"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-[#1F6E78]" />
                <span>Goa</span>
              </div>
            </div>
            <div className="pt-2 px-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#142A38] font-editorial">Coastal Heritage</span>
              <span className="text-[9px] font-mono text-emerald-700 font-bold">Palm & Tide</span>
            </div>
          </div>

          {/* Postcard 3: Jaipur Palaces (Lower Middle Front) */}
          <div className="absolute bottom-0 left-12 w-44 sm:w-48 bg-white p-2 rounded-2xl shadow-2xl transform -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 z-30 cursor-pointer group border border-white/30">
            <div className="relative h-26 sm:h-30 rounded-xl overflow-hidden bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/home/jaipur.webp"
                alt="Jaipur Royal Palaces"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-[#E96E55]" />
                <span>Jaipur</span>
              </div>
            </div>
            <div className="pt-1.5 px-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#142A38] font-editorial">Hawa Mahal & Forts</span>
              <span className="text-[9px] font-mono text-[#D8A64B] font-bold">Rajasthan</span>
            </div>
          </div>

          {/* Boarding Pass Styled Stamp Badge */}
          <div className="absolute -bottom-3 right-4 z-40 bg-[#0C1E34]/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-white/20 shadow-xl flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#1F6E78] text-white flex items-center justify-center shrink-0">
              <Ticket className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#D8A64B] font-mono">Verified Route</div>
              <div className="text-[11px] font-black tracking-tight">100% Budget Guaranteed</div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Editorial Copy */}
      <div className="relative z-10 pt-4 border-t border-white/15">
        <h3 className="text-xl sm:text-2xl font-bold font-editorial text-white tracking-tight">
          A world of journeys awaits.
        </h3>
        <p className="text-xs text-white/80 mt-1 leading-relaxed font-normal">
          Seamless multi-modal connections across India, tailored strictly to your spending ceiling.
        </p>

        {/* Feature Highlights */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-white/70 font-mono">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Deterministic Math</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center gap-1">
            <Compass className="w-3 h-3 text-[#D8A64B]" />
            <span>Multi-Modal Routing</span>
          </div>
          <span>&bull;</span>
          <div>Private &amp; Secure</div>
        </div>
      </div>
    </div>
  );
};
