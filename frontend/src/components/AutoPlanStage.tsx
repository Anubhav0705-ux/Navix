'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanner } from '@/context/PlannerContext';
import { TripPlanResult, UserResponse } from '@/types';
import { getCurrentUser } from '@/services/auth';
import { saveTrip } from '@/services/trips';
import { exportTripPlanPDF } from '@/lib/pdf-export';
import { getDestinationCoords } from '@/lib/destinations-data';
import { SafeImage } from './SafeImage';
import {
  Sparkles, Calendar, Download, Bookmark,
  Share2, Navigation, Bed, Train, Coffee,
  Sun, Copy, Compass
} from 'lucide-react';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-[#FBF7F1] border border-[#EBDCC7] rounded-3xl flex items-center justify-center text-xs text-[#64748B]">
      Loading Synchronized Map...
    </div>
  )
});

const DESTINATION_HERO_IMAGES: Record<string, string> = {
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1600&auto=format&fit=crop',
  manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1600&auto=format&fit=crop',
  'old manali': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1600&auto=format&fit=crop',
  udaipur: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?q=80&w=1600&auto=format&fit=crop',
  jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1600&auto=format&fit=crop',
  munnar: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1600&auto=format&fit=crop',
  rishikesh: 'https://images.unsplash.com/photo-1600681978345-311667a788ad?q=80&w=1600&auto=format&fit=crop',
  darjeeling: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop',
  hampi: 'https://images.unsplash.com/photo-1600100397608-f010f4433d7b?q=80&w=1600&auto=format&fit=crop',
  mysuru: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1600&auto=format&fit=crop',
  bengaluru: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1600&auto=format&fit=crop',
  mumbai: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=1600&auto=format&fit=crop',
  delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop',
  varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1600&auto=format&fit=crop',
  amritsar: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?q=80&w=1600&auto=format&fit=crop',
  kochi: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1600&auto=format&fit=crop',
  shimla: 'https://images.unsplash.com/photo-1562670652-e5947bddb335?q=80&w=1600&auto=format&fit=crop',
  ooty: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1600&auto=format&fit=crop',
  shillong: 'https://images.unsplash.com/photo-1616489953149-8d7607a3875f?q=80&w=1600&auto=format&fit=crop'
};

