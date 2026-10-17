'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar, Footer, Logo, TravelCollage } from '@/components';
import { loginUser } from '@/services/auth';
import { APIError } from '@/services/api';
import { sanitizeReturnUrl, getTripDraft, TripDraft } from '@/lib';
import {
  Lock, Mail, AlertTriangle, Eye, EyeOff,
  ArrowRight, ArrowLeft, Loader2, MapPin
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnToParam = searchParams.get('returnTo');
  const intentParam = searchParams.get('intent');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeDraft] = useState<TripDraft | null>(() => getTripDraft());

  const isPlanningIntent = intentParam === 'plan' || returnToParam?.includes('/plan') || !!activeDraft;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const resp = await loginUser(email, password);

      // Safe return navigation
      if (resp.user.role?.toLowerCase() === 'admin' && !returnToParam) {
        router.push('/admin');
      } else {
        const destination = sanitizeReturnUrl(returnToParam || (activeDraft?.returnTo) || '/dashboard');
        router.push(destination);
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      if (err instanceof APIError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Invalid email or password. Please verify your credentials and try again.');
      }
    }
  };

  // Safe query string for signup switch link
  const signupQuery = new URLSearchParams();
  if (returnToParam) signupQuery.set('returnTo', returnToParam);
  if (intentParam) signupQuery.set('intent', intentParam);
  const signupHref = signupQuery.toString() ? `/register?${signupQuery.toString()}` : '/register';

  return (
    <div className="w-full bg-white rounded-3xl lg:rounded-4xl shadow-2xl border border-[#E8DAC8] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] transition-all">
      {/* Left Form Area (Approx 58% on Desktop) */}
      <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white text-[#142A38]">
        {/* Top Header: Logo + Back to Explore Link */}
        <div className="flex items-center justify-between pb-6 border-b border-[#F4EBE0]">
          <Link href="/" className="inline-block" aria-label="NAVIX Home">
            <Logo />
          </Link>

          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#66757F] hover:text-[#1F6E78] transition-colors py-1 px-2.5 rounded-lg hover:bg-[#FBF7F1]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Explore destinations</span>
          </Link>
        </div>

        {/* Main Form Content */}
        <div className="py-6 space-y-6">
          {/* Context Notice / Draft Pill */}
          {isPlanningIntent && (
            <div className="p-3.5 bg-[#1F6E78]/10 border border-[#1F6E78]/25 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-xl bg-[#1F6E78] text-white flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1F6E78] tracking-tight">
                  {activeDraft?.destination
                    ? `Trip Draft Saved: ${activeDraft.origin ? activeDraft.origin + ' → ' : ''}${activeDraft.destination}`
                    : 'Personalized Itinerary Waiting'}
                </p>
                <p className="text-[11px] text-[#66757F] truncate">
                  Sign in to unlock multi-modal schedules, stays, and budget math.
                </p>
              </div>
            </div>
          )}

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-bold font-editorial text-[#142A38] tracking-tight">
              {isPlanningIntent ? 'Sign in to continue planning.' : 'Welcome back.'}
            </h1>
            <p className="text-xs sm:text-sm text-[#66757F] leading-relaxed">
              {isPlanningIntent
                ? 'Your journey draft is preserved. Sign in to customize and finalize your itinerary.'
                : 'Sign in to access your saved trips, multi-modal routes, and personal budget ledgers.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm flex items-center gap-3 animate-in fade-in duration-200"
            >
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#66757F] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E9BA4]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="traveler@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FBF7F1] hover:bg-white focus:bg-white border border-[#EBDCC7] rounded-xl pl-10 pr-4 py-3 text-sm text-[#142A38] font-medium placeholder-[#8E9BA4] focus:outline-none focus:ring-2 focus:ring-[#1F6E78] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#66757F]"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E9BA4]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FBF7F1] hover:bg-white focus:bg-white border border-[#EBDCC7] rounded-xl pl-10 pr-11 py-3 text-sm text-[#142A38] font-medium placeholder-[#8E9BA4] focus:outline-none focus:ring-2 focus:ring-[#1F6E78] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E9BA4] hover:text-[#142A38] transition-colors cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#1F6E78]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <>
                    <span>{isPlanningIntent ? 'Sign In & Continue to Planner' : 'Sign In to NAVIX'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Switch Link */}
        <div className="pt-4 border-t border-[#F4EBE0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#66757F] gap-2">
          <div>
            <span>New to NAVIX? </span>
            <Link
              href={signupHref}
              className="font-bold text-[#1F6E78] hover:underline cursor-pointer"
            >
              Create your traveler account
            </Link>
          </div>
          <span className="text-[11px] text-[#8E9BA4] font-mono">
            Deterministic Budget Guarantee
          </span>
        </div>
      </div>

      {/* Right Visual Area (Approx 42% on Desktop) */}
      <div className="hidden lg:block lg:col-span-5 relative">
        <TravelCollage />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4EFEA] text-[#142A38] selection:bg-[#1F6E78]/15 selection:text-[#142A38]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 sm:py-28 flex items-center justify-center">
        <Suspense
          fallback={
            <div className="w-full h-96 bg-white rounded-3xl border border-[#EBDCC7] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#1F6E78] animate-spin" />
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
