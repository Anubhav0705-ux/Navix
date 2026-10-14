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
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const PAGE_SIZE = 60;

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      setPage(1);
      try {
        const res = await getDestinations({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
          page: 1,
          limit: PAGE_SIZE
        });
        setDestinations(res.items || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(loadInitial, 250);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const handleLoadMore = async () => {
    if (loadingMore || destinations.length >= total) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await getDestinations({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
        page: nextPage,
        limit: PAGE_SIZE
      });
      if (res.items && res.items.length > 0) {
        setDestinations((prev) => {
          const existingIds = new Set(prev.map((d) => d.id));
          const newItems = res.items.filter((d) => !existingIds.has(d.id));
          return [...prev, ...newItems];
        });
        setPage(nextPage);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load more destinations:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadAll = async () => {
    if (loadingMore || destinations.length >= total) return;
    setLoadingMore(true);
    try {
      // Fetch remaining pages until all are loaded
      let currentPage = page + 1;
      let currentItems = [...destinations];
      while (currentItems.length < total) {
        const res = await getDestinations({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
          page: currentPage,
          limit: PAGE_SIZE
        });
        if (!res.items || res.items.length === 0) break;
        const existingIds = new Set(currentItems.map((d) => d.id));
        const newItems = res.items.filter((d) => !existingIds.has(d.id));
        currentItems = [...currentItems, ...newItems];
        currentPage++;
        if (currentItems.length >= res.total) break;
      }
      setDestinations(currentItems);
      setPage(currentPage);
    } catch (err) {
      console.error('Failed to load all destinations:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#142A38] flex flex-col font-sans selection:bg-[#1F6E78]/15 selection:text-[#142A38]">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-[#F5EBE1]/80 border-b border-[#EBDCC7] pt-14 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#E96E55] bg-white px-3.5 py-1 rounded-full border border-[#EBDCC7] shadow-xs">
            <Compass className="w-3.5 h-3.5" />
            <span>Discover India</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-editorial text-[#142A38]">
            Explore Destinations
          </h1>
          <p className="text-sm sm:text-base text-[#66757F] max-w-2xl leading-relaxed font-normal">
            From the pine ridges of Himachal and mountain passes of Ladakh to coastal palms of Kerala and royal desert havelis of Rajasthan.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl relative pt-2">
            <Search className="w-5 h-5 text-[#94A3B8] absolute left-4.5 top-5.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, state, or name (e.g. Manali, Goa, Sangli, Jaipur)..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#EBDCC7] rounded-2xl text-sm font-bold text-[#142A38] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1F6E78] transition-all shadow-xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#1F6E78] text-white shadow-sm font-black'
                      : 'bg-white text-[#475569] hover:bg-[#F5EBE1] hover:text-[#142A38] border border-[#EBDCC7]'
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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-[#EBDCC7] animate-pulse h-84 shadow-xs">
                <div className="bg-[#F5EBE1] h-48 w-full" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-[#F5EBE1] rounded w-1/3" />
                  <div className="h-5 bg-[#F5EBE1] rounded w-3/4" />
                  <div className="h-3 bg-[#F5EBE1] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EBDCC7] p-8 space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#F5EBE1] text-[#E96E55] flex items-center justify-center mx-auto border border-[#EBDCC7]">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-editorial text-[#142A38]">No destinations found</h3>
            <p className="text-sm text-[#66757F] max-w-md mx-auto">
              Try adjusting your search terms or filter category to discover other Indian destinations.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-6 py-2.5 bg-[#1F6E78] hover:bg-[#15525A] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-bold text-[#66757F]">
              <span>
                Showing <strong className="text-[#142A38]">{destinations.length}</strong> of{' '}
                <strong className="text-[#142A38]">{total}</strong> Indian destinations
              </span>
              <span className="text-[#142A38]">Filter: {selectedCategory}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {destinations.map((dest) => (
                <Link
                  key={dest.id}
                  href={`/explore/${dest.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-[#EBDCC7] hover:border-[#1F6E78] transition-all duration-300 flex flex-col photo-card-hover shadow-sm"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <SafeImage
                      src={dest.hero_image}
                      alt={dest.name}
                      category={dest.categories?.[0]}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500 object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#142A38] shadow-xs">
                      {dest.categories?.[0] || 'Popular'}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#142A38] flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 text-[#D8A64B] fill-[#D8A64B]" />
                      <span>{dest.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[11px] font-bold text-[#E96E55] uppercase tracking-wider">
                        {dest.state}
                      </div>
                      <h3 className="text-xl font-bold font-editorial text-[#142A38] group-hover:text-[#1F6E78] transition-colors mt-0.5">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-[#66757F] line-clamp-2 mt-1 leading-relaxed">
                        {dest.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#EBDCC7] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">Avg. Daily Budget</span>
                        <span className="font-bold text-[#142A38]">₹{dest.daily_budget.toLocaleString()}/day</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">Best Season</span>
                        <span className="font-semibold text-[#66757F] text-[11px]">{dest.best_season}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {destinations.length < total ? (
              <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-[#1F6E78] hover:bg-[#15525A] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? 'Loading More...' : `Load More Destinations (${destinations.length} of ${total} loaded)`}
                </button>
                <button
                  onClick={handleLoadAll}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-white hover:bg-[#F5EBE1] text-[#142A38] border border-[#EBDCC7] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? 'Loading All...' : `Show All (${total} Destinations)`}
                </button>
              </div>
            ) : total > 0 ? (
              <div className="pt-6 pb-2 text-center text-xs text-[#66757F] font-medium">
                ✓ Showing all {total} destinations across India
              </div>
            ) : null}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
