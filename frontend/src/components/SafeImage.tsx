'use client';

import React, { useState } from 'react';
import { Compass, ImageOff } from 'lucide-react';

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

  // If explicit fallbackSrc provided, use it, otherwise show intentional neutral UI
  if (hasError || !src) {
    if (fallbackSrc) {
      return (
        <div className={`relative overflow-hidden bg-[#F5EBE1] ${className}`}>
          <img
            src={fallbackSrc}
            alt={alt}
            className="w-full h-full object-cover"
            {...props}
          />
        </div>
      );
    }
    return (
      <div
        className={`relative overflow-hidden bg-[#F5EBE1] border border-[#EBDCC7] flex flex-col items-center justify-center text-[#8E9BA4] p-4 text-center ${className}`}
        aria-label={`${alt} - Photo unavailable`}
      >
        <ImageOff className="w-6 h-6 mb-1 text-[#8E9BA4]/80 stroke-[1.5]" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#66757F]/80">
          Photo unavailable
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#F5EBE1] ${className}`}>
      {/* Skeleton loader until loaded */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#F5EBE1] animate-pulse flex items-center justify-center">
          <Compass className="w-5 h-5 text-[#8E9BA4] animate-spin" />
        </div>
      )}

      {/* Primary Image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        {...props}
      />
    </div>
  );
};
