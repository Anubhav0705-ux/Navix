'use client';

import React from 'react';
import Link from 'next/link';
import { usePlanner, TravellerProfile, TripPersonality } from '@/context/PlannerContext';
import { Logo } from './Logo';
import {
  MapPin, Wallet, Calendar, Users, Check, ArrowLeft,
  Sparkles, Train, Bus, Car, Navigation
} from 'lucide-react';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] bg-[#101419] border border-white/10 rounded-2xl flex items-center justify-center text-xs text-slate-400">
      Loading Interactive Map...
    </div>
  )
});

const SUPPORTED_NODES = [
  'Sangli', 'Miraj', 'Pune', 'Mumbai', 'Delhi', 'Chandigarh', 'Manali', 'Old Manali'
];

const NODE_METADATA: Record<string, { state: string; label: string }> = {
  'Sangli': { state: 'Maharashtra', label: 'Starting City Hub' },
  'Miraj': { state: 'Maharashtra', label: 'Major Junction Hub' },
  'Pune': { state: 'Maharashtra', label: 'Cultural & Heritage Hub' },
  'Mumbai': { state: 'Maharashtra', label: 'Commercial Gateway' },
  'Delhi': { state: 'Delhi NCR', label: 'ISBT & Capital Transit Hub' },
  'Chandigarh': { state: 'Punjab/Haryana', label: 'Northern Gateway Hub' },
  'Manali': { state: 'Himachal Pradesh', label: 'Alpine Valley Hub' },
  'Old Manali': { state: 'Himachal Pradesh', label: 'Mountain Destination' }
};

/* ========================================================
   1. PLANNER TOP NAVIGATION BAR
   ======================================================== */
