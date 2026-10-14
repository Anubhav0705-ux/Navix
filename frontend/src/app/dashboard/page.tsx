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
    router.push('/plan?reopen=true');
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
    <div className="min-h-screen flex flex-col bg-[#FBF7F1] text-[#142A38] selection:bg-[#1F6E78]/15 selection:text-[#142A38]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Toast Feedback */}
        {feedbackMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#142A38] text-white px-5 py-3 rounded-2xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#D8A64B]" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* --- WELCOME HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EBDCC7] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#E96E55] tracking-wider uppercase block">
              Personal Travel Library
            </span>
            <h1 className="text-2xl sm:text-4xl font-black font-editorial text-[#142A38]">
              Welcome back, {currentUser?.name || 'Explorer'}
            </h1>
            <p className="text-xs text-[#66757F]">
              {currentUser?.email} &bull; Manage your multi-modal budget journeys and saved itineraries.
            </p>
          </div>

          <Link
            href="/plan"
            className="inline-flex items-center gap-2 text-xs font-bold bg-[#1F6E78] hover:bg-[#15525A] text-white px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-[#1F6E78]/20 whitespace-nowrap uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Plan New Journey</span>
          </Link>
        </div>

        {/* --- 1. UPCOMING / ACTIVE TRIP SPOTLIGHT --- */}
        {upcomingTrip && (
          <section className="bg-[#142A38] text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <span className="px-3.5 py-1 rounded-full bg-white/15 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D8A64B]" />
                Featured Active Journey
              </span>
              <span className="text-xs text-[#CBD5E1]">
                Departure: {upcomingTrip.travel_date}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-3">
                <h2 className="text-2xl sm:text-4xl font-black font-editorial tracking-tight text-white">
                  {upcomingTrip.origin} <span className="text-[#E96E55] font-light">&rarr;</span> {upcomingTrip.destination}
                </h2>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed max-w-xl">
                  Personalized itinerary computed within hard budget cap. Multi-modal connections and daily activities validated.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                  <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10">
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">TOTAL EXPENSE</span>
                    <span className="font-bold text-white text-base">₹{upcomingTrip.total_cost.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10">
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">BUDGET CAP</span>
                    <span className="font-bold text-[#D8A64B] text-base">₹{upcomingTrip.budget_cap.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10">
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">STATUS</span>
                    <span className="font-bold text-emerald-400 text-base">{upcomingTrip.budget_status}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
                <button
                  onClick={() => handleView(upcomingTrip)}
                  className="px-6 py-3.5 bg-[#1F6E78] hover:bg-[#15525A] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#1F6E78]/25 flex items-center gap-2 cursor-pointer"
                >
                  <span>Open Full Itinerary</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handlePDF(upcomingTrip)}
                  className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#D8A64B]" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* --- 2. SAVED TRIPS DIRECTORY --- */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-black font-editorial text-[#142A38] flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-[#1F6E78]" />
              <span>Saved Journeys ({savedTrips.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="p-16 text-center text-xs text-[#66757F] bg-white rounded-3xl border border-[#EBDCC7] flex items-center justify-center gap-2 shadow-xs">
              <Loader2 className="w-5 h-5 animate-spin text-[#1F6E78]" />
              <span>Loading saved itineraries...</span>
            </div>
          ) : savedTrips.length === 0 ? (
            <div className="bg-white border border-[#EBDCC7] rounded-3xl p-12 text-center space-y-4 shadow-sm max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#F5EBE1] border border-[#EBDCC7] flex items-center justify-center mx-auto text-[#1F6E78]">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-editorial text-[#142A38]">No Saved Journeys Yet</h3>
              <p className="text-xs text-[#66757F] max-w-md mx-auto leading-relaxed">
                Generate an algorithmic multi-modal itinerary using the planner, then click &quot;Save Trip&quot; to keep it in your permanent traveler account.
              </p>
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-[#1F6E78]/20"
              >
                <span>Start Planning Now &rarr;</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTrips.map((item) => (
                <div
                  key={item.trip_id}
                  className="bg-white border border-[#EBDCC7] rounded-3xl overflow-hidden shadow-sm hover:border-[#1F6E78] transition-all flex flex-col justify-between photo-card-hover"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">
                        {item.budget_status}
                      </span>
                      <span className="text-[11px] font-mono text-[#94A3B8]">#{item.trip_id.slice(-6)}</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#1F6E78] shrink-0" />
                        <span>{item.origin} &rarr; {item.destination}</span>
                      </h3>
                      <p className="text-xs text-[#66757F] flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>Travel Date: {item.travel_date}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-4 bg-[#FBF7F1] rounded-2xl border border-[#EBDCC7] text-xs">
                      <div>
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">TOTAL COST</span>
                        <span className="font-bold text-[#142A38] text-base">₹{item.total_cost.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">BUDGET CAP</span>
                        <span className="font-bold text-[#1F6E78] text-base">₹{item.budget_cap.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#FBF7F1] border-t border-[#EBDCC7] flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleView(item)}
                      className="font-bold text-[#1F6E78] hover:text-[#15525A] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Plan</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(item)}
                        disabled={duplicatingId === item.trip_id}
                        className="p-2 text-[#66757F] hover:text-[#142A38] hover:bg-white rounded-lg transition-all cursor-pointer"
                        title="Duplicate Trip"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handlePDF(item)}
                        className="p-2 text-[#66757F] hover:text-[#1F6E78] hover:bg-white rounded-lg transition-all cursor-pointer"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.trip_id)}
                        disabled={deletingId === item.trip_id}
                        className="p-2 text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
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
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-black font-editorial text-[#142A38]">
              Recommended for Your Next Journey
            </h2>
            <Link
              href="/explore"
              className="text-xs font-bold text-[#1F6E78] hover:underline flex items-center gap-1"
            >
              <span>Explore All 113 Destinations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RECOMMENDED_DESTINATIONS.map((dest) => (
              <div
                key={dest.name}
                className="bg-white border border-[#EBDCC7] rounded-3xl overflow-hidden shadow-sm hover:border-[#1F6E78] transition-all group flex flex-col justify-between photo-card-hover"
              >
                <div className="relative h-44 overflow-hidden bg-[#F5EBE1]">
                  <SafeImage
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#142A38] shadow-xs">
                    {dest.tag}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold font-editorial text-[#142A38]">{dest.name}</h3>
                    <p className="text-xs text-[#66757F]">{dest.state}</p>
                  </div>

                  <div className="pt-2 border-t border-[#EBDCC7] flex items-center justify-between text-xs">
                    <span className="text-[#66757F] font-medium">From {dest.budget}</span>
                    <Link
                      href={`/plan?destination=${encodeURIComponent(dest.name)}`}
                      className="px-3.5 py-1.5 bg-[#1F6E78]/10 text-[#1F6E78] font-bold rounded-xl text-xs hover:bg-[#1F6E78] hover:text-white transition-colors"
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
