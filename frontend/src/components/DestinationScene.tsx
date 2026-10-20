'use client';

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function subscribeReducedMotion(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface DestinationSceneData {
  id: string;
  name: string;
  state: string;
  tagline: string;
  image: string;
  alt: string;
  credit?: string;
  objectPosition?: string;
}

/**
 * All eight user-supplied authentic destination photographs from /public/home/
 * Sequence: Goa → Manali → Udaipur → Varanasi → Rishikesh → Kerala → Jaipur → Mumbai
 * Note: kerela.webp is preserved as requested by the user.
 */
export const CINEMATIC_SCENES: DestinationSceneData[] = [
  {
    id: 'goa',
    name: 'Goa',
    state: 'Western Coast',
    tagline: 'Sunlit Palms & Arabian Sea Shores',
    image: '/home/goa.webp',
    alt: 'Golden sands and swaying coconut palms on the Goa coastline',
    credit: 'NAVIX Authentic Collection',
    objectPosition: 'center 40%'
  },
  {
    id: 'manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    tagline: 'High Alpine Pine Ridges & Himalayan Passes',
    image: '/home/manali.webp',
    alt: 'Majestic snow-capped Himalayan peaks of Manali, Himachal Pradesh',
    credit: 'NAVIX Authentic Collection',
    objectPosition: 'center 45%'
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    tagline: 'City of Lakes & Regal Mewar Palaces',
    image: '/home/udaipur.webp',
    alt: 'Historic Mewar architecture over Lake Pichola in Udaipur',
    credit: 'NAVIX Authentic Collection',
    objectPosition: 'center 50%'
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    tagline: 'Ancient Sacred Riverfront Ghats & Ganga Aarti',
    image: '/home/varanasi.webp',
    alt: 'Historic Ganga riverfront steps and morning mist in Varanasi',
    credit: 'NAVIX Authentic Collection',
    objectPosition: 'center 45%'
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    tagline: 'Ganga Valley & Himalayan Foothills River Sanctuary',
    image: '/home/rishikesh.webp',
    alt: 'Emerald waters of the sacred Ganga River flowing past the mountain banks of Rishikesh',
    credit: 'NAVIX Authentic Collection',
    objectPosition: 'center 50%'
  },
  {
    id: 'kerala',
    name: 'Kerala',
    state: 'South India',
    tagline: 'Emerald Backwaters & Verdant Spice Hills',
    image: '/home/kerela.webp',
    alt: 'Peaceful palm-fringed backwaters and tranquil waterways of Kerala',
    credit: 'NAVIX Authentic Collection',
    objectPosition: 'center 50%'
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    tagline: 'Pink City Ramparts & Amber Fort Heritage',
    image: '/home/jaipur.webp',
    alt: 'Carved sandstone archways and royal heritage of Jaipur, Rajasthan',
    credit: 'NAVIX Authentic Collection',
    objectPosition: 'center 45%'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    tagline: 'Coastal Metropolis & Gateway of India',
    image: '/home/mumbai.webp',
    alt: 'Historic colonial architecture and Arabian Sea breeze of Mumbai',
    credit: 'NAVIX Authentic Collection',
    objectPosition: 'center 50%'
  }
];

interface DestinationSceneProps {
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
  showBadge?: boolean;
  showControls?: boolean;
  autoplayInterval?: number; // default: 5500ms (5.5s)
}

export const DestinationScene: React.FC<DestinationSceneProps> = ({
  activeIndex: controlledIndex,
  onIndexChange,
  className = '',
  showBadge = true,
  showControls = true,
  autoplayInterval = 5500
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const isControlled = controlledIndex !== undefined;
  const currentIndex = isControlled ? controlledIndex : internalIndex;

  const [isPaused, setIsPaused] = useState(false);
  const isReducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false);

  // Touch tracking for mobile swipe navigation
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Update active index safely
  const setIndex = useCallback(
    (nextIdx: number) => {
      const count = CINEMATIC_SCENES.length;
      const normalized = ((nextIdx % count) + count) % count;
      if (isControlled && onIndexChange) {
        onIndexChange(normalized);
      } else {
        setInternalIndex(normalized);
      }
    },
    [isControlled, onIndexChange]
  );

  const handleNext = useCallback(() => {
    setIndex(currentIndex + 1);
  }, [currentIndex, setIndex]);

  const handlePrev = useCallback(() => {
    setIndex(currentIndex - 1);
  }, [currentIndex, setIndex]);

  // Autoplay management: pauses on hover, tab blur, or reduced motion
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      handleNext();
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, autoplayInterval, handleNext]);

  // Preload next 2 photographs for seamless sliding
  useEffect(() => {
    const nextIdx1 = (currentIndex + 1) % CINEMATIC_SCENES.length;
    const nextIdx2 = (currentIndex + 2) % CINEMATIC_SCENES.length;
    [nextIdx1, nextIdx2].forEach((idx) => {
      const img = new Image();
      img.src = CINEMATIC_SCENES[idx].image;
    });
  }, [currentIndex]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      handleNext(); // swipe left -> go next
    } else if (distance < -minSwipeDistance) {
      handlePrev(); // swipe right -> go prev
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const activeScene = CINEMATIC_SCENES[currentIndex] || CINEMATIC_SCENES[0];
  const slideFraction = 100 / CINEMATIC_SCENES.length;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0
      }}
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Destination showcase background carousel"
    >
      {/* Horizontal Continuous Sliding Track */}
      <div
        className="flex h-full will-change-transform"
        style={{
          width: `${CINEMATIC_SCENES.length * 100}%`,
          height: '100%',
          transform: `translateX(-${(currentIndex * 100) / CINEMATIC_SCENES.length}%)`,
          transition: isReducedMotion ? 'none' : 'transform 800ms cubic-bezier(0.25, 1, 0.5, 1)'
        }}
      >
        {CINEMATIC_SCENES.map((scene, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={scene.id}
              data-scene-id={scene.id}
              data-active={isActive ? 'true' : 'false'}
              className="h-full relative shrink-0 overflow-hidden"
              style={{
                width: `${slideFraction}%`,
                height: '100%',
                position: 'relative'
              }}
            >
              {/* Destination Photograph */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={scene.image}
                alt={scene.alt}
                id={isActive ? 'hero-scene-image' : undefined}
                data-hero-scene={scene.id}
                className="w-full h-full object-cover transform scale-100"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: scene.objectPosition || 'center'
                }}
                loading={idx === 0 ? 'eager' : 'lazy'}
                fetchPriority={idx === 0 ? 'high' : 'auto'}
              />

              {/* Scrim Gradients directly inside each slide:
                  1. Soft horizontal gradient on left for crisp text contrast
                  2. Subtle top/bottom vignette to integrate smoothly with navbar and composer
                  3. ZERO 100% blacked-out masks — reveals vibrant landscape detail */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#0C1820]/90 via-[#0C1820]/45 to-transparent/15 pointer-events-none"
                style={{ position: 'absolute', inset: 0 }}
              />
              <div
                className="absolute inset-0 bg-gradient-to-b from-[#0C1820]/55 via-transparent to-[#0C1820]/85 pointer-events-none"
                style={{ position: 'absolute', inset: 0 }}
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {showControls && (
        <div className="absolute inset-y-0 left-0 right-0 z-30 pointer-events-none hidden sm:flex items-center justify-between px-3 sm:px-6">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous destination"
            className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-[#0C1820]/50 hover:bg-[#0C1820]/80 text-white/90 hover:text-white backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next destination"
            className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-[#0C1820]/50 hover:bg-[#0C1820]/80 text-white/90 hover:text-white backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      )}

      {/* Floating Scene Identification Badge */}
      {showBadge && (
        <div className="absolute bottom-6 right-6 z-20 hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0C1820]/60 backdrop-blur-md border border-white/20 text-white/95 text-xs font-medium tracking-wide shadow-xl pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#1F6E78] animate-pulse" />
          <span className="font-bold text-white">{activeScene.name}</span>
          <span className="text-white/40">&bull;</span>
          <span className="text-white/80">{activeScene.state}</span>
        </div>
      )}
    </div>
  );
};
