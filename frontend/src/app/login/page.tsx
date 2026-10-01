'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar, Footer } from '@/components';
import { loginUser } from '@/services/auth';
import { APIError } from '@/services/api';
import { ArrowRight, Lock, Mail, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('anubhav@example.com');
  const [password, setPassword] = useState('Password123!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const resp = await loginUser(email, password);
      if (resp.user.role.toLowerCase() === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      if (err instanceof APIError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to sign in. Please check your credentials.');
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
              NAVIX Account
            </span>
            <h1 className="text-2xl font-extrabold text-[#0B1320]">Sign In to Your Journey</h1>
            <p className="text-xs text-[#667085]">
              Access saved multi-modal itineraries and budget plans.
            </p>
          </div>

          {/* Quick Demo Credentials Info */}
          <div className="p-3.5 bg-[#F7F5F0] border border-[#E7E5E0] rounded-xl text-xs space-y-1">
            <span className="font-bold text-[#0B1320] block">Demo Credentials:</span>
            <div className="text-[#667085] font-mono text-[11px] space-y-0.5">
              <p>Traveler: anubhav@example.com / Password123!</p>
              <p>Admin: admin@navix.com / AdminPassword123!</p>
            </div>
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
                <Mail className="w-3.5 h-3.5 text-[#0E9F7A]" /> Email Address
              </label>
              <input
                type="email"
                required
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
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-[#E7E5E0] text-center text-xs text-[#667085]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#0E9F7A] font-bold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
