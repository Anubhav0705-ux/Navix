'use client';

import React from 'react';
import { usePlanner } from '@/context/PlannerContext';
import {
  Sparkles, MapPin, ArrowRight, ArrowLeft,
  Train, Bed, Utensils, AlertTriangle, ShieldCheck, Edit3,
  Star
} from 'lucide-react';


interface ReviewStageProps {
  onExecutePlan: () => void;
  isSubmitting?: boolean;
}

export const ReviewStage: React.FC<ReviewStageProps> = ({
  onExecutePlan,
  isSubmitting = false
}) => {
  const { state, dispatch } = usePlanner();

  // Duration
  const dep = new Date(state.departureDate);
  const ret = new Date(state.returnDate);
  const diffDays = Math.max(1, Math.round((ret.getTime() - dep.getTime()) / (1000 * 3600 * 24)));
  const nights = Math.max(0, diffDays - 1);

  // Cost calculations
  const transportCost = (state.selectedTransportAlternative?.total_cost || 0) * state.travellers;
  const stayCost = (state.selectedHotelItem?.price_per_night || 1200) * nights;
  const foodRatePerDay = state.foodPreference === 'BASIC' ? 300 : state.foodPreference === 'FLEXIBLE' ? 1200 : 700;
  const foodCost = foodRatePerDay * diffDays * state.travellers;
  const activitiesCost = state.selectedAttractionItems.reduce((acc, a) => acc + (a.entry_fee || 0), 0) * state.travellers;
  const localTransferCost = Math.round(150 * diffDays * state.travellers);
  const contingencyBuffer = Math.round(state.maximumBudget * 0.08);

  const totalCalculated = transportCost + stayCost + foodCost + activitiesCost + localTransferCost + contingencyBuffer;
  const remainingBudget = state.maximumBudget - totalCalculated;

  // Budget status
  let budgetStatus: 'COMFORTABLE' | 'TIGHT' | 'OVER BUDGET' = 'COMFORTABLE';
  if (remainingBudget < 0) {
    budgetStatus = 'OVER BUDGET';
  } else if (remainingBudget < state.maximumBudget * 0.1) {
    budgetStatus = 'TIGHT';
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 5 })}
              className="text-xs font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Stage 05
            </button>
            <span className="text-stone-300">&bull;</span>
            <span className="text-xs font-mono text-stone-500">Stage 06 of 07</span>
          </div>
          <h2 className="text-2xl font-black text-[#0B192C]">
            Review Journey &amp; Budget Optimization
          </h2>
          <p className="text-xs text-stone-500">
            Verify transport, accommodations, dining, and must-visits before generating your daily timetable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase border ${
              budgetStatus === 'COMFORTABLE'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : budgetStatus === 'TIGHT'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            Budget Status: {budgetStatus}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Review Summary (7 cols) + Right Budget Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: SECTIONS REVIEW */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Trip Setup Card */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> 1. Trip Corridor
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 1 })}
                className="text-xs font-bold text-stone-500 hover:text-emerald-700 flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-[#0B192C]">
                  {state.origin || 'Sangli'} &rarr; {state.destination || 'Old Manali'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {state.departureDate} to {state.returnDate} ({diffDays} Days / {nights} Nights)
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#0B192C] block">
                  {state.travellers} Traveler(s)
                </span>
                <span className="text-[11px] text-emerald-700 font-mono font-semibold">
                  {state.travelStyle} Style
                </span>
              </div>
            </div>
          </div>

          {/* 2. Transportation Card */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <Train className="w-3.5 h-3.5" /> 2. Selected Transport
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 2 })}
                className="text-xs font-bold text-stone-500 hover:text-emerald-700 flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0B192C] text-sm">
                    {state.selectedTransportAlternative?.label || 'Recommended'} Multi-Modal Transit
                  </h4>
                  <p className="text-xs text-stone-500">
                    {state.selectedTransportAlternative?.transfers || 2} transfers &bull; Safe layovers enforced
                  </p>
                </div>
                <span className="font-mono font-bold text-emerald-700 text-base">
                  ₹{transportCost.toLocaleString()}
                </span>
              </div>

              {state.selectedTransportAlternative?.segments && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {state.selectedTransportAlternative.segments.map((seg, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-xl text-[11px] font-mono text-stone-700"
                    >
                      {seg.source_city} &rarr; {seg.dest_city} ({seg.transport_mode})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Experiences & Places Card */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 3. Selected Experiences ({state.selectedAttractionItems.length})
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 3 })}
                className="text-xs font-bold text-stone-500 hover:text-emerald-700 flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>

            {state.selectedAttractionItems.length === 0 ? (
              <p className="text-xs text-stone-400 italic">
                No specific attractions picked. Algorithm will automatically schedule top recommended highlights.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {state.selectedAttractionItems.map((act) => {
                    const isMust = state.mustVisitPlaceIds.includes(act.id);
                    return (
                      <span
                        key={act.id}
                        className={`px-3 py-1 rounded-xl text-xs font-medium border flex items-center gap-1.5 ${
                          isMust
                            ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        {isMust && <Star className="w-3 h-3 fill-current text-amber-600" />}
                        <span>{act.name}</span>
                        <span className="text-stone-400 text-[10px]">({act.entry_fee === 0 ? 'Free' : `₹${act.entry_fee}`})</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. Food & Dining Card */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" /> 4. Dining Allocation
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 4 })}
                className="text-xs font-bold text-stone-500 hover:text-emerald-700 flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#0B192C] text-sm">
                  {state.foodPreference} DINING TIER
                </h4>
                <p className="text-xs text-stone-500">
                  ₹{foodRatePerDay}/day per person &bull; {state.selectedFoodItems.length} curated food spots bookmarked
                </p>
              </div>
              <span className="font-mono font-bold text-emerald-700 text-base">
                ₹{foodCost.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 5. Stay Card */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5" /> 5. Primary Accommodation
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 5 })}
                className="text-xs font-bold text-stone-500 hover:text-emerald-700 flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#0B192C] text-sm">
                  {state.selectedHotelItem?.name || 'Standard Riverside Homestay'}
                </h4>
                <p className="text-xs text-stone-500">
                  {state.selectedHotelItem?.room_type || 'Private Room'} &bull; {nights} Nights
                </p>
              </div>
              <span className="font-mono font-bold text-emerald-700 text-base">
                ₹{stayCost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BUDGET HEALTH PANEL */}
        <div className="lg:col-span-5 sticky top-20 space-y-6">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider block">
                Deterministic Budget Auditor
              </span>
              <h3 className="text-xl font-black text-[#0B192C]">
                Trip Cost Ledger
              </h3>
            </div>

            {/* Breakdown Items */}
            <div className="space-y-3 divide-y divide-stone-100 text-xs">
              <div className="flex items-center justify-between pt-1 font-mono">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-stone-400" /> Transit Fare
                </span>
                <span className="font-bold text-[#0B192C]">₹{transportCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-2 font-mono">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-stone-400" /> Lodging ({nights} nights)
                </span>
                <span className="font-bold text-[#0B192C]">₹{stayCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-2 font-mono">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-stone-400" /> Food &amp; Dining ({diffDays} days)
                </span>
                <span className="font-bold text-[#0B192C]">₹{foodCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-2 font-mono">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-stone-400" /> Experiences &amp; Tickets
                </span>
                <span className="font-bold text-[#0B192C]">₹{activitiesCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-2 font-mono">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" /> Local Transfers Buffer
                </span>
                <span className="font-bold text-[#0B192C]">₹{localTransferCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-2 font-mono">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-400" /> Contingency Reserve
                </span>
                <span className="font-bold text-[#0B192C]">₹{contingencyBuffer.toLocaleString()}</span>
              </div>
            </div>

            {/* Total vs Cap */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-500">CALCULATED TOTAL</span>
                <span className="font-black text-base text-[#0B192C]">₹{totalCalculated.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-500">MAX BUDGET CAP</span>
                <span className="font-bold text-stone-800">₹{state.maximumBudget.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-stone-600">REMAINING SURPLUS</span>
                <span className={remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                  ₹{remainingBudget.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Over-Budget Advice Pill */}
            {budgetStatus === 'OVER BUDGET' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2 text-rose-900">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Budget Exceeded by ₹{Math.abs(remainingBudget).toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Suggestions to fit budget:
                </p>
                <div className="space-y-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_STAGE', payload: 2 })}
                    className="block font-bold text-rose-800 hover:underline"
                  >
                    &bull; Switch to CHEAPEST Transit alternative
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_STAGE', payload: 5 })}
                    className="block font-bold text-rose-800 hover:underline"
                  >
                    &bull; Choose a Budget Homestay or Hostel
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              id="generate-itinerary-btn"
              type="button"
              disabled={isSubmitting}
              onClick={onExecutePlan}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg hover:shadow-emerald-600/30 transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Solving Day-by-Day Schedule...' : 'Generate Complete Itinerary →'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
