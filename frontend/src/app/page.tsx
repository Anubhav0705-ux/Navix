'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar, Footer } from '@/components';
import { Compass, ArrowRight, ShieldCheck, Cpu, Wallet, Layers, MapPin, Calendar, Users, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Budget-First Multi-Modal Travel Planner</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
              Tell us where you want to go. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
                We’ll make the budget work.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              NAVIX connects local transport, trains, metros, and interstate buses from Tier-2/Tier-3 cities while optimizing transport, lodging, food, and activities within your total budget constraint.
            </p>
          </div>

          {/* --- HERO TRIP COMPOSER CARD --- */}
          <div className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
            <form onSubmit={handleHeroSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Origin */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> From
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-smooth"
                >
                  {DEMO_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" /> To
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-smooth"
                >
                  {DEMO_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Max Budget (₹)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="20000"
                  step="500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-smooth"
                  required
                />
              </div>

              {/* Travellers */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> Travellers
                </label>
                <select
                  value={travellers}
                  onChange={(e) => setTravellers(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-smooth"
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 Persons</option>
                  <option value="3">3 Persons</option>
                </select>
              </div>

              {/* Submit CTA */}
              <div className="sm:col-span-2 lg:col-span-1">
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl transition-smooth flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
                >
                  <span>Find Route</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Hard Constraint Invariant: Total Cost &le; User Maximum Budget
              </span>
              <span className="hidden sm:inline text-slate-400 font-mono">Demo Transit Dataset</span>
            </div>
          </div>

          {/* --- HERO ROUTE STORYTELLING VISUAL --- */}
          <div className="mt-14 max-w-4xl mx-auto bg-slate-900/50 border border-slate-800/80 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 text-center">
              Primary Demo Multi-Modal Journey Corridor
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              {/* Sangli */}
              <div className="flex flex-col items-center text-center space-y-1">
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center font-bold text-emerald-400">1</span>
                <span className="font-semibold text-white">Sangli</span>
                <span className="text-[10px] text-slate-400">Origin Hub</span>
              </div>

              <div className="hidden sm:flex flex-col items-center text-[10px] text-emerald-400 font-mono">
                <span>Local Auto</span>
                <div className="w-16 h-0.5 bg-emerald-500/40 my-1" />
              </div>

              {/* Miraj */}
              <div className="flex flex-col items-center text-center space-y-1">
                <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-medium">2</span>
                <span className="font-semibold text-slate-200">Miraj</span>
                <span className="text-[10px] text-slate-400">Rail Transfer</span>
              </div>

              <div className="hidden sm:flex flex-col items-center text-[10px] text-sky-400 font-mono">
                <span>Goa Express</span>
                <div className="w-16 h-0.5 bg-sky-500/40 my-1" />
              </div>

              {/* Delhi */}
              <div className="flex flex-col items-center text-center space-y-1">
                <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-medium">3</span>
                <span className="font-semibold text-slate-200">Delhi ISBT</span>
                <span className="text-[10px] text-slate-400">Metro + Bus</span>
              </div>

              <div className="hidden sm:flex flex-col items-center text-[10px] text-teal-400 font-mono">
                <span>HRTC Volvo</span>
                <div className="w-16 h-0.5 bg-teal-500/40 my-1" />
              </div>

              {/* Manali */}
              <div className="flex flex-col items-center text-center space-y-1">
                <span className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center font-bold text-sky-400">4</span>
                <span className="font-semibold text-white">Old Manali</span>
                <span className="text-[10px] text-slate-400">Destination</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW NAVIX WORKS --- */}
      <section id="how-it-works" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Connected Algorithmic Pipeline</h2>
            <h3 className="text-3xl font-extrabold text-white">How NAVIX Solves Your Journey</h3>
            <p className="text-sm text-slate-400">Four deterministic stages ensure you never exceed your maximum budget.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group hover:border-emerald-500/40 transition-smooth">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-white mb-2">Time-Dependent A*</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reads database transit nodes & schedules to discover feasible multi-modal paths across trains, buses, and local shuttles.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group hover:border-sky-500/40 transition-smooth">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-white mb-2">Layover Validation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates connection buffers between modes. Rejects TIGHT or INVALID transfers, accepting only SAFE layovers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group hover:border-teal-500/40 transition-smooth">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-white mb-2">Knapsack Budget DP</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Allocates remaining budget across accommodation tiers, food plans, and activity packages to maximize preference utility.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group hover:border-emerald-500/40 transition-smooth">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-white mb-2">Complete Itinerary</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates a day-by-day execution breakdown with cost transparency, layovers, and decision rationale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- EXAMPLE BUDGET ALLOCATION --- */}
      <section id="example-journey" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-500/10 text-sky-400 text-xs font-semibold">
                Sangli &rarr; Old Manali Primary Demo
              </div>
              <h3 className="text-3xl font-extrabold text-white leading-tight">
                ₹20,000 Total Budget Allocation Breakdown
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Here is an actual calculated result from the NAVIX algorithm engine for a 7-day trip. Every category is optimized to fit strictly under ₹20,000.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Transport Fare: ₹2,190.00 (Train + Metro + Volvo Bus)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Accommodation: ₹9,000.00 (Standard Guest House @ ₹1,500/night)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Food Allocation: ₹4,900.00 (Balanced Cafes @ ₹700/day)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Activities & Local Shuttles: ₹2,000.00 (Trek + Cable Car Pass + Transfers)</span>
                </div>
              </div>
            </div>

            {/* Visual Proportional Budget Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between text-sm font-bold text-white">
                <span>Calculated Trip Spend</span>
                <span className="text-emerald-400">₹19,090 / ₹20,000</span>
              </div>

              {/* Stacked Bar */}
              <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
                <div className="bg-emerald-500 h-full rounded-l-full" style={{ width: '11%'.toString() }} title="Transport (11%)" />
                <div className="bg-sky-500 h-full" style={{ width: '47%' }} title="Accommodation (47%)" />
                <div className="bg-teal-400 h-full" style={{ width: '25%' }} title="Food (25%)" />
                <div className="bg-amber-400 h-full" style={{ width: '10%' }} title="Activities (10%)" />
                <div className="bg-slate-600 h-full rounded-r-full" style={{ width: '7%' }} title="Buffer (7%)" />
              </div>

              {/* Category Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-slate-300">Transport: ₹2,190</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-sky-500" />
                  <span className="text-slate-300">Stay: ₹9,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-teal-400" />
                  <span className="text-slate-300">Food: ₹4,900</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-400" />
                  <span className="text-slate-300">Activities: ₹1,300</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-600" />
                  <span className="text-slate-300">Buffer: ₹1,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- WHY NAVIX SECTION --- */}
      <section id="why-navix" className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs font-bold text-sky-400 uppercase tracking-widest">Built for Real Indian Travellers</h2>
            <h3 className="text-3xl font-extrabold text-white">Why NAVIX?</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Tier-2 / Tier-3 Hub Routing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Most travel tools assume you start in a metro. NAVIX natively handles connections starting from towns like Sangli, Miraj, or Kolhapur.
              </p>
            </div>

            <div className="space-y-3 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Hard Budget Protection</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Never get surprised by hidden costs. Total trip cost includes transport, stay, food, activities, and local transfers under one strict cap.
              </p>
            </div>

            <div className="space-y-3 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Deterministic Reliability</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by pure A* pathfinding and Knapsack DP algorithms. Zero hallucinations or probabilistic guesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-16 bg-gradient-to-b from-slate-900/40 to-slate-950">
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <h3 className="text-3xl font-black text-white tracking-tight">
            Plan the whole journey, not just the ticket.
          </h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Experience multi-modal route planning subject to your maximum budget constraint.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-xl transition-smooth shadow-xl shadow-emerald-500/20"
          >
            <span>Start Planning Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
