'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar, Footer } from '@/components';
import { getCurrentUser } from '@/services/auth';
import { getSavedTrips, deleteSavedTrip, SavedTripItem } from '@/services/trips';
import { saveTripPlan } from '@/lib';
import { UserResponse } from '@/types';
import { Compass, Calendar, Trash2, ExternalLink, ArrowRight, Loader2, MapPin, Download } from 'lucide-react';
import { exportTripPlanPDF } from '@/lib/pdf-export';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser] = useState<UserResponse | null>(() => getCurrentUser());
  const [savedTrips, setSavedTrips] = useState<SavedTripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    getSavedTrips()
      .then((data) => {
        setSavedTrips(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [currentUser, router]);

  const handleView = (item: SavedTripItem) => {
    saveTripPlan(item.plan);
    router.push('/trip/result');
  };

  const handleDelete = async (trip_id: string) => {
    setDeletingId(trip_id);
    try {
      await deleteSavedTrip(trip_id);
      setSavedTrips((prev) => prev.filter((t) => t.trip_id !== trip_id));
    } catch {
      // Error handling fallback
    } finally {
      setDeletingId(null);
    }
  };

  const handlePDF = (item: SavedTripItem) => {
    if (item.plan) {
      exportTripPlanPDF(item.plan);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1320] text-slate-100 font-sans relative selection:bg-[#0FA77A] selection:text-white">
      {/* Background Travel Canvas Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center filter saturate-50 contrast-125" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#0B1320]/90 via-[#0B1320]/95 to-[#0B1320]" />

      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101419]/90 border border-white/15 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#0FA77A] uppercase tracking-wider block">
              Travel Command Center &bull; Dashboard
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              Saved Journeys &bull; {currentUser?.name}
            </h1>
            <p className="text-xs text-slate-400">
              {currentUser?.email} &bull; Manage your multi-modal budget itineraries
            </p>
          </div>

          <div>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 text-xs font-bold bg-[#0FA77A] hover:bg-[#0B8465] text-white px-6 py-3 rounded-xl transition-all shadow-lg uppercase tracking-wider"
            >
              <span>Plan New Trip &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Trips List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#0FA77A]" />
            Loading Saved Trips...
          </div>
        ) : savedTrips.length === 0 ? (
          <div className="bg-[#101419] border border-white/15 rounded-2xl p-12 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#0FA77A]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-white">No Saved Trips Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Use the interactive trip planner to generate a budget-compliant journey, then click &quot;Save Trip to Profile&quot;.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0FA77A] hover:bg-[#0B8465] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <span>Start Planning &rarr;</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedTrips.map((item) => (
              <div key={item.trip_id} className="bg-[#101419]/90 border border-white/15 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all hover:border-white/30">
                <div className="space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0FA77A]/15 text-[#0FA77A] text-[10px] font-mono font-bold uppercase border border-[#0FA77A]/30">
                      {item.budget_status}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">ID: {item.trip_id}</span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0FA77A]" />
                    {item.origin} &rarr; {item.destination}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1 font-mono">
                    <div className="bg-[#161B22] p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block text-[10px]">PLANNED COST</span>
                      <span className="font-bold text-[#0FA77A] text-sm">₹{item.total_cost.toLocaleString()}</span>
                    </div>

                    <div className="bg-[#161B22] p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block text-[10px]">MAX BUDGET</span>
                      <span className="font-bold text-white text-sm">₹{item.budget_cap.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-[#0FA77A]" /> Travel Date: {item.travel_date}
                  </p>
                </div>

                <div className="p-4 bg-[#161B22] border-t border-white/10 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleView(item)}
                    className="inline-flex items-center gap-1.5 font-bold text-[#0FA77A] hover:underline"
                  >
                    <span>Open Journey</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePDF(item)}
                      className="p-2 text-slate-400 hover:text-white transition-all rounded-lg hover:bg-white/5"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4 text-[#0FA77A]" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.trip_id)}
                      disabled={deletingId === item.trip_id}
                      className="p-2 text-slate-400 hover:text-rose-400 transition-all rounded-lg hover:bg-rose-950/40"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

