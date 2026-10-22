'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Navbar, Footer, SafeImage,
  PassportStamp, DottedRouteAccent, CoordinatesTag,
  PostageStampSnippet, CompassRoseFragment
} from '@/components';
import { getCurrentUser, changePassword, deleteAccount, logoutSession } from '@/services/auth';
import { getSavedTrips, deleteSavedTrip, SavedTripItem, saveTrip } from '@/services/trips';
import { saveTripPlan } from '@/lib';
import { UserResponse } from '@/types';
import { resolveDestinationPhoto } from '@/lib/mediaResolver';
import { APIError } from '@/services/api';
import {
  Compass, Calendar, Trash2, ExternalLink, ArrowRight, Loader2,
  MapPin, Download, Copy, Sparkles, CheckCircle2, Plus,
  KeyRound, ShieldAlert, AlertTriangle, Lock, ShieldCheck, X
} from 'lucide-react';
import { exportTripPlanPDF } from '@/lib/pdf-export';

const RECOMMENDED_DESTINATIONS = [
  {
    name: 'Old Manali',
    city: 'Manali',
    state: 'Himachal Pradesh',
    image: '/home/manali.webp',
    tag: 'Mountain Pine Trails',
    budget: '₹20,000'
  },
  {
    name: 'North Goa',
    city: 'Goa',
    state: 'Goa',
    image: '/home/goa.webp',
    tag: 'Coastal Heritage & Cafes',
    budget: '₹22,000'
  },
  {
    name: 'Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    image: '/home/jaipur.webp',
    tag: 'Palaces & Forts',
    budget: '₹16,000'
  },
  {
    name: 'Munnar',
    city: 'Munnar',
    state: 'Kerala',
    image: '/home/kerela.webp',
    tag: 'Tea Plantations & Mist',
    budget: '₹18,000'
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [savedTrips, setSavedTrips] = useState<SavedTripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Account Settings state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwSuccessMsg, setPwSuccessMsg] = useState<string | null>(null);
  const [pwErrorMsg, setPwErrorMsg] = useState<string | null>(null);

  // Account Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const user = getCurrentUser();
    if (!user) {
      router.replace('/login?returnTo=/dashboard');
      return;
    }
    setCurrentUser(user);

    getSavedTrips()
      .then((data) => {
        setSavedTrips(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  if (!isMounted || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF7F1] text-[#142A38]">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#1F6E78] animate-spin" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#66757F]">
              Loading Personal Travel Library...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwErrorMsg(null);
    setPwSuccessMsg(null);

    if (newPw.length < 8) {
      setPwErrorMsg('New password must be at least 8 characters long.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwErrorMsg('New passwords do not match.');
      return;
    }

    setIsChangingPw(true);
    try {
      const res = await changePassword(currentPw, newPw, confirmPw);
      setPwSuccessMsg(res.message);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err: unknown) {
      if (err instanceof APIError) {
        setPwErrorMsg(err.message);
      } else {
        setPwErrorMsg('Failed to update password. Please check your current password.');
      }
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteErrorMsg(null);

    if (deleteConfirmation.trim() !== 'DELETE') {
      setDeleteErrorMsg("Please type 'DELETE' in uppercase to confirm.");
      return;
    }

    setIsDeletingAccount(true);
    try {
      await deleteAccount(deletePw, 'DELETE');
      router.push('/');
    } catch (err: unknown) {
      setIsDeletingAccount(false);
      if (err instanceof APIError) {
        setDeleteErrorMsg(err.message);
      } else {
        setDeleteErrorMsg('Failed to delete account. Please verify your password.');
      }
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
    <div className="min-h-screen flex flex-col bg-[#FBF7F1] text-[#142A38] selection:bg-[#1F6E78]/15 selection:text-[#142A38] relative overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-12 relative">
        
        {/* Toast Feedback */}
        {feedbackMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#142A38] text-white px-5 py-3 rounded-2xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#D8A64B]" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* --- WELCOME HEADER --- */}
        <div className="relative overflow-hidden bg-white border border-[#EBDCC7] rounded-3xl p-6 sm:p-8 shadow-xs">
          {/* Subtle Decorative Background Accents */}
          <div className="absolute top-2 right-12 opacity-15 pointer-events-none hidden lg:block">
            <DottedRouteAccent variant="curve-up" color="#1F6E78" />
          </div>
          <div className="absolute -top-4 -right-4 opacity-15 pointer-events-none hidden sm:block">
            <PassportStamp code="NAVIX" city="LIBRARY" date="2026" color="teal" rotation={-12} />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        </div>

        {/* --- 1. UPCOMING / ACTIVE TRIP SPOTLIGHT --- */}
        {upcomingTrip && (
          <section className="group relative rounded-3xl overflow-hidden border border-[#D5C6B5] shadow-xl transition-all duration-300">
            {/* 1. Full-bleed authentic destination photograph with smooth hover zoom */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveDestinationPhoto(upcomingTrip.destination)}
              alt={upcomingTrip.destination}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* 2. Precision Multi-stop Gradient Scrim: Dark on left for 100% readable text, translucent on right to reveal the authentic photography */}
            <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#0C1820]/95 via-[#0C1820]/80 sm:via-[#0C1820]/65 to-[#0C1820]/30 sm:to-transparent pointer-events-none" />

            {/* 3. Subtle ambient warm top vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0C1820]/35 via-transparent to-[#0C1820]/50 pointer-events-none" />

            {/* Inner Content Padding */}
            <div className="relative z-10 p-6 sm:p-10 text-white space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
                <span className="px-3.5 py-1.5 rounded-full bg-[#0C1820]/60 backdrop-blur-md border border-white/25 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#D8A64B]" />
                  <span>Featured Active Journey</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-[#0C1820]/50 backdrop-blur-md border border-white/15 text-xs text-white/90 font-medium flex items-center gap-1.5 shadow-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#CBD5E1]" />
                  <span>Departure: {upcomingTrip.travel_date}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <h2 className="text-3xl sm:text-5xl font-black font-editorial tracking-tight text-white drop-shadow-md">
                    {upcomingTrip.origin} <span className="text-[#E96E55] font-light">&rarr;</span> {upcomingTrip.destination}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl drop-shadow-xs font-normal">
                    Personalized itinerary computed within hard budget cap. Multi-modal connections and daily activities validated.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                    <div className="bg-[#0C1820]/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-sm">
                      <span className="text-white/70 block text-[10px] font-mono uppercase font-bold tracking-wider">TOTAL EXPENSE</span>
                      <span className="font-bold text-white text-base font-mono">₹{upcomingTrip.total_cost.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#0C1820]/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-sm">
                      <span className="text-white/70 block text-[10px] font-mono uppercase font-bold tracking-wider">BUDGET CAP</span>
                      <span className="font-bold text-[#D8A64B] text-base font-mono">₹{upcomingTrip.budget_cap.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#0C1820]/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-sm">
                      <span className="text-white/70 block text-[10px] font-mono uppercase font-bold tracking-wider">STATUS</span>
                      <span className="font-bold text-emerald-400 text-base flex items-center gap-1.5 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {upcomingTrip.budget_status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
                  <button
                    onClick={() => handleView(upcomingTrip)}
                    className="px-6 py-3.5 bg-[#1F6E78] hover:bg-[#16555E] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-[#1F6E78]/30 flex items-center gap-2 group/btn cursor-pointer"
                  >
                    <span>Open Full Itinerary</span>
                    <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </button>

                  <button
                    onClick={() => handlePDF(upcomingTrip)}
                    className="px-5 py-3.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-2xl transition-all border border-white/30 backdrop-blur-md flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4 text-[#D8A64B]" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- 2. SAVED TRIPS DIRECTORY --- */}
        <section className="relative space-y-6">
          <div className="absolute -top-6 right-8 opacity-10 pointer-events-none hidden md:block">
            <CompassRoseFragment size={130} opacity={0.15} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black font-editorial text-[#142A38] flex items-center gap-2.5">
                <Compass className="w-6 h-6 text-[#1F6E78]" />
                <span>Saved Journeys ({savedTrips.length})</span>
              </h2>
              <CoordinatesTag
                location="TRAVEL VAULT"
                lat="MULTI-MODAL"
                lng="DETERMINISTIC"
                className="hidden sm:inline-flex"
              />
            </div>
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
                  className="group bg-white border border-[#EBDCC7] rounded-3xl overflow-hidden shadow-sm hover:border-[#1F6E78] transition-all flex flex-col justify-between photo-card-hover"
                >
                  {/* Authentic Destination Cover Photo */}
                  <div className="relative h-44 w-full overflow-hidden bg-[#F5EBE1]">
                    <SafeImage
                      src={resolveDestinationPhoto(item.destination)}
                      alt={`Journey to ${item.destination}`}
                      category="destination"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent pointer-events-none" />
                    <span className="absolute bottom-3 left-4 text-xs font-bold text-white drop-shadow flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D8A64B]" />
                      <span>{item.destination}</span>
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-mono border border-white/20">
                      #{item.trip_id.slice(-6)}
                    </span>
                  </div>

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black font-editorial text-[#142A38]">
                Recommended for Your Next Journey
              </h2>
              <PostageStampSnippet
                label="EXPLORE"
                sublabel="CURATED"
                price="113 PLACES"
                rotation={4}
                className="hidden sm:inline-block opacity-75 hover:opacity-100"
              />
            </div>
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
                    category={dest.tag}
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

        {/* --- 4. ACCOUNT SETTINGS & SECURITY --- */}
        <section className="space-y-6 pt-6 border-t border-[#EBDCC7]">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black font-editorial text-[#142A38] flex items-center gap-2.5">
              <KeyRound className="w-6 h-6 text-[#1F6E78]" />
              <span>Account Security & Preferences</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Change Password Card */}
            <div className="lg:col-span-7 bg-white border border-[#EBDCC7] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-editorial text-[#142A38]">Change Password</h3>
                <p className="text-xs text-[#66757F]">
                  Update your personal traveler password. Password must be at least 8 characters long.
                </p>
              </div>

              {pwSuccessMsg && (
                <div role="status" className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{pwSuccessMsg}</span>
                </div>
              )}

              {pwErrorMsg && (
                <div role="alert" className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{pwErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#66757F] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="w-full bg-[#FBF7F1] focus:bg-white border border-[#EBDCC7] rounded-xl px-4 py-2.5 text-xs text-[#142A38] font-medium focus:outline-none focus:ring-2 focus:ring-[#1F6E78]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#66757F] mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="At least 8 characters"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="w-full bg-[#FBF7F1] focus:bg-white border border-[#EBDCC7] rounded-xl px-4 py-2.5 text-xs text-[#142A38] font-medium focus:outline-none focus:ring-2 focus:ring-[#1F6E78]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#66757F] mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat new password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="w-full bg-[#FBF7F1] focus:bg-white border border-[#EBDCC7] rounded-xl px-4 py-2.5 text-xs text-[#142A38] font-medium focus:outline-none focus:ring-2 focus:ring-[#1F6E78]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPw}
                    className="px-6 py-2.5 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isChangingPw ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone: Account Deletion */}
            <div className="lg:col-span-5 bg-rose-50/40 border border-rose-200/80 rounded-3xl p-6 sm:p-8 space-y-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Danger Zone</span>
                </div>
                <h3 className="text-lg font-bold font-editorial text-rose-950">Delete Account</h3>
                <p className="text-xs text-[#66757F] leading-relaxed">
                  Permanently delete your traveler profile, all saved itineraries, and preferences. This action cannot be undone.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Delete Account...
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div role="dialog" aria-modal="true" className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 p-6 sm:p-8 space-y-5 text-[#142A38]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4EBE0]">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base font-editorial text-[#142A38]">Confirm Account Deletion</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteErrorMsg(null);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8E9BA4] hover:text-[#142A38] hover:bg-[#FBF7F1] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#66757F] leading-relaxed">
              This action is permanent and irreversible. All your saved journeys ({savedTrips.length}), custom route preferences, and traveler profile will be erased immediately.
            </p>

            {deleteErrorMsg && (
              <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{deleteErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#66757F] mb-1">
                  Enter Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Your current password"
                  value={deletePw}
                  onChange={(e) => setDeletePw(e.target.value)}
                  className="w-full bg-[#FBF7F1] focus:bg-white border border-[#EBDCC7] rounded-xl px-4 py-2 text-xs text-[#142A38] focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#66757F] mb-1">
                  Type <span className="font-mono text-rose-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  required
                  placeholder="DELETE"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full bg-[#FBF7F1] focus:bg-white border border-[#EBDCC7] rounded-xl px-4 py-2 text-xs text-[#142A38] font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteErrorMsg(null);
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-[#66757F] hover:text-[#142A38] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeletingAccount}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Permanently Delete Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
