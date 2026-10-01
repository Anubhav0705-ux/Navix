import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFFFFF] text-[#667085] border-t border-[#E7E5E0] pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <Logo light={false} />
            <p className="text-sm text-[#667085] max-w-md">
              NAVIX solves multi-modal travel routing starting from Tier-2 and Tier-3 Indian cities subject to a strict total trip budget constraint.
            </p>
            <div className="inline-block px-3 py-1 bg-[#F7F5F0] border border-[#E7E5E0] rounded-md text-xs text-[#667085] font-mono">
              Academic Project &bull; Algorithmic Multi-Modal Engine
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#0B1320] uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/plan" className="hover:text-[#0B1320] transition-smooth">Planner</a></li>
              <li><a href="#how-it-works" className="hover:text-[#0B1320] transition-smooth">How it Works</a></li>
              <li><a href="#example-journey" className="hover:text-[#0B1320] transition-smooth">Sangli &rarr; Old Manali Demo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#0B1320] uppercase tracking-wider mb-3">Algorithms</h4>
            <ul className="space-y-2 text-sm text-[#667085]">
              <li>Time-Dependent A* Search</li>
              <li>Layover Validation Engine</li>
              <li>Constrained DP Budget Optimizer</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E7E5E0] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#667085] gap-4">
          <p>&copy; {new Date().getFullYear()} NAVIX. All rights reserved.</p>
          <p className="italic font-serif-emphasis text-[#0B1320]">Your budget. One complete journey.</p>
        </div>
      </div>
    </footer>
  );
};
