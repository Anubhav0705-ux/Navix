'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { reportClientError } from '@/lib/errorReporter';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalRootError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    reportClientError(error, 'RootLayoutError', error.digest);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FBF7F1] text-[#142A38] font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-lg mx-auto text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#EBDCC7] shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142A38] tracking-tight">
              Application Signal Interrupted
            </h1>
            <p className="text-xs sm:text-sm text-[#66757F] leading-relaxed">
              NAVIX encountered an unexpected system fault during initialization. A recovery attempt can be triggered below.
            </p>
            {error.digest && (
              <p className="text-[11px] font-mono text-[#8E9BA4]">Reference: {error.digest}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => reset()}
              type="button"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1F6E78] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#15525A] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Session</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#F4EBE0] text-[#142A38] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#EBDCC7] transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Home Base</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
