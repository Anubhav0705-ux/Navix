'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar, Footer } from '@/components';
import { requestTripPlan, APIError } from '@/services';
import { saveTripPlan } from '@/lib';
import {
  TripPlanRequest, OptimizationProfile, StayPreference, FoodPreference,
  ActivityPreference, TripPlanResult
} from '@/types';
import {
  ChevronRight, ChevronLeft,
  AlertTriangle, Loader2, ArrowRight, Check
} from 'lucide-react';

const SUPPORTED_NODES = [
  'Sangli', 'Miraj', 'Pune', 'Mumbai', 'Delhi', 'Chandigarh', 'Manali', 'Old Manali'
];

const STEPS = [
  { id: 1, title: 'Route', label: '01 Route' },
  { id: 2, title: 'Dates', label: '02 Dates' },
  { id: 3, title: 'Budget', label: '03 Budget' },
  { id: 4, title: 'Priority', label: '04 Priority' },
  { id: 5, title: 'Preferences', label: '05 Preferences' },
  { id: 6, title: 'Review', label: '06 Review' },
];

const LOADING_CHECKLIST = [
  'Mapping viable multi-modal transit graph',
  'Evaluating time-dependent schedules & transfers',
  'Validating layover connection safety windows',
  'Optimizing whole-trip budget DP allocation',
  'Constructing daily itinerary & cost breakdown'
];

function PlannerWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard Step (1 to 6)
  const [step, setStep] = useState(1);

  // Form State (Initialized lazily from query params)
  const [origin, setOrigin] = useState(() => {
    const q = searchParams.get('origin');
    return q && SUPPORTED_NODES.includes(q) ? q : 'Sangli';
  });

  const [destination, setDestination] = useState(() => {
    const q = searchParams.get('destination');
    return q && SUPPORTED_NODES.includes(q) ? q : 'Old Manali';
  });

  const [departureDate, setDepartureDate] = useState('2026-12-12');
  const [returnDate, setReturnDate] = useState('2026-12-18');

  const [travellers, setTravellers] = useState(() => {
    const q = searchParams.get('travellers');
    return q && !isNaN(Number(q)) ? Number(q) : 1;
  });

  const [maximumBudget, setMaximumBudget] = useState(() => {
    const q = searchParams.get('budget');
    return q && !isNaN(Number(q)) ? Number(q) : 20000;
  });

  const [profile, setProfile] = useState<OptimizationProfile>('BALANCED');
  const [stayPref, setStayPref] = useState<StayPreference>('STANDARD');
  const [foodPref, setFoodPref] = useState<FoodPreference>('BALANCED');
  const [activityPref, setActivityPref] = useState<ActivityPreference>('MEDIUM');

  // Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [errorInfo, setErrorInfo] = useState<{ code: string; message: string } | null>(null);

  // Stage checklist animation during loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSubmitting) {
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < LOADING_CHECKLIST.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

  const handleNext = () => {
    setErrorInfo(null);
    if (step === 2 && returnDate <= departureDate) {
      setErrorInfo({
        code: 'INVALID_DATE_RANGE',
        message: 'Return date must be strictly after departure date.'
      });
      return;
    }
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    setErrorInfo(null);
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setErrorInfo(null);
    setIsSubmitting(true);
    setLoadingStage(0);

    const payload: TripPlanRequest = {
      origin,
      destination,
      departure_date: departureDate,
      return_date: returnDate,
      travellers,
      maximum_budget: maximumBudget,
      profile,
      stay_preference: stayPref,
      food_preference: foodPref,
      activity_preference: activityPref
    };

    try {
      const result: TripPlanResult = await requestTripPlan(payload);
      saveTripPlan(result);
      router.push('/trip/result');
    } catch (err: unknown) {
      setIsSubmitting(false);
      if (err instanceof APIError) {
        setErrorInfo({ code: err.code, message: err.message });
      } else {
        setErrorInfo({ code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred. Please try again.' });
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Heading */}
      <div className="mb-8 space-y-1">
        <span className="text-xs font-bold text-[#0E9F7A] uppercase tracking-widest block">
          Interactive Journey Planner
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1320]">
          Configure your trip requirements
        </h1>
      </div>

      {/* Main Grid: Left Narrow Rail + Right Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PROGRESS RAIL (DESKTOP ~240px) */}
        <div className="lg:col-span-3 bg-white border border-[#E7E5E0] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block mb-4">
            Planner Steps
          </span>
          <nav className="space-y-2">
            {STEPS.map((s) => {
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    if (s.id < step) setStep(s.id);
                  }}
                  disabled={s.id > step}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-smooth ${
                    isActive
                      ? 'bg-[#0E9F7A]/10 text-[#0E9F7A] font-bold border border-[#0E9F7A]/20'
                      : isDone
                      ? 'text-[#0B1320] hover:bg-[#F7F5F0]'
                      : 'text-[#667085] cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="font-mono">{s.label}</span>
                  {isDone && <Check className="w-3.5 h-3.5 text-[#0E9F7A]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* RIGHT WORKSPACE */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Native Error Card */}
          {errorInfo && (
            <div className="p-5 bg-white border border-[#E7E5E0] rounded-2xl text-[#0B1320] shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#0B1320]">
                    {errorInfo.code === 'BUDGET_TOO_LOW' ? 'Trip Budget Shortfall' : 'Planner Warning'}
                  </h4>
                  <p className="text-xs text-[#667085] leading-relaxed">{errorInfo.message}</p>
                </div>
              </div>

              {errorInfo.code === 'BUDGET_TOO_LOW' && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setMaximumBudget((prev) => prev + 5000);
                      setErrorInfo(null);
                      setStep(3);
                    }}
                    className="px-4 py-2 bg-[#0E9F7A] hover:bg-[#0B8465] text-white text-xs font-bold rounded-xl transition-smooth shadow-sm"
                  >
                    Increase Budget by ₹5,000
                  </button>
                  <button
                    onClick={() => {
                      setStep(3);
                      setErrorInfo(null);
                    }}
                    className="px-4 py-2 border border-[#E7E5E0] hover:bg-[#F7F5F0] text-[#0B1320] text-xs font-semibold rounded-xl transition-smooth"
                  >
                    Edit Budget Manually
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loading View */}
          {isSubmitting ? (
            <div className="bg-white border border-[#E7E5E0] rounded-2xl p-10 text-center space-y-8 shadow-sm">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#0E9F7A]/10 text-[#0E9F7A] flex items-center justify-center mx-auto">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-[#0B1320]">Building your journey</h3>
                <p className="text-xs text-[#667085]">Executing A* pathfinding and Knapsack DP optimization engine...</p>
              </div>

              {/* Progress Checklist */}
              <div className="max-w-md mx-auto text-left space-y-3 bg-[#F7F5F0] p-5 rounded-xl border border-[#E7E5E0]">
                {LOADING_CHECKLIST.map((item, idx) => {
                  const isDone = idx < loadingStage;
                  const isCurrent = idx === loadingStage;
                  return (
                    <div key={item} className="flex items-center gap-3 text-xs">
                      {isDone ? (
                        <Check className="w-4 h-4 text-[#0E9F7A] flex-shrink-0" />
                      ) : isCurrent ? (
                        <span className="w-4 h-4 rounded-full border-2 border-[#0E9F7A] border-t-transparent animate-spin flex-shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-[#E7E5E0] flex-shrink-0" />
                      )}
                      <span className={isDone ? 'text-[#0B1320] font-medium' : isCurrent ? 'text-[#0E9F7A] font-bold' : 'text-[#667085]'}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* STEP FORM CONTAINER */
            <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
              
              {/* STEP 1: ROUTE */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-1 pb-4 border-b border-[#E7E5E0]">
                    <h3 className="text-lg font-bold text-[#0B1320]">Where are you starting &amp; heading?</h3>
                    <p className="text-xs text-[#667085]">Select transit nodes supported in current demo dataset.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2">
                        Origin Node
                      </label>
                      <select
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl px-4 py-3 text-sm text-[#0B1320] font-medium focus:outline-none focus:border-[#0E9F7A]"
                      >
                        {SUPPORTED_NODES.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2">
                        Destination Node
                      </label>
                      <select
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl px-4 py-3 text-sm text-[#0B1320] font-medium focus:outline-none focus:border-[#0E9F7A]"
                      >
                        {SUPPORTED_NODES.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DATES */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-1 pb-4 border-b border-[#E7E5E0]">
                    <h3 className="text-lg font-bold text-[#0B1320]">When are you travelling?</h3>
                    <p className="text-xs text-[#667085]">Select travel dates to evaluate schedule-aware transit windows.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2">
                        Departure Date
                      </label>
                      <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl px-4 py-3 text-sm text-[#0B1320] font-medium focus:outline-none focus:border-[#0E9F7A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2">
                        Return Date
                      </label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl px-4 py-3 text-sm text-[#0B1320] font-medium focus:outline-none focus:border-[#0E9F7A]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BUDGET & TRAVELLERS */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-1 pb-4 border-b border-[#E7E5E0]">
                    <h3 className="text-lg font-bold text-[#0B1320]">Who is travelling &amp; maximum budget?</h3>
                    <p className="text-xs text-[#667085]">Total trip cost includes transport, stay, food, activities, and local shuttles.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2">
                        Number of Travellers
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={travellers}
                        onChange={(e) => setTravellers(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl px-4 py-3 text-sm text-[#0B1320] font-medium focus:outline-none focus:border-[#0E9F7A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2">
                        Maximum Total Budget (₹)
                      </label>
                      <input
                        type="number"
                        step="500"
                        min="1000"
                        value={maximumBudget}
                        onChange={(e) => setMaximumBudget(Number(e.target.value))}
                        className="w-full bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl px-4 py-3 text-sm text-[#0B1320] font-medium focus:outline-none focus:border-[#0E9F7A]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PRIORITY */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-1 pb-4 border-b border-[#E7E5E0]">
                    <h3 className="text-lg font-bold text-[#0B1320]">How do you want to prioritize routing?</h3>
                    <p className="text-xs text-[#667085]">Choose routing optimization profile.</p>
                  </div>

                  {/* Segmented Control Selector */}
                  <div className="segmented-control grid grid-cols-3 gap-1">
                    {(['CHEAPEST', 'BALANCED', 'FASTER'] as OptimizationProfile[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setProfile(p)}
                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-smooth ${
                          profile === p ? 'segmented-option-active text-[#0E9F7A]' : 'text-[#667085] hover:text-[#0B1320]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: PREFERENCES */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="space-y-1 pb-4 border-b border-[#E7E5E0]">
                    <h3 className="text-lg font-bold text-[#0B1320]">Trip style preferences</h3>
                    <p className="text-xs text-[#667085]">Customize lodging, dining, and activity expectations.</p>
                  </div>

                  {/* Stay Preference */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider">
                      Accommodation Tier
                    </label>
                    <div className="segmented-control grid grid-cols-3 gap-1">
                      {(['BUDGET', 'STANDARD', 'COMFORT'] as StayPreference[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStayPref(s)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-smooth ${
                            stayPref === s ? 'segmented-option-active text-[#0E9F7A]' : 'text-[#667085] hover:text-[#0B1320]'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Food Preference */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider">
                      Food Allocation
                    </label>
                    <div className="segmented-control grid grid-cols-3 gap-1">
                      {(['BASIC', 'BALANCED', 'FLEXIBLE'] as FoodPreference[]).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFoodPref(f)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-smooth ${
                            foodPref === f ? 'segmented-option-active text-[#0E9F7A]' : 'text-[#667085] hover:text-[#0B1320]'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Preference */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider">
                      Activity Level
                    </label>
                    <div className="segmented-control grid grid-cols-3 gap-1">
                      {(['LOW', 'MEDIUM', 'HIGH'] as ActivityPreference[]).map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setActivityPref(a)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-smooth ${
                            activityPref === a ? 'segmented-option-active text-[#0E9F7A]' : 'text-[#667085] hover:text-[#0B1320]'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: REVIEW */}
              {step === 6 && (
                <div className="space-y-6">
                  <div className="space-y-1 pb-4 border-b border-[#E7E5E0]">
                    <h3 className="text-lg font-bold text-[#0B1320]">Review your journey parameters</h3>
                    <p className="text-xs text-[#667085]">Verify inputs before calling NAVIX solver backend.</p>
                  </div>

                  {/* Summary Table */}
                  <div className="bg-[#F7F5F0] rounded-xl border border-[#E7E5E0] divide-y divide-[#E7E5E0] text-xs">
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-[#667085]">Route</span>
                      <span className="font-bold text-[#0B1320]">{origin} &rarr; {destination}</span>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <span className="text-[#667085]">Travel Dates</span>
                      <span className="font-bold text-[#0B1320]">{departureDate} to {returnDate}</span>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <span className="text-[#667085]">Travellers &amp; Maximum Budget</span>
                      <span className="font-bold text-[#0E9F7A]">{travellers} person(s) &bull; ₹{maximumBudget.toLocaleString()}</span>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <span className="text-[#667085]">Preferences</span>
                      <span className="font-bold text-[#0B1320]">{profile} &bull; Stay: {stayPref} &bull; Food: {foodPref} &bull; Activity: {activityPref}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP CONTROLS FOOTER */}
              <div className="pt-6 border-t border-[#E7E5E0] flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2.5 text-xs font-semibold text-[#667085] hover:text-[#0B1320] flex items-center gap-1 transition-smooth"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : <div />}

                {step < 6 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-[#0E9F7A] hover:bg-[#0B8465] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-smooth shadow-sm"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-[#0E9F7A] hover:bg-[#0B8465] text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-smooth shadow-sm"
                  >
                    <span>Build my journey</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0B1320]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={
          <div className="p-12 text-center text-xs text-[#667085] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0E9F7A]" />
            Loading Planner...
          </div>
        }>
          <PlannerWizardContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
