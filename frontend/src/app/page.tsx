'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar, Footer, SafeImage } from '@/components';
import {
  Compass, MapPin, Calendar, Users, Wallet, ArrowRight,
  Sparkles, ShieldCheck, Clock, Star, TrendingUp, CheckCircle2,
  ChevronRight, Mountain, Palmtree, Landmark, Trees, Flame, Heart
} from 'lucide-react';
import { getDestinations, getStories, DestinationSummary, StoryItem } from '@/services';

const FEATURED_TRIPS = [
  {
    origin: 'Sangli',
    destination: 'Manali',
    slug: 'manali',
    title: 'The Great Himalayan Odyssey',
    duration: '6 Days / 5 Nights',
    budget: '₹40,000 for 2',
    modes: ['Train', 'Volvo Bus', 'Local Shuttle'],
    badge: 'FLAGSHIP ROUTE',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop'
  },
  {
    origin: 'Pune',
    destination: 'Goa',
    slug: 'goa',
    title: 'Konkan Coast & Palm Trails',
    duration: '4 Days / 3 Nights',
    budget: '₹25,000 for 2',
    modes: ['Vande Bharat / Bus', 'Cab Transfer'],
    badge: 'POPULAR WEEKEND',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop'
  },
  {
    origin: 'Mumbai',
    destination: 'Jaipur',
    slug: 'jaipur',
    title: 'Royal Haveli & Palace Trail',
    duration: '5 Days / 4 Nights',
    budget: '₹30,000 for 2',
    modes: ['Express Train', 'Local Metro'],
    badge: 'HERITAGE CIRCUIT',
    image: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=1200&auto=format&fit=crop'
  },
  {
    origin: 'Kolkata',
    destination: 'Darjeeling',
    slug: 'darjeeling',
    title: 'Queen of the Hills & Tea Gardens',
    duration: '4 Days / 3 Nights',
    budget: '₹28,000 for 2',
    modes: ['Vande Bharat', 'Shared Toy Train / Cab'],
    badge: 'TEA & MIST',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop'
  }
];

