'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { LocationSearchResultItem } from '@/types';
import {
  Train, Bus, Plane, Search, ShieldCheck,
  Clock, AlertCircle, Info, ChevronDown, ChevronUp, MapPin,
  Sparkles, Filter, CheckCircle2, AlertTriangle, X
} from 'lucide-react';
import { TransportSearchResult, TransportSearchServiceCard } from '@/types/api';

export default function TransportDiscoveryPage() {
  const [originText, setOriginText] = useState('');
  const [destText, setDestText] = useState('');
  const [originItem, setOriginItem] = useState<LocationSearchResultItem | null>(null);
  const [destItem, setDestItem] = useState<LocationSearchResultItem | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [travelDate, setTravelDate] = useState<string>(todayStr);
  const [selectedMode, setSelectedMode] = useState<string>('ALL');

  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<TransportSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [provenanceModalCard, setProvenanceModalCard] = useState<TransportSearchServiceCard | null>(null);

  const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const API_BASE = rawApiBase.endsWith('/api/v1')
    ? rawApiBase.slice(0, -'/api/v1'.length)
    : rawApiBase.replace(/\/$/, '');

  const handleSearch = async (
    customOriginId?: string,
    customDestId?: string,
    customDate?: string,
    customMode?: string
  ) => {
    const origId = customOriginId || (originItem ? originItem.id : originText.trim());
    const dId = customDestId || (destItem ? destItem.id : destText.trim());
    const qDate = customDate || travelDate;
    const qMode = customMode !== undefined ? customMode : selectedMode;

    if (!origId || !dId) {
      setError('Please select both origin and destination facilities to search timetables.');
      return;
    }

    if (origId === dId) {
      setError('Origin and destination cannot be the same facility.');
      return;
    }

    setLoading(true);
    setError(null);
    setExpandedServiceId(null);

    try {
      const params = new URLSearchParams({
        origin_facility_id: origId,
        destination_facility_id: dId,
        travel_date: qDate,
        exclude_synthetic: 'true'
      });

      if (qMode && qMode !== 'ALL') {
        params.append('mode', qMode);
      }

      const res = await fetch(`${API_BASE}/api/v1/transport/search?${params.toString()}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned ${res.status}: ${res.statusText}`);
      }

      const data: TransportSearchResult = await res.json();
      setSearchResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query transport platform');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (
    origName: string,
    origId: string,
    dName: string,
    dId: string,
    mode: string
  ) => {
    setOriginText(origName);
    setOriginItem({
      id: origId,
      name: origName,
      canonical_name: origName,
      display_name: origName,
      entity_type: 'TRANSIT_FACILITY',
      matched_on: 'exact_canonical',
      score: 1.0,
      codes: [],
      coordinates: { latitude: 0, longitude: 0 },
      coverage_status: 'COVERED',
      badge: 'VERIFIED'
    });

    setDestText(dName);
    setDestItem({
      id: dId,
      name: dName,
      canonical_name: dName,
      display_name: dName,
      entity_type: 'TRANSIT_FACILITY',
      matched_on: 'exact_canonical',
      score: 1.0,
      codes: [],
      coordinates: { latitude: 0, longitude: 0 },
      coverage_status: 'COVERED',
      badge: 'VERIFIED'
    });

    setSelectedMode(mode);
    handleSearch(origId, dId, travelDate, mode);
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Banner */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0FA77A] mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Authoritative Transport Timetables</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Multi-Provider Transport Discovery
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
            Directly query real published schedules, GTFS public transit feeds, and government open data.
            Truth-in-data enforced: missing fares are explicit, historical feeds are marked, and seat availability is never fabricated.
          </p>
        </div>

        {/* Search Panel Card */}
        <div className="bg-[#121721] border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Origin */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Origin Facility
              </label>
              <LocationAutocomplete
                id="transport-origin-input"
                label="Origin"
                value={originText}
                selectedLocationId={originItem?.id}
                onChangeText={(txt) => {
                  setOriginText(txt);
                  if (originItem && originItem.display_name !== txt) {
                    setOriginItem(null);
                  }
                }}
                onSelectLocation={(item) => {
                  setOriginText(item.display_name);
                  setOriginItem(item);
                }}
                onClear={() => {
                  setOriginText('');
                  setOriginItem(null);
                }}
                placeholder="Sangli (SLI), Delhi ISBT, Pune..."
              />
            </div>

            {/* Destination */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Destination Facility
              </label>
              <LocationAutocomplete
                id="transport-dest-input"
                label="Destination"
                value={destText}
                selectedLocationId={destItem?.id}
                onChangeText={(txt) => {
                  setDestText(txt);
                  if (destItem && destItem.display_name !== txt) {
                    setDestItem(null);
                  }
                }}
                onSelectLocation={(item) => {
                  setDestText(item.display_name);
                  setDestItem(item);
                }}
                onClear={() => {
                  setDestText('');
                  setDestItem(null);
                }}
                placeholder="Pune (PUNE), Old Manali, Mumbai..."
                excludeLocationId={originItem?.id}
              />
            </div>

            {/* Travel Date */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Travel Date
              </label>
              <div className="relative">
                <input
                  id="transport-date-input"
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-[#1A2230] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0FA77A]"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <button
                id="transport-search-button"
                onClick={() => handleSearch()}
                disabled={loading}
                className="w-full h-10 inline-flex items-center justify-center gap-2 bg-[#0FA77A] hover:bg-[#0B8465] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mode Tabs & Presets */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {/* Mode selection buttons */}
            <div className="flex items-center gap-1.5 bg-[#0A0D12] p-1 rounded-xl border border-slate-800">
              {[
                { id: 'ALL', label: 'All Modes', icon: Filter },
                { id: 'RAIL', label: 'Rail', icon: Train },
                { id: 'BUS', label: 'Bus', icon: Bus },
                { id: 'FLIGHT', label: 'Flight', icon: Plane }
              ].map((m) => {
                const Icon = m.icon;
                const active = selectedMode === m.id;
                return (
                  <button
                    key={m.id}
                    id={`transport-mode-${m.id.toLowerCase()}`}
                    onClick={() => {
                      setSelectedMode(m.id);
                      if (searchResult) {
                        handleSearch(undefined, undefined, undefined, m.id);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? 'bg-[#0FA77A] text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Demo Corridors */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Verified Corridors:
              </span>
              <button
                id="preset-sli-pune"
                onClick={() =>
                  handleSelectPreset(
                    'Sangli (SLI)',
                    'fac_sangli_sli',
                    'Pune Junction (PUNE)',
                    'fac_pune_pune',
                    'RAIL'
                  )
                }
                className="bg-[#1A2230] hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-medium border border-slate-700/60 transition-colors"
              >
                Sangli → Pune (Train)
              </button>
              <button
                id="preset-pune-sli"
                onClick={() =>
                  handleSelectPreset(
                    'Pune Junction (PUNE)',
                    'fac_pune_pune',
                    'Sangli (SLI)',
                    'fac_sangli_sli',
                    'RAIL'
                  )
                }
                className="bg-[#1A2230] hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-medium border border-slate-700/60 transition-colors"
              >
                Pune → Sangli (Train)
              </button>
              <button
                id="preset-sli-mrj"
                onClick={() =>
                  handleSelectPreset(
                    'Sangli (SLI)',
                    'fac_sangli_sli',
                    'Miraj Junction (MRJ)',
                    'fac_miraj_mrj',
                    'RAIL'
                  )
                }
                className="bg-[#1A2230] hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-medium border border-slate-700/60 transition-colors"
              >
                Sangli → Miraj (Rail)
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            id="transport-error-banner"
            className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div>
              <p className="font-semibold">Search Request Note</p>
              <p className="text-rose-200/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {searchResult && (
          <div id="transport-results-container" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Available Scheduled Services
                </span>
                <span
                  id="results-count-badge"
                  className="bg-[#0FA77A]/20 text-[#0FA77A] text-xs font-semibold px-2 py-0.5 rounded-full border border-[#0FA77A]/30"
                >
                  {searchResult.total_services_found} found
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Excludes synthetic fixtures • Real provider schedule data</span>
              </div>
            </div>

            {searchResult.services.length === 0 ? (
              <div
                id="transport-empty-state"
                className="bg-[#121721] border border-slate-800 rounded-2xl p-12 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  No Direct Scheduled Services Found
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No published services match this exact pair of facilities on the selected date. Check intermediate connections or try another transport mode.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {searchResult.services.map((card) => {
                  const isExpanded = expandedServiceId === card.service_id;
                  const ModeIcon =
                    card.transport_mode === 'RAIL'
                      ? Train
                      : card.transport_mode === 'BUS'
                      ? Bus
                      : Plane;

                  return (
                    <div
                      key={card.service_id}
                      id={`service-card-${card.service_code}`}
                      className="bg-[#121721] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-md"
                    >
                      {/* Top Header: Operator & Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-[#1A2230] text-[#0FA77A]">
                            <ModeIcon className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-xs font-bold text-white">
                              {card.operator_name}
                            </span>
                            <span className="text-xs text-slate-400 ml-2">
                              • {card.transport_mode}
                            </span>
                          </div>
                        </div>

                        {/* Truth Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Provenance Badge */}
                          {card.data_class === 'REAL_SOURCE_DERIVED' ? (
                            <span className="bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-teal-400" />
                              VERIFIED REAL SOURCE
                            </span>
                          ) : (
                            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                              SYNTHETIC CONTRACT FIXTURE
                            </span>
                          )}

                          {/* Data State Badge */}
                          {(card.data_state === 'STATIC_HISTORICAL' || card.data_state === 'STATIC' || card.data_state === 'HISTORICAL') && (
                            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium px-2 py-0.5 rounded-md">
                              STATIC / HISTORICAL
                            </span>
                          )}

                          {/* Expired Badge */}
                          {card.is_expired && (
                            <span className="bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-medium px-2 py-0.5 rounded-md">
                              EXPIRED FEED
                            </span>
                          )}

                          {/* Fare Badge */}
                          <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md">
                            FARE UNAVAILABLE
                          </span>

                          {/* Availability Badge */}
                          <span className="bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 text-[10px] font-medium px-2 py-0.5 rounded-md">
                            AVAILABILITY NOT PROVIDED
                          </span>
                        </div>
                      </div>

                      {/* Main Service Content */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Service Code & Name */}
                        <div className="md:col-span-4">
                          <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                            <span>{card.service_code}</span>
                            <span className="text-xs font-medium text-slate-400">
                              {card.service_name}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>
                              {card.operates_on_selected_date ? 'Operates on selected date' : 'Service exception: does not operate'}
                            </span>
                          </p>
                        </div>

                        {/* Timings & Duration */}
                        <div className="md:col-span-5 flex items-center justify-between gap-4">
                          {/* Departure */}
                          <div className="text-left">
                            <div className="text-lg font-black text-white">
                              {card.departure_time}
                            </div>
                            <div className="text-xs text-slate-400 truncate max-w-[120px]">
                              {card.origin_facility_name}
                            </div>
                          </div>

                          {/* Duration Line */}
                          <div className="flex-1 text-center px-2">
                            <span className="text-[11px] font-semibold text-slate-300">
                              {Math.floor(card.duration_minutes / 60)}h {card.duration_minutes % 60}m
                            </span>
                            <div className="relative flex items-center justify-center my-1">
                              <div className="h-[2px] w-full bg-slate-700" />
                              <div className="absolute w-2 h-2 rounded-full bg-[#0FA77A]" />
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {card.intermediate_stops_count} intermediate stop{card.intermediate_stops_count === 1 ? '' : 's'}
                            </span>
                          </div>

                          {/* Arrival */}
                          <div className="text-right">
                            <div className="text-lg font-black text-white flex items-center justify-end gap-1">
                              <span>{card.arrival_time}</span>
                              {card.day_offset > 0 && (
                                <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1 rounded">
                                  +{card.day_offset}d
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 truncate max-w-[120px]">
                              {card.destination_facility_name}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="md:col-span-3 flex items-center justify-end gap-2">
                          <button
                            id={`toggle-stops-${card.service_code}`}
                            onClick={() =>
                              setExpandedServiceId(isExpanded ? null : card.service_id)
                            }
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1A2230] hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
                          >
                            <span>Stops</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            id={`provenance-btn-${card.service_code}`}
                            onClick={() => setProvenanceModalCard(card)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0FA77A]/10 hover:bg-[#0FA77A]/20 text-[#0FA77A] border border-[#0FA77A]/30 flex items-center gap-1 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Provenance</span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Calling Points Timeline */}
                      {isExpanded && (
                        <div
                          id={`expanded-stops-${card.service_code}`}
                          className="mt-4 pt-4 border-t border-slate-800/80 bg-[#0E121A] p-4 rounded-xl"
                        >
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#0FA77A]" />
                            <span>Calling Points Timeline ({card.intermediate_stops.length} stops)</span>
                          </h5>
                          <div className="space-y-2">
                            {card.intermediate_stops.map((cp, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40 last:border-0"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center">
                                    {cp.stop_sequence}
                                  </span>
                                  <span className="font-medium text-slate-200">
                                    {cp.stop_name}
                                  </span>
                                  {cp.facility_id && (
                                    <span className="text-[10px] font-mono text-slate-500">
                                      ({cp.facility_id})
                                    </span>
                                  )}
                                </div>
                                <div className="font-mono text-slate-400">
                                  {cp.arrival_time} → {cp.departure_time}
                                  {cp.day_offset > 0 && (
                                    <span className="ml-1 text-amber-400 text-[10px]">
                                      +{cp.day_offset}d
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Provenance Audit Modal */}
        {provenanceModalCard && (
          <div
            id="provenance-modal-backdrop"
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div
              id="provenance-modal"
              className="bg-[#121721] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setProvenanceModalCard(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0FA77A] mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Authoritative Provenance Audit</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">
                {provenanceModalCard.service_code} — {provenanceModalCard.service_name}
              </h3>

              <div className="space-y-3 text-xs">
                <div className="bg-[#1A2230] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Authoritative Source</span>
                  <span className="font-semibold text-white">{provenanceModalCard.attribution}</span>
                </div>

                <div className="bg-[#1A2230] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Licensing & Terms</span>
                  <span className="font-mono text-emerald-400">{provenanceModalCard.license}</span>
                </div>

                <div className="bg-[#1A2230] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Data Freshness / State</span>
                  <span className="text-slate-300">
                    {provenanceModalCard.data_state}
                  </span>
                </div>

                <div className="bg-[#1A2230] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Fare & Availability Contract</span>
                  <p className="text-slate-300 leading-relaxed">
                    Live dynamic booking inventory and current ticket fares require direct authorized operator APIs. Under NAVIX truth-in-data principles, fares are marked FARE_UNAVAILABLE and seat booking is NOT_PROVIDED.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setProvenanceModalCard(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Close Audit
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
