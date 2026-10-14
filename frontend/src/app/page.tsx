'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar, Footer, SafeImage, DestinationScene, CINEMATIC_SCENES } from '@/components';
import {
  Compass, MapPin, Calendar, Users, Wallet, ArrowRight,
  ChevronRight, Mountain, Palmtree, Landmark, Trees, Flame, Heart
} from 'lucide-react';
import { getDestinations, getStories, DestinationSummary, StoryItem } from '@/services';

const TRAVEL_STYLES = [
  { name: 'Mountain Escapes', filter: 'Mountains', icon: Mountain, image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop' },
  { name: 'Beach Coastline', filter: 'Beach', icon: Palmtree, image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop' },
  { name: 'Heritage Trails', filter: 'Heritage', icon: Landmark, image: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=800&auto=format&fit=crop' },
  { name: 'Nature Sanctuaries', filter: 'Nature', icon: Trees, image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop' },
  { name: 'City Escapes', filter: 'City', icon: Flame, image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop' },
  { name: 'River & Spiritual', filter: 'Spiritual', icon: Heart, image: 'https://images.unsplash.com/photo-1600681978345-311667a788ad?q=80&w=800&auto=format&fit=crop' },
];

export default function Home() {
  const router = useRouter();

  // Scroll scene state for dynamic photographic hero & storytelling sequence
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Composer Form State
  const [origin, setOrigin] = useState('Pune');
  const [destination, setDestination] = useState('Goa');
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date(Date.now() + 14 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date(Date.now() + 20 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [travellers, setTravellers] = useState('2');
  const [budget, setBudget] = useState('25000');

  // Dynamic Data
  const [trendingDestinations, setTrendingDestinations] = useState<DestinationSummary[]>([]);
  const [stories, setStories] = useState<StoryItem[]>([]);

  // Section references for scroll scene observer
  const heroRef = useRef<HTMLElement>(null);
  const composerRef = useRef<HTMLElement>(null);
  const discoverRef = useRef<HTMLElement>(null);
  const stylesRef = useRef<HTMLElement>(null);
  const storiesRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        const [destRes, storyRes] = await Promise.all([
          getDestinations({ limit: 8 }),
          getStories({ limit: 4 })
        ]);
        setTrendingDestinations(destRes.items || []);
        setStories(storyRes.items || []);
      } catch {
        // Fallbacks handled gracefully
      }
    }
    loadContent();
  }, []);

  // IntersectionObserver for scroll-driven destination storytelling across 6 authentic scenes
  useEffect(() => {
    const sections = [
      { ref: heroRef, sceneIdx: 0 },      // Manali
      { ref: composerRef, sceneIdx: 1 },  // Goa
      { ref: discoverRef, sceneIdx: 2 },  // Udaipur
      { ref: stylesRef, sceneIdx: 3 },    // Munnar
      { ref: storiesRef, sceneIdx: 4 },   // Jaipur
      { ref: ctaRef, sceneIdx: 5 },       // Rishikesh
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const match = sections.find((s) => s.ref.current === entry.target);
            if (match !== undefined) {
              setActiveSceneIndex(match.sceneIdx);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((s) => {
      if (s.ref.current) observer.observe(s.ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      origin: origin.trim(),
      destination: destination.trim(),
      departureDate,
      returnDate,
      travellers,
      budget
    }).toString();
    router.push(`/plan?${query}`);
  };

  const currentScene = CINEMATIC_SCENES[activeSceneIndex] || CINEMATIC_SCENES[0];

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#142A38] flex flex-col font-sans selection:bg-[#1F6E78]/20 selection:text-[#142A38]">
      <Navbar transparentOnHero={true} />

      {/* ========================================================
          1. CINEMATIC HERO SECTION
          ======================================================== */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] bg-[#0C1820] flex flex-col justify-between pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden"
      >
        {/* Photographic Background Transition Engine */}
        <DestinationScene
          activeIndex={activeSceneIndex}
          className="absolute inset-0 z-0 h-full w-full"
        />

        <div className="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center py-12">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wider uppercase text-white/95">
              <span>{currentScene.name} &bull; {currentScene.tagline}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-editorial leading-[1.08] drop-shadow-md">
              India is yours <br />
              <span className="italic font-normal text-[#D8A64B]">to explore.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed font-normal drop-shadow">
              Build a journey around where you want to go, how you want to travel, and what you want to spend.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/plan"
                className="px-8 py-4 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-[#1F6E78]/30 flex items-center gap-2 group cursor-pointer"
              >
                <span>Plan a trip</span>
                <ArrowRight className="w-4 h-4 btn-icon-shift" />
              </Link>
              <Link
                href="/explore"
                className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all"
              >
                Explore India
              </Link>
            </div>
          </div>
        </div>

        {/* Scene Indicator Dots */}
        <div className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-white/80 pt-6 border-t border-white/15">
          <div className="flex items-center gap-2">
            {CINEMATIC_SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => setActiveSceneIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === activeSceneIndex
                    ? 'w-8 h-2 bg-[#D8A64B]'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
                title={`View ${scene.name}`}
              />
            ))}
          </div>

          <div className="text-[11px] font-medium tracking-wide text-white/70">
            Scroll to explore India &darr;
          </div>
        </div>
      </section>

      {/* ========================================================
          2. COMPACT TRIP COMPOSER — SLEEK HORIZONTAL DESKTOP LAYOUT
          ======================================================== */}
      <section
        ref={composerRef}
        className="relative -mt-8 sm:-mt-12 z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="bg-[#FFFDFC] rounded-2xl sm:rounded-3xl shadow-xl border border-[#EBDCC7] p-5 sm:p-7">
          <form onSubmit={handlePlanSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              {/* From */}
              <div className="lg:col-span-3 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#66757F] flex items-center gap-1.5 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-[#1F6E78]" /> From
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Starting city"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FBF7F1] hover:bg-white focus:bg-white border border-[#EBDCC7] rounded-xl text-sm font-semibold text-[#142A38] focus:outline-none focus:ring-2 focus:ring-[#1F6E78] transition-all"
                />
              </div>

              {/* To */}
              <div className="lg:col-span-3 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#66757F] flex items-center gap-1.5 font-mono">
                  <Compass className="w-3.5 h-3.5 text-[#E96E55]" /> To
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Destination"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FBF7F1] hover:bg-white focus:bg-white border border-[#EBDCC7] rounded-xl text-sm font-semibold text-[#142A38] focus:outline-none focus:ring-2 focus:ring-[#1F6E78] transition-all"
                />
              </div>

              {/* Dates */}
              <div className="lg:col-span-2 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#66757F] flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[#66757F]" /> Departure
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  required
                  className="w-full px-2.5 py-2.5 bg-[#FBF7F1] hover:bg-white focus:bg-white border border-[#EBDCC7] rounded-xl text-xs font-semibold text-[#142A38] focus:outline-none focus:ring-2 focus:ring-[#1F6E78] transition-all"
                />
              </div>

              {/* Travellers */}
              <div className="lg:col-span-2 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#66757F] flex items-center gap-1.5 font-mono">
                  <Users className="w-3.5 h-3.5 text-[#66757F]" /> Travellers
                </label>
                <select
                  value={travellers}
                  onChange={(e) => setTravellers(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FBF7F1] border border-[#EBDCC7] rounded-xl text-xs font-semibold text-[#142A38] focus:outline-none focus:ring-2 focus:ring-[#1F6E78]"
                >
                  <option value="1">1 Solo</option>
                  <option value="2">2 Travellers</option>
                  <option value="3">3 Travellers</option>
                  <option value="4">4 Travellers</option>
                </select>
              </div>

              {/* Budget */}
              <div className="lg:col-span-2 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#66757F] flex items-center gap-1.5 font-mono">
                  <Wallet className="w-3.5 h-3.5 text-[#1F6E78]" /> Budget (₹)
                </label>
                <input
                  type="number"
                  min="5000"
                  max="500000"
                  step="1000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-[#FBF7F1] border border-[#EBDCC7] rounded-xl text-xs font-bold font-mono text-[#142A38] focus:outline-none focus:ring-2 focus:ring-[#1F6E78]"
                />
              </div>
            </div>

            {/* Bottom Row: Featured corridor chips & Primary Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EBDCC7]">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#66757F]">
                <span className="font-bold text-[#142A38] text-[11px] font-mono mr-1">Corridors:</span>
                {[
                  { origin: 'Pune', destination: 'Goa', budget: '25000', label: 'Pune → Goa' },
                  { origin: 'Mumbai', destination: 'Udaipur', budget: '28000', label: 'Mumbai → Udaipur' },
                  { origin: 'Delhi', destination: 'Rishikesh', budget: '20000', label: 'Delhi → Rishikesh' },
                  { origin: 'Sangli', destination: 'Manali', budget: '40000', label: 'Sangli → Manali' },
                ].map((route) => (
                  <button
                    key={route.label}
                    type="button"
                    onClick={() => {
                      setOrigin(route.origin);
                      setDestination(route.destination);
                      setBudget(route.budget);
                      setTravellers('2');
                    }}
                    className="px-2.5 py-1 bg-[#FBF7F1] hover:bg-[#1F6E78] hover:text-white border border-[#EBDCC7] rounded-lg font-medium text-[11px] text-[#142A38] transition-colors cursor-pointer"
                  >
                    {route.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-2.5 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#1F6E78]/20 transition-all flex items-center justify-center gap-2 group cursor-pointer shrink-0"
              >
                <span>Plan my trip</span>
                <ArrowRight className="w-4 h-4 btn-icon-shift" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ========================================================
          3. EDITORIAL EXPLORE SECTION
          ======================================================== */}
      <section
        ref={discoverRef}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6E78] font-mono">
              Curated Catalog
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-editorial text-[#142A38] mt-1">
              Discover India
            </h2>
            <p className="text-sm sm:text-base text-[#66757F] mt-2 max-w-xl">
              From alpine pine valleys in Himachal to sunlit coconut groves along the Arabian Sea.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs font-bold text-[#1F6E78] hover:text-[#15525A] flex items-center gap-1 group bg-[#FFFDFC] border border-[#EBDCC7] px-4 py-2.5 rounded-xl shadow-xs"
          >
            <span>Explore all 113 destinations</span>
            <ChevronRight className="w-4 h-4 btn-icon-shift" />
          </Link>
        </div>

        {/* Asymmetric Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Editorial Feature (7 cols) */}
          {trendingDestinations.length > 0 && (
            <Link
              href={`/explore/${trendingDestinations[0].slug}`}
              className="lg:col-span-7 group relative rounded-3xl overflow-hidden border border-[#EBDCC7] min-h-[420px] flex flex-col justify-end p-8 text-white shadow-sm photo-card-hover"
            >
              <SafeImage
                src={trendingDestinations[0].hero_image}
                alt={trendingDestinations[0].name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C1820]/90 via-[#0C1820]/35 to-transparent" />
              
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-wider">
                  <span>Featured Destination</span>
                  <span>&bull;</span>
                  <span>{trendingDestinations[0].state}</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold font-editorial text-white">
                  {trendingDestinations[0].name}
                </h3>
                <p className="text-sm text-white/85 line-clamp-2 max-w-lg leading-relaxed">
                  {trendingDestinations[0].description}
                </p>
                <div className="flex items-center gap-4 pt-3 text-xs text-white/90 font-medium">
                  <span>Est. ₹{trendingDestinations[0].daily_budget.toLocaleString()}/day</span>
                  <span>&bull;</span>
                  <span>{trendingDestinations[0].ideal_duration}</span>
                </div>
              </div>
            </Link>
          )}

          {/* Curated Grid (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {trendingDestinations.slice(1, 4).map((dest) => (
              <Link
                key={dest.id}
                href={`/explore/${dest.slug}`}
                className="group bg-[#FFFDFC] rounded-2xl border border-[#EBDCC7] hover:border-[#1F6E78] p-3.5 flex gap-4 items-center transition-all shadow-xs hover:shadow-sm"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                  <SafeImage
                    src={dest.hero_image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E96E55]">
                    {dest.state}
                  </span>
                  <h4 className="text-base font-bold font-editorial text-[#142A38] group-hover:text-[#1F6E78] transition-colors truncate">
                    {dest.name}
                  </h4>
                  <p className="text-xs text-[#66757F] line-clamp-1 mt-0.5">
                    {dest.description}
                  </p>
                  <div className="text-[11px] text-[#8E9BA4] mt-2 font-medium">
                    ₹{dest.daily_budget.toLocaleString()}/day &bull; {dest.ideal_duration}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          4. TRAVEL MOOD DISCOVERY
          ======================================================== */}
      <section
        ref={stylesRef}
        className="py-18 bg-[#F5EBE1]/60 border-y border-[#EBDCC7]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6E78] font-mono">
              Explore by Landscape
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-[#142A38] mt-1">
              Travel by Mood
            </h2>
            <p className="text-xs sm:text-sm text-[#66757F] mt-2">
              Select a travel style to discover destinations with authentic Indian landscapes and heritage.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRAVEL_STYLES.map((style) => {
              const Icon = style.icon;
              return (
                <Link
                  key={style.name}
                  href={`/explore?category=${style.filter}`}
                  className="group relative h-48 rounded-2xl overflow-hidden border border-[#EBDCC7] hover:border-[#1F6E78] transition-all flex flex-col justify-end p-4 text-white shadow-xs photo-card-hover"
                >
                  <SafeImage
                    src={style.image}
                    alt={style.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C1820]/85 via-[#0C1820]/30 to-transparent" />
                  
                  <div className="relative z-10 space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="font-bold text-xs text-white font-editorial">{style.name}</div>
                    <div className="text-[10px] text-white/80">Discover</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          5. SELECTED STORIES
          ======================================================== */}
      <section
        ref={storiesRef}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E96E55] font-mono">
              Dispatches from the Road
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-editorial text-[#142A38] mt-1">
              Curated Travel Stories
            </h2>
          </div>
          <Link
            href="/stories"
            className="text-xs font-bold text-[#1F6E78] hover:text-[#15525A] flex items-center gap-1 bg-[#FFFDFC] border border-[#EBDCC7] px-4 py-2 rounded-xl shadow-xs"
          >
            <span>All stories</span>
            <ChevronRight className="w-4 h-4 btn-icon-shift" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stories.map((st) => (
            <Link
              key={st.id}
              href={`/stories/${st.slug}`}
              className="group bg-[#FFFDFC] rounded-2xl overflow-hidden border border-[#EBDCC7] hover:border-[#1F6E78] transition-all flex flex-col shadow-xs hover:shadow-sm"
            >
              <div className="relative h-44 w-full">
                <SafeImage
                  src={st.hero_image}
                  alt={st.title}
                  className="w-full h-full object-cover transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#142A38] shadow-xs">
                  {st.category}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold font-editorial text-[#142A38] group-hover:text-[#1F6E78] transition-colors line-clamp-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#66757F] line-clamp-2 mt-1 leading-relaxed">
                    {st.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EBDCC7] flex items-center justify-between text-[10px] text-[#8E9BA4] font-medium">
                  <span>{st.author}</span>
                  <span>{st.read_time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================
          6. SINGLE FINAL CALL TO ACTION
          ======================================================== */}
      <section
        ref={ctaRef}
        className="relative py-24 text-white overflow-hidden"
      >
        {/* Full-width authentic photography background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1600681978345-311667a788ad?q=80&w=2000&auto=format&fit=crop"
          alt="Emerald waters of the sacred Ganga River in Rishikesh"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C1820]/95 via-[#0C1820]/80 to-[#0C1820]/90" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D8A64B] font-mono">
            Your journey begins
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold font-editorial leading-tight text-white">
            Tell us your budget. <br />
            We build the journey.
          </h2>
          <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto leading-relaxed">
            Every connecting train, bus, stay, and curated attraction across India — calculated strictly within your total spending cap.
          </p>
          <div className="pt-2">
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-[#1F6E78]/30 transition-all cursor-pointer group"
            >
              <span>Launch Trip Planner</span>
              <ArrowRight className="w-4 h-4 btn-icon-shift" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Minimal Footer */}
      <Footer />
    </div>
  );
}
