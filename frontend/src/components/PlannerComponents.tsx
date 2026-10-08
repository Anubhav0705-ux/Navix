'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlanner, TravellerProfile, TripPersonality } from '@/context/PlannerContext';
import { Logo } from './Logo';
import {
  MapPin, Wallet, Calendar, Users, Check, ArrowLeft,
  Sparkles, Train, Bus, Car, Navigation, ShieldCheck,
  Plus, Utensils, Coffee, Filter, Clock
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
    { id: 3, label: '03 PLACES', active: state.stage === 3 },
    { id: 4, label: '04 FOOD', active: state.stage === 4 },
    { id: 5, label: '05 STAY', active: state.stage === 5 },
    { id: 6, label: '06 AUTO PLAN', active: state.stage === 6 },
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
                  if (s.id <= 5 || s.id === 7) {
                    dispatch({ type: 'SET_STAGE', payload: s.id as 1 | 2 | 3 | 4 | 5 | 6 | 7 });
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0FA77A] text-white shadow-md ring-2 ring-[#0FA77A]/40'
                    : isDone
                    ? 'bg-white/10 text-slate-200 hover:bg-white/20'
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
   3. STAGE 02 — TRANSPORT DISCOVERY & ROUTE CHOICE
   ======================================================== */
export const TransportStage: React.FC<{ onExecutePlan: () => void; isSubmitting?: boolean }> = ({
  onExecutePlan, isSubmitting = false
}) => {
  const { state, dispatch } = usePlanner();

  const routeOptions = [
    {
      id: 'BALANCED' as const,
      name: 'Option A: Sangli → Miraj → Delhi → Manali (Balanced Rail + Volvo Bus)',
      duration: '~36 hours',
      cost: '₹2,190.00 / person',
      layover: '2-Hour Safe Layover at Delhi ISBT',
      modes: ['Sangli Local Auto', 'Goa Express Train', 'Delhi Metro', 'HRTC Volvo Bus', 'Manali Auto Shuttle'],
      recommended: true,
      description: 'Goa Express train to Delhi, 2-hr safe connection window, overnight HRTC Volvo bus up the Himalayas.'
    },
    {
      id: 'CHEAPEST' as const,
      name: 'Option B: Sangli → Pune → Delhi → Manali (Economy Train + Sleeper Bus)',
      duration: '~44 hours',
      cost: '₹2,190.00 / person',
      layover: '1.5-Hour Layover at Delhi Metro',
      modes: ['Local Train to Pune', 'Jhelum Express Train', 'Delhi Metro', 'Himalayan Night AC Bus', 'Shared Shuttle'],
      recommended: false,
      description: 'Includes Pune junction transit for maximum budget efficiency and overnight sleeper bus.'
    },
    {
      id: 'FASTER' as const,
      name: 'Option C: Sangli → Mumbai → Delhi → Chandigarh → Manali (Express Rail Corridor)',
      duration: '~38 hours',
      cost: '₹4,050.00 / person',
      layover: 'Strict Vande Bharat & Rajdhani Timings',
      modes: ['Mahalaxmi Express', 'Rajdhani Express', 'Vande Bharat Express', 'HRTC Himmani Deluxe', 'Night Cab'],
      recommended: false,
      description: 'Premium express trains (Rajdhani + Vande Bharat) with scenic day bus drive from Chandigarh.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#101419]/90 border border-white/15 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 1 })}
              className="text-xs font-mono font-bold text-[#0FA77A] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Stage 01
            </button>
            <span className="text-slate-500">&bull;</span>
            <span className="text-xs font-mono text-slate-400">Stage 02 of 07</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Transport &amp; Multi-Modal Corridor Selection</h2>
          <p className="text-xs text-slate-400">Deterministic transit search candidates evaluated for {state.origin} &rarr; {state.destination}.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#0FA77A] bg-[#0FA77A]/10 px-3 py-1.5 rounded-xl border border-[#0FA77A]/30">
            Active Route Option: {state.selectedRouteOption}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Filters + Right Recommended Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT FILTERS & PREFERENCES (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#101419]/90 border border-white/15 rounded-2xl p-6 space-y-5 backdrop-blur-xl shadow-xl text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#0FA77A]" /> Transport Controls
            </h3>

            {/* Optimization Priority */}
            <div className="space-y-2">
              <label className="block text-slate-400 font-mono text-[11px] uppercase">Routing Optimization Profile</label>
              <div className="grid grid-cols-3 gap-2">
                {(['CHEAPEST', 'BALANCED', 'FASTER'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => dispatch({ type: 'SET_ROUTE_OPTION', payload: p })}
                    className={`py-2 px-2 rounded-xl font-bold font-mono text-[11px] transition-all border ${
                      state.selectedRouteOption === p
                        ? 'bg-[#0FA77A] text-white border-[#0FA77A] shadow-md'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Modes Toggles */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="block text-slate-400 font-mono text-[11px] uppercase">Preferred Modes</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'TRAIN', label: 'Train Express', icon: Train },
                  { id: 'BUS', label: 'Volvo / Bus', icon: Bus },
                  { id: 'METRO', label: 'City Metro', icon: Navigation },
                  { id: 'LOCAL', label: 'Cab / Shuttle', icon: Car }
                ].map((m) => {
                  const Icon = m.icon;
                  const selected = state.preferredModes.includes(m.id as 'TRAIN' | 'BUS' | 'METRO' | 'LOCAL');
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => dispatch({ type: 'TOGGLE_PREFERRED_MODE', payload: m.id as 'TRAIN' | 'BUS' | 'METRO' | 'LOCAL' })}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        selected
                          ? 'bg-[#0FA77A]/15 border-[#0FA77A] text-white font-bold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${selected ? 'text-[#0FA77A]' : 'text-slate-500'}`} />
                      <span className="text-[11px]">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Max Transfers */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="block text-slate-400 font-mono text-[11px] uppercase">Max Transfers Limit</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Any', '≤3', '≤2'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => dispatch({ type: 'SET_MAX_TRANSFERS', payload: t })}
                    className={`py-2 px-2 rounded-xl font-mono text-[11px] font-bold border transition-all ${
                      state.maxTransfers === t
                        ? 'bg-[#0FA77A] text-white border-[#0FA77A]'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Active vs Future Metadata Tag */}
            <div className="p-3 bg-[#161B22] rounded-xl border border-white/10 text-[11px] space-y-1">
              <span className="text-[#0FA77A] font-bold block">Engine Note:</span>
              <p className="text-slate-400 leading-relaxed">
                Routing uses time-dependent A* over deterministic transit schedules. Layover safety windows (min 30 min) are enforced automatically.
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT CANDIDATE ROUTE CARDS (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-5">
          {routeOptions.map((option) => {
            const isSelected = state.selectedRouteOption === option.id;
            return (
              <div
                key={option.id}
                onClick={() => dispatch({ type: 'SET_ROUTE_OPTION', payload: option.id })}
                className={`cursor-pointer bg-[#101419]/90 border rounded-2xl p-6 transition-all space-y-4 shadow-xl relative overflow-hidden ${
                  isSelected
                    ? 'border-[#0FA77A] ring-2 ring-[#0FA77A]/30 bg-[#101419]'
                    : 'border-white/15 hover:border-white/30 opacity-90 hover:opacity-100'
                }`}
              >
                {/* Header Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    {option.recommended && (
                      <span className="bg-[#0FA77A] text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                        Recommended by NAVIX
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-400">{option.duration}</span>
                  </div>
                  <span className="text-base font-bold text-[#0FA77A] font-mono">{option.cost}</span>
                </div>

                {/* Route Title & Desc */}
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-white">{option.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{option.description}</p>
                </div>

                {/* Mode Segments Strip */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {option.modes.map((mode, idx) => (
                    <React.Fragment key={mode}>
                      <span className="px-2.5 py-1 bg-[#161B22] border border-white/10 rounded-lg text-[11px] text-slate-200 font-mono">
                        {mode}
                      </span>
                      {idx < option.modes.length - 1 && (
                        <span className="text-slate-600 text-xs">&rarr;</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Layover Protection Indicator */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0FA77A]" /> {option.layover} &bull; SAFE Connection
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'SET_ROUTE_OPTION', payload: option.id });
                    }}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      isSelected
                        ? 'bg-[#0FA77A] text-white'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {isSelected ? '✓ Selected Route' : 'Select Option'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Navigation Action Footer */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 1 })}
              className="px-5 py-2.5 border border-white/15 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl transition-all"
            >
              &larr; Back to Setup
            </button>

            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 3 })}
              className="px-8 py-3.5 bg-gradient-to-r from-[#0FA77A] to-[#0B8465] hover:brightness-110 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-[#0FA77A]/20 flex items-center gap-2 uppercase tracking-wider"
            >
              <span>Continue to Places &rarr;</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

/* ========================================================
   4. STAGE 03 — PLACES DISCOVERY & MUST-HAVE SELECTION
   ======================================================== */
export const PlacesStage: React.FC = () => {
  const { state, dispatch } = usePlanner();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Optimizer-backed Activities (Source of Truth)
  const optimizerActivities = [
    {
      id: 'act_01',
      name: 'Old Manali Village & Temple Walk',
      category: 'Culture',
      cost: 0,
      duration: '2 hrs',
      location: 'Old Manali Village',
      description: 'Free self-guided heritage walk through Manu Temple, pine lanes, and riverside stone houses.',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=600&auto=format&fit=crop',
      optimizerBacked: true
    },
    {
      id: 'act_02',
      name: 'Hadimba Temple & Van Vihar Deodar Park',
      category: 'Culture',
      cost: 100,
      duration: '2.5 hrs',
      location: 'Dungri Forest, Manali',
      description: '16th-century wooden pagoda temple surrounded by towering ancient cedar forest trees.',
      image: 'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?q=80&w=600&auto=format&fit=crop',
      optimizerBacked: true
    },
    {
      id: 'act_03',
      name: 'Jogini Waterfall Scenic Trek',
      category: 'Adventure',
      cost: 300,
      duration: '4 hrs',
      location: 'Vashisht Village Trail',
      description: 'Scenic trail through apple orchards and pine cliffs leading to cascading mountain falls.',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop',
      optimizerBacked: true
    },
    {
      id: 'act_04',
      name: 'Solang Valley Snow Point & Cable Car',
      category: 'Adventure',
      cost: 1000,
      duration: '6 hrs',
      location: 'Solang Valley',
      description: 'Alpine valley ropeway cable car ride with panoramic glacier views and paragliding points.',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
      optimizerBacked: true
    }
  ];

  // Curated Discovery Guide Entries (Labeled Discovery-Only)
  const discoveryActivities = [
    {
      id: 'disc_05',
      name: 'Vashisht Hot Water Springs & Himalayan Temple',
      category: 'Wellness',
      cost: 0,
      duration: '1.5 hrs',
      location: 'Vashisht Village',
      description: 'Natural thermal sulphur springs with dedicated stone bathing tanks and ancient temple carvings.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop',
      optimizerBacked: false
    },
    {
      id: 'disc_06',
      name: 'Naggar Castle & Roerich Heritage Art Gallery',
      category: 'Heritage',
      cost: 50,
      duration: '3 hrs',
      location: 'Naggar Town',
      description: '15th-century wood-and-stone Kullu kingdom castle overlooking the Beas river valley.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=600&auto=format&fit=crop',
      optimizerBacked: false
    },
    {
      id: 'disc_07',
      name: 'Mall Road Evening Food Stroll & Souvenir Market',
      category: 'Local Walk',
      cost: 0,
      duration: '2 hrs',
      location: 'Central Manali',
      description: 'Vibrant pedestrian street with Kullu shawls, wooden handicrafts, soft-serve ice cream, and momos.',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
      optimizerBacked: false
    },
    {
      id: 'disc_08',
      name: 'Gulaba Alpine Meadow Viewpoint',
      category: 'Nature',
      cost: 0,
      duration: '3 hrs',
      location: 'Rohtang Highway',
      description: 'Breathtaking high-altitude grassy meadows surrounded by snow peaks on the way to Rohtang.',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop',
      optimizerBacked: false
    }
  ];

  const allPlaces = [...optimizerActivities, ...discoveryActivities];

  // Personality sorting: boost places matching selected personality
  const sortedPlaces = [...allPlaces].sort((a, b) => {
    const aMatch = state.personalities.some(p => p.toLowerCase() === a.category.toLowerCase() || (p === 'Adventure' && a.category === 'Adventure'));
    const bMatch = state.personalities.some(p => p.toLowerCase() === b.category.toLowerCase() || (p === 'Adventure' && b.category === 'Adventure'));
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  const filteredPlaces = sortedPlaces.filter(p => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'FREE') return p.cost === 0;
    if (activeCategory === 'UNDER ₹500') return p.cost <= 500;
    return p.category.toUpperCase() === activeCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#101419]/90 border border-white/15 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 2 })}
              className="text-xs font-mono font-bold text-[#0FA77A] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Stage 02
            </button>
            <span className="text-slate-500">&bull;</span>
            <span className="text-xs font-mono text-slate-400">Stage 03 of 07</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Destination Experiences &amp; Places</h2>
          <p className="text-xs text-slate-400">Select must-have experiences for Old Manali &amp; surrounding valley.</p>
        </div>

        <div className="flex items-center gap-2 bg-[#161B22] px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
          <span className="text-slate-400">Selected:</span>
          <span className="text-[#0FA77A] font-bold">{state.selectedPlaces.length + state.selectedDiscoveryPlaces.length} Items</span>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'NATURE', 'CULTURE', 'ADVENTURE', 'WELLNESS', 'HERITAGE', 'FREE', 'UNDER ₹500'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? 'bg-[#0FA77A] text-white border-[#0FA77A] shadow-md'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Places */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPlaces.map((place) => {
          const isOptimizerSelected = state.selectedPlaces.includes(place.id);
          const isDiscoverySelected = state.selectedDiscoveryPlaces.includes(place.id);
          const isSelected = place.optimizerBacked ? isOptimizerSelected : isDiscoverySelected;

          return (
            <div
              key={place.id}
              className={`bg-[#101419]/90 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-xl ${
                isSelected
                  ? 'border-[#0FA77A] ring-2 ring-[#0FA77A]/30'
                  : 'border-white/15 hover:border-white/30'
              }`}
            >
              {/* Image Header */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101419] via-transparent to-black/30" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full border border-white/20">
                    {place.category}
                  </span>
                </div>

                {/* Data Model Badge */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#0FA77A]" /> {place.duration}
                  </span>
                  <span className="font-bold text-white">
                    {place.cost === 0 ? 'FREE' : `₹${place.cost}`}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-xs">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-white text-sm line-clamp-1">{place.name}</h3>
                  <p className="text-[#0FA77A] font-mono text-[10px] flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {place.location}
                  </p>
                  <p className="text-slate-400 leading-relaxed text-[11px] line-clamp-2 mt-1">
                    {place.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">
                    {place.optimizerBacked ? 'Optimizer Engine' : 'Curated Guide'}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (place.optimizerBacked) {
                        dispatch({ type: 'TOGGLE_SELECTED_PLACE', payload: place.id });
                      } else {
                        dispatch({ type: 'TOGGLE_DISCOVERY_PLACE', payload: place.id });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#0FA77A] text-white shadow-md'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 2 })}
          className="px-5 py-2.5 border border-white/15 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl transition-all"
        >
          &larr; Back to Transport
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 4 })}
          className="px-8 py-3.5 bg-gradient-to-r from-[#0FA77A] to-[#0B8465] hover:brightness-110 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-[#0FA77A]/20 flex items-center gap-2 uppercase tracking-wider"
        >
          <span>Continue to Food &rarr;</span>
        </button>
      </div>

    </div>
  );
};

/* ========================================================
   5. STAGE 04 — FOOD & DINING DISCOVERY
   ======================================================== */
export const FoodStage: React.FC = () => {
  const { state, dispatch } = usePlanner();

  const foodTiers = [
    {
      id: 'BASIC' as const,
      name: 'BASIC DINING',
      dailyCost: 300,
      description: 'Local dhabas, roadside thali, Maggi, tea & hot parathas.',
      examples: 'Traditional Thalis, Dhabas, Street Food',
      icon: Utensils
    },
    {
      id: 'BALANCED' as const,
      name: 'BALANCED CAFÉ DINING',
      dailyCost: 700,
      description: 'Popular Old Manali cafés, fresh Himalayan trout & regional cuisine.',
      examples: 'Cafés, Family Restaurants, Himachali Specialties',
      icon: Coffee
    },
    {
      id: 'FLEXIBLE' as const,
      name: 'FLEXIBLE / GOURMET',
      dailyCost: 1200,
      description: 'Artisanal coffee, wood-fired pizza, gourmet dinners & specialty cafés.',
      examples: 'Destination Dining, Artisanal Bakeries, Italian',
      icon: Sparkles
    }
  ];

  const editorialDiscussions = [
    {
      title: 'Himachali Dham Festive Thali',
      tag: 'Regional Specialty',
      desc: 'Traditional slow-cooked feast with Madra, Sepu Badi, and Rajma served on leaves.',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400&auto=format&fit=crop'
    },
    {
      title: 'Pan-Seared Fresh River Trout',
      tag: 'Old Manali Icon',
      desc: 'Local river trout grilled with butter garlic and herbs in Old Manali cafés.',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&auto=format&fit=crop'
    },
    {
      title: 'Hot Siddu with Pure Ghee',
      tag: 'Mountain Comfort',
      desc: 'Local steamed wheat bread stuffed with poppy seed or walnut mix, drenched in ghee.',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format&fit=crop'
    },
    {
      title: 'Riverside Café Hopping',
      tag: 'Acoustic & Coffee',
      desc: 'Chilling on river balconies with artisanal espresso and live acoustic sessions.',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=400&auto=format&fit=crop'
    }
  ];

  const days = 7;
  const totalTravellers = state.travellers;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#101419]/90 border border-white/15 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 3 })}
              className="text-xs font-mono font-bold text-[#0FA77A] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Stage 03
            </button>
            <span className="text-slate-500">&bull;</span>
            <span className="text-xs font-mono text-slate-400">Stage 04 of 07</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Dining Style &amp; Food Allocation</h2>
          <p className="text-xs text-slate-400">Select functional dining budget tier &amp; explore regional Himachali culinary highlights.</p>
        </div>

        <div className="flex items-center gap-2 bg-[#161B22] px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
          <span className="text-slate-400">Selected Tier:</span>
          <span className="text-[#0FA77A] font-bold">{state.foodPreference}</span>
        </div>
      </div>

      {/* Functional Dining Tier Selectors (Source of Truth) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {foodTiers.map((tier) => {
          const isSelected = state.foodPreference === tier.id;
          const calculatedCost = tier.dailyCost * days * totalTravellers;
          const Icon = tier.icon;

          return (
            <div
              key={tier.id}
              onClick={() => dispatch({ type: 'SET_FOOD_PREFERENCE', payload: tier.id })}
              className={`cursor-pointer bg-[#101419]/90 border rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all shadow-xl ${
                isSelected
                  ? 'border-[#0FA77A] ring-2 ring-[#0FA77A]/30 bg-[#101419]'
                  : 'border-white/15 hover:border-white/30 opacity-90 hover:opacity-100'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#0FA77A]/15 border border-[#0FA77A]/30 flex items-center justify-center text-[#0FA77A]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0FA77A]">₹{tier.dailyCost}/day/person</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{tier.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-400 font-mono">
                  <span>TRIP FOOD TOTAL ({days} days)</span>
                  <span className="font-bold text-white">₹{calculatedCost.toLocaleString()}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'SET_FOOD_PREFERENCE', payload: tier.id });
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-[#0FA77A] text-white shadow-md'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {isSelected ? '✓ Selected Dining Tier' : 'Choose Tier'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editorial Food Inspiration Cards */}
      <div className="bg-[#101419]/90 border border-white/15 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#0FA77A]" /> Old Manali Culinary Inspiration
          </h3>
          <p className="text-xs text-slate-400">Curated regional dishes and dining experiences in Old Manali.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {editorialDiscussions.map((item) => (
            <div key={item.title} className="bg-[#161B22] border border-white/10 rounded-xl overflow-hidden text-xs space-y-2">
              <div className="h-32 relative overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-full text-[9px] font-mono text-[#0FA77A] font-bold">
                  {item.tag}
                </div>
              </div>
              <div className="p-3 space-y-1">
                <h4 className="font-extrabold text-white text-xs line-clamp-1">{item.title}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 3 })}
          className="px-5 py-2.5 border border-white/15 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl transition-all"
        >
          &larr; Back to Places
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 5 })}
          className="px-8 py-3.5 bg-gradient-to-r from-[#0FA77A] to-[#0B8465] hover:brightness-110 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-[#0FA77A]/20 flex items-center gap-2 uppercase tracking-wider"
        >
          <span>Continue to Stay &rarr;</span>
        </button>
      </div>

    </div>
  );
};

/* ========================================================
   6. STAGE 05 — ACCOMMODATION & STAY DISCOVERY
   ======================================================== */
export const StayStage: React.FC<{ onExecutePlan: () => void }> = ({ onExecutePlan }) => {
  const { state, dispatch } = usePlanner();

  const stayTiers = [
    {
      id: 'BUDGET' as const,
      name: 'Old Manali Backpacker Hostel / Homestay',
      rate: 500,
      description: 'Shared dorm or simple private room with basic mountain amenities in Old Manali.',
      tag: 'Budget Tier',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'STANDARD' as const,
      name: 'Manali Riverside Guest House',
      rate: 1500,
      description: 'Clean private room with attached bathroom, Wi-Fi, and river view balcony.',
      tag: 'Standard Tier (Recommended)',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'COMFORT' as const,
      name: 'Himalayan Boutique Heritage Hotel',
      rate: 3000,
      description: 'Premium heated room with breakfast included, balcony view, and room service.',
      tag: 'Comfort Tier',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop'
    }
  ];

  const nights = 6;
  const currentTier = stayTiers.find(s => s.id === state.stayPreference) || stayTiers[1];
  const calculatedStayCost = currentTier.rate * nights;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#101419]/90 border border-white/15 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 4 })}
              className="text-xs font-mono font-bold text-[#0FA77A] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Stage 04
            </button>
            <span className="text-slate-500">&bull;</span>
            <span className="text-xs font-mono text-slate-400">Stage 05 of 07</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Accommodation &amp; Lodging Selection</h2>
          <p className="text-xs text-slate-400">Select lodging tier for your stay in Old Manali ({nights} Nights).</p>
        </div>

        <div className="flex items-center gap-2 bg-[#161B22] px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
          <span className="text-slate-400">Lodging Preference:</span>
          <span className="text-[#0FA77A] font-bold">{state.stayPreference}</span>
        </div>
      </div>

      {/* Accommodation Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stayTiers.map((stay) => {
          const isSelected = state.stayPreference === stay.id;
          const totalCost = stay.rate * nights;

          return (
            <div
              key={stay.id}
              onClick={() => dispatch({ type: 'SET_STAY_PREFERENCE', payload: stay.id })}
              className={`cursor-pointer bg-[#101419]/90 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all shadow-xl ${
                isSelected
                  ? 'border-[#0FA77A] ring-2 ring-[#0FA77A]/30 bg-[#101419]'
                  : 'border-white/15 hover:border-white/30 opacity-90 hover:opacity-100'
              }`}
            >
              <div className="space-y-3">
                <div className="h-44 relative overflow-hidden">
                  <img src={stay.image} alt={stay.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101419] via-transparent to-black/30" />
                  <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#0FA77A] font-bold">
                    {stay.tag}
                  </span>
                  <div className="absolute bottom-3 right-3 bg-[#101419]/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono font-bold text-white border border-white/15">
                    ₹{stay.rate}/night
                  </div>
                </div>

                <div className="p-4 space-y-1 text-xs">
                  <h3 className="text-base font-extrabold text-white">{stay.name}</h3>
                  <p className="text-slate-400 leading-relaxed">{stay.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-400 font-mono pt-3 border-t border-white/10">
                  <span>TOTAL STAY COST ({nights} nights)</span>
                  <span className="font-bold text-[#0FA77A] text-sm">₹{totalCost.toLocaleString()}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'SET_STAY_PREFERENCE', payload: stay.id });
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-[#0FA77A] text-white shadow-md'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {isSelected ? '✓ Selected Lodging' : 'Choose Lodging'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Trip Selection Summary Drawer / Rail */}
      <div className="bg-[#101419]/90 border border-white/15 rounded-2xl p-6 space-y-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="space-y-0.5">
            <span className="text-xs font-mono font-bold text-[#0FA77A] uppercase tracking-wider block">
              Trip Workspace Summary
            </span>
            <h3 className="text-lg font-extrabold text-white">Your Configured Trip Parameters</h3>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">HARD BUDGET CAP</span>
            <span className="text-xl font-bold font-mono text-[#0FA77A]">₹{state.maximumBudget.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#161B22] p-4 rounded-xl border border-white/10 space-y-1">
            <span className="text-slate-400 font-mono text-[10px]">ROUTE &amp; TRANSPORT</span>
            <p className="font-bold text-white">{state.origin} &rarr; {state.destination}</p>
            <p className="text-[11px] text-slate-400">Profile: {state.selectedRouteOption}</p>
          </div>

          <div className="bg-[#161B22] p-4 rounded-xl border border-white/10 space-y-1">
            <span className="text-slate-400 font-mono text-[10px]">PLACES &amp; EXPERIENCES</span>
            <p className="font-bold text-white">{state.selectedPlaces.length + state.selectedDiscoveryPlaces.length} Must-See Items</p>
            <p className="text-[11px] text-slate-400">Pace: {state.travelPace}</p>
          </div>

          <div className="bg-[#161B22] p-4 rounded-xl border border-white/10 space-y-1">
            <span className="text-slate-400 font-mono text-[10px]">DINING TIER</span>
            <p className="font-bold text-white">{state.foodPreference} Tier</p>
            <p className="text-[11px] text-slate-400">{state.dietPreference}</p>
          </div>

          <div className="bg-[#161B22] p-4 rounded-xl border border-white/10 space-y-1">
            <span className="text-slate-400 font-mono text-[10px]">LODGING TIER</span>
            <p className="font-bold text-white">{state.stayPreference} Tier</p>
            <p className="text-[11px] text-slate-400">Est. ₹{calculatedStayCost.toLocaleString()} / trip</p>
          </div>
        </div>

        {/* Primary CTA: Run Solver */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-slate-400 text-xs">
            Ready to generate deterministic time-dependent itinerary &amp; DP budget allocation?
          </span>

          <button
            type="button"
            onClick={onExecutePlan}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#0FA77A] to-[#0B8465] hover:brightness-110 text-white font-bold text-sm rounded-xl transition-all shadow-xl shadow-[#0FA77A]/20 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <span>Run Complete Journey Optimization &rarr;</span>
          </button>
        </div>
      </div>

    </div>
  );
};


