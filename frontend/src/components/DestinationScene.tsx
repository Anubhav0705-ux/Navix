'use client';

import React from 'react';

export interface DestinationSceneData {
  id: string;
  name: string;
  state: string;
  tagline: string;
  image: string;
  alt: string;
  credit?: string;
}

export const CINEMATIC_SCENES: DestinationSceneData[] = [
  {
    id: 'manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    tagline: 'High Alpine Pine Ridges & Himalayan Passes',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000&auto=format&fit=crop',
    alt: 'Majestic snow-capped Himalayan peaks of Manali, Himachal Pradesh',
    credit: 'Unsplash'
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Western Coast',
    tagline: 'Sunlit Palms & Arabian Sea Shores',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2000&auto=format&fit=crop',
    alt: 'Golden sands and swaying coconut palms on the Goa coastline',
    credit: 'Unsplash'
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    tagline: 'City of Lakes & Regal Mewar Palaces',
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?q=80&w=2000&auto=format&fit=crop',
    alt: 'Historic Mewar architecture over Lake Pichola in Udaipur',
    credit: 'Unsplash'
  },
  {
    id: 'munnar',
    name: 'Munnar',
    state: 'Kerala',
    tagline: 'Emerald Mist & Rolling Western Ghats Tea Hills',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=2000&auto=format&fit=crop',
    alt: 'Verdant rolling tea plantations shrouded in morning mist in Munnar',
    credit: 'Unsplash'
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    tagline: 'Pink City Ramparts & Amber Fort Heritage',
    image: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=2000&auto=format&fit=crop',
    alt: 'Carved sandstone archways and palaces of Jaipur, Rajasthan',
    credit: 'Unsplash'
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    tagline: 'Ganga Valley & Himalayan Foothills River Sanctuary',
    image: 'https://images.unsplash.com/photo-1600681978345-311667a788ad?q=80&w=2000&auto=format&fit=crop',
    alt: 'Emerald waters of the sacred Ganga River flowing past the mountain banks of Rishikesh',
    credit: 'Unsplash'
  }
];

interface DestinationSceneProps {
  activeIndex: number;
  className?: string;
  showBadge?: boolean;
}

export const DestinationScene: React.FC<DestinationSceneProps> = ({
  activeIndex,
  className = '',
  showBadge = true
}) => {
  const safeIndex = Math.max(0, Math.min(activeIndex, CINEMATIC_SCENES.length - 1));
  const activeScene = CINEMATIC_SCENES[safeIndex];

  // Preload current and next scene images for zero-flicker transitions
  React.useEffect(() => {
    const nextIdx = (safeIndex + 1) % CINEMATIC_SCENES.length;
    const img1 = new Image();
    img1.src = activeScene.image;
    const img2 = new Image();
    img2.src = CINEMATIC_SCENES[nextIdx].image;
  }, [safeIndex, activeScene]);

  return (
    <div className={`relative overflow-hidden bg-[#0C1820] ${className}`} aria-hidden="true">
      {/* Dark Ambient Base Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0C1820] via-[#142A38] to-[#0A1118]" />

      {CINEMATIC_SCENES.map((scene, idx) => {
        const isActive = idx === safeIndex;
        return (
          <div
            key={scene.id}
            className={`absolute inset-0 transition-opacity duration-800 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image Layer */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={scene.image}
              alt={scene.alt}
              className="w-full h-full object-cover object-center transform scale-102 transition-transform duration-1000 ease-out"
              loading={idx === 0 || idx === 1 ? 'eager' : 'lazy'}
            />

            {/* Controlled Photographic Grading Overlays */}
            {/* Dark gradient for text & control legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0C1820]/85 via-[#0C1820]/45 to-[#0C1820]/90" />
            
            {/* Subtle warm tint overlay */}
            <div className="absolute inset-0 bg-[#142A38]/20 mix-blend-multiply" />
          </div>
        );
      })}

      {/* Floating Scene Badge */}
      {showBadge && (
        <div className="absolute bottom-6 right-6 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0C1820]/60 backdrop-blur-md border border-white/20 text-white/95 text-xs font-medium tracking-wide shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#1F6E78] animate-pulse" />
          <span className="font-bold">{activeScene.name}</span>
          <span className="text-white/40">&bull;</span>
          <span className="text-white/80">{activeScene.state}</span>
        </div>
      )}
    </div>
  );
};
