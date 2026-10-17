'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, Filter, Search, ExternalLink, Image as ImageIcon, MapPin, Utensils, Bed, BookOpen } from 'lucide-react';
import { MEDIA_MANIFEST, MediaManifestEntry } from '@/lib/mediaResolver';

const DESTINATIONS = ['All', 'Goa', 'Manali', 'Jaipur', 'Rishikesh', 'Mysuru'];
const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: ImageIcon },
  { id: 'places', label: 'Attractions', icon: MapPin },
  { id: 'food', label: 'Food & Dining', icon: Utensils },
  { id: 'stays', label: 'Hotels & Stays', icon: Bed },
  { id: 'stories', label: 'Cover Stories', icon: BookOpen }
];

export default function MediaGalleryPage() {
  const [selectedDest, setSelectedDest] = useState<string>('All');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allItems: MediaManifestEntry[] = useMemo(() => {
    return Object.values(MEDIA_MANIFEST);
  }, []);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchDest = selectedDest === 'All' || item.destination.toLowerCase() === selectedDest.toLowerCase();
      const matchCat = selectedCat === 'all' || item.category === selectedCat;
      const matchSearch = !searchQuery || 
        item.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.attribution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.entityId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDest && matchCat && matchSearch;
    });
  }, [allItems, selectedDest, selectedCat, searchQuery]);

  const stats = useMemo(() => {
    const total = allItems.length;
    const exact = allItems.filter(i => i.classification === 'exact').length;
    const representative = allItems.filter(i => i.classification === 'representative').length;
    return { total, exact, representative };
  }, [allItems]);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to NAVIX Home
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-navy-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Phase 7 Developer Gallery
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Authentic Assets
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-serif">
              Authentic Media Verification Catalog
            </h1>
            <p className="mt-2 text-base text-slate-400 max-w-3xl">
              Verified local WebP imagery harvested from Wikimedia Commons across 5 flagship corridors. Zero stock photo fallbacks, zero rate limits, and full attribution preservation.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-navy-900/80 backdrop-blur border border-navy-700/60 rounded-xl p-3 px-5 shadow-lg">
            <div className="text-center pr-4 border-r border-navy-800">
              <div className="text-2xl font-black text-white">{stats.total}</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Assets</div>
            </div>
            <div className="text-center pr-4 border-r border-navy-800">
              <div className="text-2xl font-black text-emerald-400">{stats.exact}</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Exact Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-sky-400">{stats.representative}</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Curated Rep</div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Destination tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {DESTINATIONS.map(dest => (
              <button
                key={dest}
                onClick={() => setSelectedDest(dest)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedDest === dest
                    ? 'bg-teal-500 text-navy-950 shadow-md font-bold'
                    : 'bg-navy-900 text-slate-300 hover:bg-navy-800 hover:text-white border border-navy-700/50'
                }`}
              >
                {dest}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search attractions, dishes, authors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  selectedCat === cat.id
                    ? 'bg-navy-800 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Showing {filteredItems.length} verified photos</span>
          <span className="text-teal-400">Zero Unsplash Fallbacks Active</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-navy-900/60 rounded-2xl border border-navy-800 p-12 text-center text-slate-400">
            No media assets match your active filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div 
                key={item.entityId}
                className="bg-navy-900/90 rounded-2xl border border-navy-800/80 overflow-hidden shadow-lg hover:shadow-teal-950/40 hover:border-navy-700 transition-all flex flex-col group"
              >
                {/* Media Image Card */}
                <div className="relative aspect-[4/3] bg-navy-950 overflow-hidden">
                  <Image
                    src={item.webPath}
                    alt={item.entityName}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-black/20" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-navy-950/80 backdrop-blur text-slate-200 border border-white/10">
                      {item.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-navy-950/80 backdrop-blur text-teal-300 border border-white/10">
                      {item.destination}
                    </span>
                  </div>

                  {/* Classification Pill */}
                  <div className="absolute top-3 right-3">
                    {item.classification === 'exact' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/90 text-white shadow flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Exact
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/90 text-white shadow">
                        Representative
                      </span>
                    )}
                  </div>

                  {/* Local Path badge */}
                  <div className="absolute bottom-2 left-3 right-3 truncate text-[11px] font-mono text-slate-300">
                    {item.webPath}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-2">
                      {item.entityName}
                    </h3>
                    <div className="mt-1 text-xs text-slate-400 font-mono">
                      ID: {item.entityId}
                    </div>
                  </div>

                  {/* Attribution Details */}
                  <div className="mt-4 pt-3 border-t border-navy-800/80 flex flex-col gap-1.5 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">License:</span>
                      <span className="font-semibold text-slate-200 truncate max-w-[140px] text-right" title={item.license}>
                        {item.license}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Author:</span>
                      <span className="font-semibold text-slate-300 truncate max-w-[140px] text-right" title={item.attribution}>
                        {item.attribution}
                      </span>
                    </div>
                    {item.source && (
                      <a 
                        href={item.source}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 text-[11px] text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 transition-colors"
                      >
                        Source on Wikimedia <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
