'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function TermsOfServicePage() {
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
          <span className="text-[#142A38] font-bold">Terms of Service</span>
        </div>

        {/* Hero Header */}
        <div className="space-y-4 pb-8 border-b border-[#EBDCC7]">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C85A32]/10 text-[#C85A32] rounded-full text-xs font-bold uppercase tracking-widest border border-[#C85A32]/20">
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Agreement</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-editorial text-[#142A38] tracking-tight">
            NAVIX Terms of Service
          </h1>

          <p className="text-sm sm:text-base text-[#66757F] leading-relaxed max-w-2xl">
            Please read these terms carefully before utilizing the NAVIX travel planning platform. These terms define the parameters of our service, data accuracy disclaimers, and user responsibilities.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8E9BA4] pt-2">
            <span>Last Updated: October 22, 2026</span>
            <span>•</span>
            <span>Platform Status: Engineering Demonstration</span>
          </div>
        </div>

        {/* Notice Card: Non-Agency Clarification */}
        <div className="mt-8 p-5 bg-[#F4EFEA] border border-[#EBDCC7] rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1F6E78] text-white flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 text-xs text-[#66757F]">
            <h2 className="font-bold text-sm text-[#142A38]">Important Service Nature & Booking Clarification</h2>
            <p className="leading-relaxed">
              NAVIX is an algorithmic route optimization research application. <strong>NAVIX is not a travel agency, ticket broker, or transportation provider.</strong> We do not issue tickets, confirm reservations, or take financial payments. Users must execute actual bookings directly with official operators (such as Indian Railways/IRCTC, state road transport corporations, and airlines).
            </p>
          </div>
        </div>

        {/* Terms Body */}
        <div className="py-10 space-y-10 text-sm leading-relaxed text-[#4A5568]">
          {/* Section 1 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">1</span>
              Platform Purpose & Algorithmic Budget Modeling
            </h3>
            <p>
              NAVIX provides multi-modal route search and trip budget allocation based on deterministic graph algorithms (A* routing and constrained budget allocation).
            </p>
            <div className="p-3 bg-white border border-[#EBDCC7] rounded-xl font-mono text-xs text-[#1F6E78] font-bold">
              Total Modeled Itinerary Cost ≤ User Specified Maximum Budget Cap
            </div>
            <p>
              <strong>Mathematical Model Feasibility vs. Real-World Expenditure:</strong> The algorithmic constraint guarantees only that the internal mathematical optimization model strictly bounds the sum of estimated line items (transport segments, accommodations, meals, entry fees, and contingency buffers) to remain within your chosen ceiling based on ingested catalog data.
            </p>
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
              <strong>No Real-World Expenditure Guarantee:</strong> NAVIX does not guarantee that your actual out-of-pocket costs will match or remain below calculated estimates. Real-world fares, seasonal accommodation tariffs, fuel surcharges, dining expenses, local transit fees, taxes, and operator pricing fluctuate continuously. Users must verify live prices directly with carriers and lodging providers prior to booking.
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">2</span>
              Timetable, Fare & Availability Disclaimers
            </h3>
            <p>
              While NAVIX utilizes authoritative transit models, open transport feeds (GTFS/Transitland), and curated destination catalogs, <strong>fares, seat availability, timetables, and room prices fluctuate dynamically in the real world</strong>.
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Timetables and schedules may be derived from seasonal cached feeds or demonstration datasets.</li>
              <li>Hotel tariffs and food estimates are based on typical regional averages and price indices.</li>
              <li>NAVIX does not guarantee that carrier seats, train berths, or hotel rooms will be available at the estimated rate upon your booking attempt.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">3</span>
              Acceptable Use & Anti-Abuse Rules
            </h3>
            <p>By using NAVIX, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Execute automated scraping, scraping loops, or denial-of-service attempts against routing endpoints.</li>
              <li>Attempt to bypass rate limiting, honeypot protections, or authorization controls.</li>
              <li>Access or mutate another user&apos;s saved itineraries or traveler profiles (IDOR violations).</li>
              <li>Submit malicious payloads, injection strings, or corrupted JSON data.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">4</span>
              User Accounts & Security Responsibilities
            </h3>
            <p>
              Users are responsible for maintaining the confidentiality of their account credentials. If you suspect unauthorized access, you must change your password immediately or request an administrator-assisted reset. You can permanently delete your account and associated trip records at any time.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">5</span>
              Limitation of Liability
            </h3>
            <p>
              To the fullest extent permitted by applicable law, NAVIX and its project contributors shall not be liable for any missed departures, transport cancellations, pricing discrepancies, personal injury, accommodation issues, or travel delays resulting from reliance on itineraries generated by the platform. Travelers must independently verify travel documents, transit alerts, and weather advisories before commencement of travel.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-editorial text-[#142A38] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1F6E78]/15 text-[#1F6E78] text-xs font-mono flex items-center justify-center">6</span>
              Changes to Terms & Service Contact
            </h3>
            <p>
              We reserve the right to modify these terms as the platform evolves. Inquiries regarding platform terms or academic review may be directed to:
            </p>
            <div className="p-4 bg-white rounded-xl border border-[#EBDCC7] inline-block font-mono text-xs text-[#142A38]">
              legal-inquiry@navix.internal • Anubhav Verma (Project Lead)
            </div>
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="pt-8 border-t border-[#EBDCC7] flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F6E78] hover:text-[#15525A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#66757F] hover:text-[#142A38] transition-colors"
          >
            <span>Review Privacy Policy →</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
