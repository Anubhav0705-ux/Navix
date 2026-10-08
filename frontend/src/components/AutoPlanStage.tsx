'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import { TripPlanResult } from '@/types';
import {
  Sparkles, MapPin, CheckCircle2, RefreshCw, Train, Coffee, Bed, Compass, Zap, Sun
} from 'lucide-react';

import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] bg-[#101419] border border-white/10 rounded-2xl flex items-center justify-center text-xs text-slate-400">
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
  planResult, onReOptimize, isSubmitting = false
}) => {
  const { state, dispatch } = usePlanner();
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  if (!planResult) {
    return (
      <div className="bg-[#101419] border border-white/15 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl my-8">
        <div className="w-16 h-16 rounded-2xl bg-[#0FA77A]/10 text-[#0FA77A] flex items-center justify-center mx-auto border border-[#0FA77A]/20">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Stage 06 &bull; Automatic Itinerary Intelligence
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Run the automatic scheduler to generate your time-dependent day-by-day itinerary.
          </p>
        </div>
        <button
          type="button"
          onClick={onReOptimize}
          disabled={isSubmitting}
          className="px-8 py-3.5 bg-gradient-to-r from-[#0FA77A] to-[#0B8465] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#0FA77A]/20 uppercase tracking-wider transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Optimizing Schedule...' : 'Generate Automatic Plan &rarr;'}
        </button>
      </div>
    );
  }

  const days = planResult.daily_itinerary || [];
  const currentDay = days[selectedDayIdx] || days[0];
  const metrics = planResult.itinerary_metrics;

  const getEventBadgeStyle = (type: string) => {
    switch (type) {
      case 'TRANSIT':
        return { bg: 'bg-blue-500/15 border-blue-500/40 text-blue-300', icon: Train, label: 'Transit Leg' };
      case 'ACTIVITY':
        return { bg: 'bg-[#0FA77A]/15 border-[#0FA77A]/40 text-[#0FA77A]', icon: Sparkles, label: 'Activity' };
      case 'MEAL':
        return { bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300', icon: Coffee, label: 'Dining' };
      case 'STAY':
      case 'CHECK_IN':
        return { bg: 'bg-purple-500/15 border-purple-500/40 text-purple-300', icon: Bed, label: 'Lodging' };
      case 'LOCAL_TRANSFER':
        return { bg: 'bg-teal-500/15 border-teal-500/30 text-teal-300', icon: NavigationIcon, label: 'Transfer' };
      default:
        return { bg: 'bg-slate-500/15 border-slate-500/30 text-slate-300', icon: Sun, label: 'Free Time' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#101419]/90 border border-white/15 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#0FA77A] font-bold">Stage 06 of 07</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-slate-400">NAVIX Auto-Itinerary Intelligence</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {planResult.origin} &rarr; {planResult.destination} Journey Plan
          </h2>
          <p className="text-xs text-slate-400">
            Automatically scheduled subject to time, budget cap (₹{planResult.cost_breakdown.maximum_budget.toLocaleString()}), transit schedules, and {state.travelPace} pace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onReOptimize}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>Optimize Again</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 7 })}
            className="px-6 py-2 bg-[#0FA77A] hover:bg-[#0B8465] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Review Plan &rarr;</span>
          </button>
        </div>
      </div>

      {/* Intelligence Dashboard Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-[#101419] p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Trip Duration</span>
          <p className="font-extrabold text-white text-sm">{planResult.days} Days / {planResult.nights} Nights</p>
        </div>

        <div className="bg-[#101419] p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Activities Scheduled</span>
          <p className="font-extrabold text-[#0FA77A] text-sm">{metrics?.activities_scheduled || planResult.activities.length} Items</p>
        </div>

        <div className="bg-[#101419] p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Must-Visits Included</span>
          <p className="font-extrabold text-white text-sm">
            {metrics ? `${metrics.must_visits_included}/${metrics.must_visits_total}` : '100%'}
          </p>
        </div>

        <div className="bg-[#101419] p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Local Travel Time</span>
          <p className="font-extrabold text-teal-400 text-sm">{metrics?.local_travel_minutes || 45} mins</p>
        </div>

        <div className="bg-[#101419] p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Free Time Buffer</span>
          <p className="font-extrabold text-amber-300 text-sm">{metrics?.free_time_hours || 3.5} hrs</p>
        </div>

        <div className="bg-[#101419] p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Configured Pace</span>
          <p className="font-extrabold text-white text-sm truncate">{state.travelPace}</p>
        </div>
      </div>

      {/* Main Workspace: Left Day Timeline (65%) + Right Map & Explanations (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT 65%: DAY-BY-DAY TIMELINE */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Day Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {days.map((d, idx) => (
              <button
                key={d.day_number}
                type="button"
                onClick={() => setSelectedDayIdx(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border whitespace-nowrap ${
                  selectedDayIdx === idx
                    ? 'bg-[#0FA77A] text-white border-[#0FA77A] shadow-md ring-2 ring-[#0FA77A]/30'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                Day 0{d.day_number}
              </button>
            ))}
          </div>

          {/* Active Day Header */}
          <div className="bg-[#101419] border border-white/15 rounded-2xl p-6 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#0FA77A] font-bold">DAY {currentDay.day_number} &bull; {currentDay.date}</span>
              <span className="text-slate-400 font-bold">Est. Daily Spend: ₹{currentDay.estimated_daily_spend.toLocaleString()}</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">{currentDay.title}</h3>
            {currentDay.day_theme && (
              <span className="inline-block text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
                Theme: {currentDay.day_theme}
              </span>
            )}
          </div>

          {/* Structured Day Events Timeline */}
          <div className="space-y-4">
            {currentDay.structured_events && currentDay.structured_events.length > 0 ? (
              currentDay.structured_events.map((ev, idx) => {
                const style = getEventBadgeStyle(ev.event_type);
                const Icon = style.icon;

                return (
                  <div
                    key={idx}
                    className="bg-[#101419]/90 border border-white/15 rounded-2xl p-5 space-y-3 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-white/30 transition-all"
                  >
                    {/* Event Time & Badge Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg">
                          {ev.start_time} - {ev.end_time}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} flex items-center gap-1`}>
                          <Icon className="w-3 h-3" />
                          {style.label}
                        </span>
                      </div>

                      {ev.cost > 0 ? (
                        <span className="font-mono font-bold text-[#0FA77A]">₹{ev.cost.toLocaleString()}</span>
                      ) : (
                        <span className="font-mono text-slate-500 text-[11px]">Free / Included</span>
                      )}
                    </div>

                    {/* Event Title & Desc */}
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-white">{ev.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>
                    </div>

                    {/* Location & Reason Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono text-slate-400 border-t border-white/5">
                      {ev.location && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3 h-3 text-[#0FA77A]" /> {ev.location}
                        </span>
                      )}
                      {ev.reason && (
                        <span className="text-[#0FA77A] italic text-[10px]">
                          &bull; {ev.reason}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              /* Fallback for human-readable events list */
              <div className="bg-[#101419] border border-white/15 rounded-2xl p-6 space-y-3">
                {currentDay.events.map((evStr, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-slate-300 border-b border-white/5 pb-2">
                    <span className="w-2 h-2 rounded-full bg-[#0FA77A] mt-1.5 flex-shrink-0" />
                    <span>{evStr}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT 35%: MAP & DECISION REASONS */}
        <div className="lg:col-span-5 sticky top-20 space-y-6">
          
          {/* Synchronized Map Canvas */}
          <div className="bg-[#101419] border border-white/15 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#0FA77A]" /> Day 0{currentDay.day_number} Spatial Path
              </span>
              <span className="font-mono text-slate-400 text-[11px]">OpenStreetMap</span>
            </div>

            <InteractiveMap />

            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1">
              <span className="text-[#0FA77A]">MAP SYNCED: Day {currentDay.day_number}</span>
              <span>{currentDay.structured_events?.filter(e => e.event_type === 'ACTIVITY').length || 0} Places</span>
            </div>
          </div>

          {/* Decision Explanations Drawer */}
          <div className="bg-[#101419] border border-white/15 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
            <div className="space-y-1 border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#0FA77A]" /> Why NAVIX Built This Schedule
              </h4>
              <p className="text-slate-400 text-[11px]">Deterministic optimization &amp; time-window decision explanations.</p>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {planResult.decision_explanations.map((exp, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 text-slate-300 text-[11px] leading-relaxed flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0FA77A] mt-0.5 flex-shrink-0" />
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Navigation Footer */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 5 })}
          className="px-5 py-2.5 border border-white/15 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl transition-all"
        >
          &larr; Back to Stay Selection
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 7 })}
          className="px-8 py-3.5 bg-gradient-to-r from-[#0FA77A] to-[#0B8465] hover:brightness-110 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-[#0FA77A]/20 flex items-center gap-2 uppercase tracking-wider"
        >
          <span>Continue to Final Review &rarr;</span>
        </button>
      </div>

    </div>
  );
};

function NavigationIcon(props: { className?: string }) {
  return <Compass {...props} />;
}

