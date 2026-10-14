'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar, Footer, SafeImage } from '@/components';
import {
  Calendar, Wallet, Star, Clock, ArrowRight,
  CheckCircle2, Utensils, Bed, Ticket
} from 'lucide-react';
import { getDestinationDetail, DestinationDetail } from '@/services/destinations';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-[#FFF9F2] rounded-3xl border border-[#EADBCE] flex items-center justify-center text-xs text-[#64748B]">
      Loading interactive map...
    </div>
  )
});

export default function DestinationDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [destination, setDestination] = useState<DestinationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attractions' | 'food' | 'stays'>('attractions');

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await getDestinationDetail(slug);
        setDestination(data);
      } catch (err) {
        console.error('Failed to load destination detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] text-[#193451] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 w-full animate-pulse space-y-8">
          <div className="h-96 bg-[#F7EFE4] rounded-3xl" />
          <div className="h-10 bg-[#F7EFE4] rounded-xl w-1/3" />
          <div className="grid grid-cols-3 gap-6">
            <div className="h-40 bg-[#F7EFE4] rounded-2xl" />
            <div className="h-40 bg-[#F7EFE4] rounded-2xl" />
            <div className="h-40 bg-[#F7EFE4] rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] text-[#193451] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-32 text-center space-y-4">
          <h2 className="text-3xl font-black font-editorial text-[#193451]">Destination Not Found</h2>
          <p className="text-sm text-[#64748B]">
            We could not find the destination details for &quot;{slug}&quot;.
          </p>
          <Link
            href="/explore"
            className="inline-flex px-6 py-3 bg-[#246BCE] hover:bg-[#1A56A8] text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Back to Explore
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#193451] flex flex-col font-sans selection:bg-[#246BCE]/15 selection:text-[#193451]">
      <Navbar />

      {/* Hero Header with Immersive Photography */}
      <section className="relative h-[60vh] min-h-[460px] max-h-[640px] w-full overflow-hidden">
        <SafeImage
          src={destination.hero_image}
          alt={destination.name}
          category={destination.categories?.[0]}
          className="w-full h-full object-cover filter brightness-[0.70]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-white space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/20 text-white">
              {destination.state}, India
            </span>
            {destination.categories?.map((cat) => (
              <span key={cat} className="px-3.5 py-1 bg-[#F46F58] text-white rounded-full text-xs font-bold shadow-xs">
                {cat}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-editorial tracking-tight text-white leading-tight">
            {destination.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-white/90 font-medium">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#F7C963] fill-[#F7C963]" />
              <span className="font-bold text-white">{destination.rating.toFixed(1)}</span>
              <span className="text-white/70">Rating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-white/70" />
              <span>{destination.ideal_duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-white/70" />
              <span>Season: {destination.best_season}</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-[#F7C963]">
              <Wallet className="w-4 h-4" />
              <span>₹{destination.daily_budget.toLocaleString()}/day</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full space-y-16">
        
        {/* Top Summary & Sticky Action Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Overview Text */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-3xl font-black font-editorial text-[#193451]">
              About {destination.name}
            </h2>
            <p className="text-base text-[#475569] leading-relaxed font-normal">
              {destination.description}
            </p>

            {/* Key Fact Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#94A3B8] block">Ideal Duration</span>
                <span className="text-sm font-bold text-[#193451]">{destination.ideal_duration}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#94A3B8] block">Best Season</span>
                <span className="text-sm font-bold text-[#193451]">{destination.best_season}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#94A3B8] block">Est. Daily Budget</span>
                <span className="text-sm font-bold text-[#246BCE]">₹{destination.daily_budget.toLocaleString()}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#94A3B8] block">Curated Sites</span>
                <span className="text-sm font-bold text-[#193451]">{destination.attractions?.length || 10} Places</span>
              </div>
            </div>
          </div>

          {/* Sticky Action Card */}
          <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-[#EADBCE] shadow-lg space-y-5 lg:sticky lg:top-24">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase text-[#246BCE] tracking-wider block">
                Multi-Modal Planner
              </span>
              <h3 className="text-2xl font-bold font-editorial text-[#193451]">
                Plan a Trip to {destination.name}
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Connect your hometown with verified trains, hill buses, stays, and budget math.
              </p>
            </div>

            <Link
              href={`/plan?destination=${encodeURIComponent(destination.name)}`}
              className="w-full py-4 px-4 bg-[#246BCE] hover:bg-[#1A56A8] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-[#246BCE]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Build Trip Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="text-xs text-[#64748B] space-y-2 pt-3 border-t border-[#EADBCE]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Deterministic total budget guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Synchronized multi-modal transfers</span>
              </div>
            </div>
          </div>

        </div>

        {/* Tab Navigation for Attractions, Food, Stays */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-[#EADBCE] pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('attractions')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'attractions'
                  ? 'bg-[#246BCE] text-white shadow-xs'
                  : 'bg-white text-[#475569] hover:bg-[#F7EFE4] hover:text-[#193451] border border-[#EADBCE]'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Attractions ({destination.attractions?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('food')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'food'
                  ? 'bg-[#246BCE] text-white shadow-xs'
                  : 'bg-white text-[#475569] hover:bg-[#F7EFE4] hover:text-[#193451] border border-[#EADBCE]'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Food & Dining ({destination.food_places?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('stays')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'stays'
                  ? 'bg-[#246BCE] text-white shadow-xs'
                  : 'bg-white text-[#475569] hover:bg-[#F7EFE4] hover:text-[#193451] border border-[#EADBCE]'
              }`}
            >
              <Bed className="w-4 h-4" />
              <span>Stays & Hotels ({destination.hotels?.length || 0})</span>
            </button>
          </div>

          {/* Tab 1: Major Attractions */}
          {activeTab === 'attractions' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destination.attractions?.map((attr) => (
                <div
                  key={attr.id}
                  className="bg-white rounded-3xl overflow-hidden border border-[#EADBCE] hover:border-[#246BCE] transition-all flex flex-col photo-card-hover shadow-sm"
                >
                  <div className="relative h-52 w-full">
                    <SafeImage src={attr.image} alt={attr.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#193451] shadow-xs">
                      {attr.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#193451] flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 text-[#F7C963] fill-[#F7C963]" />
                      <span>{attr.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-lg font-editorial text-[#193451]">{attr.name}</h4>
                      <p className="text-xs text-[#64748B] line-clamp-2 mt-1 leading-relaxed">{attr.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[#EADBCE] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">Entry Fee</span>
                        <span className="font-bold text-[#193451]">
                          {attr.entry_fee === 0 ? 'Free Entry' : `₹${attr.entry_fee}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">Duration</span>
                        <span className="font-semibold text-[#64748B]">{attr.visit_duration_minutes} mins</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Food & Regional Specialities */}
          {activeTab === 'food' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destination.food_places?.map((food) => (
                <div
                  key={food.id}
                  className="bg-white rounded-3xl overflow-hidden border border-[#EADBCE] hover:border-[#246BCE] transition-all flex flex-col photo-card-hover shadow-sm"
                >
                  <div className="relative h-52 w-full">
                    <SafeImage src={food.image} alt={food.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#193451] shadow-xs">
                      {food.cuisine}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#193451] flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 text-[#F7C963] fill-[#F7C963]" />
                      <span>{food.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-lg font-editorial text-[#193451]">{food.name}</h4>
                      <div className="text-xs text-[#F46F58] font-bold mt-0.5">
                        Speciality: {food.speciality}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#EADBCE] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">Cost for Two</span>
                        <span className="font-bold text-[#193451]">₹{food.cost_for_two}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">Hours</span>
                        <span className="font-semibold text-[#64748B] text-[11px]">{food.opening_hours}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Stays & Hotels */}
          {activeTab === 'stays' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destination.hotels?.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-3xl overflow-hidden border border-[#EADBCE] hover:border-[#246BCE] transition-all flex flex-col photo-card-hover shadow-sm"
                >
                  <div className="relative h-52 w-full">
                    <SafeImage src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-[#193451] text-white px-3 py-1 rounded-full text-[10px] font-bold">
                      {hotel.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#193451] flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 text-[#F7C963] fill-[#F7C963]" />
                      <span>{hotel.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-lg font-editorial text-[#193451]">{hotel.name}</h4>
                      <div className="text-xs text-[#64748B] mt-0.5">{hotel.room_type}</div>
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {hotel.amenities?.map((am) => (
                          <span key={am} className="px-2 py-0.5 bg-[#FFF9F2] text-[10px] font-bold text-[#64748B] rounded-lg border border-[#EADBCE]">
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#EADBCE] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">Nightly Rate</span>
                        <span className="font-bold text-base text-[#246BCE] font-mono">₹{hotel.price_per_night}</span>
                      </div>
                      <Link
                        href={`/plan?destination=${encodeURIComponent(destination.name)}`}
                        className="px-4 py-2 bg-[#246BCE] hover:bg-[#1A56A8] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        Select in Plan
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Map Section */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold font-editorial text-[#193451]">
                {destination.name} Regional Geographic Map
              </h3>
              <p className="text-xs text-[#64748B]">
                Coordinates: {destination.latitude.toFixed(4)}° N, {destination.longitude.toFixed(4)}° E
              </p>
            </div>
            <span className="text-xs font-bold text-[#246BCE] bg-[#246BCE]/10 border border-[#246BCE]/20 px-3.5 py-1 rounded-full uppercase tracking-wider">
              Interactive Leaflet
            </span>
          </div>

          <div className="h-88 w-full rounded-2xl overflow-hidden border border-[#EADBCE]">
            <InteractiveMap
              centerLat={destination.latitude}
              centerLng={destination.longitude}
              zoom={12}
              destination={destination.name}
              attractions={destination.attractions.slice(0, 8).map(a => ({ name: a.name, latitude: a.latitude, longitude: a.longitude, category: a.category }))}
              foodPlaces={destination.food_places.slice(0, 6).map(f => ({ name: f.name, latitude: f.latitude, longitude: f.longitude, speciality: f.speciality }))}
              hotel={destination.hotels[0] ? { name: destination.hotels[0].name, latitude: destination.hotels[0].latitude, longitude: destination.hotels[0].longitude } : undefined}
            />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
