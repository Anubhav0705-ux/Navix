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
  'Mountain Diaries',
  'Coastal Escapes',
  'Food Trails',
  'Heritage Trails',
  'Weekend Escapes',
  'Adventure',
  'Slow Travel'
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
      limit: 32
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
    <div className="min-h-screen flex flex-col bg-[#FBF7F1] text-[#142A38] selection:bg-[#1F6E78]/15 selection:text-[#142A38]">
      <Navbar />

      {/* --- HERO BANNER --- */}
      <section className="bg-[#F5EBE1]/80 border-b border-[#EBDCC7] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#EBDCC7] text-[#E96E55] text-xs font-bold tracking-wider uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Travel Dispatch &amp; Editorial Guides</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-editorial text-[#142A38] tracking-tight">
                Authentic Travel Stories
              </h1>
              <p className="text-sm sm:text-base text-[#66757F] max-w-2xl leading-relaxed font-normal">
                Curated travel notes, regional food trails, budget observations, and mountain dispatches across India.
              </p>
            </div>

            {/* Quick Search */}
            <div className="w-full sm:w-80">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search dispatches, destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#EBDCC7] text-sm font-bold text-[#142A38] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1F6E78] shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-[#66757F] uppercase tracking-wider mr-2 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#1F6E78] text-white shadow-sm font-black'
                    : 'bg-white text-[#66757F] hover:text-[#142A38] hover:bg-[#F5EBE1] border border-[#EBDCC7]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- STORIES GRID --- */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-[#EBDCC7] p-4 space-y-4 animate-pulse shadow-xs">
                <div className="h-56 bg-[#F5EBE1] rounded-2xl" />
                <div className="h-4 bg-[#F5EBE1] rounded w-1/3" />
                <div className="h-6 bg-[#F5EBE1] rounded w-3/4" />
                <div className="h-12 bg-[#F5EBE1] rounded w-full" />
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EBDCC7] p-8 space-y-4 max-w-md mx-auto shadow-sm">
            <BookOpen className="w-12 h-12 text-[#94A3B8] mx-auto" />
            <h3 className="text-2xl font-bold font-editorial text-[#142A38]">No stories found</h3>
            <p className="text-xs text-[#66757F]">
              No articles match your selected filter or query. Try another category.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-5 py-2.5 bg-[#1F6E78] hover:bg-[#15525A] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
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
                  className="bg-white border border-[#EBDCC7] rounded-3xl overflow-hidden hover:border-[#1F6E78] transition-all duration-300 flex flex-col group photo-card-hover shadow-sm"
                >
                  {/* Cover Image */}
                  <div className="relative h-64 w-full overflow-hidden bg-[#F5EBE1]">
                    <SafeImage
                      src={story.hero_image}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#142A38] text-[11px] font-bold shadow-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#1F6E78]" />
                        {story.destination_name}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#142A38] text-white text-[10px] font-bold shadow-xs">
                        {story.category}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(story.slug, e)}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
                      className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                        isBookmarked
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-white/80 text-[#142A38] hover:bg-white shadow-xs'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-black/50 backdrop-blur-md px-3 py-1 rounded-full">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-[#D8A64B]" />
                        {story.read_time}
                      </span>
                      <span className="font-semibold">
                        By {story.author}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold font-editorial text-[#142A38] group-hover:text-[#1F6E78] transition-colors leading-snug line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="text-xs text-[#66757F] leading-relaxed line-clamp-3">
                        {story.summary}
                      </p>
                    </div>

                    {/* Footer Links */}
                    <div className="pt-4 border-t border-[#EBDCC7] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-[#66757F] font-medium">
                        <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>{story.author}</span>
                      </div>

                      <Link
                        href={`/stories/${story.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F6E78] hover:text-[#15525A] transition-colors"
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
        <section className="bg-[#142A38] text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <span className="text-xs font-bold text-[#D8A64B] uppercase tracking-wider block">
              Multi-Modal Travel Planner
            </span>
            <h3 className="text-2xl sm:text-4xl font-black font-editorial text-white">
              Inspired to plan your own journey?
            </h3>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              Route multi-modal transit, stays, food, and activities from Sangli, Pune, Delhi, or your home city under your exact trip budget.
            </p>
          </div>

          <Link
            href="/plan"
            className="px-8 py-4 bg-[#E96E55] hover:bg-[#E05841] text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#E96E55]/25 whitespace-nowrap shrink-0 cursor-pointer"
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
