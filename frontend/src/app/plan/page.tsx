'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Footer, PlannerTopNav, PlannerContextBar,
  TripSetupStage, TransportStage, PlacesStage, FoodStage, StayStage,
  ReviewStage, AutoPlanStage
} from '@/components';
import { PlannerProvider, usePlanner } from '@/context/PlannerContext';
import { requestTripPlan, APIError } from '@/services';
import { saveTripPlan, getTripPlan, clearTripPlan, saveTripDraft, getTripDraft, clearTripDraft } from '@/lib';
import { getCurrentUser } from '@/services/auth';
import { TripPlanResult } from '@/types';
import { Loader2, Check, AlertTriangle, Sparkles } from 'lucide-react';

const LOADING_CHECKLIST = [
  'Checking multi-modal rail, bus & local connections',
  'Validating comfortable layovers (minimum 30 min transfer buffer)',
  'Selecting vetted stays and regional dining within budget',
  'Balancing daily allocations against your trip ceiling',
  'Organizing day-by-day activities and scenic highlights'
];

function InnerPlannerWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch, getBackendPayload } = usePlanner();

  const [isAuthenticatedUser] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!getCurrentUser();
    }
    return false;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [errorInfo, setErrorInfo] = useState<{ code: string; message: string } | null>(null);
  const [planResult, setPlanResult] = useState<TripPlanResult | null>(() => getTripPlan());

  // Strict Authentication Guard & Draft Restoration
  useEffect(() => {
    if (!isAuthenticatedUser) {
      // Unauthenticated guest: preserve draft intent safely before redirecting
      const qOrigin = searchParams.get('origin') || '';
      const qDest = searchParams.get('destination') || '';
      const qBudget = searchParams.get('budget') || '';
      const qTravellers = searchParams.get('travellers') || '';
      const qDep = searchParams.get('departureDate') || '';
      const qRet = searchParams.get('returnDate') || '';

      const searchStr = searchParams.toString();
      const returnPath = searchStr ? `/plan?${searchStr}` : '/plan';

      if (qDest || qOrigin || qBudget) {
        saveTripDraft({
          origin: qOrigin,
          destination: qDest,
          budget: qBudget,
          travellers: qTravellers,
          departureDate: qDep,
          returnDate: qRet,
          returnTo: returnPath,
        });
      }

      router.replace(`/login?returnTo=${encodeURIComponent(returnPath)}&intent=plan`);
      return;
    }

    // If returning from login with a draft, restore draft fields
    const draft = getTripDraft();
    if (draft) {
      if (draft.destination) dispatch({ type: 'SET_DESTINATION', payload: draft.destination });
      if (draft.origin) dispatch({ type: 'SET_ORIGIN', payload: draft.origin });
      if (draft.budget && !isNaN(Number(draft.budget))) dispatch({ type: 'SET_MAXIMUM_BUDGET', payload: Number(draft.budget) });
      if (draft.travellers && !isNaN(Number(draft.travellers))) dispatch({ type: 'SET_TRAVELLERS_COUNT', payload: Number(draft.travellers) });
      if (draft.departureDate) dispatch({ type: 'SET_DEPARTURE_DATE', payload: draft.departureDate });
      if (draft.returnDate) dispatch({ type: 'SET_RETURN_DATE', payload: draft.returnDate });
      clearTripDraft();
    }
  }, [isAuthenticatedUser, router, searchParams, dispatch]);

  // Sync initial query params if present
  useEffect(() => {
    if (!isAuthenticatedUser) return;

    const qOrigin = searchParams.get('origin');
    const qDest = searchParams.get('destination');
    const qBudget = searchParams.get('budget');
    const qTravellers = searchParams.get('travellers');
    const qReopen = searchParams.get('reopen');

    if (qReopen === 'true') {
      const saved = getTripPlan();
      if (saved) {
        queueMicrotask(() => {
          setPlanResult(saved);
          dispatch({ type: 'SET_ORIGIN', payload: saved.origin });
          dispatch({ type: 'SET_DESTINATION', payload: saved.destination });
          dispatch({ type: 'SET_STAGE', payload: 7 });
        });
        return;
      }
    }

    if (qDest) {
      if (qDest !== state.destination || (planResult && planResult.destination.toLowerCase() !== qDest.toLowerCase())) {
        queueMicrotask(() => {
          dispatch({ type: 'SET_DESTINATION', payload: qDest });
          dispatch({ type: 'SET_STAGE', payload: 1 });
          clearTripPlan();
          setPlanResult(null);
        });
      }
    }

    if (qOrigin && qOrigin !== state.origin) {
      dispatch({ type: 'SET_ORIGIN', payload: qOrigin });
    }
    if (qBudget && !isNaN(Number(qBudget))) dispatch({ type: 'SET_MAXIMUM_BUDGET', payload: Number(qBudget) });
    if (qTravellers && !isNaN(Number(qTravellers))) dispatch({ type: 'SET_TRAVELLERS_COUNT', payload: Number(qTravellers) });
  }, [isAuthenticatedUser, searchParams, dispatch, state.destination, state.origin, planResult]);


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
          message: 'An unexpected issue occurred while calculating your itinerary. Please check your inputs and try again.'
        });
      }
    }
  };

  if (!isAuthenticatedUser) {
    return (
      <div className="min-h-screen bg-[#FBF7F1] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1F6E78] animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#66757F]">
            Verifying Traveler Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#142A38] flex flex-col font-sans relative selection:bg-[#1F6E78]/20 selection:text-[#1F6E78]">
      {/* Persistent Stage Header Navigation Bar */}
      <div className="relative z-20">
        <PlannerTopNav />
        <PlannerContextBar />
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* API Error Notification */}
        {errorInfo && (
          <div className="mb-6 p-5 bg-rose-50 border border-rose-200 rounded-3xl text-rose-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-[#193451] flex items-center gap-2">
                  {errorInfo.code === 'BUDGET_TOO_LOW' ? 'Trip Budget Needs Adjustment' : 'Planner Notice'}
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-100 rounded-full text-rose-700 border border-rose-200 font-bold">
                    {errorInfo.code}
                  </span>
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed max-w-xl">
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
                  className="px-4 py-2 bg-[#246BCE] hover:bg-[#1B56A8] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Add ₹5,000 to Budget
                </button>
                <button
                  onClick={() => {
                    setErrorInfo(null);
                    dispatch({ type: 'SET_STAGE', payload: 1 });
                  }}
                  className="px-3.5 py-2 border border-rose-300 hover:bg-rose-100/50 text-rose-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Adjust Inputs
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading Overlay State */}
        {isSubmitting ? (
          <div className="my-12 max-w-xl mx-auto bg-white border border-[#EADBCE] rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-xl shadow-[#193451]/5">
            <div className="space-y-4">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#EADBCE] border-t-[#246BCE] animate-spin" />
                <Sparkles className="w-6 h-6 text-[#246BCE] animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#193451] tracking-tight">
                  Crafting Your Journey
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                  Connecting transit schedules, verified stays, and budget boundaries for {state.origin} &rarr; {state.destination}
                </p>
              </div>
            </div>

            {/* Checklist Progress */}
            <div className="text-left space-y-3 bg-[#FFF9F2] p-6 rounded-2xl border border-[#EADBCE]">
              {LOADING_CHECKLIST.map((item, idx) => {
                const isDone = idx < loadingStage;
                const isCurrent = idx === loadingStage;
                return (
                  <div key={item} className="flex items-center gap-3 text-xs sm:text-sm transition-all duration-300">
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-[#246BCE]/10 text-[#246BCE] flex items-center justify-center shrink-0 border border-[#246BCE]/30">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-[#246BCE] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[#EADBCE] shrink-0 bg-white" />
                    )}
                    <span className={isDone ? 'text-[#193451] font-semibold' : isCurrent ? 'text-[#246BCE] font-bold' : 'text-[#64748B]/60'}>
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
        <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center text-sm font-medium text-[#64748B] gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#246BCE]" />
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
