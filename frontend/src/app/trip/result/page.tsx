'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar, Footer, ReviewStage } from '@/components';
import { getTripPlan } from '@/lib';
import { TripPlanResult } from '@/types';
import { Compass } from 'lucide-react';

export default function TripResultPage() {
  const router = useRouter();
  const [plan] = useState<TripPlanResult | null>(() => getTripPlan());

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B1320] text-slate-100">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#101419] border border-white/15 flex items-center justify-center mx-auto text-[#0FA77A]">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">No Generated Journey Found</h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Please run the interactive trip planner to generate your budget-optimized itinerary.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0FA77A] hover:bg-[#0B8465] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg"
          >
            <span>Plan a Trip &rarr;</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1320] text-slate-100 font-sans relative selection:bg-[#0FA77A] selection:text-white">
      {/* Background Travel Canvas Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center filter saturate-50 contrast-125" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#0B1320]/90 via-[#0B1320]/95 to-[#0B1320]" />

      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ReviewStage
          planResult={plan}
          onBackToAutoPlan={() => router.push('/plan')}
        />
      </main>

      <Footer />
    </div>
  );
}

