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
    title: 'Himalayan Ridge & Valley Expedition',
    duration: '6 Days / 5 Nights',
    budget: '₹40,000 for 2',
    modes: ['Express Train', 'AC Volvo Bus', 'Mountain Cab'],
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
    badge: 'POPULAR ESCAPE',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop'
  },
  {
    origin: 'Mumbai',
    destination: 'Jaipur',
    slug: 'jaipur',
    title: 'Royal Haveli & Palace Circuit',
    duration: '5 Days / 4 Nights',
    budget: '₹28,000 for 2',
    modes: ['Superfast Express', 'Local Metro'],
    badge: 'HERITAGE TRAIL',
    image: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=1200&auto=format&fit=crop'
  },
  {
    origin: 'Delhi',
    destination: 'Rishikesh',
    slug: 'rishikesh',
    title: 'Ganga Foothills & Yoga Retreat',
    duration: '3 Days / 2 Nights',
    budget: '₹18,000 for 2',
    modes: ['Jan Shatabdi', 'Local Shuttle'],
    badge: 'WEEKEND ESCAPE',
    image: 'https://images.unsplash.com/photo-1600681978345-311667a788ad?q=80&w=1200&auto=format&fit=crop'
  }
];

const TRAVEL_STYLES = [
  { name: 'Mountain Escapes', filter: 'Mountains', count: '18 destinations', icon: Mountain, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop' },
  { name: 'Beach Holidays', filter: 'Beach', count: '14 destinations', icon: Palmtree, image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop' },
  { name: 'Heritage Trails', filter: 'Heritage', count: '24 destinations', icon: Landmark, image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop' },
  { name: 'Nature Adventures', filter: 'Nature', count: '20 destinations', icon: Trees, image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?q=80&w=800&auto=format&fit=crop' },
  { name: 'Weekend Getaways', filter: 'City', count: '16 destinations', icon: Flame, image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop' },
  { name: 'Spiritual Journeys', filter: 'Spiritual', count: '15 destinations', icon: Heart, image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop' },
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
    <div className="min-h-screen bg-[#FFF9F2] text-[#193451] flex flex-col font-sans selection:bg-[#246BCE]/15 selection:text-[#193451]">
      <Navbar />

      {/* ========================================================
          HERO SECTION — SUNLIT EDITORIAL PHOTOGRAPHY & COMPOSER
          ======================================================== */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden border-b border-[#EADBCE]">
        {/* Subtle background ambient warmth */}
        <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(#EADBCE_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          {/* Hero Headlines */}
          <div className="max-w-3xl mx-auto text-center space-y-5 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#EADBCE] rounded-full text-xs font-bold tracking-wider uppercase text-[#F46F58] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#F46F58]" />
              <span>India-First Multimodal Travel Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#193451] font-editorial leading-[1.08]">
              Your next great journey <br className="hidden sm:inline" />
              <span className="text-[#246BCE] italic font-normal">starts here.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed font-normal">
              Discover places, compare ways to travel, and build an all-inclusive trip bounded strictly by your total budget.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/plan"
                className="px-7 py-3.5 bg-[#246BCE] hover:bg-[#1A56A8] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#246BCE]/20"
              >
                Plan a Journey
              </Link>
              <Link
                href="/explore"
                className="px-7 py-3.5 bg-white hover:bg-[#F7EFE4] text-[#193451] border border-[#EADBCE] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs"
              >
                Explore India
              </Link>
            </div>
          </div>

          {/* Primary Trip Composer Card */}
          <div id="trip-composer" className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-[#EADBCE] p-6 sm:p-8 lg:p-10">
            <form onSubmit={handlePlanSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Origin */}
                <div className="lg:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#246BCE]" /> From
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Sangli, Pune, Mumbai"
                    required
                    className="w-full px-4 py-3.5 bg-[#FFF9F2] hover:bg-white focus:bg-white border border-[#EADBCE] rounded-2xl text-sm font-bold text-[#193451] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#246BCE] transition-all"
                  />
                </div>

                {/* Destination */}
                <div className="lg:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#F46F58]" /> To
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Manali, Goa, Jaipur"
                    required
                    className="w-full px-4 py-3.5 bg-[#FFF9F2] hover:bg-white focus:bg-white border border-[#EADBCE] rounded-2xl text-sm font-bold text-[#193451] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#246BCE] transition-all"
                  />
                </div>

                {/* Departure Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#64748B]" /> Departure
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-3.5 bg-[#FFF9F2] hover:bg-white focus:bg-white border border-[#EADBCE] rounded-2xl text-xs font-bold text-[#193451] focus:outline-none focus:ring-2 focus:ring-[#246BCE] transition-all"
                  />
                </div>

                {/* Return Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#64748B]" /> Return
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-3.5 bg-[#FFF9F2] hover:bg-white focus:bg-white border border-[#EADBCE] rounded-2xl text-xs font-bold text-[#193451] focus:outline-none focus:ring-2 focus:ring-[#246BCE] transition-all"
                  />
                </div>
              </div>

              {/* Lower Row: Travellers, Budget, Submit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-4 items-end pt-3 border-t border-[#EADBCE]">
                {/* Travellers */}
                <div className="sm:col-span-1 lg:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#64748B]" /> Travellers
                  </label>
                  <select
                    value={travellers}
                    onChange={(e) => setTravellers(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#FFF9F2] border border-[#EADBCE] rounded-2xl text-sm font-bold text-[#193451] focus:outline-none focus:ring-2 focus:ring-[#246BCE]"
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
                    <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-[#246BCE]" /> Total Budget Cap
                    </label>
                    <span className="text-sm font-bold text-[#246BCE] font-mono">₹{Number(budget).toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    min="5000"
                    max="500000"
                    step="1000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#FFF9F2] border border-[#EADBCE] rounded-2xl text-sm font-bold text-[#193451] focus:outline-none focus:ring-2 focus:ring-[#246BCE]"
                    placeholder="Total Budget (INR)"
                  />
                </div>

                {/* Submit Button */}
                <div className="sm:col-span-1 lg:col-span-5">
                  <button
                    type="submit"
                    className="w-full py-4 px-6 bg-[#246BCE] hover:bg-[#1A56A8] text-white font-bold text-sm rounded-2xl shadow-md shadow-[#246BCE]/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Build Complete Itinerary</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

            </form>

            {/* Guaranteed Demo Corridors Quick Launch */}
            <div className="mt-4 pt-4 border-t border-[#EADBCE] flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
              <span className="font-bold text-[#193451]">Quick Routes:</span>
              <button
                type="button"
                onClick={() => { setOrigin('Sangli'); setDestination('Manali'); setBudget('40000'); setTravellers('2'); }}
                className="px-3 py-1.5 bg-[#FFF9F2] hover:bg-[#246BCE] hover:text-white border border-[#EADBCE] rounded-xl font-bold text-[#193451] transition-all cursor-pointer"
              >
                Sangli → Manali (₹40k)
              </button>
              <button
                type="button"
                onClick={() => { setOrigin('Pune'); setDestination('Goa'); setBudget('25000'); setTravellers('2'); }}
                className="px-3 py-1.5 bg-[#FFF9F2] hover:bg-[#246BCE] hover:text-white border border-[#EADBCE] rounded-xl font-bold text-[#193451] transition-all cursor-pointer"
              >
                Pune → Goa (₹25k)
              </button>
              <button
                type="button"
                onClick={() => { setOrigin('Mumbai'); setDestination('Jaipur'); setBudget('28000'); setTravellers('2'); }}
                className="px-3 py-1.5 bg-[#FFF9F2] hover:bg-[#246BCE] hover:text-white border border-[#EADBCE] rounded-xl font-bold text-[#193451] transition-all cursor-pointer"
              >
                Mumbai → Jaipur (₹28k)
              </button>
              <button
                type="button"
                onClick={() => { setOrigin('Delhi'); setDestination('Rishikesh'); setBudget('20000'); setTravellers('2'); }}
                className="px-3 py-1.5 bg-[#FFF9F2] hover:bg-[#246BCE] hover:text-white border border-[#EADBCE] rounded-xl font-bold text-[#193451] transition-all cursor-pointer"
              >
                Delhi → Rishikesh (₹20k)
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 2 — WHERE TO NEXT? (FEATURED DESTINATIONS)
          ======================================================== */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F46F58] mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>National Catalog</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-editorial text-[#193451]">
              Where to next?
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] mt-2 max-w-xl">
              Handcrafted destinations across Himachal pine trails, Rajasthani royal palaces, and sunny Arabian Sea shores.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs font-bold text-[#246BCE] hover:text-[#1A56A8] flex items-center gap-1 group bg-white border border-[#EADBCE] px-4 py-2.5 rounded-xl shadow-xs"
          >
            <span>Explore all 113 destinations</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingDestinations.map((dest) => (
            <Link
              key={dest.id}
              href={`/explore/${dest.slug}`}
              className="group bg-white rounded-3xl overflow-hidden border border-[#EADBCE] hover:border-[#246BCE] transition-all duration-300 flex flex-col photo-card-hover shadow-sm"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <SafeImage
                  src={dest.hero_image}
                  alt={dest.name}
                  category={dest.categories?.[0]}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500 object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#193451] shadow-xs">
                  {dest.categories?.[0] || 'Popular'}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#193451] flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 text-[#F7C963] fill-[#F7C963]" />
                  <span>{dest.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-[#F46F58] uppercase tracking-wider">
                    {dest.state}
                  </div>
                  <h3 className="text-xl font-bold font-editorial text-[#193451] group-hover:text-[#246BCE] transition-colors mt-0.5">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 mt-1 leading-relaxed">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EADBCE] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">Est. Daily Budget</span>
                    <span className="font-bold text-[#193451]">₹{dest.daily_budget.toLocaleString()}/day</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">Ideal Stay</span>
                    <span className="font-semibold text-[#64748B]">{dest.ideal_duration}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 3 — POPULAR TRAVEL CORRIDORS
          ======================================================== */}
      <section className="py-20 md:py-24 bg-[#F7EFE4]/60 border-y border-[#EADBCE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246BCE]">
              Connected Across India
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-editorial text-[#193451] mt-1">
              Popular Journeys
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] mt-2">
              End-to-end multi-modal blueprints connecting express trains, Volvo mountain buses, stays, and authentic regional dining.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_TRIPS.map((trip) => (
              <div
                key={trip.title}
                className="bg-white rounded-3xl overflow-hidden border border-[#EADBCE] hover:border-[#246BCE] transition-all flex flex-col photo-card-hover shadow-sm"
              >
                <div className="relative h-48 w-full">
                  <SafeImage
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#193451] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    {trip.badge}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#246BCE]">
                      <span>{trip.origin}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#F46F58]" />
                      <span>{trip.destination}</span>
                    </div>
                    <h3 className="text-lg font-bold font-editorial text-[#193451] mt-1">
                      {trip.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {trip.modes.map((m) => (
                        <span key={m} className="px-2 py-0.5 bg-[#FFF9F2] border border-[#EADBCE] text-[10px] font-bold text-[#64748B] rounded-lg">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EADBCE] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#94A3B8] font-bold uppercase">Estimated Total</div>
                      <div className="text-xs font-bold text-[#193451]">{trip.budget}</div>
                    </div>
                    <Link
                      href={`/plan?origin=${trip.origin}&destination=${trip.destination}`}
                      className="px-4 py-2 bg-[#246BCE] hover:bg-[#1A56A8] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Plan Trip
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
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F46F58]">
            Tailored Journeys
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-editorial text-[#193451] mt-1">
            Explore by Travel Style
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] mt-2">
            Whether you seek high-altitude tranquility, coastal coves, or living heritage forts, NAVIX customizes the complete journey.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {TRAVEL_STYLES.map((style) => {
            const Icon = style.icon;
            return (
              <Link
                key={style.name}
                href={`/explore?category=${style.filter}`}
                className="group relative h-56 rounded-3xl overflow-hidden border border-[#EADBCE] hover:border-[#246BCE] transition-all flex flex-col justify-end p-4 text-white photo-card-hover shadow-sm"
              >
                <SafeImage
                  src={style.image}
                  alt={style.name}
                  className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                <div className="relative z-10 space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="font-bold text-sm text-white font-editorial">{style.name}</div>
                  <div className="text-[10px] text-white/80">{style.count}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          SECTION 5 — WHY TRAVELLERS CHOOSE NAVIX
          ======================================================== */}
      <section className="py-20 md:py-24 bg-[#F7EFE4]/60 border-y border-[#EADBCE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Why NAVIX */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#246BCE]">
                Built for Tier-2 & Tier-3 Explorers
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-editorial text-[#193451] leading-tight">
                Why Travellers Choose NAVIX
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Most travel apps assume your trip starts next to a metro airport. NAVIX solves real Indian geography: linking Tier-2 and Tier-3 towns like Sangli, Miraj, Kolhapur, and Nashik with multi-modal transfers and strict total budget guarantees.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-[#EADBCE] shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-[#246BCE]/10 text-[#246BCE] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#193451]">Guaranteed Total Budget Cap</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Your total spending across transport, hotel, meals, activities, and safety buffer never exceeds your budget.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-[#EADBCE] shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-[#F46F58]/10 text-[#F46F58] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#193451]">Verified Station & Bus Transfers</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Every connecting leg is validated with comfortable transfer windows, ensuring no missed connections.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-[#EADBCE] shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-[#F7C963]/20 text-[#193451] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#193451]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#193451]">Nationwide 110+ City Catalog</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Over 1,100 verified attractions, 790 local food specialties, and 790 curated stays across all 28 Indian states.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 4-Step How It Works Card */}
            <div className="lg:col-span-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#EADBCE] shadow-lg space-y-6">
              <h3 className="text-2xl font-bold font-editorial text-[#193451]">
                How Your Itinerary is Created
              </h3>

              <div className="space-y-5">
                {[
                  { step: '01', title: 'Route & Trip Budget Cap', desc: 'Select origin, destination, travel dates, party size, and your strict spending cap.' },
                  { step: '02', title: 'Multi-Modal Transit Comparison', desc: 'Compare express trains, AC sleeper buses, and local links ranked by comfort and fare.' },
                  { step: '03', title: 'Curated Places, Stays & Food', desc: 'Select regional attractions, signature dining, and hotels with live budget recalculation.' },
                  { step: '04', title: 'Day-by-Day Master Itinerary & PDF', desc: 'Receive a synchronized day-wise schedule with interactive map markers, expense breakdown, and export.' }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <span className="font-mono text-xs font-bold text-[#246BCE] bg-[#246BCE]/10 border border-[#246BCE]/20 w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[#193451]">{item.title}</h4>
                      <p className="text-xs text-[#64748B] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#EADBCE]">
                <Link
                  href="/plan"
                  className="w-full py-4 bg-[#246BCE] hover:bg-[#1A56A8] text-white font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#246BCE]/20"
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
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#F46F58]">
              Dispatches from the Road
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-editorial text-[#193451] mt-1">
              Curated Travel Stories
            </h2>
          </div>
          <Link
            href="/stories"
            className="text-xs font-bold text-[#246BCE] hover:text-[#1A56A8] flex items-center gap-1 bg-white border border-[#EADBCE] px-4 py-2.5 rounded-xl shadow-xs"
          >
            <span>All 32 stories & guides</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stories.map((st) => (
            <Link
              key={st.id}
              href={`/stories/${st.slug}`}
              className="group bg-white rounded-3xl overflow-hidden border border-[#EADBCE] hover:border-[#246BCE] transition-all flex flex-col photo-card-hover shadow-sm"
            >
              <div className="relative h-48 w-full">
                <SafeImage
                  src={st.hero_image}
                  alt={st.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#193451] shadow-xs">
                  {st.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold font-editorial text-[#193451] group-hover:text-[#246BCE] transition-colors line-clamp-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 mt-1 leading-relaxed">
                    {st.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EADBCE] flex items-center justify-between text-[11px] text-[#94A3B8] font-medium">
                  <span>{st.author}</span>
                  <span>{st.read_time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 7 — CALL TO ACTION BANNER
          ======================================================== */}
      <section className="py-20 bg-[#193451] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F7C963]">
            Ready to explore India?
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-editorial leading-tight text-white">
            Tell us your budget. <br />
            We build the journey.
          </h2>
          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-xl mx-auto">
            Experience verified multi-modal connections from western Maharashtra all the way to the snow peaks of Himachal or the sands of Rajasthan.
          </p>
          <div className="pt-3">
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#F46F58] hover:bg-[#E05841] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-[#F46F58]/25 transition-all cursor-pointer"
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
