'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar, Footer, SafeImage } from '@/components';
import { getStoryDetail, StoryItem } from '@/services/stories';
import {
  ArrowLeft, Clock, MapPin,
  Share2, ArrowRight, Heart, Sparkles
} from 'lucide-react';

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';

  const [story, setStory] = useState<StoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && slug) {
      try {
        const saved = localStorage.getItem('navix_bookmarked_stories');
        if (saved) return JSON.parse(saved).includes(slug);
      } catch {}
    }
    return false;
  });
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!slug) return;

    getStoryDetail(slug)
      .then((data) => {
        setStory(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Story not found');
        setLoading(false);
      });
  }, [slug]);

  const toggleBookmark = () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      const saved = localStorage.getItem('navix_bookmarked_stories');
      const arr: string[] = saved ? JSON.parse(saved) : [];
      const updated = next ? [...arr, slug] : arr.filter((s) => s !== slug);
      localStorage.setItem('navix_bookmarked_stories', JSON.stringify(updated));
    } catch {}
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: story?.title || 'NAVIX Travel Story',
          text: story?.summary,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      }
    }
  };

  const handlePlanThisTrip = () => {
    if (!story) return;
    const query = new URLSearchParams({
      origin: 'Sangli',
      destination: story.destination_name,
      budget: '25000',
      travellers: '2'
    }).toString();
    router.push(`/plan?${query}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#0B192C]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-20 space-y-6 animate-pulse">
          <div className="h-8 bg-stone-200 rounded w-1/3" />
          <div className="h-12 bg-stone-200 rounded w-3/4" />
          <div className="h-96 bg-stone-200 rounded-2xl" />
          <div className="space-y-3">
            <div className="h-4 bg-stone-200 rounded w-full" />
            <div className="h-4 bg-stone-200 rounded w-5/6" />
            <div className="h-4 bg-stone-200 rounded w-4/6" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#0B192C]">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto w-full px-4 py-24 text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#0B192C]">Story Not Found</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            We couldn&apos;t locate this travel story or it may have been moved.
          </p>
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stories</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Parse body paragraphs
  const paragraphs = story.body.split('\n\n').filter((p) => p.trim().length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#0B192C]">
      <Navbar />

      <main className="flex-1">
        {/* --- HEADER BANNER --- */}
        <section className="bg-white border-b border-stone-200 py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between">
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-[#0B192C] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Stories &amp; Guides</span>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleBookmark}
                  className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 font-semibold ${
                    isBookmarked
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 transition-all text-xs flex items-center gap-1.5 font-semibold"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedShare ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  {story.category}
                </span>
                <span className="text-xs text-stone-600 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {story.destination_name}
                </span>
                <span className="text-xs text-stone-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {story.read_time}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B192C] leading-tight tracking-tight">
                {story.title}
              </h1>

              {/* Author & Meta Row */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm">
                    {story.author.charAt(0)}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#0B192C]">{story.author}</span>
                    <span className="block text-[11px] text-stone-500">NAVIX Travel Contributor</span>
                  </div>
                </div>

                <button
                  onClick={handlePlanThisTrip}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Plan Trip to {story.destination_name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- ARTICLE CONTENT --- */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          {/* Main Cover Image */}
          <div className="rounded-3xl overflow-hidden border border-stone-200 shadow-md max-h-[500px]">
            <SafeImage
              src={story.hero_image}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Lead Summary */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 sm:p-8 space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Executive Overview
            </h3>
            <p className="text-base text-stone-800 leading-relaxed font-medium">
              {story.summary}
            </p>
          </div>

          {/* Body Paragraphs */}
          <div className="space-y-6 text-stone-700 text-base leading-relaxed font-serif">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* Destination Callout Box */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-[#0B192C]">
                  Visiting {story.destination_name}
                </h3>
              </div>
              <Link
                href={`/explore/${story.destination_slug}`}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                View Full Destination Guide &rarr;
              </Link>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Explore verified attractions, local dining recommendations, and budget stays curated for {story.destination_name} in the NAVIX Travel Directory.
            </p>
          </div>

          {/* --- CTA BANNER --- */}
          <div className="bg-gradient-to-r from-[#0B192C] to-[#1E3E62] text-white rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-lg text-center sm:text-left">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Inspired by this journey?
              </span>
              <h3 className="text-2xl font-black">Plan your trip to {story.destination_name}</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Deterministic route calculation, safe transfer windows, and daily itinerary optimization under your budget cap.
              </p>
            </div>

            <button
              onClick={handlePlanThisTrip}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-600/30 whitespace-nowrap shrink-0 uppercase tracking-wider"
            >
              <span>Build This Trip</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
