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
    <div className="min-h-screen flex flex-col bg-[#FBF7F1] text-[#142A38] selection:bg-[#1F6E78]/15 selection:text-[#142A38]">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-16 flex flex-col justify-center">
        <div className="bg-white border border-[#EBDCC7] rounded-3xl p-8 space-y-6 shadow-xl">
          <div className="space-y-1.5 text-center">
            <span className="text-xs font-bold text-[#E96E55] uppercase tracking-wider block">
              Join NAVIX
            </span>
            <h1 className="text-3xl font-black font-editorial text-[#142A38]">Create Your Travel Profile</h1>
            <p className="text-xs text-[#66757F]">
              Save multi-modal itineraries, export branded PDFs, and manage whole-trip budgets.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#66757F] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#1F6E78]" /> Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FBF7F1] border border-[#EBDCC7] rounded-xl px-4 py-3 text-sm text-[#142A38] placeholder-[#94A3B8] font-bold focus:outline-none focus:ring-2 focus:ring-[#1F6E78]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#66757F] mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#1F6E78]" /> Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FBF7F1] border border-[#EBDCC7] rounded-xl px-4 py-3 text-sm text-[#142A38] placeholder-[#94A3B8] font-bold focus:outline-none focus:ring-2 focus:ring-[#1F6E78]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#66757F] mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#1F6E78]" /> Password
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FBF7F1] border border-[#EBDCC7] rounded-xl px-4 py-3 text-sm text-[#142A38] placeholder-[#94A3B8] font-bold focus:outline-none focus:ring-2 focus:ring-[#1F6E78]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#1F6E78]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration →'}</span>
            </button>
          </form>

          <div className="text-center text-xs text-[#66757F] pt-2 border-t border-[#EBDCC7]">
            <span>Already have an account? </span>
            <Link href="/login" className="font-bold text-[#1F6E78] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
