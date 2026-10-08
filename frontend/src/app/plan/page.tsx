'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar, Footer, PlannerTopNav, TripSetupStage, TransportStage, PlacesStage, FoodStage, StayStage } from '@/components';
import { PlannerProvider, usePlanner } from '@/context/PlannerContext';
import { requestTripPlan, APIError } from '@/services';
import { saveTripPlan } from '@/lib';
import { TripPlanResult } from '@/types';
import { Loader2, Check, AlertTriangle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const LOADING_CHECKLIST = [
  'Mapping viable multi-modal transit graph',
  'Evaluating time-dependent schedules & transfers',
  'Validating layover connection safety windows',
  'Optimizing whole-trip budget DP allocation',
  'Constructing daily itinerary & cost breakdown'
];

function InnerPlannerWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch, getBackendPayload } = usePlanner();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [errorInfo, setErrorInfo] = useState<{ code: string; message: string } | null>(null);

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
      router.push('/trip/result');
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
    <div className="min-h-screen bg-[#0B1320] text-slate-100 flex flex-col font-sans relative selection:bg-[#0E9F7A] selection:text-white">
      {/* Background Travel Canvas Image Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center filter saturate-50 contrast-125" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#0B1320]/90 via-[#0B1320]/95 to-[#0B1320]" />

      {/* Persistent Stage Header Navigation Bar */}
      <div className="relative z-20">
        <PlannerTopNav />
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* API Error Notification */}
        {errorInfo && (
          <div className="mb-6 p-4 sm:p-5 bg-rose-950/80 border border-rose-500/40 rounded-2xl text-rose-100 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {errorInfo.code === 'BUDGET_TOO_LOW' ? 'Trip Budget Shortfall' : 'Planner Warning'}
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-900/50 rounded-full text-rose-300 border border-rose-700/50">{errorInfo.code}</span>
                </h4>
                <p className="text-xs text-rose-200/90 leading-relaxed max-w-xl">{errorInfo.message}</p>
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
                  className="px-4 py-2 bg-gradient-to-r from-[#0E9F7A] to-[#0B8465] hover:brightness-110 text-white text-xs font-bold rounded-xl transition-all shadow-lg hover:shadow-[#0E9F7A]/20"
                >
                  Add ₹5,000 to Budget
                </button>
                <button
                  onClick={() => {
                    setErrorInfo(null);
                    dispatch({ type: 'SET_STAGE', payload: 1 });
                  }}
                  className="px-3.5 py-2 border border-rose-500/30 hover:bg-rose-900/40 text-rose-200 text-xs font-medium rounded-xl transition-all"
                >
                  Adjust Inputs
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading Overlay State */}
        {isSubmitting ? (
          <div className="my-12 max-w-xl mx-auto bg-slate-900/90 border border-teal-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-2xl backdrop-blur-2xl">
            <div className="space-y-4">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 border-t-[#0E9F7A] animate-spin" />
                <Sparkles className="w-6 h-6 text-[#0E9F7A] animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Solving Multi-Modal Journey</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Evaluating schedules, transfers, and budget constraints for {state.origin} &rarr; {state.destination}
                </p>
              </div>
            </div>

            {/* Checklist Progress */}
            <div className="text-left space-y-3 bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800">
              {LOADING_CHECKLIST.map((item, idx) => {
                const isDone = idx < loadingStage;
                const isCurrent = idx === loadingStage;
                return (
                  <div key={item} className="flex items-center gap-3 text-xs sm:text-sm transition-all duration-300">
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-[#0E9F7A]/20 text-[#0E9F7A] flex items-center justify-center border border-[#0E9F7A]/40 flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-[#0E9F7A] border-t-transparent animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-800 flex-shrink-0 bg-slate-900" />
                    )}
                    <span className={isDone ? 'text-slate-200 font-medium' : isCurrent ? 'text-[#0E9F7A] font-bold' : 'text-slate-500'}>
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

            {/* Future Execution Shell Views (6 to 7) */}
            {state.stage > 5 && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 backdrop-blur-xl shadow-2xl my-8">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-[#0E9F7A] flex items-center justify-center mx-auto border border-teal-500/20">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    Stage 0{state.stage} Automatic Solver Trigger
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Execute time-dependent A* routing and constrained DP budget optimization for your customized selections.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <button
                    onClick={handleExecutePlan}
                    className="px-6 py-3 bg-gradient-to-r from-[#0E9F7A] to-[#0B8465] hover:brightness-110 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-[#0E9F7A]/20 transition-all"
                  >
                    <span>Run Full Trip Generation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_STAGE', payload: 1 })}
                    className="px-5 py-3 border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium text-sm rounded-xl transition-all"
                  >
                    Return to Trip Setup
                  </button>
                </div>
              </div>
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
        <div className="min-h-screen bg-[#0B1320] flex items-center justify-center text-xs text-slate-400 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#0E9F7A]" />
          <span>Loading NAVIX Cinematic Planner Workspace...</span>
        </div>
      }
    >
      <PlannerProvider>
        <InnerPlannerWorkspace />
      </PlannerProvider>
    </Suspense>
  );
}

