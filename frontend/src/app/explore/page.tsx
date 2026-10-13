'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar, Footer, SafeImage } from '@/components';
import { Search, Star, Compass } from 'lucide-react';


import { getDestinations, DestinationSummary } from '@/services/destinations';

const CATEGORIES = [
  { id: 'All', label: 'All Destinations' },
  { id: 'Mountains', label: 'Mountains' },
  { id: 'Beach', label: 'Beach' },
  { id: 'Heritage', label: 'Heritage' },
  { id: 'Nature', label: 'Nature' },
  { id: 'Adventure', label: 'Adventure' },
  { id: 'Spiritual', label: 'Spiritual' },
  { id: 'City', label: 'City' },
  { id: 'Romantic', label: 'Romantic' },
  { id: 'Budget', label: 'Budget' },
];

export default function ExplorePage() {
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getDestinations({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
          limit: 80
        });
        setDestinations(res.items || []);
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(loadData, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0B192C] flex flex-col font-sans selection:bg-emerald-700 selection:text-white">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-white border-b border-stone-200/80 pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Discover India</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-[#0B192C]">
            Explore Destinations
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            From the pine ridges of Himachal and mountain passes of Ladakh to coastal palms of Kerala and royal forts of Rajasthan.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl relative pt-2">
            <Search className="w-5 h-5 text-stone-400 absolute left-4.5 top-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, state, or destination name (e.g. Manali, Goa, Sangli)..."
              className="w-full pl-12 pr-4 py-3 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 rounded-2xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all shadow-xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0B192C] text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Destination Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-200 animate-pulse h-80">
                <div className="bg-stone-200 h-44 w-full" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-6 bg-stone-200 rounded w-3/4" />
                  <div className="h-4 bg-stone-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">No destinations found</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Try adjusting your search terms or filter category to discover other Indian destinations.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
              <span>Showing {destinations.length} Indian destinations</span>
              <span>Category: {selectedCategory}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {destinations.map((dest) => (
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
                        <span className="text-[10px] text-stone-400 block">Indicative Budget</span>
                        <span className="font-bold font-mono text-stone-900">₹{dest.daily_budget.toLocaleString()}/day</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block">Best Season</span>
                        <span className="font-semibold text-stone-700 text-[11px]">{dest.best_season}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
