'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo, TravelCollage } from '@/components';
import { requestPasswordReset } from '@/services/auth';
import { APIError } from '@/services/api';
import {
  Mail, ShieldAlert, ArrowLeft, Loader2, CheckCircle2,
  KeyRound, ShieldCheck
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [hpField, setHpField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your account email or username.');
      return;
    }

    setIsSubmitting(true);

    try {
      const resp = await requestPasswordReset(identifier.trim(), hpField);
      setSubmittedMessage(resp.message);
    } catch (err: unknown) {
      if (err instanceof APIError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Unable to reach NAVIX recovery service. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F1] flex flex-col justify-between selection:bg-[#1F6E78]/20 selection:text-[#1F6E78]">
      {/* Centered Auth Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl bg-white rounded-3xl lg:rounded-4xl shadow-2xl border border-[#E8DAC8] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] transition-all">
          {/* Left Form Area */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white text-[#142A38]">
            {/* Top Navigation */}
            <div className="flex items-center justify-between pb-6 border-b border-[#F4EBE0]">
              <Link href="/" className="inline-block" aria-label="NAVIX Home">
                <Logo />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#66757F] hover:text-[#1F6E78] transition-colors py-1 px-2.5 rounded-lg hover:bg-[#FBF7F1]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </Link>
            </div>

            {/* Main Content */}
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1F6E78]/10 text-[#1F6E78] rounded-full text-xs font-bold tracking-wider uppercase">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Manual Account Recovery</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-editorial text-[#142A38] tracking-tight">
                  Recover your account.
                </h1>
                <p className="text-xs sm:text-sm text-[#66757F] leading-relaxed">
                  Submit a password reset request. An administrator will verify the request and provide a temporary password.
                </p>
              </div>

              {/* Error Message Banner */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm flex items-center gap-3 animate-in fade-in duration-200"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Confirmation State */}
              {submittedMessage ? (
                <div className="p-6 bg-[#1F6E78]/10 border border-[#1F6E78]/25 rounded-2xl space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#1F6E78] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[#142A38]">Request Logged for Review</h3>
                      <p className="text-xs text-[#526371] leading-relaxed">
                        {submittedMessage}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1F6E78]/15 text-[11px] text-[#66757F] space-y-1">
                    <p className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1F6E78]" />
                      <span>Single-use temporary credentials are cryptographically generated and expire in 24 hours.</span>
                    </p>
                  </div>

                  <div className="pt-3">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                    >
                      <span>Return to Sign In</span>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Reset Request Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Anti-bot Honeypot field */}
                  <input
                    type="text"
                    name="hp_field"
                    value={hpField}
                    onChange={(e) => setHpField(e.target.value)}
                    tabIndex={-1}
                    aria-hidden="true"
                    autoComplete="off"
                    className="opacity-0 absolute -left-[9999px] h-0 w-0 -z-50 pointer-events-none"
                  />

                  <div>
                    <label
                      htmlFor="recovery-identifier"
                      className="block text-xs font-bold uppercase tracking-wider text-[#66757F] mb-1.5"
                    >
                      Email Address or Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E9BA4]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="recovery-identifier"
                        type="text"
                        required
                        autoComplete="email"
                        placeholder="traveler@example.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full bg-[#FBF7F1] hover:bg-white focus:bg-white border border-[#EBDCC7] rounded-xl pl-10 pr-4 py-3 text-sm text-[#142A38] font-medium placeholder-[#8E9BA4] focus:outline-none focus:ring-2 focus:ring-[#1F6E78] transition-all"
                      />
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
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <span>Request Password Reset</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-6 border-t border-[#F4EBE0] flex items-center justify-between text-xs text-[#8E9BA4]">
              <span>Remember your credentials?</span>
              <Link
                href="/login"
                className="font-bold text-[#1F6E78] hover:text-[#15525A] transition-colors"
              >
                Sign in &rarr;
              </Link>
            </div>
          </div>

          {/* Right Collage Area */}
          <div className="hidden lg:block lg:col-span-5 bg-[#142A38] p-8 border-l border-[#E8DAC8]/60 relative overflow-hidden">
            <TravelCollage />
          </div>
        </div>
      </main>
    </div>
  );
}
