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
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#0B192C]">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-16 flex flex-col justify-center">
        <div className="bg-white border border-stone-200 rounded-3xl p-8 space-y-6 shadow-xl">
          <div className="space-y-1 text-center">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              Join NAVIX
            </span>
            <h1 className="text-2xl font-black text-[#0B192C]">Create Your Travel Profile</h1>
            <p className="text-xs text-stone-500">
              Save multi-modal itineraries, export branded PDFs, and manage budgets.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#0B192C] font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-emerald-600" /> Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#0B192C] font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" /> Password
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#0B192C] font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-600/30 text-sm disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating Profile...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100 text-center text-xs text-stone-500">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-700 font-bold hover:underline">
              Sign In Instead
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