const TRAVEL_STYLES = [
  { name: 'Mountains', count: '14 destinations', icon: Mountain, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop' },
  { name: 'Beach', count: '8 destinations', icon: Palmtree, image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop' },
  { name: 'Heritage', count: '16 destinations', icon: Landmark, image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop' },
  { name: 'Nature', count: '12 destinations', icon: Trees, image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=800&auto=format&fit=crop' },
  { name: 'Adventure', count: '10 destinations', icon: Flame, image: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?q=80&w=800&auto=format&fit=crop' },
  { name: 'Spiritual', count: '9 destinations', icon: Heart, image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop' },
];

export default function Home() {
  const router = useRouter();

  // Composer Form State
  const [origin, setOrigin] = useState('Sangli');
  const [destination, setDestination] = useState('Manali');
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date(Date.now() + 14 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date(Date.now() + 20 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [travellers, setTravellers] = useState('2');
  const [budget, setBudget] = useState('40000');

  // Dynamic Data
  const [trendingDestinations, setTrendingDestinations] = useState<DestinationSummary[]>([]);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        const [destRes, storyRes] = await Promise.all([
          getDestinations({ limit: 8 }),
          getStories({ limit: 4 })
        ]);
        setTrendingDestinations(destRes.items || []);
        setStories(storyRes.items || []);
      } catch {
        // Fallback gracefully handled
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, []);

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      origin: origin.trim(),
      destination: destination.trim(),
      departureDate,
      returnDate,
      travellers,
      budget
    }).toString();
    router.push(`/plan?${query}`);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0B192C] flex flex-col font-sans selection:bg-emerald-700 selection:text-white">
      <Navbar />

      {/* ========================================================
          HERO SECTION — "Plan India, your way."
          ======================================================== */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-stone-200/80">
        {/* Soft background aura */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Title */}
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-bold text-emerald-800 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Modal • Budget-First • Deterministic</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0B192C] font-serif leading-[1.15]">
              Plan India, <span className="text-emerald-700 italic">your way.</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Transport, stays, food and experiences optimized around your time and budget. Guaranteed zero overspend.
            </p>
          </div>

          {/* Primary Planner Composer Card */}
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-stone-200/60 border border-stone-200/80 p-4 sm:p-6 lg:p-8">
            <form onSubmit={handlePlanSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* Origin */}
                <div className="lg:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Starting From
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Sangli, Pune, Mumbai"
                    required
                    className="w-full px-4 py-3 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  />
                </div>

                {/* Destination */}
                <div className="lg:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" /> Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Manali, Goa, Jaipur"
                    required
                    className="w-full px-4 py-3 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  />
                </div>

                {/* Departure Date */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" /> Departure
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    required
                    className="w-full px-3 py-3 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                </div>

                {/* Return Date */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" /> Return
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required
                    className="w-full px-3 py-3 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                </div>
              </div>

              {/* Lower Row: Travellers, Budget, CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-3 sm:gap-4 items-end pt-2 border-t border-stone-100">
                {/* Travellers */}
                <div className="sm:col-span-1 lg:col-span-3 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-stone-400" /> Travellers
                  </label>
                  <select
                    value={travellers}
                    onChange={(e) => setTravellers(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="1">1 Solo Explorer</option>
                    <option value="2">2 Travellers (Duo)</option>
                    <option value="3">3 Travellers (Small Group)</option>
                    <option value="4">4 Travellers (Group/Family)</option>
                  </select>
                </div>

                {/* Maximum Budget */}
                <div className="sm:col-span-1 lg:col-span-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Total Trip Budget
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-700">₹{Number(budget).toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    min="5000"
                    max="500000"
                    step="1000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                    placeholder="Total Budget (INR)"
                  />
                </div>

                {/* Submit Button */}
                <div className="sm:col-span-1 lg:col-span-5">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Plan My Trip</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

            </form>

            {/* Quick Demo Corridors Quick-Pills */}
            <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <span className="font-semibold text-stone-400">Guaranteed Demo Routes:</span>
              <button
                type="button"
                onClick={() => { setOrigin('Sangli'); setDestination('Manali'); setBudget('40000'); setTravellers('2'); }}
                className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Sangli → Manali (₹40k)
              </button>
              <button
                type="button"
                onClick={() => { setOrigin('Pune'); setDestination('Goa'); setBudget('25000'); setTravellers('2'); }}
                className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Pune → Goa (₹25k)
              </button>
              <button
                type="button"
                onClick={() => { setOrigin('Mumbai'); setDestination('Jaipur'); setBudget('30000'); setTravellers('2'); }}
                className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Mumbai → Jaipur (₹30k)
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 2 — TRENDING DESTINATIONS
          ======================================================== */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Explore Across India</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0B192C]">
              Trending Destinations
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>View all 65 Indian destinations</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingDestinations.map((dest) => (
            <Link
              key={dest.id}
              href={`/explore/${dest.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <SafeImage
                  src={dest.hero_image}
                  alt={dest.name}
                  category={dest.categories?.[0]}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-stone-800 shadow-xs">
                  {dest.categories?.[0] || 'Popular'}
                </div>
                <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-300" />
                  <span>{dest.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                    {dest.state}
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Avg. Daily Budget</span>
                    <span className="font-bold font-mono text-stone-900">₹{dest.daily_budget.toLocaleString()}/day</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block">Duration</span>
                    <span className="font-semibold text-stone-700">{dest.ideal_duration}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 3 — POPULAR MULTI-MODAL TRIPS
          ======================================================== */}
      <section className="py-16 bg-[#F4F1EA] border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Tested & Guaranteed Corridors
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0B192C] mt-1">
              Popular Multi-Modal Trips
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              End-to-end journey blueprints linking local autos, express trains, volvo hill buses, stays and authentic regional cuisine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_TRIPS.map((trip) => (
              <div
                key={trip.title}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="relative h-44 w-full">
                  <SafeImage
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full"
                  />
                  <div className="absolute top-3 left-3 bg-[#0B192C] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {trip.badge}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <span>{trip.origin}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                      <span>{trip.destination}</span>
                    </div>
                    <h3 className="text-base font-bold text-stone-900 mt-1">
                      {trip.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {trip.modes.map((m) => (
                        <span key={m} className="px-2 py-0.5 bg-stone-100 text-[10px] font-semibold text-stone-600 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-stone-400">Total Budget</div>
                      <div className="text-xs font-bold font-mono text-emerald-800">{trip.budget}</div>
                    </div>
                    <Link
                      href={`/plan?origin=${trip.origin}&destination=${trip.destination}`}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Plan Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 4 — EXPLORE BY TRAVEL STYLE
          ======================================================== */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Tailor Your Expedition
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0B192C] mt-1">
            Explore by Travel Style
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Whether you seek high-altitude tranquility, coastal relaxation, or ancient temples, NAVIX solves the route.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {TRAVEL_STYLES.map((style) => {
            const Icon = style.icon;
            return (
              <Link
                key={style.name}
                href={`/explore?category=${style.name}`}
                className="group relative h-48 rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-end p-4 text-white"
              >
                <SafeImage
                  src={style.image}
                  alt={style.name}
                  className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                <div className="relative z-10 space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="font-bold text-sm text-white">{style.name}</div>
                  <div className="text-[10px] text-stone-300">{style.count}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          SECTION 5 — HOW NAVIX WORKS & WHY NAVIX
          ======================================================== */}
      <section className="py-16 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Why NAVIX */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                The Engineering Behind NAVIX
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0B192C] leading-snug">
                Why Tier-2 & Tier-3 Travelers Choose NAVIX
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                Most travel apps assume you start from Delhi, Mumbai, or Bengaluru with direct flights. NAVIX solves the real Indian reality: connecting Sangli, Nashik, or Miraj through multi-modal legs with strict budget math.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Deterministic Hard Budget Invariant</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Total trip cost including transit, stays, food, activities, and emergency buffers never exceeds your budget.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Layover Safety & Station Transfers</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Every connecting transfer is validated with minimum safety windows — no impossible 5-minute connections.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Real India Destination Catalog</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      65 Indian cities, 650 attractions, 455 regional restaurants and authentic stays ready to explore.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 4-Step How It Works Card */}
            <div className="lg:col-span-6 bg-[#FDFBF7] p-8 rounded-3xl border border-stone-200/80 shadow-md space-y-6">
              <h3 className="text-xl font-bold font-serif text-[#0B192C]">
                How NAVIX Creates Your Journey
              </h3>

              <div className="space-y-5">
                {[
                  { step: '01', title: 'Input Cities & Budget', desc: 'Pick your origin, destination, dates, party size, and maximum spending cap.' },
                  { step: '02', title: 'Choose Multi-Modal Transport', desc: 'A* engine evaluates train, bus, flight, and taxi transfers with comfort & price rankings.' },
                  { step: '03', title: 'Curate Places, Food & Stays', desc: 'Select regional attractions, signature local dining, and stays with real-time budget updates.' },
                  { step: '04', title: 'Export Ready-to-Travel PDF', desc: 'Get a synchronized day-wise itinerary with interactive map markers, costs, and timeline.' }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{item.title}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-200">
                <Link
                  href="/plan"
                  className="w-full py-3 bg-[#0B192C] hover:bg-[#1E293B] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <span>Start Planning in 60 Seconds</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 6 — TRAVEL STORIES
          ======================================================== */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Dispatches from the Road
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0B192C] mt-1">
              Curated Travel Stories
            </h2>
          </div>
          <Link
            href="/stories"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>All 32 stories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stories.map((st) => (
            <Link
              key={st.id}
              href={`/stories/${st.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative h-44 w-full">
                <SafeImage
                  src={st.hero_image}
                  alt={st.title}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-stone-800">
                  {st.category}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {st.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>{st.author}</span>
                  <span>{st.read_time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 7 — CALL TO ACTION FOOTER BANNER
          ======================================================== */}
      <section className="py-16 bg-[#0B192C] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Ready to explore India?
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-serif leading-tight">
            Tell us your budget. <br />
            We build the journey.
          </h2>
          <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
            Experience verified multi-modal connections from western Maharashtra to the snow peaks of Himachal or the sands of Rajasthan.
          </p>
          <div className="pt-2">
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            >
              <span>Launch Trip Planner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
