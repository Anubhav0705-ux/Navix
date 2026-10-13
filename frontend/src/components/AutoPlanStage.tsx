'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePlanner } from '@/context/PlannerContext';
import { TripPlanResult, UserResponse } from '@/types';
import { getCurrentUser } from '@/services/auth';
import { saveTrip } from '@/services/trips';
import { exportTripPlanPDF } from '@/lib/pdf-export';
import { SafeImage } from './SafeImage';
import {
  Sparkles, Calendar, MapPin, CheckCircle2, Download, Bookmark, Check,
  Share2, Navigation, ShieldCheck, Bed, Utensils, Compass, Train, Coffee,
  Sun, Moon, Copy, ExternalLink, RefreshCw, AlertCircle, ArrowLeft, ArrowRight
} from 'lucide-react';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-stone-100 border border-stone-200 rounded-3xl flex items-center justify-center text-xs text-stone-500">
      Loading Synchronized Map...
    </div>
  )
});

interface AutoPlanStageProps {
  planResult: TripPlanResult | null;
  onReOptimize: () => void;
  isSubmitting?: boolean;
}

export const AutoPlanStage: React.FC<AutoPlanStageProps> = ({
  planResult,
  onReOptimize,
  isSubmitting = false
}) => {
  const router = useRouter();
  const { state, dispatch } = usePlanner();
  const [currentUser] = useState<UserResponse | null>(() => getCurrentUser());
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!planResult) {
    return (
      <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-6 shadow-sm my-8 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-[#0B192C]">No Active Journey Generated</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Please complete the review step to calculate your time-dependent itinerary.
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 6 })}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md uppercase tracking-wider transition-all"
        >
          &larr; Back to Budget Review
        </button>
      </div>
    );
  }

  const cb = planResult.cost_breakdown;
  const days = planResult.daily_itinerary || [];
  const currentDay = days[selectedDayIdx] || days[0];
  const metrics = planResult.itinerary_metrics;

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
      setSaveError(err instanceof Error ? err.message : 'Failed to save trip to profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePDFDownload = () => {
    exportTripPlanPDF(planResult);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
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
    }
  };

  const handleDuplicate = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    await handleSave();
    router.push('/dashboard');
  };

  // Proportional percentages for budget chart
  const maxB = Number(cb.maximum_budget) || 1;
  const tPct = Math.min(100, Math.round((Number(cb.transport_cost) / maxB) * 100));
  const sPct = Math.min(100, Math.round((Number(cb.accommodation_cost) / maxB) * 100));
  const fPct = Math.min(100, Math.round((Number(cb.food_cost) / maxB) * 100));
  const aPct = Math.min(100, Math.round((Number(cb.activities_cost) / maxB) * 100));
  const lPct = Math.min(100, Math.round((Number(cb.local_transport_cost) / maxB) * 100));
  const bPct = Math.min(100, Math.round((Number(cb.contingency_buffer) / maxB) * 100));

  // Extract map pins from itinerary
  const mapAttractions = (planResult.activities || []).map((a, idx) => ({
    name: a.name,
    latitude: 32.24 + ((idx * 17) % 50) * 0.001,
    longitude: 77.18 + ((idx * 23) % 50) * 0.001,
    category: a.category
  }));

  const mapHotel = planResult.stay ? {
    name: planResult.stay.name,
    latitude: 32.2548,
    longitude: 77.1751
  } : undefined;

  const getEventBadgeStyle = (type: string) => {
    switch (type) {
      case 'TRANSIT':
        return { bg: 'bg-sky-50 border-sky-200 text-sky-800', icon: Train, label: 'Transit' };
      case 'ACTIVITY':
        return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: Sparkles, label: 'Activity' };
      case 'MEAL':
        return { bg: 'bg-amber-50 border-amber-200 text-amber-800', icon: Coffee, label: 'Dining' };
      case 'STAY':
      case 'CHECK_IN':
        return { bg: 'bg-purple-50 border-purple-200 text-purple-800', icon: Bed, label: 'Lodging' };
      default:
        return { bg: 'bg-stone-50 border-stone-200 text-stone-700', icon: Sun, label: 'Free Time' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* 1. CINEMATIC HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-200 shadow-xl bg-[#0B192C] text-white">
        <div className="absolute inset-0 z-0 opacity-40">
          <SafeImage
            src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1600&auto=format&fit=crop"
            alt={planResult.destination}
            className="w-full h-full object-cover filter brightness-75"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/70 to-transparent z-0" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-md">
              ✓ JOURNEY COMPUTED &bull; {cb.budget_status}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save Trip'}</span>
              </button>

              <button
                type="button"
                onClick={handlePDFDownload}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-xl transition-all"
                title="Share Itinerary"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              {planResult.origin} <span className="text-emerald-400 font-light">&rarr;</span> {planResult.destination}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 font-medium flex flex-wrap items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{planResult.departure_date} to {planResult.return_date} ({planResult.days} Days / {planResult.nights} Nights)</span>
              <span>&bull;</span>
              <span>{planResult.travellers} Traveler(s)</span>
              <span>&bull;</span>
              <span className="text-emerald-300 font-bold">{state.travelPace} Pace</span>
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-stone-300 block text-[10px]">TOTAL EXPENSE</span>
              <span className="font-black text-lg text-emerald-400">₹{cb.total_trip_cost.toLocaleString()}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-stone-300 block text-[10px]">BUDGET CAP</span>
              <span className="font-bold text-lg text-white">₹{cb.maximum_budget.toLocaleString()}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-stone-300 block text-[10px]">BUDGET SURPLUS</span>
              <span className="font-bold text-lg text-emerald-300">₹{cb.remaining_budget.toLocaleString()}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-stone-300 block text-[10px]">MUST-VISITS</span>
              <span className="font-bold text-lg text-amber-300">100% Scheduled</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: MAP (RIGHT) + DAILY SCHEDULE (LEFT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: DAILY ITINERARY (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider block">
                  Deterministic Time-Slot Intelligence
                </span>
                <h3 className="text-xl font-black text-[#0B192C]">
                  Day-by-Day Experience Schedule
                </h3>
              </div>

              {/* Day Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {days.map((d, idx) => (
                  <button
                    key={d.day_number}
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                      selectedDayIdx === idx
                        ? 'bg-[#0B192C] text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Day {d.day_number}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Day Header */}
            {currentDay && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                  <div>
                    <h4 className="font-bold text-[#0B192C] text-sm">
                      Day {currentDay.day_number}: {currentDay.title}
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {currentDay.date} &bull; {currentDay.day_theme || 'Experience & Sightseeing'}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    {currentDay.structured_events?.length || currentDay.events?.length || 0} Events
                  </span>
                </div>

                {/* Timeline Events */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
                  {currentDay.structured_events && currentDay.structured_events.length > 0 ? (
                    currentDay.structured_events.map((ev, i) => {
                      const style = getEventBadgeStyle(ev.event_type);
                      return (
                        <div key={i} className="relative group">
                          {/* Dot */}
                          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center text-emerald-600 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          </div>

                          {/* Event Card */}
                          <div className="bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-2xl p-4 space-y-2 transition-colors text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-[#0B192C] text-[11px]">
                                {ev.start_time} - {ev.end_time}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${style.bg}`}>
                                {style.label}
                              </span>
                            </div>

                            <h5 className="font-bold text-[#0B192C] text-sm">{ev.title}</h5>
                            <p className="text-stone-600 leading-relaxed text-[11px]">{ev.description}</p>

                            <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-stone-400">
                              <span>Cost: ₹{ev.cost}</span>
                              {ev.location && <span>{ev.location}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    currentDay.events?.map((evStr, i) => (
                      <div key={i} className="relative group">
                        <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center text-emerald-600 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        </div>
                        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1 text-xs">
                          <h5 className="font-bold text-[#0B192C] text-sm">{evStr}</h5>
                          <span className="text-[10px] text-stone-400 font-mono">Scheduled Itinerary Event</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: MAP & BUDGET CHART (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 space-y-6">
          {/* Synchronized OpenStreetMap */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs">
              <span className="font-bold text-[#0B192C] flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-600" /> Geospatial Itinerary Map
              </span>
              <span className="font-mono text-stone-400 text-[11px]">OpenStreetMap</span>
            </div>

            <InteractiveMap
              destination={planResult.destination}
              attractions={mapAttractions}
              hotel={mapHotel}
              zoom={11}
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 pt-1">
              <span>● Hotel Pin (Purple)</span>
              <span>★ Attractions (Green)</span>
            </div>
          </div>

          {/* Budget Proportional Breakdown Chart */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider block">
                Deterministic Allocation Breakdown
              </span>
              <h3 className="text-lg font-black text-[#0B192C]">Trip Expense Allocation</h3>
            </div>

            {/* Proportional Bar */}
            <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: `${tPct}%` }} className="bg-sky-500" title={`Transit: ₹${cb.transport_cost}`} />
              <div style={{ width: `${sPct}%` }} className="bg-purple-500" title={`Lodging: ₹${cb.accommodation_cost}`} />
              <div style={{ width: `${fPct}%` }} className="bg-amber-500" title={`Food: ₹${cb.food_cost}`} />
              <div style={{ width: `${aPct}%` }} className="bg-emerald-500" title={`Activities: ₹${cb.activities_cost}`} />
              <div style={{ width: `${lPct}%` }} className="bg-teal-500" title={`Local: ₹${cb.local_transport_cost}`} />
              <div style={{ width: `${bPct}%` }} className="bg-stone-400" title={`Reserve: ₹${cb.contingency_buffer}`} />
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-sky-700 block text-[10px] font-bold">● Transit</span>
                <span className="font-bold text-[#0B192C]">₹{cb.transport_cost.toLocaleString()}</span>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-purple-700 block text-[10px] font-bold">● Lodging</span>
                <span className="font-bold text-[#0B192C]">₹{cb.accommodation_cost.toLocaleString()}</span>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-amber-700 block text-[10px] font-bold">● Dining</span>
                <span className="font-bold text-[#0B192C]">₹{cb.food_cost.toLocaleString()}</span>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-emerald-700 block text-[10px] font-bold">● Activities</span>
                <span className="font-bold text-[#0B192C]">₹{cb.activities_cost.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <button
                type="button"
                onClick={handlePDFDownload}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export High-Res Itinerary PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDuplicate}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>Save &amp; View in Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
