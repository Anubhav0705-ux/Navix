'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar, Footer } from '@/components';
import { SAMPLE_STORIES } from '@/lib/stories-data';
import {
  ArrowRight, ShieldCheck, MapPin, Users, Wallet, Compass,
  Sparkles, BookOpen, Clock, CheckCircle2, Heart, Star
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
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0B1320] selection:bg-[#0E9F7A] selection:text-white">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="pt-10 pb-16 md:pt-16 md:pb-24 relative overflow-hidden">
        {/* Subtle background glow accent */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0E9F7A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#4C8BF5]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* HERO LEFT: HUMAN & INSPIRING COPY */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E7E5E0] shadow-sm text-[#0E9F7A] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#0E9F7A]" />
                <span>Travel smarter. Explore more.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#0B1320] leading-[1.12]">
                From smaller cities to{' '}
                <span className="font-serif italic text-[#0E9F7A] font-normal block sm:inline">
                  unforgettable journeys.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#667085] leading-relaxed max-w-xl">
                One total budget. One seamless itinerary. NAVIX connects local transport, trains, buses, homestays, and meals starting from Tier-2 &amp; Tier-3 Indian cities.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/plan"
                  className="inline-flex items-center justify-center gap-2.5 text-sm font-bold bg-[#0E9F7A] hover:bg-[#0B8465] text-white px-7 py-4 rounded-xl transition-smooth shadow-sm"
                >
                  <span>Build My Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/stories"
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#0B1320] bg-white border border-[#E7E5E0] hover:bg-[#F7F5F0] px-5 py-4 rounded-xl transition-smooth shadow-sm"
                >
                  <BookOpen className="w-4 h-4 text-[#0E9F7A]" />
                  <span>Read Travel Stories</span>
                </Link>
              </div>

              {/* Value Badges */}
              <div className="pt-4 border-t border-[#E7E5E0] flex flex-wrap items-center gap-6 text-xs text-[#667085]">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#0E9F7A]" />
                  Hard Total Budget Cap
                </span>
                <span>&bull;</span>
                <span className="font-medium">Multi-Modal Connections</span>
                <span>&bull;</span>
                <span className="font-medium">Safe Layover Windows</span>
              </div>
            </div>

            {/* HERO RIGHT: VIBRANT JOURNEY PLANNER CARD */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 sm:p-7 shadow-md relative">
                {/* Decorative Postcard Stamp Tag */}
                <div className="absolute -top-3 -right-3 bg-[#0E9F7A] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Compass className="w-3 h-3" /> Quick Search
                </div>

                <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E7E5E0]">
                  <h3 className="text-sm font-bold text-[#0B1320] uppercase tracking-wider">
                    Where are you heading?
                  </h3>
                  <span className="text-[11px] font-mono text-[#667085] bg-[#F7F5F0] px-2.5 py-1 rounded-md border border-[#E7E5E0]">
                    Demo Dataset
                  </span>
                </div>

                <form onSubmit={handleHeroSubmit} className="space-y-4">
                  {/* From & To */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#667085] mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0E9F7A]" /> Starting City
                      </label>
                      <select
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl px-3 py-2.5 text-sm text-[#0B1320] font-medium focus:outline-none focus:border-[#0E9F7A] transition-smooth"
                      >
                        {DEMO_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#667085] mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#4C8BF5]" /> Destination
                      </label>
                      <select
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl px-3 py-2.5 text-sm text-[#0B1320] font-medium focus:outline-none focus:border-[#0E9F7A] transition-smooth"
                      >
                        {DEMO_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Budget & Travellers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#667085] mb-1.5 flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-[#0E9F7A]" /> Total Budget (₹)
                      </label>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="20000"
                        step="500"
                        className="w-full bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl px-3 py-2.5 text-sm text-[#0B1320] font-medium focus:outline-none focus:border-[#0E9F7A] transition-smooth"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#667085] mb-1.5 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#667085]" /> Travellers
                      </label>
                      <select
                        value={travellers}
                        onChange={(e) => setTravellers(e.target.value)}
                        className="w-full bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl px-3 py-2.5 text-sm text-[#0B1320] font-medium focus:outline-none focus:border-[#0E9F7A] transition-smooth"
                      >
                        <option value="1">1 Person</option>
                        <option value="2">2 Persons</option>
                        <option value="3">3 Persons</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#0E9F7A] hover:bg-[#0B8465] text-white font-bold py-3.5 px-4 rounded-xl transition-smooth flex items-center justify-center gap-2 shadow-sm text-sm"
                  >
                    <span>Build My Journey</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FEATURED DESTINATION CORRIDORS (PHOTO GRID) --- */}
      <section id="example-journey" className="py-14 bg-white border-y border-[#E7E5E0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#0E9F7A] uppercase tracking-widest block">
                Popular Budget Routes
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1320]">
                Curated Travel Corridors
              </h2>
            </div>
            <Link
              href="/plan"
              className="text-xs font-bold text-[#0E9F7A] hover:text-[#0B8465] flex items-center gap-1 transition-smooth"
            >
              <span>Explore All Destinations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Old Manali */}
            <div className="bg-[#F7F5F0] border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-sm flex flex-col group">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop"
                  alt="Old Manali"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-[#0B1320] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0E9F7A]" /> Sangli &rarr; Old Manali
                </span>
                <span className="absolute bottom-3 right-3 bg-[#0B1320]/80 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-full">
                  Under ₹20,000
                </span>
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0B1320]">Himachal Mountain Escape</h3>
                  <p className="text-xs text-[#667085] leading-relaxed mt-1">
                    Connecting local auto shuttles from Sangli to Miraj, Goa Express to Delhi, and HRTC Volvo bus to Old Manali.
                  </p>
                </div>
                <Link
                  href="/plan?origin=Sangli&destination=Old+Manali&budget=20000"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0E9F7A] hover:text-[#0B8465] pt-2"
                >
                  <span>Plan This Route</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Pune */}
            <div className="bg-[#F7F5F0] border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-sm flex flex-col group">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1588416936097-41850ab3d86d?q=80&w=800&auto=format&fit=crop"
                  alt="Pune"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-[#0B1320] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#4C8BF5]" /> Sangli &rarr; Pune
                </span>
                <span className="absolute bottom-3 right-3 bg-[#0B1320]/80 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-full">
                  Under ₹5,000
                </span>
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0B1320]">Pune Heritage &amp; Fort Weekend</h3>
                  <p className="text-xs text-[#667085] leading-relaxed mt-1">
                    Fast express trains from Miraj Junction to Pune Railway Station, connecting local bus transit to Sinhagad Fort.
                  </p>
                </div>
                <Link
                  href="/plan?origin=Sangli&destination=Pune&budget=5000"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0E9F7A] hover:text-[#0B8465] pt-2"
                >
                  <span>Plan This Route</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Delhi Layover */}
            <div className="bg-[#F7F5F0] border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-sm flex flex-col group">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop"
                  alt="Delhi ISBT"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-[#0B1320] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0E9F7A]" /> Sangli &rarr; Delhi ISBT
                </span>
                <span className="absolute bottom-3 right-3 bg-[#0B1320]/80 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-full">
                  Under ₹12,000
                </span>
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0B1320]">Delhi Cultural &amp; Food Transit</h3>
                  <p className="text-xs text-[#667085] leading-relaxed mt-1">
                    Multi-modal train route ending at Kashmere Gate ISBT with seamless Delhi Metro access to historic Old Delhi.
                  </p>
                </div>
                <Link
                  href="/plan?origin=Sangli&destination=Delhi&budget=12000"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0E9F7A] hover:text-[#0B8465] pt-2"
                >
                  <span>Plan This Route</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FEATURED STORIES SECTION --- */}
      <section className="py-16 bg-[#F7F5F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#4C8BF5] uppercase tracking-widest block">
                From Our Traveler Community
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1320]">
                Real Stories &amp; Backpacker Logs
              </h2>
            </div>
            <Link
              href="/stories"
              className="text-xs font-bold text-[#0E9F7A] hover:text-[#0B8465] flex items-center gap-1 transition-smooth"
            >
              <span>Read All Stories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SAMPLE_STORIES.slice(0, 2).map((story) => (
              <article
                key={story.id}
                className="bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row group"
              >
                <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                <div className="p-6 sm:w-3/5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#0E9F7A] uppercase">{story.category}</span>
                    <h3 className="text-base font-bold text-[#0B1320] group-hover:text-[#0E9F7A] transition-smooth leading-snug">
                      {story.title}
                    </h3>
                    <p className="text-xs text-[#667085] leading-relaxed line-clamp-2">
                      {story.excerpt}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-[#E7E5E0]">
                    <span className="text-xs font-bold text-[#0B1320]">{story.author.name}</span>
                    <Link
                      href={`/stories/${story.id}`}
                      className="text-xs font-bold text-[#0E9F7A] flex items-center gap-1"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (FOUR EASY STAGES) --- */}
      <section id="how-it-works" className="py-16 bg-white border-t border-[#E7E5E0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold text-[#0E9F7A] uppercase tracking-widest block mb-1">
              One budget. One plan. Fewer travel headaches.
            </span>
            <h2 className="text-3xl font-extrabold text-[#0B1320]">
              How NAVIX plans your whole journey
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#F7F5F0] border border-[#E7E5E0] rounded-2xl p-6 space-y-3">
              <span className="w-8 h-8 rounded-full bg-[#0E9F7A]/10 text-[#0E9F7A] font-bold text-xs flex items-center justify-center font-mono">
                01
              </span>
              <h3 className="text-base font-bold text-[#0B1320]">Transit Graph Search</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Connects local shuttles, trains, and interstate buses starting from smaller hubs like Sangli or Miraj.
              </p>
            </div>

            <div className="bg-[#F7F5F0] border border-[#E7E5E0] rounded-2xl p-6 space-y-3">
              <span className="w-8 h-8 rounded-full bg-[#4C8BF5]/10 text-[#4C8BF5] font-bold text-xs flex items-center justify-center font-mono">
                02
              </span>
              <h3 className="text-base font-bold text-[#0B1320]">Layover Validation</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Evaluates time-dependent connection windows between stations, rejecting risky or tight transfers.
              </p>
            </div>

            <div className="bg-[#F7F5F0] border border-[#E7E5E0] rounded-2xl p-6 space-y-3">
              <span className="w-8 h-8 rounded-full bg-[#0E9F7A]/10 text-[#0E9F7A] font-bold text-xs flex items-center justify-center font-mono">
                03
              </span>
              <h3 className="text-base font-bold text-[#0B1320]">DP Budget Allocator</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Optimizes accommodation, food, and activity tiers so your total trip cost never exceeds your max budget.
              </p>
            </div>

            <div className="bg-[#F7F5F0] border border-[#E7E5E0] rounded-2xl p-6 space-y-3">
              <span className="w-8 h-8 rounded-full bg-[#0B1320]/10 text-[#0B1320] font-bold text-xs flex items-center justify-center font-mono">
                04
              </span>
              <h3 className="text-base font-bold text-[#0B1320]">Complete Itinerary</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Generates a day-by-day execution plan with transparent price breakdowns and PDF download.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION (HIGH CONTRAST NAVY) --- */}
      <section className="py-16 bg-[#0A1128] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready for your next budget trip?
          </h2>
          <p className="text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
            Plan your complete multi-modal travel itinerary under one budget cap.
          </p>
          <div>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 text-sm font-bold bg-[#0E9F7A] hover:bg-[#0B8465] text-white px-8 py-4 rounded-xl transition-smooth shadow-lg"
            >
              <span>Build Your Journey Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
