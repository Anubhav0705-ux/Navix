'use client';

import React, { useState, useEffect } from 'react';
import { Compass, Wallet, Navigation, X, ArrowRight, Check } from 'lucide-react';

interface OnboardingModalProps {
  forceShow?: boolean;
  onClose?: () => void;
}

const ONBOARDING_KEY = 'navix_onboarding_completed';

const STEPS = [
  {
    step: 1,
    title: 'Choose Your Destination',
    subtitle: '113+ Flagship Destinations Across India',
    description: 'Browse verified high-resolution photography, cultural highlights, authentic local cuisine, and vetted stays across coastal, mountain, and heritage corridors.',
    icon: Compass,
    badge: 'Step 1 of 3'
  },
  {
    step: 2,
    title: 'Set a Hard Budget Ceiling',
    subtitle: 'Mathematical Guarantee: Total Trip Cost ≤ Your Budget',
    description: 'Set your exact spending limit. NAVIX applies constrained optimization across transport, stays, meals, activities, and contingency buffers without ever overspending.',
    icon: Wallet,
    badge: 'Step 2 of 3'
  },
  {
    step: 3,
    title: 'Algorithmic Multimodal Routing',
    subtitle: 'Deterministic Layovers & Transfers',
    description: 'Our A* route engine coordinates trains, buses, and local connections with verified station transfer buffers so you never miss a connection in tier-2 and tier-3 hubs.',
    icon: Navigation,
    badge: 'Step 3 of 3'
  }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ forceShow = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceShow || (typeof window !== 'undefined' && window.location.search.includes('showTour=true'))) {
      setIsOpen(true);
      return;
    }
    try {
      const completed = localStorage.getItem(ONBOARDING_KEY);
      if (!completed) {
        // Show after a brief delay on first visit so page loads gracefully
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [forceShow]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {}
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  if (!isOpen) return null;

  const active = STEPS[currentStep];
  const IconComponent = active.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EBDCC7] overflow-hidden text-[#142A38] animate-in zoom-in-95 duration-200 relative"
      >
        {/* Top Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-[#F4EBE0]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1F6E78] bg-[#1F6E78]/10 px-3 py-1 rounded-full">
            {active.badge}
          </span>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8E9BA4] hover:text-[#142A38] hover:bg-[#FBF7F1] transition-colors cursor-pointer"
            aria-label="Skip onboarding"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#1F6E78]/10 text-[#1F6E78] border border-[#1F6E78]/20 flex items-center justify-center mx-auto shadow-xs">
            <IconComponent className="w-8 h-8" />
          </div>

          <div className="text-center space-y-2">
            <h2 id="onboarding-title" className="text-2xl font-bold font-editorial text-[#142A38]">
              {active.title}
            </h2>
            <p className="text-xs font-bold text-[#1F6E78]">
              {active.subtitle}
            </p>
            <p className="text-xs sm:text-sm text-[#66757F] leading-relaxed pt-1">
              {active.description}
            </p>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStep ? 'w-8 bg-[#1F6E78]' : 'w-2 bg-[#EBDCC7] hover:bg-[#8E9BA4]'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 bg-[#FBF7F1] border-t border-[#F4EBE0] flex items-center justify-between gap-3">
          <button
            onClick={handleDismiss}
            className="text-xs font-bold text-[#8E9BA4] hover:text-[#142A38] py-2 px-3 rounded-lg transition-colors cursor-pointer"
          >
            Skip Tour
          </button>

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
          >
            {currentStep < STEPS.length - 1 ? (
              <>
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Start Exploring</span>
                <Check className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
