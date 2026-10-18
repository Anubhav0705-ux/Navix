'use client';

import React, { useState } from 'react';
import { Compass } from 'lucide-react';
import { sanitizeImageUrl, resolveFallbackImage } from '@/lib/mediaResolver';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  category?: string;
}

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
  const [fallbackFailed, setFallbackFailed] = useState(false);

  // 1. Sanitize any legacy 404 URLs
  const cleanSrc = typeof src === 'string' ? sanitizeImageUrl(src) : (src as string | undefined);

  // 2. Determine effective fallback image if primary is missing or errored
  const effectiveFallback = fallbackSrc || resolveFallbackImage(category, alt);

  // If both primary and fallback failed, show a subtle warm editorial texture
  if (fallbackFailed || (!cleanSrc && !effectiveFallback)) {
    return (
      <div
        className={`relative overflow-hidden bg-[#F5EBE1] border border-[#EBDCC7] flex items-center justify-center text-[#8E9BA4] p-4 text-center ${className}`}
        aria-label={alt}
      >
        <span className="text-[11px] font-sans font-medium text-[#142A38]/50 tracking-wider">
          {alt || 'NAVIX Travel'}
        </span>
      </div>
    );
  }

  // If primary errored or missing, smoothly render the authentic fallback photo
  if (hasError || !cleanSrc) {
    return (
      <div className={`relative overflow-hidden bg-[#F5EBE1] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={effectiveFallback}
          alt={alt}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={() => setFallbackFailed(true)}
          {...props}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#F5EBE1] ${className}`}>
      {/* Subtle loader while image loads */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#F5EBE1] animate-pulse flex items-center justify-center">
          <Compass className="w-5 h-5 text-[#8E9BA4] animate-spin" />
        </div>
      )}

      {/* Primary Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cleanSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        {...props}
      />
    </div>
  );
};
