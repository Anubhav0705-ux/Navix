'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePlanner } from '@/context/PlannerContext';
import { TripPlanResult, UserResponse } from '@/types';
import { getCurrentUser } from '@/services/auth';
import { saveTrip } from '@/services/trips';
import { exportTripPlanPDF } from '@/lib/pdf-export';
import {
  Sparkles, Calendar, MapPin, CheckCircle2, Download, Bookmark, Check,
  Share2, Navigation, ShieldCheck, Ticket, Bed, Utensils, Compass,
  Zap
} from 'lucide-react';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-[#101419] border border-white/10 rounded-2xl flex items-center justify-center text-xs text-slate-400">
      Loading Command Center Map...
    </div>
  )
});

interface ReviewStageProps {
  planResult: TripPlanResult | null;
  onBackToAutoPlan: () => void;
}

export const ReviewStage: React.FC<ReviewStageProps> = ({ planResult, onBackToAutoPlan }) => {
  const router = useRouter();
  const { state } = usePlanner();
  const [currentUser] = useState<UserResponse | null>(() => getCurrentUser());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  if (!planResult) {
    return (
      <div className="bg-[#101419] border border-white/15 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl my-8">
        <div className="w-16 h-16 rounded-2xl bg-[#0FA77A]/10 text-[#0FA77A] flex items-center justify-center mx-auto border border-[#0FA77A]/20">
          <Compass className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">No Active Journey Calculated</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Please run the solver from Stage 05 or Stage 06 to calculate your trip plan.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToAutoPlan}
          className="px-8 py-3.5 bg-[#0FA77A] hover:bg-[#0B8465] text-white font-bold text-xs rounded-xl shadow-lg uppercase tracking-wider transition-all"
        >
          Go to Auto Plan &rarr;
        </button>
      </div>
    );
  }

  const cb = planResult.cost_breakdown;
  const days = planResult.daily_itinerary || [];
  const currentDay = days[selectedDayIdx] || days[0];

  const handleSave = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setIsSaving(true);
    setSaveError(null);

    try {
      await saveTrip(planResult);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save trip.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePDFDownload = () => {
    exportTripPlanPDF(planResult);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `NAVIX Trip: ${planResult.origin} to ${planResult.destination}`,
        text: `Check out my ${planResult.days}-day itinerary to ${planResult.destination} under ₹${cb.maximum_budget.toLocaleString()}!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  // Proportional Receipt Width Calculation
  const maxB = Number(cb.maximum_budget) || 1;
  const tPct = Math.min(100, Math.round((Number(cb.transport_cost) / maxB) * 100));
  const sPct = Math.min(100, Math.round((Number(cb.accommodation_cost) / maxB) * 100));
  const fPct = Math.min(100, Math.round((Number(cb.food_cost) / maxB) * 100));
  const aPct = Math.min(100, Math.round((Number(cb.activities_cost) / maxB) * 100));
  const lPct = Math.min(100, Math.round((Number(cb.local_transport_cost) / maxB) * 100));
  const bPct = Math.min(100, Math.round((Number(cb.contingency_buffer) / maxB) * 100));

  return (
    <div className="max-w-7xl mx-auto space-y-10 selection:bg-[#0FA77A] selection:text-white">
      
      {/* 1. CINEMATIC JOURNEY HERO */}
      <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-[#101419]">
        <div className="absolute inset-0 z-0">
          <img
            src="/travel/sangli_manali.jpg"
            alt={planResult.destination}
            className="w-full h-full object-cover filter brightness-50 saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101419] via-[#101419]/70 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3.5 py-1 rounded-full bg-[#0FA77A] text-white text-xs font-mono font-bold uppercase tracking-wider shadow-md">
              ✓ YOUR JOURNEY IS READY &bull; {cb.budget_status}
            </span>
            <span className="text-xs font-mono text-slate-300 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15">
              Data Source: Demo Transit Dataset
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              {planResult.origin} <span className="text-[#0FA77A] font-light">&rarr;</span> {planResult.destination}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-medium flex flex-wrap items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0FA77A]" />
              <span>{planResult.departure_date} to {planResult.return_date} ({planResult.days} Days / {planResult.nights} Nights)</span>
              <span>&bull;</span>
              <span>{planResult.travellers} Traveler(s)</span>
              <span>&bull;</span>
              <span className="text-[#0FA77A] font-bold">{state.travelPace} Pace</span>
            </p>
          </div>

          {/* Hero Budget Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black/60 backdrop-blur-xl p-5 rounded-2xl border border-white/15 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-slate-400 block text-[10px]">PLANNED SPEND</span>
              <span className="text-2xl font-extrabold text-[#0FA77A]">₹{cb.total_trip_cost.toLocaleString()}</span>
            </div>
            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/15 pt-2 sm:pt-0 sm:pl-4">
              <span className="text-slate-400 block text-[10px]">HARD BUDGET CAP</span>
              <span className="text-xl font-bold text-white">₹{cb.maximum_budget.toLocaleString()}</span>
            </div>
            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/15 pt-2 sm:pt-0 sm:pl-4">
              <span className="text-slate-400 block text-[10px]">REMAINING SURPLUS</span>
              <span className="text-xl font-bold text-teal-300">₹{cb.remaining_budget.toLocaleString()}</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || saveSuccess}
                className="px-6 py-3 bg-[#0FA77A] hover:bg-[#0B8465] text-white text-xs font-bold rounded-xl transition-all shadow-xl flex items-center gap-2 uppercase tracking-wider"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved to Profile</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Trip to Profile'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePDFDownload}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-[#0FA77A]" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onBackToAutoPlan}
              className="text-xs text-slate-400 hover:text-white underline font-mono"
            >
              &larr; Back to Auto Plan Stage
            </button>
          </div>

          {saveError && (
            <div className="p-3 bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs rounded-xl">
              {saveError}
            </div>
          )}
        </div>
      </div>

      {/* 2. MULTI-MODAL CONNECTED ROUTE RIBBON */}
      <div className="bg-[#101419]/90 border border-white/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="space-y-0.5">
            <span className="text-xs font-mono text-[#0FA77A] font-bold uppercase tracking-wider block">
              Time-Dependent Transit Graph
            </span>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#0FA77A]" /> Multi-Modal Route Ribbon
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
            Total Transit Fare: ₹{cb.transport_cost.toLocaleString()}
          </span>
        </div>

        {/* Route Segment Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {planResult.route_segments.map((seg, idx) => (
            <div
              key={idx}
              className="bg-[#161B22] border border-white/10 rounded-xl p-4 space-y-3 text-xs relative hover:border-[#0FA77A]/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0FA77A]/15 text-[#0FA77A] font-mono text-[10px] font-bold border border-[#0FA77A]/30">
                  {seg.transport_mode}
                </span>
                <span className="font-mono font-bold text-white">₹{seg.cost}</span>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-white text-sm">
                  {seg.source_city} &rarr; {seg.dest_city}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {seg.source_node_name} to {seg.dest_node_name}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>{seg.provider}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#0FA77A]" /> Safe Connection
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MAIN TRAVEL COMMAND CENTER (60% TIMELINE / 40% MAP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT 60%: AUTO-ITINERARY REVIEW TIMELINE */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-[#101419]/90 border border-white/15 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#0FA77A] uppercase block">
                  Automatic Daily Schedule
                </span>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#4D7CFE]" /> Day-by-Day Timeline Review
                </h3>
              </div>

              {/* Day Pills */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {days.map((d, idx) => (
                  <button
                    key={d.day_number}
                    type="button"
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      selectedDayIdx === idx
                        ? 'bg-[#0FA77A] text-white shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    D0{d.day_number}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Day Card Header */}
            <div className="bg-[#161B22] p-4 rounded-xl border border-white/10 flex items-center justify-between text-xs">
              <span className="font-bold text-white text-sm">{currentDay.title}</span>
              <span className="font-mono text-[#0FA77A] font-bold">Est. ₹{currentDay.estimated_daily_spend.toLocaleString()}</span>
            </div>

            {/* Structured Events */}
            <div className="space-y-3 pt-1">
              {currentDay.structured_events && currentDay.structured_events.length > 0 ? (
                currentDay.structured_events.map((ev, idx) => (
                  <div
                    key={idx}
                    className="bg-[#161B22] border border-white/10 rounded-xl p-4 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-[#0FA77A] bg-white/5 px-2 py-0.5 rounded">
                        {ev.start_time} - {ev.end_time}
                      </span>
                      <span className="text-slate-400 font-bold uppercase">{ev.event_type}</span>
                    </div>
                    <h4 className="font-extrabold text-white text-sm">{ev.title}</h4>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{ev.description}</p>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  {currentDay.events.map((eStr, idx) => (
                    <div key={idx} className="bg-[#161B22] p-3 rounded-xl text-xs text-slate-300">
                      • {eStr}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4. BUDGET RECEIPT SECTION */}
          <div className="bg-[#101419] border border-white/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative">
            <div className="space-y-1 border-b border-white/10 pb-4">
              <span className="text-xs font-mono font-bold text-[#0FA77A] uppercase block">
                Financial Audit Receipt
              </span>
              <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                YOUR ₹{cb.maximum_budget.toLocaleString()} TRIP RECEIPT
              </h3>
            </div>

            {/* Proportional Allocation Bar */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Proportional Cost Distribution</span>
              <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden flex">
                <div style={{ width: `${tPct}%` }} className="bg-blue-500 h-full" title={`Transport: ${tPct}%`} />
                <div style={{ width: `${sPct}%` }} className="bg-purple-500 h-full" title={`Stay: ${sPct}%`} />
                <div style={{ width: `${fPct}%` }} className="bg-amber-500 h-full" title={`Food: ${fPct}%`} />
                <div style={{ width: `${aPct}%` }} className="bg-[#0FA77A] h-full" title={`Activities: ${aPct}%`} />
                <div style={{ width: `${lPct}%` }} className="bg-teal-400 h-full" title={`Local Transfers: ${lPct}%`} />
                <div style={{ width: `${bPct}%` }} className="bg-slate-500 h-full" title={`Buffer: ${bPct}%`} />
              </div>
            </div>

            {/* Itemized Receipt Table */}
            <div className="bg-[#161B22] rounded-xl border border-white/10 p-5 space-y-3 font-mono text-xs text-slate-300">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="flex items-center gap-2"><Ticket className="w-3.5 h-3.5 text-blue-400" /> Multi-Modal Transport</span>
                <span className="font-bold text-white">₹{cb.transport_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="flex items-center gap-2"><Bed className="w-3.5 h-3.5 text-purple-400" /> Accommodation ({planResult.stay.tier})</span>
                <span className="font-bold text-white">₹{cb.accommodation_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="flex items-center gap-2"><Utensils className="w-3.5 h-3.5 text-amber-400" /> Dining ({planResult.food.tier})</span>
                <span className="font-bold text-white">₹{cb.food_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-[#0FA77A]" /> Experiences &amp; Activities</span>
                <span className="font-bold text-white">₹{cb.activities_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="flex items-center gap-2"><Compass className="w-3.5 h-3.5 text-teal-400" /> Local Movement Buffer</span>
                <span className="font-bold text-white">₹{cb.local_transport_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Emergency Contingency Buffer</span>
                <span className="font-bold text-white">₹{cb.contingency_buffer.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-sm text-white font-bold">
                <span>TOTAL PLANNED TRIP COST</span>
                <span className="text-[#0FA77A]">₹{cb.total_trip_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-teal-300 font-bold">
                <span>REMAINING BUDGET SURPLUS</span>
                <span>₹{cb.remaining_budget.toLocaleString()} ({cb.budget_status})</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT 40%: MAP & DECISION REASONS */}
        <div className="lg:col-span-5 sticky top-20 space-y-6">
          
          {/* Interactive Map */}
          <div className="bg-[#101419] border border-white/15 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0FA77A]" /> Travel Command Center Map
              </span>
              <span className="font-mono text-slate-400 text-[11px]">OpenStreetMap</span>
            </div>

            <InteractiveMap segments={planResult.route_segments} />

            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1">
              <span>{planResult.origin} &rarr; {planResult.destination}</span>
              <span className="text-[#0FA77A] font-bold">A* Verified Path</span>
            </div>
          </div>

          {/* Decision Rationale */}
          <div className="bg-[#101419] border border-white/15 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
            <div className="space-y-1 border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#0FA77A]" /> Why NAVIX Built This Solution
              </h4>
              <p className="text-slate-400 text-[11px]">Deterministic solver decision justifications.</p>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {planResult.decision_explanations.map((exp, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 text-slate-300 text-[11px] leading-relaxed flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0FA77A] mt-0.5 flex-shrink-0" />
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Community Stories Secondary Section */}
          <div className="bg-[#101419] border border-white/15 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">From the Community</h4>
            <div className="bg-[#161B22] p-4 rounded-xl border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-[#0FA77A] font-bold uppercase">Featured Community Story</span>
              <h5 className="font-extrabold text-white text-sm">7 Days in Old Manali Under ₹20,000</h5>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Read how fellow backpackers executed the same Sangli to Manali corridor within budget.
              </p>
              <Link href="/stories" className="inline-block text-[#0FA77A] font-bold hover:underline pt-1">
                Explore Community Stories &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
