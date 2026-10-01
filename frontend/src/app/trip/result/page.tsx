'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar, Footer } from '@/components';
import { getTripPlan } from '@/lib';
import { TripPlanResult } from '@/types';
import {
  Compass, CheckCircle2, ShieldCheck, MapPin, Calendar, Users, Wallet,
  ArrowRight, Layers, Clock, AlertTriangle, ChevronRight, Info
} from 'lucide-react';

export default function TripResultPage() {
  const [plan, setPlan] = useState<TripPlanResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = getTripPlan();
    setPlan(data);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center text-[#667085] text-sm">
        Loading Trip Plan Result...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0B1320]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-white border border-[#E7E5E0] flex items-center justify-center mx-auto text-[#667085]">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#0B1320]">No Generated Journey Found</h1>
          <p className="text-xs text-[#667085] max-w-md mx-auto">
            Please run the interactive trip planner to generate a real-time budget-optimized itinerary.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E9F7A] hover:bg-[#0B8465] text-white font-bold rounded-xl text-xs transition-smooth shadow-sm"
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

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* EDITORIAL HEADER BANNER */}
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E5E0] pb-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E9F7A]/10 border border-[#0E9F7A]/20 text-[#0E9F7A] text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>WITHIN BUDGET &bull; {cb.budget_status}</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1320]">
                {plan.origin} &rarr; {plan.destination}
              </h1>

              <p className="text-xs text-[#667085]">
                {plan.departure_date} to {plan.return_date} ({plan.days} Days / {plan.nights} Nights) &bull; {plan.travellers} Person(s)
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="block text-xs text-[#667085] font-semibold uppercase tracking-wider">Total Planned Spend</span>
              <span className="text-3xl font-extrabold text-[#0E9F7A]">
                ₹{cb.total_trip_cost.toLocaleString()}
              </span>
              <span className="block text-xs text-[#667085]">
                Max Budget: ₹{cb.maximum_budget.toLocaleString()} (₹{cb.remaining_budget.toLocaleString()} remaining)
              </span>
            </div>
          </div>

          {/* Quick Category Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#E7E5E0]">
              <span className="block text-[#667085] mb-1">Transport Fare</span>
              <span className="font-bold text-[#0B1320] text-sm">₹{cb.transport_cost.toLocaleString()}</span>
            </div>

            <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#E7E5E0]">
              <span className="block text-[#667085] mb-1">Stay ({plan.stay.tier})</span>
              <span className="font-bold text-[#0B1320] text-sm">₹{cb.accommodation_cost.toLocaleString()}</span>
            </div>

            <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#E7E5E0]">
              <span className="block text-[#667085] mb-1">Food ({plan.food.tier})</span>
              <span className="font-bold text-[#0B1320] text-sm">₹{cb.food_cost.toLocaleString()}</span>
            </div>

            <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#E7E5E0]">
              <span className="block text-[#667085] mb-1">Activities ({plan.activities.length})</span>
              <span className="font-bold text-[#0B1320] text-sm">₹{cb.activities_cost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* DECISION RATIONALE CALLOUT */}
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

        {/* OPEN ROUTE TIMELINE */}
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E0]">
            <h3 className="text-base font-bold text-[#0B1320] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#0E9F7A]" />
              Calculated Multi-Modal Route Segments
            </h3>
            <span className="text-xs font-mono text-[#667085]">
              Algorithm: {plan.route_summary.algorithm_used}
            </span>
          </div>

          <div className="space-y-4">
            {plan.route_segments.map((seg, idx) => (
              <div
                key={idx}
                className="bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#0E9F7A]/10 text-[#0E9F7A] font-bold uppercase text-[10px]">
                      {seg.transport_mode}
                    </span>
                    <span className="font-bold text-[#0B1320]">
                      {seg.source_city} ({seg.source_node_name}) &rarr; {seg.dest_city} ({seg.dest_node_name})
                    </span>
                  </div>
                  <p className="text-[#667085]">
                    Provider: {seg.provider} &bull; Departure: {new Date(seg.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Arrival: {new Date(seg.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                  <span className="font-bold text-[#0E9F7A] text-sm">₹{seg.cost}</span>
                  {seg.layover_before_minutes > 0 && (
                    <span className="text-[10px] text-[#667085] bg-white px-2 py-0.5 rounded border border-[#E7E5E0]">
                      Layover: {seg.layover_before_minutes}m ({seg.transfer_status})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DAILY ITINERARY TIMELINE */}
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="pb-4 border-b border-[#E7E5E0]">
            <h3 className="text-base font-bold text-[#0B1320] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#4C8BF5]" />
              Deterministic Daily Itinerary Breakdown
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.daily_itinerary.map((day) => (
              <div key={day.day_number} className="bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-2">
                  <span className="font-bold text-[#0B1320]">{day.title}</span>
                  <span className="text-[#0E9F7A] font-mono font-bold">Est. ₹{day.estimated_daily_spend}</span>
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

        {/* Action Callout & Phase 6 Note */}
        <div className="p-6 bg-white border border-[#E7E5E0] rounded-2xl text-center space-y-3 shadow-sm">
          <p className="text-xs font-bold text-[#0E9F7A] uppercase tracking-wider">
            Phase 5.5 Visual Redesign Complete &bull; Foundation Ready for Phase 6 Map Integration
          </p>
          <div className="pt-2">
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 text-xs font-bold bg-[#0E9F7A] hover:bg-[#0B8465] text-white px-6 py-3 rounded-xl transition-smooth shadow-sm"
            >
              <span>Plan Another Trip</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
