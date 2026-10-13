'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePlanner, PlannerStage } from '@/context/PlannerContext';
import { Logo } from './Logo';
import { SafeImage } from './SafeImage';

import {
  getTransportAlternatives,
  getDestinationAttractions,
  getDestinationFood,
  getDestinationHotels,
  TransportAlternative,
  AttractionItem,
  FoodPlaceItem,
  HotelItem
} from '@/services/destinations';
import {
  MapPin, Wallet, Calendar, Users, Check, ArrowLeft,
  Sparkles, Navigation, Plus, Utensils, Coffee,
  Clock, Star, AlertCircle, RefreshCw
} from 'lucide-react';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-center text-xs text-stone-500">
      Loading OpenStreetMap...
    </div>
  )
});

// Seeded Indian Hubs for Instant Autocomplete
const SEEDED_INDIAN_HUBS = [
  'Sangli', 'Pune', 'Mumbai', 'Delhi', 'Manali', 'Old Manali', 'Goa',
  'Jaipur', 'Bengaluru', 'Mysuru', 'Chennai', 'Pondicherry', 'Kochi',
  'Munnar', 'Kolkata', 'Darjeeling', 'Varanasi', 'Agra', 'Udaipur',
  'Amritsar', 'Shimla', 'Rishikesh', 'Haridwar', 'Hyderabad', 'Ahmedabad',
  'Chandigarh', 'Miraj'
];

// Guaranteed Presentation Corridors
const POPULAR_CORRIDORS = [
  { origin: 'Sangli', dest: 'Old Manali', budget: 40000, label: 'Sangli → Manali' },
  { origin: 'Pune', dest: 'Goa', budget: 25000, label: 'Pune → Goa' },
  { origin: 'Mumbai', dest: 'Jaipur', budget: 28000, label: 'Mumbai → Jaipur' },
  { origin: 'Delhi', dest: 'Manali', budget: 20000, label: 'Delhi → Manali' },
  { origin: 'Bengaluru', dest: 'Mysuru', budget: 12000, label: 'Bengaluru → Mysuru' }
];

/* ========================================================
   1. PLANNER TOP NAVIGATION BAR
   ======================================================== */
