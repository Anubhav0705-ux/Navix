import React, { useState } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import {
  Sparkles, MapPin, ArrowRight, ArrowLeft,
  Train, Bed, Utensils, AlertTriangle, ShieldCheck, Edit3,
  Star, Edit2
} from 'lucide-react';
import { BudgetEditModal } from './PlannerComponents';

interface ReviewStageProps {
  onExecutePlan: () => void;
  isSubmitting?: boolean;
}

export const ReviewStage: React.FC<ReviewStageProps> = ({
  onExecutePlan,
  isSubmitting = false
}) => {
  const { state, dispatch } = usePlanner();
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFFDFC] border border-[#EBDCC7] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 5 })}
              className="text-xs font-mono font-bold text-[#1F6E78] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Stage 05
            </button>
            <span className="text-[#EBDCC7]">&bull;</span>
            <span className="text-xs font-mono text-[#66757F]">Stage 06 of 07</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#142A38]">
            Review Journey &amp; Budget Optimization
          </h2>
          <p className="text-xs text-[#66757F]">
            Verify transport, accommodations, dining, and must-visits before generating your daily timetable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase border ${
              budgetStatus === 'COMFORTABLE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : budgetStatus === 'TIGHT'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
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
          <div className="bg-white border border-[#EBDCC7] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBDCC7]">
              <span className="text-xs font-mono font-bold text-[#1F6E78] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> 1. Trip Corridor
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 1 })}
                className="text-xs font-bold text-[#64748B] hover:text-[#1F6E78] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#142A38]">
                  {state.origin || 'Origin'} &rarr; {state.destination || 'Destination'}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {state.departureDate} to {state.returnDate} ({diffDays} Days / {nights} Nights)
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#142A38] block">
                  {state.travellers} Traveler(s)
                </span>
                <span className="text-[11px] text-[#1F6E78] font-mono font-semibold">
                  {state.travelStyle} Style
                </span>
              </div>
            </div>
          </div>

          {/* 2. Transportation Card */}
          <div className="bg-white border border-[#EBDCC7] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBDCC7]">
              <span className="text-xs font-mono font-bold text-[#1F6E78] uppercase tracking-wider flex items-center gap-1.5">
                <Train className="w-3.5 h-3.5" /> 2. Selected Transport
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 2 })}
                className="text-xs font-bold text-[#64748B] hover:text-[#1F6E78] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#142A38] text-sm">
                    {state.selectedTransportAlternative?.label || 'Recommended'} Multi-Modal Transit
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    {state.selectedTransportAlternative?.transfers ?? 0} transfers &bull; Safe layovers enforced
                  </p>
                </div>

                <span className="font-mono font-bold text-[#1F6E78] text-base">
                  ₹{transportCost.toLocaleString()}
                </span>
              </div>

              {state.selectedTransportAlternative?.segments && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {state.selectedTransportAlternative.segments.map((seg, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-[#FBF7F1] border border-[#EBDCC7] rounded-xl text-[11px] font-mono text-[#64748B]"
                    >
                      {seg.source_city} &rarr; {seg.dest_city} ({seg.transport_mode})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Experiences & Places Card */}
          <div className="bg-white border border-[#EBDCC7] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBDCC7]">
              <span className="text-xs font-mono font-bold text-[#1F6E78] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 3. Selected Experiences ({state.selectedAttractionItems.length})
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 3 })}
                className="text-xs font-bold text-[#64748B] hover:text-[#1F6E78] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>

            {state.selectedAttractionItems.length === 0 ? (
              <p className="text-xs text-[#64748B]/70 italic">
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
                            ? 'bg-[#D8A64B]/20 border-[#D8A64B]/50 text-[#142A38] font-bold'
                            : 'bg-[#FBF7F1] border-[#EBDCC7] text-[#64748B]'
                        }`}
                      >
                        {isMust && <Star className="w-3 h-3 fill-current text-[#D8A64B]" />}
                        <span>{act.name}</span>
                        <span className="text-[#64748B]/70 text-[10px]">({act.entry_fee === 0 ? 'Free' : `₹${act.entry_fee}`})</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. Food & Dining Card */}
          <div className="bg-white border border-[#EBDCC7] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBDCC7]">
              <span className="text-xs font-mono font-bold text-[#1F6E78] uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" /> 4. Dining Allocation
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 4 })}
                className="text-xs font-bold text-[#64748B] hover:text-[#1F6E78] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#142A38] text-sm">
                  {state.foodPreference} DINING TIER
                </h4>
                <p className="text-xs text-[#64748B]">
                  ₹{foodRatePerDay}/day per person &bull; {state.selectedFoodItems.length} curated food spots bookmarked
                </p>
              </div>
              <span className="font-mono font-bold text-[#1F6E78] text-base">
                ₹{foodCost.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 5. Stay Card */}
          <div className="bg-white border border-[#EBDCC7] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBDCC7]">
              <span className="text-xs font-mono font-bold text-[#1F6E78] uppercase tracking-wider flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5" /> 5. Primary Accommodation
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 5 })}
                className="text-xs font-bold text-[#64748B] hover:text-[#1F6E78] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#142A38] text-sm">
                  {state.selectedHotelItem?.name || 'Standard Riverside Homestay'}
                </h4>
                <p className="text-xs text-[#64748B]">
                  {state.selectedHotelItem?.room_type || 'Private Room'} &bull; {nights} Nights
                </p>
              </div>
              <span className="font-mono font-bold text-[#1F6E78] text-base">
                ₹{stayCost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BUDGET HEALTH PANEL */}
        <div className="lg:col-span-5 sticky top-20 space-y-6">
          <div className="bg-white border border-[#EBDCC7] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#1F6E78] uppercase tracking-wider block">
                Budget Allocation Summary
              </span>
              <h3 className="font-serif text-xl font-bold text-[#142A38]">
                Trip Cost Ledger
              </h3>
            </div>

            {/* Breakdown Items */}
            <div className="space-y-3 divide-y divide-[#EBDCC7] text-xs">
              <div className="flex items-center justify-between pt-1 font-mono">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-[#1F6E78]" /> Transit Fare
                </span>
                <span className="font-bold text-[#142A38]">₹{transportCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-2 font-mono">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-purple-600" /> Lodging ({nights} nights)
                </span>
                <span className="font-bold text-[#142A38]">₹{stayCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-2 font-mono">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#D8A64B]" /> Food &amp; Dining ({diffDays} days)
                </span>
                <span className="font-bold text-[#142A38]">₹{foodCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-2 font-mono">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1F6E78]" /> Experiences &amp; Tickets
                </span>
                <span className="font-bold text-[#142A38]">₹{activitiesCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-2 font-mono">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Local Transfers Buffer
                </span>
                <span className="font-bold text-[#142A38]">₹{localTransferCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-2 font-mono">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#64748B]" /> Contingency Reserve
                </span>
                <span className="font-bold text-[#142A38]">₹{contingencyBuffer.toLocaleString()}</span>
              </div>
            </div>

            {/* Total vs Cap */}
            <div className="p-4 bg-[#FBF7F1] rounded-2xl border border-[#EBDCC7] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#66757F]">CALCULATED TOTAL</span>
                <span className="font-black text-base text-[#142A38]">₹{totalCalculated.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#66757F]">MAX BUDGET CAP</span>
                <button
                  type="button"
                  onClick={() => setBudgetModalOpen(true)}
                  className="flex items-center gap-1.5 font-bold text-[#1F6E78] hover:underline cursor-pointer"
                  title="Click to change trip budget"
                >
                  <span>₹{state.maximumBudget.toLocaleString()}</span>
                  <Edit2 className="w-3 h-3 text-[#1F6E78]" />
                </button>
              </div>
              <div className="pt-2 border-t border-[#EBDCC7] flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-[#66757F]">REMAINING BALANCE</span>
                <span className={remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                  {remainingBudget >= 0 ? `+₹${remainingBudget.toLocaleString()}` : `-₹${Math.abs(remainingBudget).toLocaleString()} (Shortfall)`}
                </span>
              </div>
            </div>

            {/* Over-Budget Advice Pill */}
            {budgetStatus === 'OVER BUDGET' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-3 text-rose-800 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Budget Exceeded by ₹{Math.abs(remainingBudget).toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Your current selections exceed your maximum budget cap. You can either increase the budget or adjust individual selections.
                </p>
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_MAXIMUM_BUDGET', payload: totalCalculated })}
                    className="w-full py-2 bg-[#1F6E78] hover:bg-[#15525A] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    Increase Budget to ₹{totalCalculated.toLocaleString()}
                  </button>
                  <div className="flex flex-col gap-1 text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'SET_STAGE', payload: 2 })}
                      className="text-left font-bold text-rose-800 hover:underline cursor-pointer"
                    >
                      &bull; Switch to CHEAPEST Transit alternative
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'SET_STAGE', payload: 5 })}
                      className="text-left font-bold text-rose-800 hover:underline cursor-pointer"
                    >
                      &bull; Choose a Budget Homestay or Hostel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <BudgetEditModal
              isOpen={budgetModalOpen}
              onClose={() => setBudgetModalOpen(false)}
            />

            {/* Primary Action Button */}
            <button
              id="generate-itinerary-btn"
              type="button"
              disabled={isSubmitting}
              onClick={onExecutePlan}
              className="w-full py-4 bg-[#1F6E78] hover:bg-[#15525A] text-white font-black text-xs rounded-2xl shadow-lg hover:shadow-[#1F6E78]/25 transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Organizing Day-by-Day Schedule...' : 'Generate Complete Itinerary →'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