function getHeroImageForDestination(destName: string): string {
  const key = destName.toLowerCase().replace(' & old manali', '').replace(' (calangute & anjuna)', '').trim();
  for (const [k, url] of Object.entries(DESTINATION_HERO_IMAGES)) {
    if (key.includes(k) || k.includes(key)) {
      return url;
    }
  }
  return 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1600&auto=format&fit=crop';
}

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
      <div className="bg-white border border-[#EBDCC7] rounded-3xl p-12 text-center space-y-6 shadow-sm my-8 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[#1F6E78]/10 text-[#1F6E78] flex items-center justify-center mx-auto border border-[#1F6E78]/20">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif text-2xl font-bold text-[#142A38]">No Active Journey Generated</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Please complete the review step to calculate your time-dependent itinerary.
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 6 })}
          className="px-8 py-3.5 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs rounded-2xl shadow-lg uppercase tracking-wider transition-all cursor-pointer shadow-[#1F6E78]/25"
        >
          &larr; Back to Budget Review
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

  // Extract destination coordinates dynamically to prevent hardcoded Manali bug
  const [destLat, destLng] = getDestinationCoords(planResult.destination);

  // Extract map pins for attractions around the destination
  const mapAttractions = (planResult.activities || []).map((a, idx) => ({
    name: a.name,
    latitude: destLat + (((idx * 17) % 50) - 25) * 0.0012,
    longitude: destLng + (((idx * 23) % 50) - 25) * 0.0012,
    category: a.category
  }));

  const mapHotel = planResult.stay ? {
    name: planResult.stay.name,
    latitude: destLat + 0.006,
    longitude: destLng + 0.004
  } : undefined;

  const rawSegments = state.selectedTransportAlternative?.segments || planResult.route_segments || [];
  const transitSegments = rawSegments.map((seg) => ({
    source_city: seg.source_city,
    source_node_name: ('source_node_name' in seg && seg.source_node_name ? seg.source_node_name : seg.source_city) || seg.source_city,
    dest_city: seg.dest_city,
    dest_node_name: ('dest_node_name' in seg && seg.dest_node_name ? seg.dest_node_name : seg.dest_city) || seg.dest_city,
    transport_mode: seg.transport_mode
  }));

  const getEventBadgeStyle = (type: string) => {
    switch (type) {
      case 'TRANSIT':
        return { bg: 'bg-sky-50 border-sky-200 text-[#1F6E78]', icon: Train, label: 'Transit' };
      case 'ACTIVITY':
        return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: Sparkles, label: 'Activity' };
      case 'MEAL':
        return { bg: 'bg-amber-50 border-amber-200 text-amber-800', icon: Coffee, label: 'Dining' };
      case 'STAY':
      case 'CHECK_IN':
        return { bg: 'bg-purple-50 border-purple-200 text-purple-700', icon: Bed, label: 'Lodging' };
      default:
        return { bg: 'bg-[#FBF7F1] border-[#EBDCC7] text-[#64748B]', icon: Sun, label: 'Free Time' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* 1. CINEMATIC HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden border border-[#EBDCC7] shadow-lg bg-white text-[#142A38]">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <SafeImage
            src={getHeroImageForDestination(planResult.destination)}
            alt={planResult.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#142A38]/95 via-[#142A38]/50 to-transparent" />

          <div className="absolute top-6 left-6 right-6 flex flex-wrap items-center justify-between gap-3 z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#1F6E78] text-xs font-mono font-bold uppercase tracking-wider shadow-sm border border-white/20">
              ✓ TRIP READY &bull; {cb.budget_status === 'COMFORTABLE' ? 'WITHIN BUDGET' : cb.budget_status}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-white/95 hover:bg-white backdrop-blur-md border border-white/20 text-[#142A38] font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#1F6E78]" />
                <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save Trip'}</span>
              </button>

              <button
                type="button"
                onClick={handlePDFDownload}
                className="px-4 py-2 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-2 bg-white/95 hover:bg-white backdrop-blur-md border border-white/20 text-[#142A38] rounded-xl transition-all shadow-sm cursor-pointer"
                title="Share Itinerary"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-10 text-white space-y-2">
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-sm">
              Your {planResult.destination} Journey
            </h1>
            <p className="text-xs sm:text-sm text-white/90 font-medium flex flex-wrap items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D8A64B]" />
              <span>{planResult.origin} &rarr; {planResult.destination}</span>
              <span>&bull;</span>
              <span>{planResult.departure_date} to {planResult.return_date} ({planResult.days} Days / {planResult.nights} Nights)</span>
              <span>&bull;</span>
              <span>{planResult.travellers} Traveler(s)</span>
              <span>&bull;</span>
              <span className="font-bold text-[#D8A64B]">{state.travelStyle || 'Balanced'} Style</span>
            </p>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="p-6 bg-white border-t border-[#EBDCC7]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#EBDCC7]">
              <span className="text-[#64748B] block text-[10px] uppercase font-bold tracking-wider">TOTAL TRIP COST</span>
              <span className="font-serif font-black text-xl text-[#1F6E78]">₹{cb.total_trip_cost.toLocaleString()}</span>
            </div>

            <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#EBDCC7]">
              <span className="text-[#64748B] block text-[10px] uppercase font-bold tracking-wider">BUDGET CAP</span>
              <span className="font-serif font-bold text-xl text-[#142A38]">₹{cb.maximum_budget.toLocaleString()}</span>
            </div>

            <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#EBDCC7]">
              <span className="text-[#64748B] block text-[10px] uppercase font-bold tracking-wider">REMAINING BALANCE</span>
              <span className="font-serif font-bold text-xl text-emerald-600">₹{cb.remaining_budget.toLocaleString()}</span>
            </div>

            <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#EBDCC7]">
              <span className="text-[#64748B] block text-[10px] uppercase font-bold tracking-wider">MUST-VISITS</span>
              <span className="font-serif font-bold text-xl text-[#E96E55]">100% Scheduled</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: MAP (RIGHT) + DAILY SCHEDULE (LEFT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: DAILY ITINERARY (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#EBDCC7] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EBDCC7]">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-[#1F6E78] uppercase tracking-wider block">
                  Your Daily Travel Timetable
                </span>
                <h3 className="font-serif text-xl font-bold text-[#142A38]">
                  Day-by-Day Experience Schedule
                </h3>
              </div>

              {/* Day Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {days.map((d, idx) => (
                  <button
                    key={d.day_number}
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                      selectedDayIdx === idx
                        ? 'bg-[#1F6E78] text-white shadow-md shadow-[#1F6E78]/25'
                        : 'bg-[#FBF7F1] text-[#64748B] hover:bg-[#F5EBE1] border border-[#EBDCC7]'
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
                <div className="flex items-center justify-between p-4 bg-[#FBF7F1] rounded-2xl border border-[#EBDCC7]">
                  <div>
                    <h4 className="font-serif font-bold text-[#142A38] text-base">
                      Day {currentDay.day_number}: {currentDay.title}
                    </h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {currentDay.date} &bull; {currentDay.day_theme || 'Experience & Exploration'}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1F6E78]">
                    {currentDay.structured_events?.length || currentDay.events?.length || 0} Events
                  </span>
                </div>

                {/* Timeline Events */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#EBDCC7]">
                  {currentDay.structured_events && currentDay.structured_events.length > 0 ? (
                    currentDay.structured_events.map((ev, i) => {
                      const style = getEventBadgeStyle(ev.event_type);
                      return (
                        <div key={i} className="relative group">
                          {/* Dot */}
                          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-[#1F6E78] flex items-center justify-center text-[#1F6E78] shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#1F6E78]" />
                          </div>

                          {/* Event Card */}
                          <div className="bg-[#FBF7F1] hover:bg-white border border-[#EBDCC7] rounded-2xl p-4 space-y-2 transition-all hover:shadow-md text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-[#142A38] text-[11px]">
                                {ev.start_time} - {ev.end_time}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${style.bg}`}>
                                {style.label}
                              </span>
                            </div>

                            <h5 className="font-bold text-[#142A38] text-sm">{ev.title}</h5>
                            <p className="text-[#64748B] leading-relaxed text-[11px]">{ev.description}</p>

                            <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-[#64748B]">
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
                        <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-[#1F6E78] flex items-center justify-center text-[#1F6E78] shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#1F6E78]" />
                        </div>
                        <div className="bg-[#FBF7F1] border border-[#EBDCC7] rounded-2xl p-4 space-y-1 text-xs">
                          <h5 className="font-bold text-[#142A38] text-sm">{evStr}</h5>
                          <span className="text-[10px] text-[#64748B] font-mono">Curated Activity</span>
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
          <div className="bg-white border border-[#EBDCC7] rounded-3xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#EBDCC7] text-xs">
              <span className="font-bold text-[#142A38] flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-[#1F6E78]" /> Geospatial Journey Map
              </span>
              <span className="font-mono text-[#64748B] text-[11px]">OpenStreetMap</span>
            </div>

            <InteractiveMap
              origin={planResult.origin}
              destination={planResult.destination}
              segments={transitSegments}
              attractions={mapAttractions}
              hotel={mapHotel}
              zoom={9}
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] pt-1">
              <span className="text-purple-600 font-bold">● Hotel</span>
              <span className="text-[#1F6E78] font-bold">★ Attractions</span>
              <span className="text-[#E96E55] font-bold">▬ Route Path</span>
            </div>
          </div>

          {/* Budget Proportional Breakdown Chart */}
          <div className="bg-white border border-[#EBDCC7] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#1F6E78] uppercase tracking-wider block">
                Where Your Money Goes
              </span>
              <h3 className="font-serif text-lg font-bold text-[#142A38]">Trip Expense Allocation</h3>
            </div>

            {/* Proportional Bar */}
            <div className="h-4 w-full bg-[#FBF7F1] rounded-full overflow-hidden flex shadow-inner border border-[#EBDCC7]">
              <div style={{ width: `${tPct}%` }} className="bg-[#1F6E78]" title={`Transit: ₹${cb.transport_cost}`} />
              <div style={{ width: `${sPct}%` }} className="bg-purple-500" title={`Lodging: ₹${cb.accommodation_cost}`} />
              <div style={{ width: `${fPct}%` }} className="bg-[#D8A64B]" title={`Food: ₹${cb.food_cost}`} />
              <div style={{ width: `${aPct}%` }} className="bg-emerald-500" title={`Activities: ₹${cb.activities_cost}`} />
              <div style={{ width: `${lPct}%` }} className="bg-teal-500" title={`Local: ₹${cb.local_transport_cost}`} />
              <div style={{ width: `${bPct}%` }} className="bg-slate-400" title={`Reserve: ₹${cb.contingency_buffer}`} />
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2.5 bg-[#FBF7F1] rounded-xl border border-[#EBDCC7]">
                <span className="text-[#1F6E78] block text-[10px] font-bold">● Transit</span>
                <span className="font-bold text-[#142A38]">₹{cb.transport_cost.toLocaleString()}</span>
              </div>

              <div className="p-2.5 bg-[#FBF7F1] rounded-xl border border-[#EBDCC7]">
                <span className="text-purple-600 block text-[10px] font-bold">● Lodging</span>
                <span className="font-bold text-[#142A38]">₹{cb.accommodation_cost.toLocaleString()}</span>
              </div>

              <div className="p-2.5 bg-[#FBF7F1] rounded-xl border border-[#EBDCC7]">
                <span className="text-amber-600 block text-[10px] font-bold">● Dining</span>
                <span className="font-bold text-[#142A38]">₹{cb.food_cost.toLocaleString()}</span>
              </div>

              <div className="p-2.5 bg-[#FBF7F1] rounded-xl border border-[#EBDCC7]">
                <span className="text-emerald-600 block text-[10px] font-bold">● Activities</span>
                <span className="font-bold text-[#142A38]">₹{cb.activities_cost.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 border-t border-[#EBDCC7] space-y-2">
              <button
                type="button"
                onClick={handlePDFDownload}
                className="w-full py-3 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-[#1F6E78]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export High-Res Itinerary PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDuplicate}
                className="w-full py-2.5 bg-[#FBF7F1] hover:bg-[#F5EBE1] border border-[#EBDCC7] text-[#142A38] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
