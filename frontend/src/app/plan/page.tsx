'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar, Footer } from '@/components';
import { requestTripPlan, APIError } from '@/services';
import { saveTripPlan } from '@/lib';
import {
  TripPlanRequest, OptimizationProfile, StayPreference, FoodPreference,
  ActivityPreference, TripPlanResult
} from '@/types';
import {
  MapPin, Calendar, Wallet, Users, Compass, ChevronRight, ChevronLeft,
  CheckCircle2, AlertTriangle, Loader2, Sparkles, ArrowRight, ShieldCheck, RefreshCw
} from 'lucide-react';

const SUPPORTED_NODES = [
  'Sangli', 'Miraj', 'Pune', 'Mumbai', 'Delhi', 'Chandigarh', 'Manali', 'Old Manali'
];

const STAGE_MESSAGES = [
  'Building multi-modal transport graph...',
  'Evaluating time-dependent schedules...',
  'Validating layover connection buffers...',
  'Optimizing whole-trip budget DP...',
  'Constructing daily itinerary...'
];

function PlannerWizardContent() {
  const searchParams = useSearchParams();

  // Wizard Step (1 to 6)
  const [step, setStep] = useState(1);

  // Form State
  const [origin, setOrigin] = useState('Sangli');
  const [destination, setDestination] = useState('Old Manali');
  const [departureDate, setDepartureDate] = useState('2026-12-12');
  const [returnDate, setReturnDate] = useState('2026-12-18');
  const [travellers, setTravellers] = useState(1);
  const [maximumBudget, setMaximumBudget] = useState(20000);
  const [profile, setProfile] = useState<OptimizationProfile>('BALANCED');
  const [stayPref, setStayPref] = useState<StayPreference>('STANDARD');
  const [foodPref, setFoodPref] = useState<FoodPreference>('BALANCED');
  const [activityPref, setActivityPref] = useState<ActivityPreference>('MEDIUM');

  // Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [errorInfo, setErrorInfo] = useState<{ code: string; message: string } | null>(null);

  // Prefill from URL query params
  useEffect(() => {
    const qOrigin = searchParams.get('origin');
    const qDest = searchParams.get('destination');
    const qBudget = searchParams.get('budget');
    const qTravellers = searchParams.get('travellers');

    if (qOrigin && SUPPORTED_NODES.includes(qOrigin)) setOrigin(qOrigin);
    if (qDest && SUPPORTED_NODES.includes(qDest)) setDestination(qDest);
    if (qBudget && !isNaN(Number(qBudget))) setMaximumBudget(Number(qBudget));
    if (qTravellers && !isNaN(Number(qTravellers))) setTravellers(Number(qTravellers));
  }, [searchParams]);

  // Stage animation during loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSubmitting) {
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev + 1) % STAGE_MESSAGES.length);
      }, 1200);
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
      window.location.href = '/trip/result';
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>Interactive Journey Planner</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Plan Your Journey</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Guided 6-step workflow backed by real-time A* and Knapsack DP algorithms.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="mb-10 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <span>Step {step} of 6</span>
          <span className="text-emerald-400 font-mono">
            {step === 1 && 'Locations'}
            {step === 2 && 'Dates'}
            {step === 3 && 'Travellers & Budget'}
            {step === 4 && 'Routing Profile'}
            {step === 5 && 'Trip Preferences'}
            {step === 6 && 'Review & Generate'}
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Alert Box */}
      {errorInfo && (
        <div className="mb-8 p-4 bg-red-950/40 border border-red-500/50 rounded-xl text-red-200 text-sm space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-red-300">
                {errorInfo.code === 'BUDGET_TOO_LOW' ? 'Trip Budget Shortfall' : 'Planning Request Warning'}
              </h4>
              <p className="text-xs leading-relaxed text-red-200">{errorInfo.message}</p>
            </div>
          </div>

          {errorInfo.code === 'BUDGET_TOO_LOW' && (
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  setMaximumBudget((prev) => prev + 5000);
                  setErrorInfo(null);
                  setStep(3);
                }}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-smooth"
              >
                Increase Budget by ₹5,000
              </button>
              <button
                onClick={() => {
                  setStep(3);
                  setErrorInfo(null);
                }}
                aria-label="Edit Budget"
                className="px-3.5 py-1.5 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-smooth"
              >
                Edit Budget Manually
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Generating Your Journey</h3>
            <p className="text-sm font-mono text-emerald-400 transition-all duration-300">
              {STAGE_MESSAGES[loadingStage]}
            </p>
          </div>

          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Calling NAVIX FastAPI engine to execute A* route search and Whole-Trip Knapsack DP.
          </p>
        </div>
      ) : (
        /* STEP CONTENT */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8">
          {/* STEP 1: Locations */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  Select Origin & Destination
                </h3>
                <p className="text-xs text-slate-400">
                  Select starting location and target destination from supported transit nodes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Origin Hub
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                  >
                    {SUPPORTED_NODES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Destination Hub
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                  >
                    {SUPPORTED_NODES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Demo Transit Dataset supported corridor: Sangli &rarr; Miraj &rarr; Pune &rarr; Delhi &rarr; Manali &rarr; Old Manali.</span>
              </div>
            </div>
          )}

          {/* STEP 2: Dates */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-400" />
                  Travel Dates
                </h3>
                <p className="text-xs text-slate-400">
                  Specify departure and return dates for trip duration calculation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Travellers & Budget */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  Travellers & Maximum Budget
                </h3>
                <p className="text-xs text-slate-400">
                  Total budget is enforced as a strict hard constraint.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Number of Travellers
                  </label>
                  <select
                    value={travellers}
                    onChange={(e) => setTravellers(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value={1}>1 Traveller</option>
                    <option value={2}>2 Travellers</option>
                    <option value={3}>3 Travellers</option>
                    <option value={4}>4 Travellers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Maximum Total Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={maximumBudget}
                    onChange={(e) => setMaximumBudget(Number(e.target.value))}
                    step="500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-400">Quick Budget Presets:</span>
                <div className="flex flex-wrap gap-2">
                  {[5000, 10000, 15000, 20000, 30000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMaximumBudget(preset)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-smooth ${
                        maximumBudget === preset
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      ₹{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Routing Profile */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-teal-400" />
                  Route Optimization Profile
                </h3>
                <p className="text-xs text-slate-400">
                  Determines scoring weight allocation for time-dependent A* route search.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'CHEAPEST',
                    title: 'CHEAPEST',
                    desc: 'Prioritize lower total transport cost.'
                  },
                  {
                    id: 'BALANCED',
                    title: 'BALANCED',
                    desc: 'Harmonious trade-off of cost, time, and transfers.'
                  },
                  {
                    id: 'FASTER',
                    title: 'FASTER',
                    desc: 'Prioritize shorter total elapsed journey time.'
                  }
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setProfile(p.id as OptimizationProfile)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-smooth ${
                      profile === p.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white">{p.title}</span>
                      {profile === p.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-xs leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Trip Preferences */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Trip Style Preferences
                </h3>
                <p className="text-xs text-slate-400">
                  Configures preference utility targets for stay, food, and activities.
                </p>
              </div>

              <div className="space-y-6">
                {/* Stay */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Accommodation Tier Preference
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'BUDGET', label: 'Budget (₹500/n)' },
                      { id: 'STANDARD', label: 'Standard (₹1.5k/n)' },
                      { id: 'COMFORT', label: 'Comfort (₹3k/n)' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStayPref(st.id as StayPreference)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-smooth ${
                          stayPref === st.id
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Food */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Food Dining Preference
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'BASIC', label: 'Basic (₹300/d)' },
                      { id: 'BALANCED', label: 'Balanced (₹700/d)' },
                      { id: 'FLEXIBLE', label: 'Flexible (₹1.2k/d)' }
                    ].map((fd) => (
                      <button
                        key={fd.id}
                        type="button"
                        onClick={() => setFoodPref(fd.id as FoodPreference)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-smooth ${
                          foodPref === fd.id
                            ? 'bg-sky-500 text-slate-950'
                            : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {fd.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Activity Intensity Preference
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'LOW', label: 'Low (1 Activity)' },
                      { id: 'MEDIUM', label: 'Medium (2-3 Activities)' },
                      { id: 'HIGH', label: 'High (All Activities)' }
                    ].map((ac) => (
                      <button
                        key={ac.id}
                        type="button"
                        onClick={() => setActivityPref(ac.id as ActivityPreference)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-smooth ${
                          activityPref === ac.id
                            ? 'bg-teal-400 text-slate-950'
                            : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {ac.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Submit */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Review Journey Parameters
                </h3>
                <p className="text-xs text-slate-400">
                  Verify inputs before running the NAVIX algorithmic optimization engine.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs text-slate-300">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Route</span>
                    <span className="font-bold text-white">{origin} &rarr; {destination}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Dates</span>
                    <span className="font-medium text-white">{departureDate} to {returnDate}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Travellers</span>
                    <span className="font-medium text-white">{travellers} Person(s)</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Max Budget</span>
                    <span className="font-bold text-emerald-400">₹{maximumBudget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Profile</span>
                    <span className="font-medium text-white">{profile}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Stay Pref</span>
                    <span className="font-medium text-white">{stayPref}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Food Pref</span>
                    <span className="font-medium text-white">{foodPref}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Activity Pref</span>
                    <span className="font-medium text-white">{activityPref}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTROL NAVIGATION BUTTONS */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-smooth ${
                step === 1
                  ? 'opacity-40 cursor-not-allowed text-slate-600'
                  : 'text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {step < 6 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-smooth"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-smooth shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>GENERATE MY JOURNEY</span>
              </button>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function PlannerWizard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading Planner...
      </div>
    }>
      <PlannerWizardContent />
    </Suspense>
  );
}
