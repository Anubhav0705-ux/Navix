'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar, Footer, AutoPlanStage } from '@/components';
import { getTripPlan } from '@/lib';
import { getCurrentUser } from '@/services/auth';
import { TripPlanResult } from '@/types';
import { Compass } from 'lucide-react';

export default function TripResultPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [plan, setPlan] = useState<TripPlanResult | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const user = getCurrentUser();
    if (!user) {
      router.replace('/login?returnTo=/trip/result');
      return;
    }
    setCurrentUser(user);
    setPlan(getTripPlan());
  }, [router]);

  if (!isMounted || !currentUser) {
    return null;
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF7F1] text-[#142A38]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 pt-24 sm:pt-28 pb-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#1F6E78]/10 border border-[#1F6E78]/20 flex items-center justify-center mx-auto text-[#1F6E78]">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#142A38] font-editorial">No Generated Journey Found</h1>
          <p className="text-xs text-[#66757F] max-w-md mx-auto leading-relaxed">
            Please run the interactive trip planner to generate your budget-optimized itinerary.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            <span>Plan a Trip &rarr;</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7F1] text-[#142A38] font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        <AutoPlanStage
          planResult={plan}
          onReOptimize={() => router.push('/plan')}
        />
      </main>

      <Footer />
    </div>
  );
}
