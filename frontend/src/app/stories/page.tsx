'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar, Footer, SafeImage } from '@/components';
import { getStories, StoryItem } from '@/services/stories';
import {
  Clock, MapPin, ArrowRight, Sparkles, Filter,
  BookOpen, ChevronRight, User, Heart, Search
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Guides',
  'Budget Travel',
  'Food',
  'Adventure',
  'Culture',
  'Weekend Trips'
];

export default function StoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('navix_bookmarked_stories');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const toggleBookmark = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedSlugs((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem('navix_bookmarked_stories', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    let mounted = true;

    getStories({

      category: selectedCategory === 'All' ? undefined : selectedCategory,
      search: searchQuery.trim() || undefined,
      limit: 60
    })
      .then((res) => {
        if (mounted) {
          setStories(res.items || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#0B192C]">
      <Navbar />

      {/* --- HERO BANNER --- */}
      <section className="bg-white border-b border-stone-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Travel Editorial &amp; Destination Guides</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#0B192C] tracking-tight">
                Authentic Travel Stories &amp; Guides
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
                Curated itineraries, regional food deep-dives, budget secrets, and mountain trail notes across India.
              </p>
            </div>

            {/* Quick Search */}
            <div className="w-full sm:w-72">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search stories, destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0B192C] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-2 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#0B192C] text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:text-[#0B192C] border border-stone-200 hover:border-stone-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- STORIES GRID --- */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-4 animate-pulse">
                <div className="h-52 bg-stone-100 rounded-xl" />
                <div className="h-4 bg-stone-100 rounded w-1/3" />
                <div className="h-6 bg-stone-100 rounded w-3/4" />
                <div className="h-12 bg-stone-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 p-8 space-y-4 max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-[#0B192C]">No stories found</h3>
            <p className="text-xs text-stone-500">
              No articles match your selected filter or query. Try another category.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => {
              const isBookmarked = bookmarkedSlugs.includes(story.slug);
              return (
                <article
                  key={story.id}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  {/* Cover Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-stone-100">
                    <SafeImage
                      src={story.hero_image}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#0B192C] text-[11px] font-bold shadow-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {story.destination_name}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#0B192C]/80 backdrop-blur-md text-white text-[11px] font-semibold">
                        {story.category}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(story.slug, e)}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                        isBookmarked
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-stone-200">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {story.read_time}
                      </span>
                      <span className="font-semibold text-white">
                        By {story.author}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-[#0B192C] group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                        {story.summary}
                      </p>
                    </div>

                    {/* Footer Links */}
                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{story.author}</span>
                      </div>

                      <Link
                        href={`/stories/${story.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                      >
                        <span>Read Story</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* --- PLANNER PROMO BANNER --- */}
        <section className="bg-gradient-to-r from-[#0B192C] to-[#1E3E62] text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              Algorithmic Travel Planner
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Ready to create your own journey?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Route multi-modal transit, stays, food, and activities from Sangli, Pune, Delhi, or your home city under your exact trip budget.
            </p>
          </div>

          <Link
            href="/plan"
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-600/30 whitespace-nowrap uppercase tracking-wider shrink-0"
          >
            <span>Plan Your Journey</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