export const PlannerTopNav: React.FC = () => {
  const { state, dispatch } = usePlanner();

  const stages = [
    { id: 1, label: '01 SETUP', full: '01 TRIP SETUP', active: state.stage === 1 },
    { id: 2, label: '02 TRANSIT', full: '02 TRANSPORTATION', active: state.stage === 2 },
    { id: 3, label: '03 PLACES', full: '03 EXPERIENCES', active: state.stage === 3 },
    { id: 4, label: '04 FOOD', full: '04 REGIONAL DINING', active: state.stage === 4 },
    { id: 5, label: '05 STAYS', full: '05 HOTELS & LODGING', active: state.stage === 5 },
    { id: 6, label: '06 REVIEW', full: '06 BUDGET REVIEW', active: state.stage === 6 },
    { id: 7, label: '07 ITINERARY', full: '07 FINAL ITINERARY', active: state.stage === 7 }
  ];

  // Calculate estimated total expenditure so far
  const transportCost = (state.selectedTransportAlternative?.total_cost || 0) * state.travellers;
  const placesCost = state.selectedAttractionItems.reduce((acc, a) => acc + (a.entry_fee || 0), 0) * state.travellers;
  const dep = new Date(state.departureDate);
  const ret = new Date(state.returnDate);
  const nights = Math.max(1, Math.round((ret.getTime() - dep.getTime()) / (1000 * 3600 * 24)) - 1);
  const hotelCost = (state.selectedHotelItem?.price_per_night || 1200) * nights;
  const foodRatePerDay = state.foodPreference === 'BASIC' ? 300 : state.foodPreference === 'FLEXIBLE' ? 1200 : 700;
  const foodCost = foodRatePerDay * (nights + 1) * state.travellers;
  const estimatedSpent = transportCost + placesCost + hotelCost + foodCost;
  const remainingBudget = state.maximumBudget - estimatedSpent;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 text-[#0B192C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Logo light={false} />
          <span className="hidden xl:inline-block text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Multi-Modal Planner
          </span>
        </div>

        {/* 7-Stage Progress Stepper (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {stages.map((s) => {
            const isDone = s.id < state.stage;
            const isActive = state.stage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (s.id <= state.stage || s.id <= 6) {
                    dispatch({ type: 'SET_STAGE', payload: s.id as PlannerStage });
                  }
                }}

                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0B192C] text-white shadow-sm ring-2 ring-[#0B192C]/20'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {isDone && <Check className="w-3 h-3 text-emerald-600" />}
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Budget Pill & Exit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-mono">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-stone-500 hidden sm:inline">CAP:</span>
            <span className="font-bold text-[#0B192C]">₹{state.maximumBudget.toLocaleString()}</span>
            <span className="text-stone-300 hidden sm:inline">&bull;</span>
            <span className={`text-[11px] font-bold hidden sm:inline ${remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              REM: ₹{remainingBudget.toLocaleString()}
            </span>
          </div>

          <Link
            href="/"
            className="text-xs font-bold text-stone-600 hover:text-[#0B192C] px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Exit
          </Link>
        </div>
      </div>
    </header>
  );
};

/* ========================================================
   2. STAGE 01 — TRIP SETUP
   ======================================================== */
export const TripSetupStage: React.FC = () => {
  const { state, dispatch } = usePlanner();

  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const dep = new Date(state.departureDate);
  const ret = new Date(state.returnDate);
  const diffDays = Math.max(1, Math.round((ret.getTime() - dep.getTime()) / (1000 * 3600 * 24)));
  const nights = Math.max(0, diffDays - 1);
  const todayStr = new Date().toISOString().split('T')[0];

  const isOriginValid = Boolean(state.origin && state.origin.trim().length >= 2);
  const isDestValid = Boolean(state.destination && state.destination.trim().length >= 2);
  const isSameLocation = isOriginValid && isDestValid && state.origin.trim().toLowerCase() === state.destination.trim().toLowerCase();
  const isDepInPast = Boolean(state.departureDate && state.departureDate < todayStr);
  const isReturnBeforeDep = Boolean(state.returnDate && state.departureDate && state.returnDate < state.departureDate);
  const isBudgetValid = state.maximumBudget > 0;
  const isTravellersValid = state.travellers >= 1 && state.travellers <= 20;

  const canContinue = isOriginValid && isDestValid && !isSameLocation && !isDepInPast && !isReturnBeforeDep && isBudgetValid && isTravellersValid;

  let validationWarning: string | null = null;
  if (!isOriginValid && !isDestValid) {
    validationWarning = 'Please enter starting city and destination.';
  } else if (!isOriginValid) {
    validationWarning = 'Please specify a starting location.';
  } else if (!isDestValid) {
    validationWarning = 'Please specify a destination.';
  } else if (isSameLocation) {
    validationWarning = 'Starting point and destination must be distinct cities.';
  } else if (isDepInPast) {
    validationWarning = 'Departure date cannot be in the past.';
  } else if (isReturnBeforeDep) {
    validationWarning = 'Return date must be on or after departure date.';
  }

  const handleOriginSearch = (val: string) => {
    dispatch({ type: 'SET_ORIGIN', payload: val });
    if (val.trim().length > 0) {
      const filtered = SEEDED_INDIAN_HUBS.filter((h) => h.toLowerCase().includes(val.toLowerCase()));
      setOriginSuggestions(filtered);
      setShowOriginDropdown(true);
    } else {
      setShowOriginDropdown(false);
    }
  };

  const handleDestSearch = (val: string) => {
    dispatch({ type: 'SET_DESTINATION', payload: val });
    if (val.trim().length > 0) {
      const filtered = SEEDED_INDIAN_HUBS.filter((h) => h.toLowerCase().includes(val.toLowerCase()));
      setDestSuggestions(filtered);
      setShowDestDropdown(true);
    } else {
      setShowDestDropdown(false);
    }
  };

  const travelStyles = [
    { id: 'Budget' as const, label: 'BUDGET', desc: 'Dorm / standard rail, dhabas, value sightseeing' },
    { id: 'Balanced' as const, label: 'BALANCED', desc: 'Comfort trains/buses, guest houses, local cafes' },
    { id: 'Comfort' as const, label: 'COMFORT', desc: 'AC express, boutique hotels, curated food' },
    { id: 'Adventure' as const, label: 'ADVENTURE', desc: 'Treks, mountain trails, scenic passes' },
    { id: 'Relaxed' as const, label: 'RELAXED', desc: 'Slow strolls, mountain views, riverside resting' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT 55%: FORM */}
      <div className="lg:col-span-7 space-y-8">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider block">
              Stage 01 of 07 &bull; Trip Setup
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B192C]">
              Where &amp; when are you traveling?
            </h2>
            <p className="text-xs text-stone-500">
              Select any Indian starting city and destination. We calculate multi-modal routes strictly within your trip budget.
            </p>
          </div>

          {/* Quick Corridor Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Popular Guaranteed Corridors:
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_CORRIDORS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'SET_ORIGIN', payload: c.origin });
                    dispatch({ type: 'SET_DESTINATION', payload: c.dest });
                    dispatch({ type: 'SET_MAXIMUM_BUDGET', payload: c.budget });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-[#0B192C] transition-colors"
                >
                  {c.label} (₹{c.budget.toLocaleString()})
                </button>
              ))}
            </div>
          </div>

          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Origin */}
            <div className="relative space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Starting City
              </label>
              <input
                id="planner-origin-input"
                type="text"
                placeholder="e.g. Sangli, Pune, Mumbai..."
                value={state.origin}
                onChange={(e) => handleOriginSearch(e.target.value)}
                onFocus={() => setShowOriginDropdown(true)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-[#0B192C] font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              {showOriginDropdown && originSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-2xl shadow-xl z-30 max-h-48 overflow-y-auto">
                  {originSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        dispatch({ type: 'SET_ORIGIN', payload: sug });
                        setShowOriginDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-stone-50 text-[#0B192C] font-semibold flex items-center justify-between"
                    >
                      <span>{sug}</span>
                      <span className="text-[10px] text-stone-400 font-mono">Transit Node</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination */}
            <div className="relative space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-sky-600" /> Destination
              </label>
              <input
                id="planner-dest-input"
                type="text"
                placeholder="e.g. Old Manali, Goa, Jaipur..."
                value={state.destination}
                onChange={(e) => handleDestSearch(e.target.value)}
                onFocus={() => setShowDestDropdown(true)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-[#0B192C] font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              {showDestDropdown && destSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-2xl shadow-xl z-30 max-h-48 overflow-y-auto">
                  {destSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        dispatch({ type: 'SET_DESTINATION', payload: sug });
                        setShowDestDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-stone-50 text-[#0B192C] font-semibold flex items-center justify-between"
                    >
                      <span>{sug}</span>
                      <span className="text-[10px] text-stone-400 font-mono">Destination</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Validation Warning */}
          {validationWarning && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{validationWarning}</span>
            </div>
          )}

          {/* Dates & Duration Banner */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Departure Date
                </label>
                <input
                  id="departure-date-input"
                  type="date"
                  min={todayStr}
                  value={state.departureDate}
                  onChange={(e) => dispatch({ type: 'SET_DEPARTURE_DATE', payload: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-[#0B192C] font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" /> Return Date
                </label>
                <input
                  id="return-date-input"
                  type="date"
                  min={state.departureDate || todayStr}
                  value={state.returnDate}
                  onChange={(e) => dispatch({ type: 'SET_RETURN_DATE', payload: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-[#0B192C] font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs font-mono font-bold text-emerald-900">
              <span>TRIP DURATION:</span>
              <span>{diffDays} DAYS &bull; {nights} NIGHTS</span>
            </div>
          </div>

          {/* Budget Input & Presets */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" /> Total Trip Budget Cap (₹)
              </span>
              <span className="font-mono text-sm text-emerald-700 font-bold">
                ₹{state.maximumBudget.toLocaleString()}
              </span>
            </label>

            <input
              type="number"
              step="500"
              min="1000"
              value={state.maximumBudget}
              onChange={(e) => dispatch({ type: 'SET_MAXIMUM_BUDGET', payload: Number(e.target.value) })}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-lg font-mono font-bold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />

            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { amount: 8000, label: 'Backpacker' },
                { amount: 20000, label: 'Standard' },
                { amount: 40000, label: 'Comfort Plus' }
              ].map((p) => (
                <button
                  key={p.amount}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_MAXIMUM_BUDGET', payload: p.amount })}
                  className={`p-2.5 rounded-2xl border text-center font-mono transition-all ${
                    state.maximumBudget === p.amount
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span className="block font-bold">₹{p.amount.toLocaleString()}</span>
                  <span className="text-[10px] opacity-80">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Travellers Count */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" /> Number of Travellers
              </span>
              <span className="font-mono text-sm text-[#0B192C] font-bold">
                {state.travellers} {state.travellers === 1 ? 'Person' : 'People'}
              </span>
            </label>

            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_TRAVELLERS_COUNT', payload: num })}
                  className={`flex-1 py-2.5 rounded-2xl border text-xs font-bold font-mono transition-all ${
                    state.travellers === num
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {num} {num === 1 ? 'Solo' : 'Pax'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Travel Style */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#0B192C] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Travel Style &amp; Pace
            </h3>
            <p className="text-stone-500">Guides algorithm prioritization for transport class and lodging.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {travelStyles.map((style) => {
              const selected = state.travelStyle === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_TRAVEL_STYLE', payload: style.id })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selected
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="block font-bold text-xs">{style.label}</span>
                  <span className="block text-[11px] text-stone-500 mt-0.5">{style.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Continue Action */}
        <div className="pt-2 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            {canContinue ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Ready to select transport
              </span>
            ) : (
              <span className="text-stone-400">Please provide valid trip details</span>
            )}
          </div>

          <button
            id="trip-setup-continue-btn"
            type="button"
            disabled={!canContinue}
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 2 })}
            className={`px-8 py-4 font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 uppercase tracking-wider ${
              canContinue
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-600/30'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <span>Continue to Transport &rarr;</span>
          </button>
        </div>
      </div>

      {/* RIGHT 45%: MAP & SUMMARY */}
      <div className="lg:col-span-5 sticky top-20 space-y-6">
        <div className="bg-white border border-stone-200 rounded-3xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs">
            <span className="font-bold text-[#0B192C] flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-emerald-600" /> Route Corridor
            </span>
            <span className="font-mono text-stone-400 text-[11px]">OpenStreetMap</span>
          </div>

          <InteractiveMap
            origin={state.origin || 'Sangli'}
            destination={state.destination || 'Old Manali'}
          />

          <div className="pt-2 text-xs font-mono text-stone-600 flex items-center justify-between border-t border-stone-100">
            <span className="text-emerald-700 font-bold">FROM: {state.origin || '---'}</span>
            <span className="text-sky-700 font-bold">TO: {state.destination || '---'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================
   3. STAGE 02 — TRANSPORTATION (MULTI-MODAL ALTERNATIVES)
   ======================================================== */
export const TransportStage: React.FC<{ onExecutePlan?: () => void }> = () => {
  const { state, dispatch } = usePlanner();

  const [alternatives, setAlternatives] = useState<TransportAlternative[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getTransportAlternatives(state.origin || 'Sangli', state.destination || 'Old Manali')

      .then((res) => {
        if (mounted) {
          const list = res.alternatives || [];
          setAlternatives(list);
          // If none selected, default to RECOMMENDED
          if (!state.selectedTransportAlternative && list.length > 0) {
            dispatch({ type: 'SET_SELECTED_TRANSPORT', payload: list[0] });
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [state.origin, state.destination, dispatch, state.selectedTransportAlternative]);

  const originName = state.origin || 'Origin';
  const destName = state.destination || 'Destination';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 1 })}
              className="text-xs font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Stage 01
            </button>
            <span className="text-stone-300">&bull;</span>
            <span className="text-xs font-mono text-stone-500">Stage 02 of 07</span>
          </div>
          <h2 className="text-2xl font-black text-[#0B192C]">
            Select Transportation Option
          </h2>
          <p className="text-xs text-stone-500">
            Multi-modal corridors connecting {originName} &rarr; {destName} with verified layovers and fares.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 font-bold">
            Selected: {state.selectedTransportAlternative?.label || 'Recommended'}
          </span>
        </div>
      </div>

      {/* Alternatives List */}
      {loading ? (
        <div className="p-16 text-center text-xs text-stone-500 bg-white rounded-3xl border border-stone-200 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Computing time-dependent multi-modal transit options...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {alternatives.map((alt) => {
            const isSelected = state.selectedTransportAlternative?.id === alt.id || state.selectedTransportAlternative?.label === alt.label;
            const remainingBudget = state.maximumBudget - (alt.total_cost * state.travellers);
            const totalHours = Math.round(alt.duration_minutes / 60);

            const badgeColorMap: Record<string, string> = {
              'RECOMMENDED': 'bg-emerald-600 text-white',
              'CHEAPEST': 'bg-amber-600 text-white',
              'FASTEST': 'bg-sky-600 text-white',
              'COMFORT': 'bg-purple-600 text-white',
              'LOWEST TRANSFERS': 'bg-teal-600 text-white'
            };

            return (
              <div
                key={alt.id}
                data-testid="alt-card"
                role="button"
                tabIndex={0}
                onClick={() => dispatch({ type: 'SET_SELECTED_TRANSPORT', payload: alt })}
                className={`cursor-pointer bg-white border rounded-3xl p-6 sm:p-8 transition-all space-y-4 shadow-sm hover:shadow-md relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${badgeColorMap[alt.label] || 'bg-stone-800 text-white'}`}>
                      {alt.label}
                    </span>
                    <span className="text-xs font-mono text-stone-500">
                      {totalHours}h {alt.duration_minutes % 60}m &bull; {alt.transfers} Transfer(s)
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-700 font-mono">
                      ₹{alt.total_cost.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-stone-400 font-mono">
                      ₹{(alt.total_cost * state.travellers).toLocaleString()} for {state.travellers} traveler(s)
                    </span>
                  </div>
                </div>

                {/* Segments Timeline */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Transit Timeline &amp; Connectors:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {alt.segments.map((seg, idx) => (
                      <div
                        key={idx}
                        className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between text-stone-500 text-[10px]">
                          <span className="font-bold text-emerald-700">{seg.transport_mode}</span>
                          <span>{Math.round(seg.duration_minutes / 60)}h {seg.duration_minutes % 60}m</span>
                        </div>
                        <div className="font-bold text-[#0B192C] text-xs">
                          {seg.source_city} &rarr; {seg.dest_city}
                        </div>
                        <div className="text-[10px] text-stone-500 flex items-center justify-between">
                          <span>{seg.provider}</span>
                          <span className="font-bold text-stone-700">₹{seg.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Selection & Remaining Budget */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-stone-500 font-mono">
                      Remaining Budget after transit:
                    </span>
                    <span className={`font-mono font-bold ${remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      ₹{remainingBudget.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'SET_SELECTED_TRANSPORT', payload: alt });
                    }}
                    className={`px-5 py-2 rounded-xl font-bold text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {isSelected ? '✓ Selected Route' : 'Choose Route'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 1 })}
          className="px-6 py-3 border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-2xl transition-all"
        >
          &larr; Back to Setup
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 3 })}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 uppercase tracking-wider"
        >
          <span>Continue to Places &rarr;</span>
        </button>
      </div>
    </div>
  );
};

/* ========================================================
   4. STAGE 03 — PLACES & ATTRACTIONS
   ======================================================== */
export const PlacesStage: React.FC = () => {
  const { state, dispatch } = usePlanner();

  const [attractions, setAttractions] = useState<AttractionItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getDestinationAttractions(state.destination || 'Old Manali')

      .then((items) => {
        if (mounted) {
          setAttractions(items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [state.destination]);

  const categories = ['ALL', 'RECOMMENDED', 'NATURE', 'HERITAGE', 'ADVENTURE', 'SPIRITUAL', 'SHOPPING', 'FREE'];

  const filtered = attractions.filter((a) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'FREE') return a.entry_fee === 0;
    if (activeCategory === 'RECOMMENDED') return (a.recommended_score || 0) >= 8.5;
    return a.category?.toUpperCase() === activeCategory;
  });

  const selectedCount = state.selectedAttractionItems.length;
  const placesSubtotal = state.selectedAttractionItems.reduce((acc, a) => acc + (a.entry_fee || 0), 0) * state.travellers;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 2 })}
              className="text-xs font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Stage 02
            </button>
            <span className="text-stone-300">&bull;</span>
            <span className="text-xs font-mono text-stone-500">Stage 03 of 07</span>
          </div>
          <h2 className="text-2xl font-black text-[#0B192C]">
            Experiences &amp; Must-Visit Places in {state.destination}
          </h2>
          <p className="text-xs text-stone-500">
            Pick activities to include. Mark must-visits to make them hard constraints in your daily schedule.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-stone-50 px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-mono">
            <span className="text-stone-500">Selected: </span>
            <span className="font-bold text-emerald-700">{selectedCount} Places</span>
            <span className="text-stone-400 ml-2">(₹{placesSubtotal.toLocaleString()})</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? 'bg-[#0B192C] text-white border-[#0B192C]'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-stone-500 bg-white rounded-3xl border border-stone-200 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading verified attractions for {state.destination}...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((place) => {
            const isAdded = state.selectedAttractionItems.some((a) => a.id === place.id);
            const isMustVisit = state.mustVisitPlaceIds.includes(place.id);

            return (
              <div
                key={place.id}
                className={`bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isAdded
                    ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                    : 'border-stone-200'
                }`}
              >
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <SafeImage
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white">
                    {place.category}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'TOGGLE_MUST_VISIT_PLACE', payload: place.id })}
                      title={isMustVisit ? 'Remove hard constraint' : 'Mark as must-visit constraint'}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold backdrop-blur-md transition-all flex items-center gap-1 ${
                        isMustVisit
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-black/50 text-white hover:bg-black/70'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${isMustVisit ? 'fill-current' : ''}`} />
                      <span>{isMustVisit ? 'Must-Visit' : 'Mark Must'}</span>
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {place.visit_duration_minutes}m
                    </span>
                    <span className="font-bold">
                      {place.entry_fee === 0 ? 'FREE' : `₹${place.entry_fee}`}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-[#0B192C] text-sm line-clamp-1">{place.name}</h3>
                      <span className="text-[11px] font-mono text-amber-600 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-current" /> {place.rating}
                      </span>
                    </div>
                    <p className="text-stone-500 leading-relaxed text-[11px] line-clamp-2">
                      {place.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 font-mono">
                      Hours: {place.opening_time} - {place.closing_time}
                    </span>

                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'TOGGLE_ATTRACTION_ITEM', payload: place })}
                      className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                        isAdded
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Add Place
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 2 })}
          className="px-6 py-3 border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-2xl transition-all"
        >
          &larr; Back to Transport
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 4 })}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 uppercase tracking-wider"
        >
          <span>Continue to Food &rarr;</span>
        </button>
      </div>
    </div>
  );
};

/* ========================================================
   5. STAGE 04 — REGIONAL DINING & FOOD
   ======================================================== */
export const FoodStage: React.FC = () => {
  const { state, dispatch } = usePlanner();

  const [foodPlaces, setFoodPlaces] = useState<FoodPlaceItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getDestinationFood(state.destination || 'Old Manali')

      .then((items) => {
        if (mounted) {
          setFoodPlaces(items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [state.destination]);

  const diningTiers = [
    {
      id: 'BASIC' as const,
      name: 'LOCAL DHABAS & THALIS',
      dailyCost: 300,
      desc: 'Authentic local eateries, street food stalls, chai & hot parathas.'
    },
    {
      id: 'BALANCED' as const,
      name: 'BALANCED CAFÉ DINING',
      dailyCost: 700,
      desc: 'Popular town cafes, fresh regional cuisine & riverside breakfast.'
    },
    {
      id: 'FLEXIBLE' as const,
      name: 'GOURMET & SPECIALTY',
      dailyCost: 1200,
      desc: 'Artisanal bakeries, destination dining & heritage dinners.'
    }
  ];

  const dep = new Date(state.departureDate);
  const ret = new Date(state.returnDate);
  const days = Math.max(1, Math.round((ret.getTime() - dep.getTime()) / (1000 * 3600 * 24)));

  const categories = ['ALL', 'LOCAL', 'VEGETARIAN', 'CAFE', 'STREET FOOD', 'PREMIUM'];

  const filtered = foodPlaces.filter((f) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'VEGETARIAN') return (f.dietary || '').toLowerCase().includes('veg');
    return (f.cuisine || '').toUpperCase().includes(activeCategory);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 3 })}
              className="text-xs font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Stage 03
            </button>
            <span className="text-stone-300">&bull;</span>
            <span className="text-xs font-mono text-stone-500">Stage 04 of 07</span>
          </div>
          <h2 className="text-2xl font-black text-[#0B192C]">
            Regional Dining &amp; Food in {state.destination}
          </h2>
          <p className="text-xs text-stone-500">
            Set your daily dining allocation tier and browse verified local culinary spots.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-50 px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-mono">
          <span className="text-stone-500">Active Tier: </span>
          <span className="font-bold text-emerald-700">{state.foodPreference}</span>
        </div>
      </div>

      {/* 3 Dining Allocation Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {diningTiers.map((tier) => {
          const isSelected = state.foodPreference === tier.id;
          const totalCost = tier.dailyCost * days * state.travellers;
          return (
            <div
              key={tier.id}
              onClick={() => dispatch({ type: 'SET_FOOD_PREFERENCE', payload: tier.id })}
              className={`cursor-pointer bg-white border rounded-3xl p-6 space-y-4 flex flex-col justify-between transition-all shadow-sm hover:shadow-md ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                  : 'border-stone-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Utensils className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-mono font-bold text-emerald-700">₹{tier.dailyCost}/day/pax</span>
                </div>
                <h3 className="font-black text-[#0B192C] text-base">{tier.name}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{tier.desc}</p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
                <span className="text-stone-400">Total ({days}d):</span>
                <span className="font-bold text-[#0B192C]">₹{totalCost.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verified Local Food Spots */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#0B192C] flex items-center gap-2">
            <Coffee className="w-4 h-4 text-emerald-600" />
            Verified Local Food Spots
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                  activeCategory === c
                    ? 'bg-[#0B192C] text-white border-[#0B192C]'
                    : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-stone-500 bg-white rounded-3xl border border-stone-200 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading food places...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((place) => {
              const isSelected = state.selectedFoodItems.some((f) => f.id === place.id);
              return (
                <div
                  key={place.id}
                  className={`bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                    isSelected ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-stone-200'
                  }`}
                >
                  <div className="relative h-44 overflow-hidden bg-stone-100">
                    <SafeImage
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white">
                      {place.cuisine}
                    </div>
                    <div className="absolute bottom-2 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-mono text-white">
                      ₹{place.cost_for_two} for two
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[#0B192C] text-sm">{place.name}</h4>
                        <span className="text-[11px] font-mono text-amber-600 font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-current" /> {place.rating}
                        </span>
                      </div>
                      <p className="text-emerald-700 font-semibold text-[11px]">
                        Speciality: {place.speciality}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 font-mono">
                        {place.opening_hours}
                      </span>

                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'TOGGLE_FOOD_ITEM', payload: place })}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{isSelected ? 'Added' : 'Add Spot'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 3 })}
          className="px-6 py-3 border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-2xl transition-all"
        >
          &larr; Back to Places
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 5 })}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 uppercase tracking-wider"
        >
          <span>Continue to Stays &rarr;</span>
        </button>
      </div>
    </div>
  );
};

/* ========================================================
   6. STAGE 05 — ACCOMMODATION & HOTELS
   ======================================================== */
export const StayStage: React.FC<{ onExecutePlan?: () => void }> = () => {
  const { state, dispatch } = usePlanner();

  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getDestinationHotels(state.destination || 'Old Manali')

      .then((items) => {
        if (mounted) {
          setHotels(items);
          if (!state.selectedHotelItem && items.length > 0) {
            dispatch({ type: 'SET_SELECTED_HOTEL', payload: items[0] });
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [state.destination, dispatch, state.selectedHotelItem]);

  const dep = new Date(state.departureDate);
  const ret = new Date(state.returnDate);
  const nights = Math.max(1, Math.round((ret.getTime() - dep.getTime()) / (1000 * 3600 * 24)) - 1);

  const categories = ['ALL', 'BUDGET', 'STANDARD', 'PREMIUM'];

  const filtered = hotels.filter((h) => {
    if (activeCategory === 'ALL') return true;
    return (h.category || '').toUpperCase() === activeCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 4 })}
              className="text-xs font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Stage 04
            </button>
            <span className="text-stone-300">&bull;</span>
            <span className="text-xs font-mono text-stone-500">Stage 05 of 07</span>
          </div>
          <h2 className="text-2xl font-black text-[#0B192C]">
            Select Primary Stay in {state.destination} ({nights} Nights)
          </h2>
          <p className="text-xs text-stone-500">
            Choose exactly one primary accommodation for your trip. Your running budget updates immediately.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-50 px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-mono">
          <span className="text-stone-500">Selected Stay: </span>
          <span className="font-bold text-emerald-700">{state.selectedHotelItem?.name || 'Standard Stay'}</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
              activeCategory === c
                ? 'bg-[#0B192C] text-white border-[#0B192C]'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Hotels Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-stone-500 bg-white rounded-3xl border border-stone-200 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading verified hotels for {state.destination}...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((hotel) => {
            const isSelected = state.selectedHotelItem?.id === hotel.id;
            const totalStayCost = hotel.price_per_night * nights;

            return (
              <div
                key={hotel.id}
                onClick={() => dispatch({ type: 'SET_SELECTED_HOTEL', payload: hotel })}
                className={`cursor-pointer bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isSelected ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-stone-200'
                }`}
              >
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <SafeImage
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase">
                    {hotel.category}
                  </div>
                  <div className="absolute bottom-2 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono font-bold text-white">
                    ₹{hotel.price_per_night}/night
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-[#0B192C] text-sm">{hotel.name}</h3>
                      <span className="text-[11px] font-mono text-amber-600 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-current" /> {hotel.rating}
                      </span>
                    </div>

                    <p className="text-stone-500 text-[11px]">
                      Room: <span className="font-semibold text-stone-700">{hotel.room_type}</span>
                    </p>

                    {hotel.amenities && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {hotel.amenities.slice(0, 4).map((amenity) => (
                          <span
                            key={amenity}
                            className="px-2 py-0.5 bg-stone-100 rounded-md text-[10px] text-stone-600"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-mono block">TOTAL ({nights} NIGHTS)</span>
                      <span className="font-bold text-[#0B192C] font-mono text-sm">₹{totalStayCost.toLocaleString()}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: 'SET_SELECTED_HOTEL', payload: hotel });
                      }}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {isSelected ? '✓ Selected Stay' : 'Select Stay'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 4 })}
          className="px-6 py-3 border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-2xl transition-all"
        >
          &larr; Back to Food
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 6 })}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 uppercase tracking-wider"
        >
          <span>Continue to Review &rarr;</span>
        </button>
      </div>
    </div>
  );
};
