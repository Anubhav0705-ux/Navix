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
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (slug) {
      try {
        const saved = localStorage.getItem('navix_bookmarked_stories');
        if (saved) setIsBookmarked(JSON.parse(saved).includes(slug));
      } catch {}
    }
  }, [slug]);

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
      budget: '35000',
      travellers: '2'
    }).toString();
    router.push(`/plan?${query}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF7F1] text-[#142A38]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-20 space-y-6 animate-pulse">
          <div className="h-8 bg-[#F5EBE1] rounded w-1/3" />
          <div className="h-12 bg-[#F5EBE1] rounded w-3/4" />
          <div className="h-96 bg-[#F5EBE1] rounded-2xl" />
          <div className="space-y-3">
            <div className="h-4 bg-[#F5EBE1] rounded w-full" />
            <div className="h-4 bg-[#F5EBE1] rounded w-5/6" />
            <div className="h-4 bg-[#F5EBE1] rounded w-4/6" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF7F1] text-[#142A38]">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto w-full px-4 py-24 text-center space-y-4">
          <h2 className="text-3xl font-black font-editorial text-[#142A38]">Story Not Found</h2>
          <p className="text-xs text-[#66757F] leading-relaxed">
            We could not locate this travel dispatch or it may have been moved.
          </p>
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#1F6E78] text-white rounded-xl text-xs font-bold hover:bg-[#15525A]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stories</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Parse body sections and markdown blocks
  const rawSections = story.body.split('\n\n').filter((p) => p.trim().length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7F1] text-[#142A38] selection:bg-[#1F6E78]/15 selection:text-[#142A38]">
      <Navbar />

      <main className="flex-1">
        {/* --- HEADER BANNER --- */}
        <section className="bg-[#F5EBE1]/80 border-b border-[#EBDCC7] py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between">
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#66757F] hover:text-[#142A38] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Stories &amp; Guides</span>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleBookmark}
                  className={`p-2.5 rounded-xl border transition-all text-xs flex items-center gap-1.5 font-bold cursor-pointer ${
                    isBookmarked
                      ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
                      : 'bg-white border-[#EBDCC7] text-[#66757F] hover:text-[#142A38] shadow-xs'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-[#EBDCC7] bg-white text-[#66757F] hover:text-[#142A38] transition-all text-xs flex items-center gap-1.5 font-bold cursor-pointer shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedShare ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#142A38] text-white text-[10px] font-bold uppercase tracking-wider">
                  {story.category}
                </span>
                <span className="text-xs text-[#142A38] font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1F6E78]" />
                  {story.destination_name}
                </span>
                <span className="text-xs text-[#66757F] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#D8A64B]" />
                  {story.read_time}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-editorial text-[#142A38] leading-tight tracking-tight">
                {story.title}
              </h1>

              {/* Author & Meta Row */}
              <div className="pt-4 border-t border-[#EBDCC7] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1F6E78] text-white flex items-center justify-center font-black text-sm shadow-xs">
                    {story.author.charAt(0)}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#142A38]">{story.author}</span>
                    <span className="block text-[11px] text-[#66757F]">NAVIX Travel Dispatch</span>
                  </div>
                </div>

                <button
                  onClick={handlePlanThisTrip}
                  className="px-5 py-2.5 bg-[#1F6E78] hover:bg-[#15525A] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#1F6E78]/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Plan Trip to {story.destination_name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- ARTICLE CONTENT --- */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {/* Main Hero Image */}
          <div className="rounded-3xl overflow-hidden border border-[#EBDCC7] shadow-md max-h-[520px]">
            <SafeImage
              src={story.hero_image}
              alt={story.title}
              category={story.category}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Lead Summary */}
          <div className="bg-white border border-[#EBDCC7] rounded-3xl p-6 sm:p-8 space-y-2 shadow-xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1F6E78] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#1F6E78]" /> Field Dispatches Overview
            </h3>
            <p className="text-base text-[#142A38] leading-relaxed font-normal">
              {story.summary}
            </p>
          </div>

          {/* Rich Body Paragraphs & Image Galleries */}
          <div className="space-y-6 text-[#334155] text-lg leading-relaxed font-serif">
            {rawSections.map((section, idx) => {
              const trimmed = section.trim();

              // Heading 1 or Title
              if (trimmed.startsWith('# ')) {
                return null; // Already rendered in hero
              }

              // Chapter Headings (###)
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-2xl font-bold font-editorial text-[#142A38] pt-6 pb-2 border-b border-[#EBDCC7] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1F6E78]" />
                    <span>{trimmed.replace('### ', '')}</span>
                  </h3>
                );
              }

              // Image Embed: ![caption](url)
              if (trimmed.startsWith('![') && trimmed.includes('](')) {
                const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
                if (match) {
                  const caption = match[1];
                  const url = match[2];
                  return (
                    <figure key={idx} className="my-6 rounded-3xl overflow-hidden border border-[#EBDCC7] bg-white shadow-xs">
                      <div className="relative h-72 sm:h-96 w-full">
                        <SafeImage src={url} alt={caption} className="w-full h-full object-cover" />
                      </div>
                      {caption && (
                        <figcaption className="p-3 text-center text-xs text-[#66757F] italic font-sans border-t border-[#EBDCC7]">
                          {caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }
              }

              // Divider
              if (trimmed === '---') {
                return <hr key={idx} className="border-[#EBDCC7] my-6" />;
              }

              // Unordered List
              if (trimmed.startsWith('- ') || trimmed.startsWith('1. ')) {
                const lines = trimmed.split('\n');
                return (
                  <ul key={idx} className="space-y-2.5 my-4 pl-4 text-base font-sans text-[#142A38]">
                    {lines.map((line, lIdx) => (
                      <li key={lIdx} className="flex items-start gap-2.5">
                        <span className="text-[#1F6E78] font-bold mt-0.5">•</span>
                        <span>{line.replace(/^[-*]\s+|\d+\.\s+/, '')}</span>
                      </li>
                    ))}
                  </ul>
                );
              }

              // Standard Paragraph
              return (
                <p key={idx} className="leading-relaxed text-[#334155]">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Destination Callout Box */}
          <div className="bg-white border border-[#EBDCC7] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBDCC7]">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#1F6E78]" />
                <h3 className="text-xl font-bold font-editorial text-[#142A38]">
                  Visiting {story.destination_name}
                </h3>
              </div>
              <Link
                href={`/explore/${story.destination_slug || story.destination_name.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-xs font-bold text-[#1F6E78] hover:text-[#15525A] flex items-center gap-1"
              >
                <span>Explore Destination Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-[#66757F] leading-relaxed font-sans">
              Discover verified attractions, authentic regional restaurants, and stays curated for {story.destination_name} in the NAVIX Travel Directory.
            </p>
          </div>

          {/* --- CTA BANNER --- */}
          <div className="bg-[#142A38] text-white rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-lg text-center sm:text-left">
              <span className="text-xs font-bold text-[#D8A64B] uppercase tracking-wider block">
                Inspired by this journey?
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-editorial text-white">
                Plan your trip to {story.destination_name}
              </h3>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Deterministic route calculation, safe transfer windows, and personalized daily itinerary optimization under your budget cap.
              </p>
            </div>

            <button
              onClick={handlePlanThisTrip}
              className="px-8 py-4 bg-[#E96E55] hover:bg-[#E05841] text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#E96E55]/25 whitespace-nowrap shrink-0 uppercase tracking-wider cursor-pointer"
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
