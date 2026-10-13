'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Footer, PlannerTopNav,
  TripSetupStage, TransportStage, PlacesStage, FoodStage, StayStage,
  ReviewStage, AutoPlanStage
} from '@/components';
import { PlannerProvider, usePlanner } from '@/context/PlannerContext';
import { requestTripPlan, APIError } from '@/services';
import { saveTripPlan, getTripPlan } from '@/lib';
import { TripPlanResult } from '@/types';
import { Loader2, Check, AlertTriangle, Sparkles } from 'lucide-react';

const LOADING_CHECKLIST = [
  'Mapping viable multi-modal transit graph & schedules',
  'Evaluating time-dependent train, bus & local transfers',
  'Enforcing mandatory ≥30 min safe layover connection windows',
  'Optimizing whole-trip budget allocation across transport, stay & food',
  'Scheduling personalized daily itinerary with must-visit highlights'
];

function InnerPlannerWorkspace() {
  const searchParams = useSearchParams();
  const { state, dispatch, getBackendPayload } = usePlanner();


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [errorInfo, setErrorInfo] = useState<{ code: string; message: string } | null>(null);
  const [planResult, setPlanResult] = useState<TripPlanResult | null>(() => getTripPlan());

  // Sync initial query params if present
  useEffect(() => {
    const qOrigin = searchParams.get('origin');
    const qDest = searchParams.get('destination');
    const qBudget = searchParams.get('budget');
    const qTravellers = searchParams.get('travellers');

    if (qOrigin) dispatch({ type: 'SET_ORIGIN', payload: qOrigin });
    if (qDest) dispatch({ type: 'SET_DESTINATION', payload: qDest });
    if (qBudget && !isNaN(Number(qBudget))) dispatch({ type: 'SET_MAXIMUM_BUDGET', payload: Number(qBudget) });
    if (qTravellers && !isNaN(Number(qTravellers))) dispatch({ type: 'SET_TRAVELLERS_COUNT', payload: Number(qTravellers) });
  }, [searchParams, dispatch]);

  // Loading checklist timer animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSubmitting) {
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < LOADING_CHECKLIST.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

  // Trigger backend trip planning execution
  const handleExecutePlan = async () => {
    setErrorInfo(null);
    setIsSubmitting(true);
    setLoadingStage(0);

    const payload = getBackendPayload();

    try {
      const result: TripPlanResult = await requestTripPlan(payload);
      saveTripPlan(result);
      setPlanResult(result);
      setIsSubmitting(false);
      dispatch({ type: 'SET_STAGE', payload: 7 });
    } catch (err: unknown) {
      setIsSubmitting(false);
      if (err instanceof APIError) {
        setErrorInfo({ code: err.code, message: err.message });
      } else {
        setErrorInfo({
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred during trip calculation. Please verify inputs and try again.'
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0B192C] flex flex-col font-sans relative selection:bg-emerald-600 selection:text-white">
      {/* Persistent Stage Header Navigation Bar */}
      <div className="relative z-20">
        <PlannerTopNav />
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Error Notification */}
        {errorInfo && (
          <div className="mb-6 p-5 bg-rose-50 border border-rose-200 rounded-3xl text-rose-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-[#0B192C] flex items-center gap-2">
                  {errorInfo.code === 'BUDGET_TOO_LOW' ? 'Trip Budget Shortfall' : 'Planner Notice'}
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-100 rounded-full text-rose-800 border border-rose-200">
                    {errorInfo.code}
                  </span>
                </h4>
                <p className="text-xs text-rose-700 leading-relaxed max-w-xl">
                  {errorInfo.message}
                </p>
              </div>
            </div>

            {errorInfo.code === 'BUDGET_TOO_LOW' && (
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_MAXIMUM_BUDGET', payload: state.maximumBudget + 5000 });
                    setErrorInfo(null);
                    dispatch({ type: 'SET_STAGE', payload: 1 });
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Add ₹5,000 to Budget
                </button>
                <button
                  onClick={() => {
                    setErrorInfo(null);
                    dispatch({ type: 'SET_STAGE', payload: 1 });
                  }}
                  className="px-3.5 py-2 border border-rose-200 hover:bg-rose-100/50 text-rose-800 text-xs font-semibold rounded-xl transition-all"
                >
                  Adjust Inputs
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading Overlay State */}
        {isSubmitting ? (
          <div className="my-12 max-w-xl mx-auto bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-xl">
            <div className="space-y-4">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0B192C] tracking-tight">
                  Solving Multi-Modal Journey
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Evaluating transit schedules, transfers, and budget constraints for {state.origin} &rarr; {state.destination}
                </p>
              </div>
            </div>

            {/* Checklist Progress */}
            <div className="text-left space-y-3 bg-stone-50 p-6 rounded-2xl border border-stone-200">
              {LOADING_CHECKLIST.map((item, idx) => {
                const isDone = idx < loadingStage;
                const isCurrent = idx === loadingStage;
                return (
                  <div key={item} className="flex items-center gap-3 text-xs sm:text-sm transition-all duration-300">
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-stone-200 shrink-0 bg-white" />
                    )}
                    <span className={isDone ? 'text-stone-800 font-semibold' : isCurrent ? 'text-emerald-700 font-bold' : 'text-stone-400'}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Stage Views */
          <div>
            {state.stage === 1 && <TripSetupStage />}
            {state.stage === 2 && <TransportStage onExecutePlan={handleExecutePlan} />}
            {state.stage === 3 && <PlacesStage />}
            {state.stage === 4 && <FoodStage />}
            {state.stage === 5 && <StayStage onExecutePlan={handleExecutePlan} />}
            {state.stage === 6 && (
              <ReviewStage
                onExecutePlan={handleExecutePlan}
                isSubmitting={isSubmitting}
              />
            )}
            {state.stage === 7 && (
              <AutoPlanStage
                planResult={planResult}
                onReOptimize={handleExecutePlan}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs text-stone-500 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading NAVIX Travel Planner...</span>
        </div>
      }
    >
      <PlannerProvider>
        <InnerPlannerWorkspace />
      </PlannerProvider>
    </Suspense>
  );
}
