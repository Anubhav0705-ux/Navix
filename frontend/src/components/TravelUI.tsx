'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin, Wallet, Users, ArrowRight, Sparkles, Compass,
  CheckCircle2, Clock, Navigation, Heart, ShieldCheck, Tag
} from 'lucide-react';

/* --- 1. TRAVEL STAMP BADGE --- */
export interface TravelStampProps {
  text: string;
  variant?: 'emerald' | 'blue' | 'coral' | 'yellow' | 'sand';
}

export const TravelStamp: React.FC<TravelStampProps> = ({ text, variant = 'emerald' }) => {
  const styles = {
    emerald: 'bg-[#0FA77A]/15 text-[#0FA77A] border-[#0FA77A]/30',
    blue: 'bg-[#4D7CFE]/15 text-[#4D7CFE] border-[#4D7CFE]/30',
    coral: 'bg-[#FF6B5D]/15 text-[#FF6B5D] border-[#FF6B5D]/30',
    yellow: 'bg-[#F7B955]/15 text-[#D97706] border-[#F7B955]/40',
    sand: 'bg-white/10 text-slate-300 border-white/20'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-sm ${styles[variant]}`}>
      <Tag className="w-3 h-3" />
      <span>{text}</span>
    </span>
  );
};

/* --- 2. ANIMATED SVG ROUTE LINE VISUAL --- */
export const AnimatedRouteVisual: React.FC = () => {
  return (
    <div className="w-full py-4 relative z-10">
      <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-widest text-slate-300 mb-2 px-2">
        <span className="flex items-center gap-1 text-[#0FA77A]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0FA77A] ring-4 ring-[#0FA77A]/30" />
          SANGLI
        </span>
        <span className="text-slate-400">MIRAJ</span>
        <span className="text-slate-400">DELHI</span>
        <span className="flex items-center gap-1 text-[#4D7CFE]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4D7CFE] ring-4 ring-[#4D7CFE]/30" />
          OLD MANALI
        </span>
      </div>

      <svg className="w-full h-8" viewBox="0 0 600 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 10 15 L 180 15 Q 230 15 280 20 L 400 20 Q 480 20 590 15"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="3"
          strokeDasharray="6 6"
        />
        <path
          d="M 10 15 L 180 15 Q 230 15 280 20 L 400 20 Q 480 20 590 15"
          stroke="url(#routeGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          className="animate-route-draw"
        />
        <defs>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0FA77A" />
            <stop offset="0.5" stopColor="#4D7CFE" />
            <stop offset="1" stopColor="#FF6B5D" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

/* --- 3. DESTINATION PHOTO CARD --- */
export interface DestinationCardProps {
  title: string;
  corridor: string;
  budget: string;
  duration: string;
  image: string;
  tags: string[];
  href: string;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  title, corridor, budget, duration, image, tags, href
}) => {
  return (
    <div className="bg-[#101419] border border-white/10 rounded-2xl overflow-hidden photo-card-hover group flex flex-col justify-between">
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101419] via-[#101419]/40 to-transparent" />
        
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-mono font-bold border border-white/10 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#0FA77A]" />
            {corridor}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-[#0FA77A] text-white font-mono font-bold text-xs shadow-md">
            {budget}
          </span>
          <span className="text-xs text-slate-300 font-medium bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            {duration}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white group-hover:text-[#0FA77A] transition-smooth">
            {title}
          </h3>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((t, idx) => (
              <span key={idx} className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                #{t}
              </span>
            ))}
          </div>
        </div>

        <Link
          href={href}
          className="pt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#0FA77A] hover:text-[#0B8465] transition-smooth"
        >
          <span>Explore Route</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

/* --- 4. BUDGET RECEIPT BOARD VISUAL --- */
export const BudgetReceiptBoard: React.FC = () => {
  return (
    <div className="bg-[#F5F0E8] border-2 border-[#D8CBB8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative text-[#101828]">
      {/* Receipt Header */}
      <div className="flex items-center justify-between border-b-2 border-dashed border-[#D8CBB8] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
            NAVIX TRIP RECEIPT
          </span>
          <h3 className="text-xl font-extrabold tracking-tight">
            Sangli &rarr; Old Manali
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#0FA77A] block font-bold">
            MAX BUDGET CAP
          </span>
          <span className="text-xl font-mono font-bold text-[#0FA77A]">₹20,000</span>
        </div>
      </div>

      {/* Itemized Line Items */}
      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#4D7CFE]" />
            <span>TRAIN + LOCAL SHUTTLE</span>
          </span>
          <span className="font-bold">₹2,190.00</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#0FA77A]" />
            <span>MOUNTAIN HOMESTAY (6 NIGHTS)</span>
          </span>
          <span className="font-bold">₹9,000.00</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#FF6B5D]" />
            <span>MEALS &amp; CAFES ALLOCATION</span>
          </span>
          <span className="font-bold">₹4,900.00</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#F7B955]" />
            <span>ACTIVITIES &amp; JOGINI TREK</span>
          </span>
          <span className="font-bold">₹1,300.00</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-slate-400" />
            <span>LOCAL TRANSFERS</span>
          </span>
          <span className="font-bold">₹700.00</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-slate-300" />
            <span>CONTINGENCY RESERVE</span>
          </span>
          <span className="font-bold">₹1,000.00</span>
        </div>
      </div>

      {/* Total & Surplus Footer */}
      <div className="border-t-2 border-dashed border-[#D8CBB8] pt-4 flex items-center justify-between font-mono text-sm font-bold">
        <span>TOTAL CALCULATED SPEND</span>
        <span className="text-[#0FA77A]">₹19,090.00</span>
      </div>
      <div className="flex items-center justify-between font-mono text-xs text-[#4D7CFE] font-bold">
        <span>REMAINING SURPLUS (TIGHT)</span>
        <span>₹910.00</span>
      </div>
    </div>
  );
};

/* --- 5. CINEMATIC END CTA SECTION --- */
export const CinematicCTA: React.FC = () => {
  return (
    <section className="relative py-24 bg-[#101419] text-white overflow-hidden">
      <img
        src="/travel/hero/manali_hero.jpg"
        alt="Mountain background"
        className="absolute inset-0 w-full h-full object-cover opacity-20 filter brightness-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#101419] via-[#101419]/70 to-[#101419]" />

      <div className="max-w-4xl mx-auto text-center px-4 space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#0FA77A] text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Start Your Adventure Today</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          WHERE ARE YOU GOING NEXT?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Tell NAVIX your budget cap and home city. We will build your complete multi-modal travel plan.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/plan"
            className="px-8 py-4 bg-[#0FA77A] hover:bg-[#0B8465] text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-smooth shadow-xl"
          >
            <span>Build My Journey</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/stories"
            className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold rounded-xl transition-smooth"
          >
            Browse Travel Stories
          </Link>
        </div>
      </div>
    </section>
  );
};