export const PlannerTopNav: React.FC = () => {
  const { state, dispatch } = usePlanner();

  const stages = [
    { id: 1, label: '01 TRIP SETUP', active: state.stage === 1 },
    { id: 2, label: '02 TRANSPORT', active: state.stage === 2 },
    { id: 3, label: '03 PLACES', active: state.stage === 3, muted: true },
    { id: 4, label: '04 FOOD', active: state.stage === 4, muted: true },
    { id: 5, label: '05 STAY', active: state.stage === 5, muted: true },
    { id: 6, label: '06 AUTO PLAN', active: state.stage === 6, muted: true },
    { id: 7, label: '07 REVIEW', active: state.stage === 7 }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#101419]/95 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Logo light={true} />
          <span className="hidden lg:inline-block text-[11px] font-mono text-[#0FA77A] bg-[#0FA77A]/10 px-2.5 py-0.5 rounded border border-[#0FA77A]/30">
            Workspace V2
          </span>
        </div>

        {/* Stage Progress Pills (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1">
          {stages.map((s) => {
            const isDone = s.id < state.stage;
            const isActive = state.stage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (s.id <= 2 || s.id === 7) {
                    dispatch({ type: 'SET_STAGE', payload: s.id as 1 | 2 | 3 | 4 | 5 | 6 | 7 });
                  }
                }}
                disabled={s.muted && !isDone}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0FA77A] text-white shadow-md ring-2 ring-[#0FA77A]/40'
                    : isDone
                    ? 'bg-white/10 text-slate-200 hover:bg-white/20'
                    : s.muted
                    ? 'text-slate-600 cursor-not-allowed opacity-50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isDone && <Check className="w-3 h-3 text-[#0FA77A]" />}
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Info & Exit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs font-mono">
            <Wallet className="w-3.5 h-3.5 text-[#0FA77A]" />
            <span className="text-slate-400 hidden sm:inline">CAP:</span>
            <span className="font-bold text-[#0FA77A]">₹{state.maximumBudget.toLocaleString()}</span>
          </div>

          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl transition-smooth"
          >
            Exit
          </Link>
        </div>
      </div>
    </header>
  );
};

/* ========================================================
   2. STAGE 01 — TRIP SETUP COMPONENT
   ======================================================== */
export const TripSetupStage: React.FC = () => {
  const { state, dispatch } = usePlanner();

  // Duration calculation
  const dep = new Date(state.departureDate);
  const ret = new Date(state.returnDate);
  const diffDays = Math.max(1, Math.round((ret.getTime() - dep.getTime()) / (1000 * 3600 * 24)));
  const nights = Math.max(0, diffDays - 1);

  const origMeta = NODE_METADATA[state.origin] || { state: 'India', label: 'Starting Hub' };
  const destMeta = NODE_METADATA[state.destination] || { state: 'India', label: 'Destination' };

  const personalityOptions: { id: TripPersonality; label: string; desc: string }[] = [
    { id: 'Adventure', label: 'ADVENTURE', desc: 'Treks, mountain passes, trails' },
    { id: 'Relaxed', label: 'RELAXED', desc: 'Cafes, slow scenic walks, rest' },
    { id: 'Culture', label: 'CULTURE', desc: 'Heritage, temples, old streets' },
    { id: 'Food', label: 'FOOD', desc: 'Regional dishes, street eats, cafes' },
    { id: 'Nature', label: 'NATURE', desc: 'Valleys, rivers, forest views' },
    { id: 'Mixed', label: 'MIXED', desc: 'A balanced blend of everything' }
  ];

  const mustIncludeTags = ['scenic places', 'local food', 'heritage', 'nightlife', 'shopping', 'trekking'];
  const avoidTags = ['overnight travel', 'too many transfers', 'early mornings', 'long walks'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT 55%: FORM & PREFERENCES */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* Stage Header */}
        <div className="bg-[#101419] border border-white/15 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#0FA77A] uppercase tracking-wider block">
              Stage 01 of 07 &bull; Trip Setup
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Where &amp; when are you traveling?
            </h2>
            <p className="text-xs text-slate-400">
              Set your origin, destination, dates, budget cap, travellers, and travel style.
            </p>
          </div>

          {/* Location Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Origin */}
            <div className="space-y-1.5 bg-white/5 p-4 rounded-xl border border-white/10">
              <label className="block text-xs font-bold text-[#D8CBB8] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1 text-[#0FA77A]">
                  <MapPin className="w-3.5 h-3.5" /> Starting City
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{origMeta.state}</span>
              </label>
              <select
                value={state.origin}
                onChange={(e) => dispatch({ type: 'SET_ORIGIN', payload: e.target.value })}
                className="w-full bg-[#101419] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#0FA77A]"
              >
                {SUPPORTED_NODES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="block text-[11px] text-[#0FA77A] font-mono">{origMeta.label}</span>
            </div>

            {/* Destination */}
            <div className="space-y-1.5 bg-white/5 p-4 rounded-xl border border-white/10">
              <label className="block text-xs font-bold text-[#D8CBB8] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1 text-[#4D7CFE]">
                  <MapPin className="w-3.5 h-3.5" /> Destination
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{destMeta.state}</span>
              </label>
              <select
                value={state.destination}
                onChange={(e) => dispatch({ type: 'SET_DESTINATION', payload: e.target.value })}
                className="w-full bg-[#101419] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#0FA77A]"
              >
                {SUPPORTED_NODES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="block text-[11px] text-[#4D7CFE] font-mono">{destMeta.label}</span>
            </div>

          </div>

          {/* Dates & Duration Banner */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0FA77A]" /> Departure Date
                </label>
                <input
                  type="date"
                  value={state.departureDate}
                  onChange={(e) => dispatch({ type: 'SET_DEPARTURE_DATE', payload: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#0FA77A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#4D7CFE]" /> Return Date
                </label>
                <input
                  type="date"
                  value={state.returnDate}
                  onChange={(e) => dispatch({ type: 'SET_RETURN_DATE', payload: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#0FA77A]"
                />
              </div>
            </div>

            {/* Calculated Duration Stamp */}
            <div className="bg-[#0FA77A]/10 border border-[#0FA77A]/30 rounded-xl p-3 flex items-center justify-between text-xs font-mono font-bold text-[#0FA77A]">
              <span>DURATION CALCULATOR:</span>
              <span>{diffDays} DAYS &bull; {nights} NIGHTS</span>
            </div>
          </div>

          {/* Budget Input & Presets */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-[#D8CBB8] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white">
                <Wallet className="w-4 h-4 text-[#0FA77A]" /> Maximum Trip Budget Cap (₹)
              </span>
              <span className="font-mono text-sm text-[#0FA77A] font-bold">₹{state.maximumBudget.toLocaleString()}</span>
            </label>

            <input
              type="number"
              step="500"
              min="1000"
              value={state.maximumBudget}
              onChange={(e) => dispatch({ type: 'SET_MAXIMUM_BUDGET', payload: Number(e.target.value) })}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-[#0FA77A]"
            />

            {/* Budget Guidance Presets */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_MAXIMUM_BUDGET', payload: 8000 })}
                className={`p-2.5 rounded-xl border text-center font-mono transition-smooth ${
                  state.maximumBudget === 8000 ? 'bg-[#0FA77A] text-white border-[#0FA77A]' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="block font-bold">₹8,000</span>
                <span className="text-[10px] opacity-80">Lean Backpacker</span>
              </button>

              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_MAXIMUM_BUDGET', payload: 20000 })}
                className={`p-2.5 rounded-xl border text-center font-mono transition-smooth ${
                  state.maximumBudget === 20000 ? 'bg-[#0FA77A] text-white border-[#0FA77A]' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="block font-bold">₹20,000</span>
                <span className="text-[10px] opacity-80">Balanced Standard</span>
              </button>

              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_MAXIMUM_BUDGET', payload: 40000 })}
                className={`p-2.5 rounded-xl border text-center font-mono transition-smooth ${
                  state.maximumBudget === 40000 ? 'bg-[#0FA77A] text-white border-[#0FA77A]' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="block font-bold">₹40,000</span>
                <span className="text-[10px] opacity-80">Comfort Plus</span>
              </button>
            </div>
          </div>

        </div>

        {/* Travellers & Profiles Editor */}
        <div className="bg-[#101419] border border-white/15 rounded-2xl p-6 space-y-6 shadow-xl text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4D7CFE]" />
                Traveller Profiles ({state.travellers})
              </h3>
              <p className="text-slate-400 text-[11px]">Specify names and lightweight travel paces.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_TRAVELLERS_COUNT', payload: state.travellers - 1 })}
                disabled={state.travellers <= 1}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold disabled:opacity-30"
              >
                -
              </button>
              <span className="font-mono font-bold text-sm text-white px-2">{state.travellers}</span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_TRAVELLERS_COUNT', payload: state.travellers + 1 })}
                disabled={state.travellers >= 5}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          {/* Lightweight Profiles list */}
          <div className="space-y-3">
            {state.travellerProfiles.map((p, idx) => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between font-mono font-bold text-[#0FA77A] text-[11px]">
                  <span>TRAVELLER 0{idx + 1}</span>
                  <span>{p.ageGroup}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_TRAVELLER_PROFILE',
                      payload: { id: p.id, profile: { name: e.target.value } }
                    })}
                    placeholder="Name / Nickname"
                    className="bg-[#101419] border border-white/15 rounded-lg px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#0FA77A]"
                  />

                  <select
                    value={p.ageGroup}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_TRAVELLER_PROFILE',
                      payload: { id: p.id, profile: { ageGroup: e.target.value as TravellerProfile['ageGroup'] } }
                    })}
                    className="bg-[#101419] border border-white/15 rounded-lg px-3 py-2 text-white font-semibold focus:outline-none"
                  >
                    <option value="18-24">Age: 18–24</option>
                    <option value="25-34">Age: 25–34</option>
                    <option value="35-49">Age: 35–49</option>
                    <option value="50+">Age: 50+</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trip Personality Chips */}
        <div className="bg-[#101419] border border-white/15 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B5D]" />
              What kind of trip is this?
            </h3>
            <p className="text-slate-400">Select 1 to 3 personalities to guide activity ranking.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {personalityOptions.map((opt) => {
              const selected = state.personalities.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => dispatch({ type: 'TOGGLE_PERSONALITY', payload: opt.id })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selected
                      ? 'bg-[#0FA77A]/15 border-[#0FA77A] text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block font-bold text-xs">{opt.label}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Must Include & Avoid Tags */}
        <div className="bg-[#101419] border border-white/15 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
          <h3 className="text-base font-bold text-white">Specific Travel Preferences</h3>
          
          <div className="space-y-2">
            <span className="block text-slate-400 font-bold uppercase tracking-wider">Must Include</span>
            <div className="flex flex-wrap gap-2">
              {mustIncludeTags.map((tag) => {
                const active = state.mustInclude.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => dispatch({ type: 'TOGGLE_MUST_INCLUDE', payload: tag })}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-smooth ${
                      active ? 'bg-[#0FA77A] text-white border-[#0FA77A]' : 'bg-white/5 text-slate-400 border-white/15'
                    }`}
                  >
                    + {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="block text-slate-400 font-bold uppercase tracking-wider">Avoid</span>
            <div className="flex flex-wrap gap-2">
              {avoidTags.map((tag) => {
                const active = state.avoid.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => dispatch({ type: 'TOGGLE_AVOID', payload: tag })}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-smooth ${
                      active ? 'bg-[#FF6B5D] text-white border-[#FF6B5D]' : 'bg-white/5 text-slate-400 border-white/15'
                    }`}
                  >
                    - {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Continue CTA */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 2 })}
            className="px-8 py-4 bg-[#0FA77A] hover:bg-[#0B8465] text-white font-bold text-sm rounded-xl transition-smooth shadow-xl flex items-center gap-2 uppercase tracking-wider"
          >
            <span>Continue to Transport &rarr;</span>
          </button>
        </div>

      </div>

      {/* RIGHT 45%: MAP & JOURNEY PREVIEW */}
      <div className="lg:col-span-5 sticky top-20 space-y-6">
        
        {/* Interactive Map Visual */}
        <div className="bg-[#101419] border border-white/15 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-[#0FA77A]" /> Geographic Corridor
            </span>
            <span className="font-mono text-slate-400 text-[11px]">OpenStreetMap</span>
          </div>

          <InteractiveMap />

          <div className="pt-2 text-xs font-mono text-slate-300 flex items-center justify-between border-t border-white/10">
            <span className="text-[#0FA77A]">ORIGIN: {state.origin}</span>
            <span className="text-[#4D7CFE]">TARGET: {state.destination}</span>
          </div>
        </div>

        {/* Destination Mood Preview Card */}
        <div className="bg-[#101419] border border-white/15 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="relative h-44 rounded-xl overflow-hidden border border-white/10">
            <img
              src="/travel/destinations/old_manali.jpg"
              alt={state.destination}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-xs font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0FA77A]" /> {state.destination}
              </span>
              <span className="text-[11px] text-slate-300">Alpine Pine Forests &amp; Riverside Homestays</span>
            </div>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-slate-400">Budget Cap</span>
              <span className="font-mono font-bold text-[#0FA77A]">₹{state.maximumBudget.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pace Preference</span>
              <span className="font-bold text-white">{state.travelPace}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

/* ========================================================
   3. STAGE 02 — TRANSPORT COMPONENT FRAMEWORK SHELL
   ======================================================== */
export const TransportStage: React.FC<{ onExecutePlan: () => void; isSubmitting?: boolean }> = ({
  onExecutePlan, isSubmitting = false
}) => {
  const { state, dispatch } = usePlanner();

  const modes = [
    { id: 'TRAIN', label: 'TRAIN', desc: 'Sleeper / Express Rail', icon: Train, available: true },
    { id: 'BUS', label: 'BUS', desc: 'HRTC Volvo & Interstate', icon: Bus, available: true },
    { id: 'METRO', label: 'METRO / LOCAL', desc: 'City Transit & Auto', icon: Navigation, available: true },
    { id: 'LOCAL', label: 'CAB SHUTTLE', desc: 'Station Transfers', icon: Car, available: true }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Back button */}
      <button
        type="button"
        onClick={() => dispatch({ type: 'SET_STAGE', payload: 1 })}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> &larr; Back to Trip Setup
      </button>

      <div className="bg-[#101419] border border-white/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl text-xs">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-[#0FA77A] uppercase tracking-wider block">
            Stage 02 of 07 &bull; Transport Framework Shell
          </span>
          <h2 className="text-2xl font-extrabold text-white">
            Transport Modes &amp; Routing Preferences
          </h2>
          <p className="text-slate-400">Select mode preferences and routing optimization profile.</p>
        </div>

        {/* Transport Modes Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {modes.map((m) => {
            const Icon = m.icon;
            const selected = state.preferredModes.includes(m.id as 'TRAIN' | 'BUS' | 'METRO' | 'LOCAL');
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => dispatch({ type: 'TOGGLE_PREFERRED_MODE', payload: m.id as 'TRAIN' | 'BUS' | 'METRO' | 'LOCAL' })}
                className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
                  selected
                    ? 'bg-[#0FA77A]/15 border-[#0FA77A] text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${selected ? 'text-[#0FA77A]' : 'text-slate-400'}`} />
                <div>
                  <span className="block font-bold">{m.label}</span>
                  <span className="block text-[10px] text-slate-400">{m.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Optimization Profile */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <label className="block font-bold text-white uppercase tracking-wider">
            Routing Optimization Profile
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['CHEAPEST', 'BALANCED', 'FASTER'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => dispatch({ type: 'SET_PROFILE', payload: p })}
                className={`py-3 px-4 rounded-xl font-bold border transition-smooth ${
                  state.profile === p
                    ? 'bg-[#0FA77A] text-white border-[#0FA77A]'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Execute Auto Plan CTA */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <span className="text-slate-400 text-xs">
            Ready to compute route &amp; DP budget allocation?
          </span>

          <button
            type="button"
            onClick={onExecutePlan}
            disabled={isSubmitting}
            className="px-8 py-4 bg-[#0FA77A] hover:bg-[#0B8465] text-white font-bold text-sm rounded-xl transition-smooth shadow-xl flex items-center gap-2 uppercase tracking-wider disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Computing Route...' : 'Build Complete Journey &rarr;'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
