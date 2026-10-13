'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar, Footer, SafeImage } from '@/components';
import { getCurrentUser } from '@/services/auth';
import { getSavedTrips, deleteSavedTrip, SavedTripItem, saveTrip } from '@/services/trips';
import { saveTripPlan } from '@/lib';
import { UserResponse } from '@/types';
import {
  Compass, Calendar, Trash2, ExternalLink, ArrowRight, Loader2,
  MapPin, Download, Copy, Sparkles, CheckCircle2, Plus
} from 'lucide-react';

import { exportTripPlanPDF } from '@/lib/pdf-export';

const RECOMMENDED_DESTINATIONS = [
  {
    name: 'Old Manali',
    city: 'Manali',
    state: 'Himachal Pradesh',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
    tag: 'Mountain Pine Trails',
    budget: '₹20,000'
  },
  {
    name: 'North Goa',
    city: 'Goa',
    state: 'Goa',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
    tag: 'Coastal Heritage & Cafes',
    budget: '₹22,000'
  },
  {
    name: 'Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop',
    tag: 'Palaces & Forts',
    budget: '₹16,000'
  },
  {
    name: 'Munnar',
    city: 'Munnar',
    state: 'Kerala',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop',
    tag: 'Tea Plantations & Mist',
    budget: '₹18,000'
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser] = useState<UserResponse | null>(() => getCurrentUser());
  const [savedTrips, setSavedTrips] = useState<SavedTripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleView = (item: SavedTripItem) => {
    saveTripPlan(item.plan);
    router.push('/plan');
  };

  const handleDelete = async (trip_id: string) => {
    setDeletingId(trip_id);
    try {
      await deleteSavedTrip(trip_id);
      setSavedTrips((prev) => prev.filter((t) => t.trip_id !== trip_id));
      showToast('Trip removed successfully.');
    } catch {
      showToast('Could not delete trip.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (item: SavedTripItem) => {
    setDuplicatingId(item.trip_id);
    try {
      if (item.plan) {
        await saveTrip(item.plan);
        const refreshed = await getSavedTrips();
        setSavedTrips(refreshed);
        showToast('Trip cloned successfully!');
      }
    } catch {
      showToast('Could not duplicate trip.');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handlePDF = (item: SavedTripItem) => {
    if (item.plan) {
      exportTripPlanPDF(item.plan);
    }
  };

  const upcomingTrip = savedTrips.length > 0 ? savedTrips[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#0B192C]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Toast Feedback */}
        {feedbackMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0B192C] text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* --- WELCOME HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              Traveler Profile
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C]">
              Welcome back, {currentUser?.name || 'Explorer'}
            </h1>
            <p className="text-xs text-stone-500">
              {currentUser?.email} &bull; Manage your multi-modal budget journeys and saved itineraries.
            </p>
          </div>

          <Link
            href="/plan"
            className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-emerald-600/30 whitespace-nowrap uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Plan New Journey</span>
          </Link>
        </div>

        {/* --- 1. UPCOMING / ACTIVE TRIP SPOTLIGHT --- */}
        {upcomingTrip && (
          <section className="bg-gradient-to-r from-[#0B192C] to-[#1E3E62] text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-400 to-transparent" />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Active Journey
              </span>
              <span className="text-xs font-mono text-stone-300">
                Departure: {upcomingTrip.travel_date}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-3">
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                  {upcomingTrip.origin} <span className="text-emerald-400 font-light">&rarr;</span> {upcomingTrip.destination}
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
                  Algorithmic itinerary computed within hard budget cap. Multi-modal connections and daily activities validated.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono">
                  <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-stone-400 block text-[10px]">TOTAL EXPENSE</span>
                    <span className="font-bold text-emerald-400 text-sm">₹{upcomingTrip.total_cost.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-stone-400 block text-[10px]">BUDGET CAP</span>
                    <span className="font-bold text-white text-sm">₹{upcomingTrip.budget_cap.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-stone-400 block text-[10px]">STATUS</span>
                    <span className="font-bold text-emerald-300 text-sm">{upcomingTrip.budget_status}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
                <button
                  onClick={() => handleView(upcomingTrip)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <span>Open Full Itinerary</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handlePDF(upcomingTrip)}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/15 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* --- 2. SAVED TRIPS DIRECTORY --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-[#0B192C] flex items-center gap-2">
              <Compass className="w-6 h-6 text-emerald-600" />
              <span>Saved Journeys ({savedTrips.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="p-16 text-center text-xs text-stone-500 bg-white rounded-3xl border border-stone-200 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>Loading saved itineraries...</span>
            </div>
          ) : savedTrips.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#0B192C]">No Saved Journeys Yet</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Generate an algorithmic multi-modal itinerary using the planner, then click &quot;Save Trip&quot; to keep it in your permanent traveler account.
              </p>
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <span>Start Planning Now &rarr;</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTrips.map((item) => (
                <div
                  key={item.trip_id}
                  className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold uppercase border border-emerald-200">
                        {item.budget_status}
                      </span>
                      <span className="text-[11px] font-mono text-stone-400">#{item.trip_id.slice(-6)}</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#0B192C] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item.origin} &rarr; {item.destination}</span>
                      </h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>Travel Date: {item.travel_date}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-100 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-stone-500 block">TOTAL COST</span>
                        <span className="font-bold text-emerald-700 text-sm">₹{item.total_cost.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">BUDGET CAP</span>
                        <span className="font-bold text-[#0B192C] text-sm">₹{item.budget_cap.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleView(item)}
                      className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>Open Plan</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(item)}
                        disabled={duplicatingId === item.trip_id}
                        className="p-2 text-stone-500 hover:text-[#0B192C] hover:bg-stone-200/50 rounded-lg transition-all"
                        title="Duplicate Trip"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handlePDF(item)}
                        className="p-2 text-stone-500 hover:text-emerald-700 hover:bg-stone-200/50 rounded-lg transition-all"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.trip_id)}
                        disabled={deletingId === item.trip_id}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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
        </section>

        {/* --- 3. RECOMMENDED DESTINATIONS --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-[#0B192C]">
              Recommended for Your Next Journey
            </h2>
            <Link
              href="/explore"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Explore All 65 Cities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RECOMMENDED_DESTINATIONS.map((dest) => (
              <div
                key={dest.name}
                className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="relative h-44 overflow-hidden bg-stone-100">
                  <SafeImage
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white">
                    {dest.tag}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-[#0B192C]">{dest.name}</h3>
                    <p className="text-xs text-stone-500">{dest.state}</p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-stone-600">From {dest.budget}</span>
                    <Link
                      href={`/plan?destination=${encodeURIComponent(dest.name)}`}
                      className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-[11px] hover:bg-emerald-100 transition-colors"
                    >
                      Plan Trip &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
