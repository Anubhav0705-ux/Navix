'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar, Footer } from '@/components';
import { SAMPLE_STORIES } from '@/lib/stories-data';
import { Compass, Clock, Wallet, MapPin, ArrowRight, Sparkles, Filter } from 'lucide-react';

export default function StoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Backpacking', 'Mountain Trails', 'Weekend Escapes', 'Budget Guides'];

  const filteredStories = selectedCategory === 'All'
    ? SAMPLE_STORIES
    : SAMPLE_STORIES.filter((s) => s.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0B1320]">
      <Navbar />

      {/* --- HERO BANNER --- */}
      <section className="bg-white border-b border-[#E7E5E0] py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E9F7A]/10 border border-[#0E9F7A]/20 text-[#0E9F7A] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community &amp; Travel Journal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0B1320] tracking-tight">
            Real journeys.{' '}
            <span className="text-[#0E9F7A] italic font-serif font-normal">Actual budgets.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#667085] max-w-2xl leading-relaxed">
            Discover how travelers explore India starting from Tier-2 and Tier-3 cities — complete with real cost breakdowns, transit tips, and local highlights.
          </p>

          {/* Category Filters */}
          <div className="pt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth ${
                  selectedCategory === cat
                    ? 'bg-[#0E9F7A] text-white shadow-sm'
                    : 'bg-[#F7F5F0] text-[#667085] hover:text-[#0B1320] border border-[#E7E5E0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- STORIES GRID --- */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStories.map((story) => (
            <article
              key={story.id}
              className="bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden hover:shadow-md transition-smooth flex flex-col group"
            >
              {/* Cover Image Container */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#0B1320] text-[11px] font-bold shadow-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#0E9F7A]" />
                    {story.destination.split(',')[0]}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-2.5 py-1 rounded-full bg-[#0B1320]/80 backdrop-blur-md text-white text-[11px] font-mono font-bold shadow-sm flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-[#0E9F7A]" />
                    ₹{story.budget.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Story Details Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#667085] font-semibold">
                    <span>{story.category}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {story.duration}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0B1320] group-hover:text-[#0E9F7A] transition-smooth leading-snug">
                    {story.title}
                  </h3>

                  <p className="text-xs text-[#667085] leading-relaxed line-clamp-3">
                    {story.excerpt}
                  </p>
                </div>

                {/* Author & CTA Footer */}
                <div className="pt-4 border-t border-[#E7E5E0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={story.author.avatar}
                      alt={story.author.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#E7E5E0]"
                    />
                    <div>
                      <span className="block text-xs font-bold text-[#0B1320]">{story.author.name}</span>
                      <span className="block text-[10px] text-[#667085]">{story.author.role}</span>
                    </div>
                  </div>

                  <Link
                    href={`/stories/${story.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0E9F7A] hover:text-[#0B8465] transition-smooth"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* --- COMMUNITY CALLOUT BANNER --- */}
        <section className="bg-white border border-[#E7E5E0] rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4C8BF5]">
              <Compass className="w-4 h-4" />
              <span>NAVIX Traveler Stories</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0B1320]">
              Ready to turn your travel plans into reality?
            </h3>
            <p className="text-xs text-[#667085] max-w-lg">
              Use the NAVIX algorithmic planner to route your budget trip from Sangli, Pune, Delhi, or your home city.
            </p>
          </div>

          <Link
            href="/plan"
            className="px-6 py-3.5 bg-[#0E9F7A] hover:bg-[#0B8465] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-smooth shadow-sm whitespace-nowrap"
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
