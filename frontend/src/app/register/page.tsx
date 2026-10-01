'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar, Footer } from '@/components';
import { registerUser } from '@/services/auth';
import { APIError } from '@/services/api';
import { ArrowRight, Lock, Mail, User, AlertTriangle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await registerUser(name, email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setIsSubmitting(false);
      if (err instanceof APIError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create account. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0B1320]">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-16 flex flex-col justify-center">
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1 text-center">
            <span className="text-xs font-bold text-[#0E9F7A] uppercase tracking-wider block">
              Create Account
            </span>
            <h1 className="text-2xl font-extrabold text-[#0B1320]">Join NAVIX</h1>
            <p className="text-xs text-[#667085]">
              Save itineraries, manage multi-modal trips, and track travel budgets.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#667085] mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#0E9F7A]" /> Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Anubhav Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl px-3.5 py-2.5 text-sm text-[#0B1320] font-medium focus:outline-none focus:border-[#0E9F7A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#667085] mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#0E9F7A]" /> Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl px-3.5 py-2.5 text-sm text-[#0B1320] font-medium focus:outline-none focus:border-[#0E9F7A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#667085] mb-1.5 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#0E9F7A]" /> Password
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl px-3.5 py-2.5 text-sm text-[#0B1320] font-medium focus:outline-none focus:border-[#0E9F7A]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0E9F7A] hover:bg-[#0B8465] text-white font-bold py-3 px-4 rounded-xl transition-smooth flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-[#E7E5E0] text-center text-xs text-[#667085]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#0E9F7A] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
