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
    <div className="w-full h-80 bg-stone-100 rounded-3xl flex items-center justify-center text-xs text-stone-400">
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
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 w-full animate-pulse space-y-8">
          <div className="h-96 bg-stone-200 rounded-3xl" />
          <div className="h-10 bg-stone-200 rounded-xl w-1/3" />
          <div className="grid grid-cols-3 gap-6">
            <div className="h-40 bg-stone-200 rounded-2xl" />
            <div className="h-40 bg-stone-200 rounded-2xl" />
            <div className="h-40 bg-stone-200 rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-32 text-center space-y-4">
          <h2 className="text-2xl font-bold font-serif text-stone-900">Destination Not Found</h2>
          <p className="text-sm text-stone-500">
            We could not find the destination details for &quot;{slug}&quot;.
          </p>
          <Link
            href="/explore"
            className="inline-flex px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
          >
            Back to Explore
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0B192C] flex flex-col font-sans selection:bg-emerald-700 selection:text-white">
      <Navbar />

      {/* Hero Header */}
      <section className="relative h-[60vh] min-h-[420px] max-h-[580px] w-full overflow-hidden">
        <SafeImage
          src={destination.hero_image}
          alt={destination.name}
          category={destination.categories?.[0]}
          className="w-full h-full object-cover filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 text-white space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
              {destination.state}, India
            </span>
            {destination.categories?.map((cat) => (
              <span key={cat} className="px-3 py-1 bg-emerald-700/80 backdrop-blur-md rounded-full text-xs font-semibold">
                {cat}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold font-serif tracking-tight">
            {destination.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-stone-200">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-white">{destination.rating.toFixed(1)}</span>
              <span className="text-stone-300">Popularity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-stone-300" />
              <span>{destination.ideal_duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-stone-300" />
              <span>Best: {destination.best_season}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-300">
              <Wallet className="w-4 h-4" />
              <span>₹{destination.daily_budget.toLocaleString()}/day</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        
        {/* Top Summary & CTA Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Overview Text */}
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-2xl font-bold font-serif text-[#0B192C]">
              About {destination.name}
            </h2>
            <p className="text-base text-stone-600 leading-relaxed">
              {destination.description}
            </p>

            {/* Key Fact Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Ideal Duration</span>
                <span className="text-sm font-bold text-stone-900">{destination.ideal_duration}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Best Season</span>
                <span className="text-sm font-bold text-stone-900">{destination.best_season}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Est. Daily Budget</span>
                <span className="text-sm font-bold text-emerald-700 font-mono">₹{destination.daily_budget.toLocaleString()}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Total Attractions</span>
                <span className="text-sm font-bold text-stone-900">{destination.attractions?.length || 10} Sites</span>
              </div>
            </div>
          </div>

          {/* Sticky Action Card */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-lg space-y-5 lg:sticky lg:top-24">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider">Algorithmic Planner</span>
              <h3 className="text-xl font-bold font-serif text-stone-900">Plan a Trip to {destination.name}</h3>
              <p className="text-xs text-stone-500">
                Connect your origin city with verified trains, hill buses, stays, and budget math.
              </p>
            </div>

            <Link
              href={`/plan?destination=${encodeURIComponent(destination.name)}`}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Plan My Trip Here</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="text-[11px] text-stone-500 space-y-1 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-1.5 text-stone-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deterministic total budget guarantee</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Synchronized multi-modal transfers</span>
              </div>
            </div>
          </div>

        </div>

        {/* Tab Navigation for Attractions, Food, Stays */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
            <button
              onClick={() => setActiveTab('attractions')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'attractions'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Attractions ({destination.attractions?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('food')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'food'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Food & Dining ({destination.food_places?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('stays')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'stays'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
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
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative h-44 w-full">
                    <SafeImage src={attr.image} alt={attr.name} className="w-full h-full" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-stone-800">
                      {attr.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-stone-900/80 px-2 py-1 rounded-full text-[10px] font-bold text-amber-300 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300" />
                      <span>{attr.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-base text-stone-900">{attr.name}</h4>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">{attr.description}</p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Entry Fee</span>
                        <span className="font-bold text-stone-900">
                          {attr.entry_fee === 0 ? 'Free Entry' : `₹${attr.entry_fee}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block">Duration</span>
                        <span className="font-semibold text-stone-600">{attr.visit_duration_minutes} mins</span>
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
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative h-44 w-full">
                    <SafeImage src={food.image} alt={food.name} className="w-full h-full" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-stone-800">
                      {food.cuisine}
                    </div>
                    <div className="absolute top-3 right-3 bg-stone-900/80 px-2 py-1 rounded-full text-[10px] font-bold text-amber-300 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300" />
                      <span>{food.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-base text-stone-900">{food.name}</h4>
                      <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                        Speciality: {food.speciality}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Cost for Two</span>
                        <span className="font-bold text-stone-900">₹{food.cost_for_two}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block">Hours</span>
                        <span className="font-semibold text-stone-600 text-[11px]">{food.opening_hours}</span>
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
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative h-44 w-full">
                    <SafeImage src={hotel.image} alt={hotel.name} className="w-full h-full" />
                    <div className="absolute top-3 left-3 bg-[#0B192C] text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                      {hotel.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-stone-900/80 px-2 py-1 rounded-full text-[10px] font-bold text-amber-300 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300" />
                      <span>{hotel.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-base text-stone-900">{hotel.name}</h4>
                      <div className="text-xs text-stone-500 mt-1">{hotel.room_type}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {hotel.amenities?.map((am) => (
                          <span key={am} className="px-2 py-0.5 bg-stone-100 text-[10px] text-stone-600 rounded">
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Nightly Rate</span>
                        <span className="font-bold font-mono text-emerald-700 text-sm">₹{hotel.price_per_night}</span>
                      </div>
                      <Link
                        href={`/plan?destination=${encodeURIComponent(destination.name)}`}
                        className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors"
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
        <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-serif text-stone-900">
                {destination.name} Geographical Hub
              </h3>
              <p className="text-xs text-stone-500">
                Coordinates: {destination.latitude.toFixed(4)}° N, {destination.longitude.toFixed(4)}° E
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              OpenStreetMap + Leaflet
            </span>
          </div>

          <div className="h-80 w-full rounded-2xl overflow-hidden border border-stone-200">
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
