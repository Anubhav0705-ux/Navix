'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Navbar, Footer, PageTransition, TravelStamp,
  AnimatedRouteVisual, DestinationCard, BudgetReceiptBoard, CinematicCTA
} from '@/components';
import { SAMPLE_STORIES } from '@/lib/stories-data';
import {
  ArrowRight, ShieldCheck, MapPin, Users, Wallet, Compass,
  Sparkles, BookOpen, Clock, CheckCircle2, Heart, Route, Tag
} from 'lucide-react';

const DEMO_LOCATIONS = [
  'Sangli', 'Miraj', 'Pune', 'Mumbai', 'Delhi', 'Chandigarh', 'Manali', 'Old Manali'
];

export default function Home() {
  const router = useRouter();
  const [origin, setOrigin] = useState('Sangli');
  const [destination, setDestination] = useState('Old Manali');
  const [budget, setBudget] = useState('20000');
  const [travellers, setTravellers] = useState('1');

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      origin,
      destination,
      budget,
      travellers
    }).toString();
    router.push(`/plan?${query}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#101419] text-[#F5F0E8] selection:bg-[#0FA77A] selection:text-white">
      {/* Route Loading Overlay */}
      <PageTransition />

      {/* Global Transparent / Sticky Navbar */}
      <Navbar transparentOnTop={true} />

      {/* ========================================================
          SECTION 1 — CINEMATIC HERO (85–95vh Desktop)
          ======================================================== */}
      <section className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden">
        {/* Full-bleed background photography */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/travel/hero/manali_hero.jpg"
            alt="Himalayan mountain background"
            className="w-full h-full object-cover animate-hero-zoom filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101419] via-[#101419]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101419] via-transparent to-[#101419]/60" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* HERO LEFT: BOLD EDITORIAL TYPOGRAPHY */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-2">
                <TravelStamp text="BUDGET-FIRST TRAVEL PLATFORM" variant="emerald" />
                <span className="text-xs font-mono font-bold text-slate-300 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  SANGLI &rarr; OLD MANALI &bull; 7 DAYS &bull; ₹20K
                </span>
              </div>

              {/* Expressive Editorial Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                GO FARTHER.{' '}
                <span className="font-editorial italic text-[#0FA77A] font-normal block sm:inline">
                  Spend smarter.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Tell NAVIX where you’re starting, where you want to go and what you can spend. We’ll figure out the whole multi-modal trip under one hard budget cap.
              </p>

              {/* Animated SVG Route Visual */}
              <div className="max-w-md pt-2">
                <AnimatedRouteVisual />
              </div>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/plan"
                  className="inline-flex items-center justify-center gap-2.5 text-sm font-bold bg-[#0FA77A] hover:bg-[#0B8465] text-white px-8 py-4 rounded-xl transition-smooth shadow-xl"
                >
                  <span>Plan a Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#corridors"
                  className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-4 rounded-xl transition-smooth backdrop-blur-sm"
                >
                  <span>Explore Corridors</span>
                  <ArrowRight className="w-4 h-4 text-[#0FA77A]" />
                </a>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#0FA77A]" />
                  Hard Budget Cap
                </span>
                <span>&bull;</span>
                <span className="font-medium">Train + Bus + Local Shuttles</span>
                <span>&bull;</span>
                <span className="font-medium">Safe Transfers Guaranteed</span>
              </div>

            </div>

            {/* HERO RIGHT: COMPACT TRAVEL QUICK PLANNER */}
            <div className="lg:col-span-5">
              <div className="bg-[#101419]/90 border border-white/15 backdrop-blur-xl rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#0FA77A]" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Quick Trip Composer
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#0FA77A] bg-[#0FA77A]/15 px-2.5 py-0.5 rounded border border-[#0FA77A]/30">
                    India Transit
                  </span>
                </div>

                <form onSubmit={handleHeroSubmit} className="space-y-4 text-xs">
                  {/* From & To */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#D8CBB8] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0FA77A]" /> Starting City
                      </label>
                      <select
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-[#0FA77A]"
                      >
                        {DEMO_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc} className="bg-[#101419] text-white">{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#D8CBB8] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#4D7CFE]" /> Destination
                      </label>
                      <select
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-[#0FA77A]"
                      >
                        {DEMO_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc} className="bg-[#101419] text-white">{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Budget & Travellers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#D8CBB8] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-[#0FA77A]" /> Max Budget (₹)
                      </label>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="20000"
                        step="500"
                        className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-[#0FA77A]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[#D8CBB8] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-300" /> Travellers
                      </label>
                      <select
                        value={travellers}
                        onChange={(e) => setTravellers(e.target.value)}
                        className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-[#0FA77A]"
                      >
                        <option value="1" className="bg-[#101419]">1 Person</option>
                        <option value="2" className="bg-[#101419]">2 Persons</option>
                        <option value="3" className="bg-[#101419]">3 Persons</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#0FA77A] hover:bg-[#0B8465] text-white font-bold py-3.5 px-4 rounded-xl transition-smooth flex items-center justify-center gap-2 shadow-lg text-sm uppercase tracking-wider"
                  >
                    <span>Build My Trip</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2 — "START SOMEWHERE. END SOMEWHERE UNFORGETTABLE."
          ======================================================== */}
      <section id="corridors" className="py-20 bg-[#F5F0E8] text-[#101828]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <TravelStamp text="CURATED CORRIDORS" variant="emerald" />
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Start somewhere.{' '}
                <span className="font-editorial italic text-[#0FA77A] font-normal">
                  End somewhere unforgettable.
                </span>
              </h2>
            </div>
            <Link
              href="/plan"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0FA77A] hover:underline"
            >
              <span>View All Supported Hubs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <DestinationCard
              title="Himachal Valley & Mountain Trail"
              corridor="Sangli → Old Manali"
              budget="UNDER ₹20,000"
              duration="7 Days / 6 Nights"
              image="/travel/destinations/old_manali.jpg"
              tags={['Mountain Hikes', 'Pine Forests', 'Hostel Stay']}
              href="/plan?origin=Sangli&destination=Old+Manali&budget=20000"
            />

            <DestinationCard
              title="Peshwa Forts & Cultural Crawl"
              corridor="Sangli → Pune"
              budget="UNDER ₹5,000"
              duration="3 Days / 2 Nights"
              image="/travel/destinations/pune.jpg"
              tags={['Heritage', 'Sinhagad Fort', 'Street Food']}
              href="/plan?origin=Sangli&destination=Pune&budget=5000"
            />

            <DestinationCard
              title="Old Delhi Heritage & ISBT Transit"
              corridor="Sangli → Delhi ISBT"
              budget="UNDER ₹12,000"
              duration="4 Days / 3 Nights"
              image="/travel/destinations/delhi_isbt.jpg"
              tags={['Metro Access', 'Chandni Chowk', 'Volvo Hub']}
              href="/plan?origin=Sangli&destination=Delhi&budget=12000"
            />
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 3 — HOW NAVIX THINKS (HUMAN STAGES)
          ======================================================== */}
      <section id="how-it-thinks" className="py-20 bg-[#101419] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <TravelStamp text="THE NAVIX ENGINE" variant="blue" />
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Four simple stages to build your trip.
            </h2>
            <p className="text-sm text-slate-400">
              Deterministic routing algorithms work behind the scenes so you can focus on the travel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#0FA77A]/50 transition-smooth">
              <span className="text-xs font-mono font-bold text-[#0FA77A] block">01</span>
              <h3 className="text-lg font-bold text-white">Find the route</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Train, bus and local shuttle connections stitched together starting from smaller city hubs.
              </p>
              <div className="pt-2 text-[10px] font-mono text-[#0FA77A]">A* Graph Search</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#4D7CFE]/50 transition-smooth">
              <span className="text-xs font-mono font-bold text-[#4D7CFE] block">02</span>
              <h3 className="text-lg font-bold text-white">Protect the budget</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stay, food and experiences balanced deterministically against one strict maximum budget cap.
              </p>
              <div className="pt-2 text-[10px] font-mono text-[#4D7CFE]">DP Knapsack Optimizer</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#FF6B5D]/50 transition-smooth">
              <span className="text-xs font-mono font-bold text-[#FF6B5D] block">03</span>
              <h3 className="text-lg font-bold text-white">Make every hour count</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluates time-dependent station transfer windows to reject tight or risky connections.
              </p>
              <div className="pt-2 text-[10px] font-mono text-[#FF6B5D]">Layover Validation</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#F7B955]/50 transition-smooth">
              <span className="text-xs font-mono font-bold text-[#F7B955] block">04</span>
              <h3 className="text-lg font-bold text-white">Hand you the journey</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                One complete day-by-day itinerary with transparent costs, PDF export, and profile saving.
              </p>
              <div className="pt-2 text-[10px] font-mono text-[#F7B955]">Complete Itinerary</div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 4 — FULL-BLEED STORY MOMENT
          ======================================================== */}
      <section className="relative py-28 bg-[#101419] overflow-hidden text-white">
        <img
          src="/travel/hero/train_journey.jpg"
          alt="Train journey through mountains"
          className="absolute inset-0 w-full h-full object-cover filter brightness-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101419] via-[#101419]/75 to-[#101419]" />

        <div className="max-w-4xl mx-auto text-center px-4 space-y-6 relative z-10">
          <TravelStamp text="EDITORIAL ESSAY" variant="coral" />
          
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            &ldquo;Your trip shouldn’t start with twelve open tabs.&rdquo;
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            NAVIX turns scattered transport schedules, hostel tariffs, street food estimates, and local shuttles into one unified journey.
          </p>

          <div className="pt-4">
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#0FA77A] hover:bg-[#0B8465] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-smooth shadow-xl"
            >
              <span>Build My Plan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 5 — COMMUNITY STORIES ("TRAVEL NOTES FROM THE ROAD")
          ======================================================== */}
      <section className="py-20 bg-[#F5F0E8] text-[#101828]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <TravelStamp text="TRAVEL NOTES FROM THE ROAD" variant="blue" />
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Backpacker Logs &amp; Guides
              </h2>
            </div>
            <Link
              href="/stories"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0FA77A] hover:underline"
            >
              <span>Explore All Stories ({SAMPLE_STORIES.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SAMPLE_STORIES.slice(0, 2).map((story) => (
              <article
                key={story.id}
                className="bg-white border border-[#D8CBB8] rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row group photo-card-hover"
              >
                <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                    {story.category}
                  </span>
                </div>
                <div className="p-6 sm:w-3/5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#101828] group-hover:text-[#0FA77A] transition-smooth leading-snug">
                      {story.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {story.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#D8CBB8] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={story.author.avatar}
                        alt={story.author.name}
                        className="w-7 h-7 rounded-full object-cover border border-[#D8CBB8]"
                      />
                      <span className="text-xs font-bold text-[#101828]">{story.author.name}</span>
                    </div>

                    <Link
                      href={`/stories/${story.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0FA77A] hover:underline"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 6 — BUDGET VISUAL STORY (TRAVEL RECEIPT BOARD)
          ======================================================== */}
      <section className="py-20 bg-[#101419] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <TravelStamp text="TRANSPARENT COST ALLOCATION" variant="coral" />
              
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Trips that actually match your budget.
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                NAVIX allocates every rupee deterministically across transport, accommodation, food, activities, local transfers, and contingency reserves.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
                <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 text-[#0FA77A]">
                  Total: ₹19,090
                </span>
                <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 text-[#4D7CFE]">
                  Surplus: ₹910
                </span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <BudgetReceiptBoard />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 7 — FINAL CINEMATIC CTA
          ======================================================== */}
      <CinematicCTA />

      {/* Global Travel Footer */}
      <Footer />
    </div>
  );
}
