'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo, TravelCollage } from '@/components';
import { setNewPassword } from '@/services/auth';
import { APIError } from '@/services/api';
import {
  Lock, AlertTriangle, Eye, EyeOff, Loader2,
  CheckCircle2, ShieldCheck, Key
} from 'lucide-react';

export default function SetNewPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await setNewPassword(newPassword, confirmPassword);
      // Redirect to dashboard with active regular session
      router.push('/dashboard');
    } catch (err: unknown) {
      setIsSubmitting(false);
      if (err instanceof APIError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Unable to update your password. Your temporary session may have expired.');
      }
    }
  };

  const isLengthValid = newPassword.length >= 8;
  const isMatchValid = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="min-h-screen bg-[#FBF7F1] flex flex-col justify-between selection:bg-[#1F6E78]/20 selection:text-[#1F6E78]">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl bg-white rounded-3xl lg:rounded-4xl shadow-2xl border border-[#E8DAC8] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] transition-all">
          {/* Left Form Area */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white text-[#142A38]">
            <div className="flex items-center justify-between pb-6 border-b border-[#F4EBE0]">
              <Link href="/" className="inline-block" aria-label="NAVIX Home">
                <Logo />
              </Link>

              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F6E78] bg-[#1F6E78]/10 py-1 px-3 rounded-full">
                <Key className="w-3.5 h-3.5" />
                <span>Password Update Required</span>
              </div>
            </div>

            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold font-editorial text-[#142A38] tracking-tight">
                  Set your permanent password.
                </h1>
                <p className="text-xs sm:text-sm text-[#66757F] leading-relaxed">
                  You have authenticated using an administrator temporary credential. Please choose a strong, secure password to continue your journey.
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

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="set-new-password"
                    className="block text-xs font-bold uppercase tracking-wider text-[#66757F] mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E9BA4]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="set-new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPasswordState(e.target.value)}
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

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirm-new-password"
                    className="block text-xs font-bold uppercase tracking-wider text-[#66757F] mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E9BA4]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirm-new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#FBF7F1] hover:bg-white focus:bg-white border border-[#EBDCC7] rounded-xl pl-10 pr-11 py-3 text-sm text-[#142A38] font-medium placeholder-[#8E9BA4] focus:outline-none focus:ring-2 focus:ring-[#1F6E78] transition-all"
                    />
                  </div>
                </div>

                {/* Password Criteria Feedback */}
                <div className="p-3 bg-[#FBF7F1] border border-[#EBDCC7] rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${isLengthValid ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      ✓
                    </span>
                    <span className={isLengthValid ? 'text-emerald-700 font-semibold' : 'text-[#66757F]'}>
                      Minimum 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${isMatchValid ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      ✓
                    </span>
                    <span className={isMatchValid ? 'text-emerald-700 font-semibold' : 'text-[#66757F]'}>
                      Passwords match
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isLengthValid || !isMatchValid}
                    className="w-full py-3.5 px-6 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#1F6E78]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Save Password & Access Dashboard</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-[#F4EBE0] text-xs text-[#8E9BA4]">
              <span>Need help? Contact NAVIX system administration for verified recovery assistance.</span>
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
