'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navbar, Footer } from '@/components';
import { getTripPlan } from '@/lib';
import { getCurrentUser } from '@/services/auth';
import { saveTrip } from '@/services/trips';
import { exportTripPlanPDF } from '@/lib/pdf-export';
import { TripPlanResult, UserResponse } from '@/types';
import {
  Compass, CheckCircle2, Calendar, MapPin,
  ArrowRight, Info, Download, Bookmark, Check,
  Bed, Utensils, Ticket, Navigation
} from 'lucide-react';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-[#F7F5F0] border border-[#E7E5E0] rounded-2xl flex items-center justify-center text-xs text-[#667085]">
      Loading Interactive Map...
    </div>
  )
});

export default function TripResultPage() {
  const router = useRouter();
  const [plan] = useState<TripPlanResult | null>(() => getTripPlan());
  const [currentUser] = useState<UserResponse | null>(() => getCurrentUser());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!plan) return;
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setIsSaving(true);
    setSaveError(null);

    try {
      await saveTrip(plan);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save trip.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePDFDownload = () => {
    if (plan) {
      exportTripPlanPDF(plan);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0B1320]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-white border border-[#E7E5E0] flex items-center justify-center mx-auto text-[#667085]">
            <Compass className="w-8 h-8 text-[#0E9F7A]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0B1320]">No Generated Journey Found</h1>
          <p className="text-xs text-[#667085] max-w-md mx-auto leading-relaxed">
            Please run the interactive trip planner to generate your budget-optimized itinerary.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0E9F7A] hover:bg-[#0B8465] text-white font-bold rounded-xl text-xs transition-smooth shadow-sm"
          >
            <span>Plan a Trip</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const cb = plan.cost_breakdown;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0B1320]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* EDITORIAL HEADER BANNER */}
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#E7E5E0] pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E9F7A]/10 border border-[#0E9F7A]/20 text-[#0E9F7A] text-xs font-bold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  WITHIN BUDGET &bull; {cb.budget_status}
                </span>
                <span className="text-[11px] font-mono text-[#667085] bg-[#F7F5F0] px-2.5 py-1 rounded-md border border-[#E7E5E0]">
                  Demo Transit Dataset
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1320] tracking-tight">
                {plan.origin} &rarr; {plan.destination}
              </h1>

              <p className="text-xs text-[#667085] flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#4C8BF5]" />
                <span>{plan.departure_date} to {plan.return_date} ({plan.days} Days / {plan.nights} Nights)</span>
                <span>&bull;</span>
                <span>{plan.travellers} Person(s)</span>
              </p>
            </div>

            {/* Price & Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4">
              <div className="text-left sm:text-right space-y-0.5">
                <span className="block text-xs text-[#667085] font-semibold uppercase tracking-wider">Total Planned Spend</span>
                <span className="text-3xl font-extrabold text-[#0E9F7A]">
                  ₹{cb.total_trip_cost.toLocaleString()}
                </span>
                <span className="block text-xs text-[#667085]">
                  Max Budget: ₹{cb.maximum_budget.toLocaleString()} (₹{cb.remaining_budget.toLocaleString()} remaining surplus)
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || saveSuccess}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#E7E5E0] hover:bg-[#F7F5F0] text-[#0B1320] text-xs font-bold rounded-xl transition-smooth shadow-sm"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-[#0E9F7A]" />
                      <span>Saved to Profile</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-[#0E9F7A]" />
                      <span>{isSaving ? 'Saving...' : 'Save Trip'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePDFDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0E9F7A] hover:bg-[#0B8465] text-white text-xs font-bold rounded-xl transition-smooth shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>

          {saveError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {saveError}
            </div>
          )}

          {/* RICH CATEGORY SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#E7E5E0] space-y-1">
              <span className="text-[#667085] flex items-center gap-1.5 font-medium">
                <Ticket className="w-3.5 h-3.5 text-[#0E9F7A]" /> Transport Fare
              </span>
              <span className="block font-bold text-[#0B1320] text-base">₹{cb.transport_cost.toLocaleString()}</span>
            </div>

            <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#E7E5E0] space-y-1">
              <span className="text-[#667085] flex items-center gap-1.5 font-medium">
                <Bed className="w-3.5 h-3.5 text-[#4C8BF5]" /> Stay ({plan.stay.tier})
              </span>
              <span className="block font-bold text-[#0B1320] text-base">₹{cb.accommodation_cost.toLocaleString()}</span>
            </div>

            <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#E7E5E0] space-y-1">
              <span className="text-[#667085] flex items-center gap-1.5 font-medium">
                <Utensils className="w-3.5 h-3.5 text-[#0E9F7A]" /> Food ({plan.food.tier})
              </span>
              <span className="block font-bold text-[#0B1320] text-base">₹{cb.food_cost.toLocaleString()}</span>
            </div>

            <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#E7E5E0] space-y-1">
              <span className="text-[#667085] flex items-center gap-1.5 font-medium">
                <Compass className="w-3.5 h-3.5 text-[#EAB308]" /> Activities ({plan.activities.length})
              </span>
              <span className="block font-bold text-[#0B1320] text-base">₹{cb.activities_cost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* --- MAIN TRAVEL COMMAND CENTER (55% TIMELINE / 45% MAP) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 55%: JOURNEY TIMELINE & DETAILS */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Algorithmic Decision Rationale */}
            <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-[#0B1320] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#4C8BF5]" />
                Algorithmic Decision Rationale
              </h3>
              <ul className="space-y-2 text-xs text-[#667085]">
                {plan.decision_explanations.map((exp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#0E9F7A] font-bold">&bull;</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vertical Connected Route Timeline */}
            <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E0]">
                <h3 className="text-base font-bold text-[#0B1320] flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[#0E9F7A]" />
                  Multi-Modal Connected Timeline
                </h3>
                <span className="text-xs font-mono text-[#667085]">
                  A* Path Search
                </span>
              </div>

              <div className="space-y-4">
                {plan.route_segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:border-[#0E9F7A]/40 transition-smooth"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-[#0E9F7A]/10 text-[#0E9F7A] font-bold uppercase text-[10px]">
                          {seg.transport_mode}
                        </span>
                        <span className="font-bold text-[#0B1320]">
                          {seg.source_city} ({seg.source_node_name}) &rarr; {seg.dest_city} ({seg.dest_node_name})
                        </span>
                      </div>
                      <p className="text-[#667085]">
                        Provider: {seg.provider} &bull; Dep: {new Date(seg.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Arr: {new Date(seg.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                      <span className="font-bold text-[#0E9F7A] text-sm">₹{seg.cost}</span>
                      {seg.layover_before_minutes > 0 && (
                        <span className="text-[10px] text-[#0E9F7A] bg-white px-2 py-0.5 rounded border border-[#E7E5E0] font-semibold">
                          {seg.layover_before_minutes}m layover ({seg.transfer_status})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Itinerary */}
            <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="pb-4 border-b border-[#E7E5E0]">
                <h3 className="text-base font-bold text-[#0B1320] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#4C8BF5]" />
                  Day-by-Day Execution Breakdown
                </h3>
              </div>

              <div className="space-y-4">
                {plan.daily_itinerary.map((day) => (
                  <div key={day.day_number} className="bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl p-5 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-2">
                      <span className="font-bold text-[#0B1320]">{day.title}</span>
                      <span className="text-[#0E9F7A] font-mono font-bold">Est. Spend: ₹{day.estimated_daily_spend}</span>
                    </div>
                    <ul className="space-y-2 text-[#667085]">
                      {day.events.map((evt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#4C8BF5] font-bold">&bull;</span>
                          <span>{evt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 45%: INTERACTIVE LEAFLET MAP */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bg-white border border-[#E7E5E0] rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E0]">
                <h3 className="text-sm font-bold text-[#0B1320] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#0E9F7A]" />
                  Multi-Modal Transit Map
                </h3>
                <span className="text-[11px] font-mono text-[#667085]">OpenStreetMap</span>
              </div>

              <InteractiveMap segments={plan.route_segments} />

              <div className="pt-2 text-[11px] text-[#667085] flex items-center justify-between font-mono">
                <span>Origin: {plan.origin}</span>
                <span>Target: {plan.destination}</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
