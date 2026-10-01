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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading Trip Plan Result...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">No Generated Journey Found</h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Please run the interactive trip planner to generate a real-time budget-optimized itinerary.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-smooth"
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Banner Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Calculated Trip Result Foundation (Phase 5)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {plan.origin} &rarr; {plan.destination}
              </h1>
              <p className="text-xs text-slate-400">
                {plan.departure_date} to {plan.return_date} ({plan.days} Days / {plan.nights} Nights) &bull; {plan.travellers} Person(s)
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="block text-xs text-slate-400 font-semibold uppercase">Total Calculated Spend</span>
              <span className="text-2xl font-black text-emerald-400">
                ₹{cb.total_trip_cost.toLocaleString()}
              </span>
              <span className="block text-xs text-slate-400">
                Max Budget: ₹{cb.maximum_budget.toLocaleString()} (₹{cb.remaining_budget.toLocaleString()} {cb.budget_status})
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="block text-slate-400 font-medium mb-1">Transport Fare</span>
              <span className="font-bold text-white">₹{cb.transport_cost.toLocaleString()}</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="block text-slate-400 font-medium mb-1">Stay ({plan.stay.tier})</span>
              <span className="font-bold text-white">₹{cb.accommodation_cost.toLocaleString()}</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="block text-slate-400 font-medium mb-1">Food ({plan.food.tier})</span>
              <span className="font-bold text-white">₹{cb.food_cost.toLocaleString()}</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="block text-slate-400 font-medium mb-1">Activities ({plan.activities.length})</span>
              <span className="font-bold text-white">₹{cb.activities_cost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Decision Explanations Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400" />
            Algorithmic Decision Rationale
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {plan.decision_explanations.map((exp, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span>{exp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Route Segments Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              Calculated Multi-Modal Route Segments
            </span>
            <span className="text-xs text-slate-400 font-normal">
              Algorithm: {plan.route_summary.algorithm_used}
            </span>
          </h3>

          <div className="space-y-3">
            {plan.route_segments.map((seg, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase text-[10px]">
                      {seg.transport_mode}
                    </span>
                    <span className="font-bold text-white">
                      {seg.source_city} ({seg.source_node_name}) &rarr; {seg.dest_city} ({seg.dest_node_name})
                    </span>
                  </div>
                  <p className="text-slate-400">
                    Provider: {seg.provider} &bull; Departure: {new Date(seg.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Arrival: {new Date(seg.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                  <span className="font-bold text-emerald-400 text-sm">₹{seg.cost}</span>
                  {seg.layover_before_minutes > 0 && (
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Layover: {seg.layover_before_minutes}m ({seg.transfer_status})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Itinerary Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            Deterministic Daily Itinerary Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.daily_itinerary.map((day) => (
              <div key={day.day_number} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">{day.title}</span>
                  <span className="text-emerald-400 font-mono">Est. ₹{day.estimated_daily_spend}</span>
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {day.events.map((evt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-sky-400">&bull;</span>
                      <span>{evt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 6 Command Center Transition Note */}
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-center space-y-2 text-xs text-slate-300">
          <p className="font-semibold text-emerald-400">
            Phase 5 Result Handoff Foundation Complete
          </p>
          <p className="text-slate-400 max-w-xl mx-auto">
            In Phase 6, this page will be transformed into the full desktop 55% Timeline / 45% Leaflet Map &quot;Travel Command Center&quot; layout with permanent persistence.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
