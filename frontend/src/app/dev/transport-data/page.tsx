'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Train, Bus, Plane, ShieldCheck, Database, RefreshCw, Layers, ArrowRight, AlertTriangle, Info } from 'lucide-react';

interface CallingPoint {
  id: string;
  facility_id?: string;
  stop_name: string;
  provider_stop_code: string;
  stop_sequence: number;
  arrival_time: string;
  departure_time: string;
  day_offset: number;
}

interface TransportFare {
  id: string;
  origin_facility_id?: string;
  destination_facility_id?: string;
  fare_class: string;
  fare_status?: string;
  amount: number | null;
  currency: string;
  is_estimated: boolean;
  data_source?: string;
}

interface TransportService {
  id: string;
  provider_id: string;
  provider_name: string;
  service_code: string;
  service_name: string;
  transport_mode: 'RAIL' | 'BUS' | 'FLIGHT';
  origin_facility_id?: string;
  destination_facility_id?: string;
  data_state: string;
  data_class: 'REAL_SOURCE_DERIVED' | 'SYNTHETIC_CONTRACT_FIXTURE' | 'LEGACY_DEMO';
  calling_points: CallingPoint[];
  fares: TransportFare[];
  license: string;
  attribution: string;
}

interface SourceStatus {
  source_id: string;
  transport_mode: string;
  operator_name: string;
  source_name: string;
  license: string;
  ingestion_status: string;
  last_run_status: string;
  records_read: number;
  records_inserted: number;
  attribution: string;
}

interface SourceCoverage {
  total_providers: number;
  total_services: number;
  services_by_data_class: Record<string, number>;
  services_by_mode: Record<string, number>;
  total_calling_points: number;
  resolved_facility_count: number;
  quarantined_stops_count: number;
}

