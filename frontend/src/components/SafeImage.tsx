'use client';

import React, { useState } from 'react';
import { Compass } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  category?: string;
}

const DEFAULT_FALLBACKS: Record<string, string> = {
  Mountains: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
  Beach: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop',
  Heritage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop',
  Nature: 'https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=1200&auto=format&fit=crop',
  City: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop'
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Travel Image',
  fallbackSrc,
  category,
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const fallback = fallbackSrc || (category ? DEFAULT_FALLBACKS[category] || DEFAULT_FALLBACKS.default : DEFAULT_FALLBACKS.default);
  const currentSrc = hasError || !src ? fallback : src;

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
      {/* Skeleton loader until loaded */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center">
          <Compass className="w-6 h-6 text-stone-400 animate-spin" />
        </div>
      )}
      
      {/* Image */}
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setIsLoaded(true);
          }
        }}
        {...props}
      />
    </div>
  );
};
