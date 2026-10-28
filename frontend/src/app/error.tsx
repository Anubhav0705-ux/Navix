'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Compass, ShieldAlert } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { reportClientError } from '@/lib/errorReporter';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorComponent({ error, reset }: ErrorProps) {
  useEffect(() => {
    reportClientError(error, 'AppRouteError', error.digest);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7F1] text-[#142A38] selection:bg-[#1F6E78]/20 selection:text-[#1F6E78]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-20">
        <div className="w-full max-w-2xl mx-auto text-center space-y-8 animate-in fade-in duration-300">
          {/* Visual Signal Disruption Indicator */}
          <div className="relative mx-auto w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-rose-500/20 animate-ping opacity-30" />
            <div className="absolute -inset-2 rounded-full border border-dashed border-rose-300/40" />

            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white shadow-xl border border-rose-100 flex items-center justify-center text-rose-600 relative z-10">
              <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-rose-600" />
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                !
              </div>
            </div>
          </div>

          {/* Editorial Error Description */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-700 rounded-full text-xs font-bold uppercase tracking-widest border border-rose-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Transit Signal Disrupted • 500</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold font-editorial text-[#142A38] tracking-tight max-w-lg mx-auto">
              Our expedition hit an unexpected detour.
            </h1>

            <p className="text-xs sm:text-sm text-[#66757F] max-w-md mx-auto leading-relaxed">
              A temporary interruption occurred while charting this screen. The routing engine has captured diagnostic telemetry so we can restore the path.
            </p>

            {error.digest && (
              <div className="pt-1">
                <span className="inline-block px-2.5 py-1 bg-white rounded-md border border-[#EBDCC7] text-[11px] font-mono text-[#8E9BA4]">
                  Ref: {error.digest}
                </span>
              </div>
            )}
          </div>

          {/* Recovery Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
            <button
              onClick={() => reset()}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1F6E78] hover:bg-[#15525A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#1F6E78]/25 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recalculate Route (Retry)</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#F4EBE0] text-[#142A38] font-bold text-xs uppercase tracking-wider rounded-xl border border-[#EBDCC7] transition-all shadow-xs cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#1F6E78]" />
              <span>Home Base</span>
            </Link>

            <Link
              href="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#F4EBE0] text-[#142A38] font-bold text-xs uppercase tracking-wider rounded-xl border border-[#EBDCC7] transition-all shadow-xs cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#C85A32]" />
              <span>Explore</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
