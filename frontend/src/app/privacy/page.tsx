'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Database, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7F1] text-[#142A38] selection:bg-[#1F6E78]/20 selection:text-[#1F6E78]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-xs text-[#8E9BA4]">
          <Link href="/" className="hover:text-[#1F6E78] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-[#142A38] font-bold">Privacy Policy</span>
        </div>

        {/* Hero Header */}
        <div className="space-y-4 pb-8 border-b border-[#EBDCC7]">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1F6E78]/10 text-[#1F6E78] rounded-full text-xs font-bold uppercase tracking-widest border border-[#1F6E78]/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy & Data Protection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-editorial text-[#142A38] tracking-tight">
            NAVIX Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-[#66757F] leading-relaxed max-w-2xl">
            This policy outlines how NAVIX handles user accounts, saved itineraries, telemetry, and security logs. We believe in strict data minimization and transparent engineering.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8E9BA4] pt-2">
            <span>Last Updated: October 22, 2026</span>
            <span>•</span>
            <span>Version: 2.1 (Release Hardening)</span>
            <span>•</span>
            <span>Status: Academic & Demonstration Platform</span>
          </div>
        </div>

        {/* Policy Body */}
        <div className="py-10 space-y-10 text-sm leading-relaxed text-[#4A5568]">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">1</span>
              About NAVIX & Platform Scope
            </h2>
            <p>
              NAVIX is an algorithmic, budget-first multi-modal journey planner tailored for travelers exploring India, with an emphasis on Tier-2 and Tier-3 connectivity. NAVIX operates currently as an advanced engineering demonstration and university capstone project. NAVIX is not a licensed commercial travel agency and does not process payments or ticket bookings directly.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">2</span>
              Information We Collect
            </h2>
            <p>
              We collect only the minimum data required to authenticate accounts, plan journeys, and safeguard application stability:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Credentials:</strong> Full name, email address, and one-way cryptographic password hashes. Plaintext passwords are never stored.
              </li>
              <li>
                <strong>Travel Preferences & Saved Trips:</strong> Origin, destination, dates, budget bounds, selected transport legs, accommodation nodes, and daily itineraries explicitly saved to your profile.
              </li>
              <li>
                <strong>Temporary Recovery Requests:</strong> When requesting an administrator-assisted password reset, timestamp and request status are recorded until completed or expired.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">3</span>
              First-Party, Privacy-Preserving Analytics
            </h2>
            <p>
              NAVIX <strong>does not use Google Analytics, Meta Pixel, Mixpanel, or third-party behavioral trackers</strong>.
            </p>
            <p>
              We maintain a lightweight, first-party telemetry system that tracks non-identifying product events (e.g., page views, destination searches, planner starts, and completion rates). These events are keyed only to a random, client-generated anonymous session token stored in your browser session storage. They do not store user identifiers, IP addresses, form passwords, or sensitive itinerary text.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">4</span>
              Security Logging & Request Correlation
            </h2>
            <p>
              To maintain system uptime, detect abuse, and prevent brute-force attacks, our backend servers record operational diagnostic entries:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Timestamp, HTTP method, and route endpoint</li>
              <li>HTTP status code and processing duration</li>
              <li>Cryptographic correlation token (<code>X-Request-ID</code>)</li>
            </ul>
            <p>
              All server logs pass through automated redaction filters that scrub passwords, JWT tokens, cookies, and database credentials before emission.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">5</span>
              Cookies & Local Storage
            </h2>
            <p>
              NAVIX utilizes browser storage strictly for functional application state:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><code>navix_access_token</code>: Authenticated session JSON Web Token (JWT).</li>
              <li><code>navix_user</code>: Basic profile cache for immediate navigation feedback.</li>
              <li><code>navix_anon_session_id</code>: Ephemeral anonymous session identifier for privacy-safe event counts.</li>
            </ul>
            <p>We do not serve advertising cookies or third-party tracking scripts.</p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">6</span>
              Account Deletion & Backup Retention
            </h2>
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2 text-amber-900">
              <div className="font-bold flex items-center gap-1.5">
                <Database className="w-4 h-4 text-amber-700" />
                <span>Transparent Backup Lifecycle Notice</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-800">
                You may permanently delete your account at any time via <strong>Account Settings → Delete Account</strong>. When confirmed, all your user records, saved trips, segments, and allocations are immediately and transactionally deleted from the active primary database.
              </p>
              <p className="text-xs leading-relaxed text-amber-800">
                Because NAVIX maintains encrypted database snapshots for disaster recovery, historical backup archives retain records until normal backup expiration (typically 7 to 14 days), after which they are permanently overwritten. We do not claim instantaneous purge from immutable historical backup files.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">7</span>
              Third-Party Data Providers & Maps
            </h2>
            <p>
              NAVIX coordinates data from reputable sources to display maps, photos, and transit data:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>OpenStreetMap:</strong> Map tiles rendered via Leaflet GIS under ODbL.</li>
              <li><strong>Wikimedia Commons:</strong> Verified historical and cultural landmark photography under Creative Commons.</li>
              <li><strong>Unsplash API:</strong> Destination scenery photos served via secured server proxies.</li>
            </ul>
            <p>
              External service API secrets are strictly held on server backends and are never exposed to browser bundles.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">8</span>
              Contact & Project Inquiry
            </h2>
            <p>
              For questions regarding this privacy policy or to submit a data inquiry, please contact the development team at:
            </p>
            <div className="p-4 bg-white rounded-xl border border-[#EBDCC7] inline-block font-mono text-xs text-[#142A38]">
              privacy@navix.internal • Anubhav Verma (Project Lead)
            </div>
            <p className="text-xs text-[#8E9BA4] pt-2">
              <em>Note for Production Deployment: Commercial deployment of NAVIX should undergo formal jurisdiction-specific legal review.</em>
            </p>
          </section>
        </div>

        {/* Bottom Back Button */}
        <div className="pt-8 border-t border-[#EBDCC7] flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F6E78] hover:text-[#15525A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/terms"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#66757F] hover:text-[#142A38] transition-colors"
          >
            <span>Read Terms of Service →</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
