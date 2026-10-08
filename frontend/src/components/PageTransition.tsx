'use client';

import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

const LOADING_MESSAGES = [
  'Finding the way...',
  'Checking connections...',
  'Making the budget work...'
];

export const PageTransition: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    // Quickly rotate loading text messages
    const msgInterval = setInterval(() => {
      setMsgIdx((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 350);

    // Unblock page after brief load experience (900ms)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 950);

    return () => {
      clearInterval(msgInterval);
      clearTimeout(timer);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#101419] text-white flex flex-col items-center justify-center p-4 transition-opacity duration-300">
      <div className="space-y-6 text-center max-w-sm">
        {/* Animated Brand Symbol */}
        <div className="w-14 h-14 rounded-full bg-[#0FA77A]/10 border border-[#0FA77A]/30 flex items-center justify-center mx-auto text-[#0FA77A] animate-pulse">
          <Compass className="w-7 h-7" />
        </div>

        {/* Animated Route Line Visual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#D8CBB8] px-2">
            <span>SANGLI</span>
            <span className="text-[#0FA77A]">MIRAJ</span>
            <span>DELHI</span>
            <span className="text-[#4D7CFE]">MANALI</span>
          </div>
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto relative">
            <div className="h-full bg-gradient-to-r from-[#0FA77A] via-[#4D7CFE] to-[#FF6B5D] w-full animate-route-draw" />
          </div>
        </div>

        {/* Text transition */}
        <p className="text-xs font-mono text-[#0FA77A] tracking-wider uppercase animate-pulse">
          {LOADING_MESSAGES[msgIdx]}
        </p>
      </div>
    </div>
  );
};
