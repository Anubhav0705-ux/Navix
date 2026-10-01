'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar, Footer } from '@/components';
import { ArrowRight, ShieldCheck, MapPin, Calendar, Users, Wallet, Compass } from 'lucide-react';

const DEMO_LOCATIONS = [
  'Sangli', 'Miraj', 'Pune', 'Mumbai', 'Delhi', 'Chandigarh', 'Manali', 'Old Manali'
];

export default function Home() {
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
    window.location.href = `/plan?${query}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0B1320] selection:bg-[#0E9F7A] selection:text-white">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* HERO LEFT: EDITORIAL COPY */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E9F7A]/10 border border-[#0E9F7A]/20 text-[#0E9F7A] text-xs font-semibold tracking-wider uppercase">
                <Compass className="w-3.5 h-3.5" />
                <span>Budget-First Multi-Modal Travel</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#0B1320] leading-[1.15]">
                Plan the whole journey.{' '}
                <span className="font-serif-emphasis italic text-[#0E9F7A] font-normal block sm:inline">
                  Not just the ticket.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#667085] leading-relaxed max-w-xl">
                NAVIX connects local transport, trains, metros, and interstate buses starting from Tier-2 & Tier-3 cities — keeping transport, lodging, food, and activities under one total budget cap.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/plan"
                  className="inline-flex items-center justify-center gap-2.5 text-sm font-bold bg-[#0E9F7A] hover:bg-[#0B8465] text-white px-6 py-3.5 rounded-xl transition-smooth shadow-sm"
                >
                  <span>Plan a Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center text-sm font-medium text-[#667085] hover:text-[#0B1320] px-4 py-3.5 transition-smooth"
                >
                  See how it works &rarr;
                </a>
              </div>

              {/* Small proof line */}
              <div className="pt-4 border-t border-[#E7E5E0] flex items-center gap-6 text-xs text-[#667085]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0E9F7A]" />
                  A* Routing
                </span>
                <span>&bull;</span>
                <span>Safe Transfer Windows</span>
                <span>&bull;</span>
                <span>Hard Budget Guarantee</span>
              </div>
            </div>

            {/* HERO RIGHT: JOURNEY COMPOSER CARD */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 sm:p-7 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E7E5E0]">
                  <h3 className="text-sm font-bold text-[#0B1320] uppercase tracking-wider">
                    Build Your Journey
                  </h3>
                  <span className="text-[11px] font-mono text-[#667085] bg-[#F7F5F0] px-2 py-0.5 rounded">
                    Demo transit dataset
                  </span>
                </div>

                <form onSubmit={handleHeroSubmit} className="space-y-4">
                  {/* From & To */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#667085] mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0E9F7A]" /> From
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
                        <MapPin className="w-3.5 h-3.5 text-[#4C8BF5]" /> To
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
                        <Wallet className="w-3.5 h-3.5 text-[#0E9F7A]" /> Max Budget (₹)
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
                        <option value="1">1 Traveller</option>
                        <option value="2">2 Travellers</option>
                        <option value="3">3 Travellers</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#0E9F7A] hover:bg-[#0B8465] text-white font-bold py-3 px-4 rounded-xl transition-smooth flex items-center justify-center gap-2 shadow-sm text-sm"
                  >
                    <span>Build my journey</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- ELEGANT ROUTE CORRIDOR VISUAL --- */}
      <section className="py-10 bg-white border-y border-[#E7E5E0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#667085] mb-6 text-center">
            Primary Multi-Modal Corridor &bull; Sangli to Old Manali
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-2">
            {/* Sangli */}
            <div className="flex flex-col items-center text-center">
              <span className="w-3 h-3 rounded-full bg-[#0E9F7A] ring-4 ring-[#0E9F7A]/20" />
              <span className="mt-2 text-sm font-bold text-[#0B1320]">Sangli</span>
              <span className="text-xs text-[#667085]">Origin</span>
            </div>

            {/* Mode 1 */}
            <div className="flex-1 flex flex-col items-center px-2 w-full sm:w-auto">
              <span className="text-[11px] font-semibold text-[#0E9F7A] uppercase tracking-wider">AUTO / LOCAL</span>
              <div className="w-full h-0.5 bg-[#0E9F7A] my-1" />
            </div>

            {/* Miraj */}
            <div className="flex flex-col items-center text-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#667085]" />
              <span className="mt-2 text-xs font-semibold text-[#0B1320]">Miraj Junction</span>
              <span className="text-[11px] text-[#667085]">Rail Layover</span>
            </div>

            {/* Mode 2 */}
            <div className="flex-1 flex flex-col items-center px-2 w-full sm:w-auto">
              <span className="text-[11px] font-semibold text-[#4C8BF5] uppercase tracking-wider">TRAIN (Goa Exp)</span>
              <div className="w-full h-0.5 bg-[#4C8BF5] my-1" />
            </div>

            {/* Delhi */}
            <div className="flex flex-col items-center text-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#667085]" />
              <span className="mt-2 text-xs font-semibold text-[#0B1320]">Delhi ISBT</span>
              <span className="text-[11px] text-[#667085]">Metro &amp; Bus</span>
            </div>

            {/* Mode 3 */}
            <div className="flex-1 flex flex-col items-center px-2 w-full sm:w-auto">
              <span className="text-[11px] font-semibold text-[#0E9F7A] uppercase tracking-wider">BUS (HRTC Volvo)</span>
              <div className="w-full h-0.5 bg-[#0E9F7A] my-1" />
            </div>

            {/* Old Manali */}
            <div className="flex flex-col items-center text-center">
              <span className="w-3 h-3 rounded-full bg-[#4C8BF5] ring-4 ring-[#4C8BF5]/20" />
              <span className="mt-2 text-sm font-bold text-[#0B1320]">Old Manali</span>
              <span className="text-xs text-[#667085]">Destination</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW NAVIX WORKS --- */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <h2 className="text-xs font-bold text-[#0E9F7A] uppercase tracking-widest mb-2">Connected Algorithmic Pipeline</h2>
            <h3 className="text-3xl font-extrabold text-[#0B1320] leading-tight">
              Four deterministic stages to solve your trip constraint.
            </h3>
          </div>

          {/* Connected Horizontal Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white border border-[#E7E5E0] rounded-xl p-6 relative">
              <span className="text-xs font-bold font-mono text-[#0E9F7A] block mb-2">STAGE 01</span>
              <h4 className="text-base font-bold text-[#0B1320] mb-2">Route Search</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Time-dependent A* graph search discovers multi-modal transit legs across trains, buses, and local shuttles.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#E7E5E0] rounded-xl p-6 relative">
              <span className="text-xs font-bold font-mono text-[#4C8BF5] block mb-2">STAGE 02</span>
              <h4 className="text-base font-bold text-[#0B1320] mb-2">Transfer Validation</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Evaluates connection windows. Rejects tight or invalid station transfers, accepting only safe layovers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#E7E5E0] rounded-xl p-6 relative">
              <span className="text-xs font-bold font-mono text-[#0E9F7A] block mb-2">STAGE 03</span>
              <h4 className="text-base font-bold text-[#0B1320] mb-2">Budget Optimization</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Dynamic programming optimizes remaining funds for accommodation, food, and activities without exceeding cap.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-[#E7E5E0] rounded-xl p-6 relative">
              <span className="text-xs font-bold font-mono text-[#0B1320] block mb-2">STAGE 04</span>
              <h4 className="text-base font-bold text-[#0B1320] mb-2">Complete Itinerary</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Generates a day-by-day execution breakdown with transparent cost breakdowns and decision explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- BUDGET STORY SECTION --- */}
      <section id="example-journey" className="py-20 bg-white border-y border-[#E7E5E0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Summary Numbers */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-[#0E9F7A] uppercase tracking-widest block">
                Primary Demo Budget Allocation
              </span>

              <h3 className="text-3xl font-extrabold text-[#0B1320] leading-tight">
                Sangli &rarr; Old Manali under ₹20,000
              </h3>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#E7E5E0]">
                  <span className="text-xs text-[#667085] block mb-1">Max Budget</span>
                  <span className="text-lg font-bold text-[#0B1320]">₹20,000</span>
                </div>

                <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#E7E5E0]">
                  <span className="text-xs text-[#667085] block mb-1">Planned Cost</span>
                  <span className="text-lg font-bold text-[#0E9F7A]">₹19,090</span>
                </div>

                <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#E7E5E0]">
                  <span className="text-xs text-[#667085] block mb-1">Remaining</span>
                  <span className="text-lg font-bold text-[#4C8BF5]">₹910</span>
                </div>
              </div>

              <p className="text-xs text-[#667085] leading-relaxed">
                Every category is computed deterministically by the Knapsack DP optimizer to balance stay comfort, food preferences, and activity tier while keeping overall spend strictly under your maximum cap.
              </p>
            </div>

            {/* Right: Proportional Horizontal Budget Bar */}
            <div className="lg:col-span-7 bg-[#F7F5F0] border border-[#E7E5E0] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between text-sm font-bold text-[#0B1320]">
                <span>Calculated Trip Spend</span>
                <span className="text-[#0E9F7A]">₹19,090 / ₹20,000</span>
              </div>

              {/* Stacked Bar */}
              <div className="h-4 w-full bg-white rounded-full overflow-hidden flex p-0.5 border border-[#E7E5E0]">
                <div className="bg-[#0E9F7A] h-full rounded-l-full" style={{ width: '11%' }} title="Transport (11%)" />
                <div className="bg-[#4C8BF5] h-full" style={{ width: '47%' }} title="Accommodation (47%)" />
                <div className="bg-[#05B386] h-full" style={{ width: '25%' }} title="Food (25%)" />
                <div className="bg-[#EAB308] h-full" style={{ width: '10%' }} title="Activities (10%)" />
                <div className="bg-[#94A3B8] h-full rounded-r-full" style={{ width: '7%' }} title="Buffer (7%)" />
              </div>

              {/* Category Breakdown Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded bg-[#0E9F7A]" />
                  <div>
                    <span className="text-[#667085] block">Transport</span>
                    <span className="font-bold text-[#0B1320]">₹2,190</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded bg-[#4C8BF5]" />
                  <div>
                    <span className="text-[#667085] block">Stay (7 Nights)</span>
                    <span className="font-bold text-[#0B1320]">₹9,000</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded bg-[#05B386]" />
                  <div>
                    <span className="text-[#667085] block">Food Allocation</span>
                    <span className="font-bold text-[#0B1320]">₹4,900</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded bg-[#EAB308]" />
                  <div>
                    <span className="text-[#667085] block">Activities</span>
                    <span className="font-bold text-[#0B1320]">₹2,000</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded bg-[#94A3B8]" />
                  <div>
                    <span className="text-[#667085] block">Contingency Buffer</span>
                    <span className="font-bold text-[#0B1320]">₹1,000</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- WHY NAVIX (EDITORIAL 3-COLUMN LAYOUT) --- */}
      <section id="why-navix" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-14">
            <h2 className="text-xs font-bold text-[#667085] uppercase tracking-widest mb-2">Built for Real Indian Travellers</h2>
            <h3 className="text-3xl font-extrabold text-[#0B1320]">Why NAVIX?</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-3">
              <span className="text-sm font-mono font-bold text-[#0E9F7A]">01 /</span>
              <h4 className="text-lg font-bold text-[#0B1320]">Tier-2 &amp; Tier-3 Hub Routing</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Most travel tools assume you start in a metro. NAVIX natively stitches connections starting from smaller hubs like Sangli, Miraj, or Kolhapur.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-mono font-bold text-[#4C8BF5]">02 /</span>
              <h4 className="text-lg font-bold text-[#0B1320]">Hard Budget Protection</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Never get surprised by unexpected costs. Total trip budget includes transport, stay, food, activities, and local transfers under one strict cap.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-mono font-bold text-[#0B1320]">03 /</span>
              <h4 className="text-lg font-bold text-[#0B1320]">Deterministic Reliability</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Powered strictly by time-dependent A* graph search and Knapsack DP algorithms. Zero probabilistic guesses or AI hallucinated schedules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA (HIGH CONTRAST NAVY SECTION) --- */}
      <section className="py-20 bg-[#0A1128] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Plan the whole journey.{' '}
            <span className="font-serif-emphasis italic text-[#0E9F7A]">Not just the ticket.</span>
          </h3>
          <p className="text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
            Experience multi-modal route planning subject to your maximum budget constraint.
          </p>
          <div className="pt-2">
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 text-sm font-bold bg-[#0E9F7A] hover:bg-[#0B8465] text-white px-8 py-4 rounded-xl transition-smooth shadow-lg"
            >
              <span>Start Planning Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
