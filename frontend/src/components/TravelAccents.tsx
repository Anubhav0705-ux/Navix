'use client';

import React from 'react';

interface PassportStampProps {
  city?: string;
  code?: string;
  date?: string;
  color?: 'teal' | 'terracotta' | 'gold' | 'ink';
  rotation?: number;
  className?: string;
}

/**
 * Authentic vintage passport stamp accent.
 * Gives an editorial, field-journal aesthetic with subtle opacity.
 */
export const PassportStamp: React.FC<PassportStampProps> = ({
  city = 'BHARAT',
  code = 'NAVIX',
  date = '2026',
  color = 'teal',
  rotation = -8,
  className = '',
}) => {
  const colorMap = {
    teal: 'border-[#1F6E78] text-[#1F6E78]',
    terracotta: 'border-[#E96E55] text-[#E96E55]',
    gold: 'border-[#D8A64B] text-[#D8A64B]',
    ink: 'border-[#142A38] text-[#142A38]',
  };

  const selectedColor = colorMap[color] || colorMap.teal;

  return (
    <div
      className={`inline-flex flex-col items-center justify-center p-2 rounded-full border-2 border-dashed select-none pointer-events-none transition-transform duration-300 ${selectedColor} ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      <div className="w-20 h-20 rounded-full border border-current flex flex-col items-center justify-center p-1 text-center">
        <span className="text-[8px] font-mono font-bold tracking-widest uppercase opacity-80">
          {code}
        </span>
        <span className="text-[11px] font-black font-editorial uppercase tracking-wider my-0.5">
          {city}
        </span>
        <div className="flex items-center gap-1 opacity-75">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="text-[8px] font-mono font-semibold">{date}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        </div>
      </div>
    </div>
  );
};

/**
 * Dotted route trajectory curve with travel origin and destination nodes.
 */
export const DottedRouteAccent: React.FC<{
  className?: string;
  variant?: 'curve-up' | 'curve-down' | 's-curve';
  color?: string;
}> = ({ className = '', variant = 'curve-up', color = '#1F6E78' }) => {
  let pathD = 'M 10 70 Q 140 10, 290 50';
  if (variant === 'curve-down') {
    pathD = 'M 10 20 Q 150 90, 290 30';
  } else if (variant === 's-curve') {
    pathD = 'M 10 50 C 90 10, 200 90, 290 50';
  }

  return (
    <svg
      className={`pointer-events-none select-none opacity-25 ${className}`}
      width="300"
      height="100"
      viewBox="0 0 300 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={pathD}
        stroke={color}
        strokeWidth="1.75"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />
      <circle cx="10" cy={variant === 'curve-down' ? 20 : 50} r="3.5" fill={color} />
      <circle cx="290" cy={variant === 'curve-down' ? 30 : 50} r="3.5" fill="#E96E55" />
    </svg>
  );
};

/**
 * Vintage Postage Stamp snippet with perforated edges.
 */
export const PostageStampSnippet: React.FC<{
  label?: string;
  sublabel?: string;
  price?: string;
  rotation?: number;
  className?: string;
}> = ({
  label = 'BHARAT',
  sublabel = 'TRANSIT',
  price = '₹25',
  rotation = 6,
  className = '',
}) => {
  return (
    <div
      className={`inline-block select-none pointer-events-none transition-transform duration-300 ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      <div className="bg-[#FFFDFC] border-2 border-dashed border-[#D5C6B5] p-2.5 rounded-lg shadow-sm w-20 text-center">
        <div className="border border-[#E8DAC8] p-1.5 rounded bg-[#FAF6F0]">
          <div className="text-[7px] font-mono font-bold tracking-widest text-[#66757F] uppercase">
            {label}
          </div>
          <div className="text-[9px] font-editorial font-bold text-[#142A38] uppercase">
            {sublabel}
          </div>
          <div className="text-[10px] font-mono font-bold text-[#E96E55] mt-0.5">
            {price}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Elegant typographic geographic coordinates tag.
 */
export const CoordinatesTag: React.FC<{
  lat?: string;
  lng?: string;
  location?: string;
  className?: string;
}> = ({
  lat = '28.6139° N',
  lng = '77.2090° E',
  location = 'INDIA CORRIDOR',
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EBE1]/70 border border-[#EBDCC7] text-[10px] font-mono text-[#66757F] select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#1F6E78]" />
      <span className="font-semibold text-[#142A38]">{location}</span>
      <span>&bull;</span>
      <span>{lat}, {lng}</span>
    </div>
  );
};

/**
 * Line-art compass rose background ornament.
 */
export const CompassRoseFragment: React.FC<{
  size?: number;
  opacity?: number;
  className?: string;
}> = ({ size = 120, opacity = 0.12, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle cx="50" cy="50" r="46" stroke="#1F6E78" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="50" cy="50" r="38" stroke="#1F6E78" strokeWidth="0.75" />
      {/* 4 Cardinal points */}
      <polygon points="50,6 54,46 50,42 46,46" fill="#1F6E78" />
      <polygon points="50,94 54,54 50,58 46,54" fill="#142A38" />
      <polygon points="6,50 46,46 42,50 46,54" fill="#142A38" />
      <polygon points="94,50 54,46 58,50 54,54" fill="#1F6E78" />
      {/* Center ring */}
      <circle cx="50" cy="50" r="4" fill="#D8A64B" />
      <text x="50" y="2" textAnchor="middle" fontSize="6" fill="#1F6E78" fontWeight="bold" fontFamily="monospace">N</text>
    </svg>
  );
};

/**
 * Realistic washi tape strip accent for cards or paper snippets.
 */
export const WashiTapeAccent: React.FC<{
  className?: string;
  width?: string;
  rotation?: number;
}> = ({ className = '', width = 'w-16', rotation = -3 }) => {
  return (
    <div
      className={`h-4.5 ${width} bg-[#E2D2BE]/50 backdrop-blur-xs border-y border-white/40 shadow-xs pointer-events-none select-none ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    />
  );
};
