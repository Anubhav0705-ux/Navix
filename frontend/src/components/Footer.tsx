import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <Logo light />
            <p className="text-sm text-slate-400 max-w-md">
              NAVIX solves multi-modal travel routing starting from Tier-2 and Tier-3 Indian cities subject to a strict total trip budget constraint.
            </p>
            <div className="inline-block px-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-400 font-mono">
              Academic Project &bull; Demo Transit Dataset
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">System Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/plan" className="hover:text-emerald-400 transition-smooth">Planner Wizard</a></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-smooth">How It Works</a></li>
              <li><a href="#example-journey" className="hover:text-emerald-400 transition-smooth">Sangli &rarr; Old Manali Demo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Core Algorithms</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-slate-400">Time-Dependent A* Search</li>
              <li className="text-slate-400">Layover Validation Engine</li>
              <li className="text-slate-400">Constrained DP Budget Optimizer</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} NAVIX. All rights reserved.</p>
          <p>Your budget. One complete journey.</p>
        </div>
      </div>
    </footer>
  );
};
