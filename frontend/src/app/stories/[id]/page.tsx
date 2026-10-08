'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar, Footer } from '@/components';
import { SAMPLE_STORIES } from '@/lib/stories-data';
import {
  ArrowLeft, Clock, MapPin, Wallet, Calendar,
  Share2, Compass, ArrowRight, CheckCircle2
} from 'lucide-react';

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params?.id as string;

  const story = SAMPLE_STORIES.find((s) => s.id === storyId) || SAMPLE_STORIES[0];

  const handlePlanThisTrip = () => {
    const query = new URLSearchParams({
      origin: 'Sangli',
      destination: story.destination.includes('Manali') ? 'Old Manali' : 'Pune',
      budget: story.budget.toString(),
      travellers: '1'
    }).toString();
    router.push(`/plan?${query}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0B1320]">
      <Navbar />

      <main className="flex-1">
        {/* --- HEADER NAVIGATION & TITLE BANNER --- */}
        <section className="bg-white border-b border-[#E7E5E0] py-10 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            <Link
              href="/stories"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#667085] hover:text-[#0B1320] transition-smooth"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Stories</span>
            </Link>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#0E9F7A]/10 border border-[#0E9F7A]/20 text-[#0E9F7A] text-xs font-bold uppercase">
                  {story.category}
                </span>
                <span className="text-xs text-[#667085] flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#0E9F7A]" />
                  {story.destination}
                </span>
                <span className="text-xs text-[#667085] flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  {story.duration}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B1320] leading-tight">
                {story.title}
              </h1>

              {/* Author Row */}
              <div className="pt-2 flex items-center justify-between border-t border-[#E7E5E0]">
                <div className="flex items-center gap-3">
                  <img
                    src={story.author.avatar}
                    alt={story.author.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#E7E5E0]"
                  />
                  <div>
                    <span className="block text-xs font-bold text-[#0B1320]">{story.author.name}</span>
                    <span className="block text-[11px] text-[#667085]">{story.author.role} &bull; {story.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#0E9F7A] bg-[#0E9F7A]/10 px-3 py-1.5 rounded-lg border border-[#0E9F7A]/20">
                    Est. Budget: ₹{story.budget.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* --- MAIN STORY COVER & EDITORIAL CONTENT --- */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          
          {/* Main Cover Image */}
          <div className="rounded-2xl overflow-hidden border border-[#E7E5E0] shadow-sm max-h-[480px]">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Intro Paragraph */}
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-[#0B1320] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#0E9F7A]" />
              Trip Overview
            </h2>
            <p className="text-sm text-[#0B1320] leading-relaxed font-medium">
              {story.content?.introduction || story.excerpt}
            </p>

            {/* Highlights List */}
            {story.content?.highlights && (
              <div className="pt-4 border-t border-[#E7E5E0] space-y-2">
                <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">Key Highlights</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#0B1320]">
                  {story.content.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0E9F7A] flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Story Sections */}
          {story.content?.sections.map((sec, idx) => (
            <section key={idx} className="bg-white border border-[#E7E5E0] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold text-[#0B1320]">{sec.title}</h3>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">{sec.body}</p>
              {sec.image && (
                <div className="mt-4 rounded-xl overflow-hidden border border-[#E7E5E0] max-h-[360px]">
                  <img src={sec.image} alt={sec.title} className="w-full h-full object-cover" />
                </div>
              )}
            </section>
          ))}

          {/* Budget Breakdown Table Card */}
          {story.content?.budgetBreakdown && (
            <section className="bg-white border border-[#E7E5E0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E0]">
                <h3 className="text-lg font-bold text-[#0B1320] flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#0E9F7A]" />
                  Actual Trip Cost Breakdown
                </h3>
                <span className="text-xs font-mono font-bold text-[#0E9F7A]">
                  Total: ₹{story.budget.toLocaleString()}
                </span>
              </div>

              <div className="divide-y divide-[#E7E5E0] text-xs">
                {story.content.budgetBreakdown.map((b, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <span className="text-[#0B1320] font-medium">{b.category}</span>
                    <span className="font-bold text-[#0E9F7A]">₹{b.cost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- PLAN THIS TRIP CTA BANNER --- */}
          <div className="bg-[#0A1128] text-white rounded-2xl p-8 sm:p-10 space-y-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 max-w-lg">
              <span className="text-xs font-bold text-[#0E9F7A] uppercase tracking-wider block">Inspired by this story?</span>
              <h3 className="text-2xl font-extrabold">Plan your own budget trip now</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Use the NAVIX algorithmic planner to calculate multi-modal transport and lodging under your budget constraint.
              </p>
            </div>

            <button
              onClick={handlePlanThisTrip}
              className="px-6 py-3.5 bg-[#0E9F7A] hover:bg-[#0B8465] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-smooth shadow-sm whitespace-nowrap"
            >
              <span>Build This Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