export default function DevTransportDataPage() {
  const [services, setServices] = useState<TransportService[]>([]);
  const [sources, setSources] = useState<SourceStatus[]>([]);
  const [coverage, setCoverage] = useState<SourceCoverage | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const API_BASE = rawApiBase.endsWith('/api/v1')
    ? rawApiBase.slice(0, -'/api/v1'.length)
    : rawApiBase.replace(/\/$/, '');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [servRes, srcRes, covRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/transport/services`),
          fetch(`${API_BASE}/api/v1/transport/source-status`),
          fetch(`${API_BASE}/api/v1/transport/coverage`)
        ]);

        if (!servRes.ok || !srcRes.ok) {
          throw new Error('Failed to fetch transport platform data from backend APIs');
        }

        const servData = await servRes.json();
        const srcData = await srcRes.json();
        const covData = covRes.ok ? await covRes.json() : null;

        setServices(servData);
        setSources(srcData);
        setCoverage(covData);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error connecting to transport platform backend');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [API_BASE]);

  const filteredServices = selectedMode === 'ALL'
    ? services
    : services.filter(s => s.transport_mode === selectedMode);

  return (
    <div className="min-h-screen bg-[#0B1320] text-slate-100 p-6 sm:p-10 font-sans selection:bg-[#0E9F7A] selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#0FA77A] font-bold uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              <span>Phase 9 Platform Verification &amp; Audit</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Real Transport Provider Platform &amp; Schedules
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Deterministic timetable and route platform with rigorous data provenance, truthful classifications, and canonical geographic linking.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link
              href="/transport"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0FA77A] hover:bg-[#0B8465] text-xs font-bold text-white rounded-xl transition-all shadow-md"
            >
              <span>User Timetable Search</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white rounded-xl transition-all"
            >
              <span>Back to Planner</span>
            </Link>
          </div>
        </div>

        {/* Coverage Statistics Bar */}
        {coverage && (
          <div id="coverage-stats-bar" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-[11px] font-mono text-slate-400">Total Services</div>
              <div className="text-xl font-extrabold text-white mt-0.5">{coverage.total_services}</div>
            </div>
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-[11px] font-mono text-emerald-400">Verified Real</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                {coverage.services_by_data_class?.REAL_SOURCE_DERIVED || 0}
              </div>
            </div>
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-[11px] font-mono text-indigo-400">Synthetic Fixtures</div>
              <div className="text-xl font-extrabold text-indigo-400 mt-0.5">
                {coverage.services_by_data_class?.SYNTHETIC_CONTRACT_FIXTURE || 0}
              </div>
            </div>
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-[11px] font-mono text-slate-400">Calling Points</div>
              <div className="text-xl font-extrabold text-white mt-0.5">{coverage.total_calling_points}</div>
            </div>
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-[11px] font-mono text-teal-400">Resolved Facilities</div>
              <div className="text-xl font-extrabold text-teal-400 mt-0.5">{coverage.resolved_facility_count}</div>
            </div>
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-[11px] font-mono text-amber-400">Quarantined Stops</div>
              <div className="text-xl font-extrabold text-amber-400 mt-0.5">{coverage.quarantined_stops_count}</div>
            </div>
          </div>
        )}

        {/* Data Classification Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>REAL SOURCE-DERIVED</span>
            </div>
            <p className="text-[12px] text-slate-300">
              Directly parsed from official Ministry of Railways open timetable under GODL-India. Exact route, timings &amp; stops.
            </p>
          </div>
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold">
              <Info className="w-4 h-4" />
              <span>SYNTHETIC CONTRACT FIXTURE</span>
            </div>
            <p className="text-[12px] text-slate-300">
              Parser validation and schema testing fixtures for bus/flight modes. Public web data with license review pending.
            </p>
          </div>
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>LEGACY DEMO</span>
            </div>
            <p className="text-[12px] text-slate-300">
              Pre-Phase-9 demo examples. Segregated from verified transport platform records.
            </p>
          </div>
        </div>

        {/* Source Status Overview Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#4D7CFE]" />
            <span>Transport Data Source Registry ({sources.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sources.map((src) => (
              <div
                key={src.source_id}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                    {src.transport_mode}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    src.ingestion_status === 'APPROVED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      : src.ingestion_status === 'REQUIRES_LICENSE_REVIEW'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                  }`}>
                    {src.ingestion_status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">{src.source_name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{src.operator_name}</p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>License: {src.license}</span>
                  <span className={src.last_run_status === 'SUCCESS' ? 'text-emerald-400' : 'text-slate-500'}>
                    Run: {src.last_run_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            {['ALL', 'RAIL', 'BUS', 'FLIGHT'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                  selectedMode === mode
                    ? 'bg-[#0FA77A] text-white shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {mode === 'RAIL' && <Train className="w-3.5 h-3.5" />}
                {mode === 'BUS' && <Bus className="w-3.5 h-3.5" />}
                {mode === 'FLIGHT' && <Plane className="w-3.5 h-3.5" />}
                <span>{mode}</span>
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-slate-400">
            Showing {filteredServices.length} active provider services
          </span>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0FA77A]" />
            <span className="text-sm font-medium">Fetching real transport records from PostGIS backend...</span>
          </div>
        )}

        {error && (
          <div className="p-6 bg-rose-950/80 border border-rose-500/40 rounded-2xl text-rose-200 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Services List */}
        {!loading && !error && (
          <div className="space-y-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                data-testid="transport-service-card"
                className="bg-slate-900/90 border border-white/15 rounded-2xl p-6 space-y-5 shadow-2xl backdrop-blur-xl"
              >
                {/* Service Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0FA77A]/20 text-[#0FA77A] border border-[#0FA77A]/30 flex items-center justify-center font-bold">
                      {service.transport_mode === 'RAIL' && <Train className="w-5 h-5" />}
                      {service.transport_mode === 'BUS' && <Bus className="w-5 h-5" />}
                      {service.transport_mode === 'FLIGHT' && <Plane className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white">{service.service_name}</h3>
                        <span className="text-xs font-mono font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                          {service.service_code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{service.provider_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
                    {/* Data Class Badge */}
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold border ${
                      service.data_class === 'REAL_SOURCE_DERIVED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                        : service.data_class === 'SYNTHETIC_CONTRACT_FIXTURE'
                        ? 'bg-indigo-950 text-indigo-300 border-indigo-500/30'
                        : 'bg-amber-950 text-amber-300 border-amber-500/30'
                    }`}>
                      {service.data_class === 'REAL_SOURCE_DERIVED' ? 'REAL SOURCE-DERIVED' :
                       service.data_class === 'SYNTHETIC_CONTRACT_FIXTURE' ? 'SYNTHETIC CONTRACT FIXTURE' :
                       'LEGACY DEMO'}
                    </span>

                    {/* Data State Badge */}
                    <span className="text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-500/30 px-2.5 py-1 rounded-full font-bold">
                      {service.data_state === 'STATIC' ? 'STATIC / HISTORICAL' : service.data_state}
                    </span>

                    {/* License Badge */}
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 border border-white/10 px-2.5 py-1 rounded-full">
                      {service.license}
                    </span>
                  </div>
                </div>

                {/* Calling Points Timeline */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Calling Points &amp; Timetable
                    </h4>
                    {service.origin_facility_id && (
                      <span className="text-[10px] font-mono text-slate-500">
                        Route: {service.origin_facility_id} &rarr; {service.destination_facility_id}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {service.calling_points.map((cp) => (
                      <div
                        key={cp.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                          <span>Stop #{cp.stop_sequence} ({cp.provider_stop_code})</span>
                          {cp.day_offset > 0 && <span className="text-amber-400 font-bold">Day +{cp.day_offset}</span>}
                        </div>
                        <div className="font-bold text-white truncate" title={cp.stop_name}>{cp.stop_name}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          Facility: {cp.facility_id || 'unlinked'}
                        </div>
                        <div className="text-[11px] font-mono text-[#0FA77A] font-bold">
                          Arr: {cp.arrival_time} | Dep: {cp.departure_time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fares & Availability & Provenance */}
                <div className="pt-3 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">Fares:</span>
                      {service.fares && service.fares.length > 0 ? (
                        service.fares.map((f) => (
                          <span key={f.id} className="bg-white/10 text-white font-mono px-2 py-0.5 rounded-lg border border-white/15 font-bold text-[11px]">
                            {f.fare_class}: {f.amount !== null && f.amount !== undefined ? `₹${f.amount}` : 'Fare unavailable'}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Fare unavailable</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">Seats:</span>
                      <span className="text-slate-400 italic bg-white/5 px-2 py-0.5 rounded border border-white/10 text-[11px]">
                        Availability not provided
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-[#0FA77A] shrink-0" />
                    <span className="truncate">{service.attribution}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
