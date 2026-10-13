'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar, Footer, AutoPlanStage } from '@/components';
import { getTripPlan } from '@/lib';
import { TripPlanResult } from '@/types';
import { Compass, ArrowRight } from 'lucide-react';

export default function TripResultPage() {
  const router = useRouter();
  const [plan] = useState<TripPlanResult | null>(() => getTripPlan());

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#0B192C]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#0B192C]">No Generated Journey Found</h1>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            Please run the interactive trip planner to generate your budget-optimized itinerary.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
          >
            <span>Plan a Trip &rarr;</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#0B192C] font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <AutoPlanStage
          planResult={plan}
          onReOptimize={() => router.push('/plan')}
        />
      </main>

      <Footer />
    </div>
  );
}
