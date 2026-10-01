'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar, Footer } from '@/components';
import { getCurrentUser } from '@/services/auth';
import { getSavedTrips, deleteSavedTrip, SavedTripItem } from '@/services/trips';
import { saveTripPlan } from '@/lib';
import { UserResponse } from '@/types';
import { Compass, Calendar, Trash2, ExternalLink, ArrowRight, Loader2, MapPin } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0B1320]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#0E9F7A] uppercase tracking-wider block">
              Traveler Dashboard
            </span>
            <h1 className="text-2xl font-extrabold text-[#0B1320]">
              Saved Trips &bull; {currentUser?.name}
            </h1>
            <p className="text-xs text-[#667085]">
              {currentUser?.email} &bull; Manage your multi-modal itineraries
            </p>
          </div>

          <div>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 text-xs font-bold bg-[#0E9F7A] hover:bg-[#0B8465] text-white px-5 py-2.5 rounded-xl transition-smooth shadow-sm"
            >
              <span>Plan New Trip</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Trips List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#667085] flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#0E9F7A]" />
            Loading Saved Trips...
          </div>
        ) : savedTrips.length === 0 ? (
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#F7F5F0] border border-[#E7E5E0] flex items-center justify-center mx-auto text-[#667085]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0B1320]">No Saved Trips Yet</h3>
            <p className="text-xs text-[#667085] max-w-md mx-auto leading-relaxed">
              Use the interactive trip planner to generate a budget-compliant journey, then click &quot;Save Trip to Profile&quot;.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E9F7A] hover:bg-[#0B8465] text-white font-bold rounded-xl text-xs transition-smooth"
            >
              <span>Start Planning</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedTrips.map((item) => (
              <div key={item.trip_id} className="bg-white border border-[#E7E5E0] rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-[#0E9F7A]/10 text-[#0E9F7A] text-[10px] font-bold uppercase">
                      {item.budget_status}
                    </span>
                    <span className="text-[11px] font-mono text-[#667085]">ID: {item.trip_id}</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#0B1320] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0E9F7A]" />
                    {item.origin} &rarr; {item.destination}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="bg-[#F7F5F0] p-3 rounded-xl border border-[#E7E5E0]">
                      <span className="text-[#667085] block mb-0.5">Planned Cost</span>
                      <span className="font-bold text-[#0E9F7A] text-sm">₹{item.total_cost.toLocaleString()}</span>
                    </div>

                    <div className="bg-[#F7F5F0] p-3 rounded-xl border border-[#E7E5E0]">
                      <span className="text-[#667085] block mb-0.5">Max Budget</span>
                      <span className="font-bold text-[#0B1320] text-sm">₹{item.budget_cap.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#667085] flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5" /> {item.travel_date}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E7E5E0] flex items-center justify-between">
                  <button
                    onClick={() => handleView(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E9F7A] hover:underline"
                  >
                    <span>View Itinerary</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.trip_id)}
                    disabled={deletingId === item.trip_id}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#667085] hover:text-red-600 transition-smooth p-1.5"
                    title="Delete Trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
