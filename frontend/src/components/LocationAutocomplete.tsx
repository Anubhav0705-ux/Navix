'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Train, Plane, Bus, X, Loader2, AlertCircle, Check, Search } from 'lucide-react';
import { searchLocations } from '@/lib/location-api';
import { LocationSearchResultItem } from '@/types';

export interface LocationAutocompleteProps {
  id: string;
  label: string;
  value: string;
  selectedLocationId?: string;
  onChangeText: (text: string) => void;
  onSelectLocation: (item: LocationSearchResultItem) => void;
  onClear?: () => void;
  placeholder?: string;
  iconColor?: string;
  disabled?: boolean;
  error?: string;
  excludeLocationId?: string;
  subLabel?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  id,
  label,
  value,
  selectedLocationId,
  onChangeText,
  onSelectLocation,
  onClear,
  placeholder = 'Type city, station, or airport...',
  iconColor = '#0FA77A',
  disabled = false,
  error,
  excludeLocationId,
  subLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<LocationSearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filter out excluded location (e.g., origin location when picking destination)
  const filteredResults = excludeLocationId
    ? results.filter((r) => r.id !== excludeLocationId)
    : results;

  // Perform debounced search request with AbortController race safety
  const executeSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      setFetchError(null);
      return;
    }

    // Cancel superseded pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await searchLocations(trimmed, {
        limit: 8,
        signal: controller.signal
      });

      if (!controller.signal.aborted) {
        setResults(response.results);
        setIsLoading(false);
        setIsOpen(true);
        setHighlightedIndex(response.results.length > 0 ? 0 : -1);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Silently ignore aborted requests
        return;
      }
      if (!controller.signal.aborted) {
        setIsLoading(false);
        setFetchError('Unable to connect to geographic search service.');
        setIsOpen(true);
      }
    }
  }, []);

  // Debounced input watcher
  useEffect(() => {
    // Only search if user is actively typing and it differs from selected location text
    const timer = setTimeout(() => {
      if (value && isOpen) {
        executeSearch(value);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, isOpen, executeSearch]);

  // Clean up AbortController on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    onChangeText(newText);
    
    // Invalidate stale canonical selection if user edits text
    if (selectedLocationId && onClear) {
      onClear();
    }

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Input Focus Handler
  const handleFocus = () => {
    if (value.trim().length >= 1) {
      setIsOpen(true);
      executeSearch(value);
    }
  };

  // Select Item Handler
  const handleSelect = (item: LocationSearchResultItem) => {
    onSelectLocation(item);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Clear Handler
  const handleClear = () => {
    onChangeText('');
    setResults([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onClear) onClear();
    if (inputRef.current) inputRef.current.focus();
  };

  // Keyboard Navigation (ArrowUp, ArrowDown, Enter, Escape, Tab)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        executeSearch(value);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredResults.length - 1
      );
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredResults.length) {
        e.preventDefault();
        handleSelect(filteredResults[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  // Entity Type Icon helper
  const getEntityIcon = (type: string, facilityType?: string) => {
    if (facilityType === 'RAIL_STATION') return <Train className="w-4 h-4 text-emerald-400" />;
    if (facilityType === 'AIRPORT') return <Plane className="w-4 h-4 text-sky-400" />;
    if (facilityType === 'BUS_TERMINAL') return <Bus className="w-4 h-4 text-amber-400" />;
    if (type === 'TRANSIT_FACILITY') return <Train className="w-4 h-4 text-emerald-400" />;
    return <MapPin className="w-4 h-4 text-[#0FA77A]" />;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Label */}
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={id}
          className="block text-xs font-bold text-[#D8CBB8] uppercase tracking-wider flex items-center gap-1.5"
        >
          <span style={{ color: iconColor }}>
            <MapPin className="w-3.5 h-3.5 inline" />
          </span>
          <span>{label}</span>
        </label>
        {subLabel && (
          <span className="text-[10px] text-slate-400 font-mono">{subLabel}</span>
        )}
      </div>

      {/* Input Field Container */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${id}-opt-${highlightedIndex}` : undefined
          }
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-[#101419] border rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white font-medium placeholder-slate-500 focus:outline-none transition-all duration-200 ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
              : selectedLocationId
              ? 'border-[#0FA77A]/70 focus:border-[#0FA77A] focus:ring-1 focus:ring-[#0FA77A]/30'
              : 'border-white/20 focus:border-[#0FA77A] focus:ring-1 focus:ring-[#0FA77A]/30'
          }`}
        />

        {/* Right Status / Clear Icons */}
        <div className="absolute right-3 flex items-center gap-1.5 text-slate-400">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#0FA77A]" />}

          {!isLoading && selectedLocationId && (
            <span className="flex items-center text-emerald-400 title='Canonical Location Selected'">
              <Check className="w-4 h-4" />
            </span>
          )}

          {!isLoading && value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-white rounded-md transition-colors"
              aria-label="Clear location input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {!isLoading && !value && (
            <Search className="w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Input Error Message */}
      {error && (
        <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1.5 bg-[#0D121B] border border-white/20 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in duration-150 max-h-80 overflow-y-auto"
        >
          {/* Loading Header */}
          {isLoading && (
            <div className="px-4 py-2.5 text-xs text-slate-400 flex items-center gap-2 border-b border-white/5 bg-slate-900/50">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0FA77A]" />
              <span>Searching Indian geographic catalog...</span>
            </div>
          )}

          {/* Fetch Error Message */}
          {fetchError && (
            <div className="p-4 text-xs text-rose-300 bg-rose-950/40 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{fetchError}</p>
                <button
                  type="button"
                  onClick={() => executeSearch(value)}
                  className="mt-1 text-[11px] text-rose-400 hover:text-rose-200 underline"
                >
                  Retry Search
                </button>
              </div>
            </div>
          )}

          {/* Empty Results */}
          {!isLoading && !fetchError && filteredResults.length === 0 && value.trim().length > 0 && (
            <div className="p-4 text-center text-xs text-slate-400 space-y-1">
              <p className="font-medium text-slate-300">No matching Indian cities or stations found</p>
              <p className="text-[11px] text-slate-500">
                Try searching canonical name (e.g. Sangli), station code (SLI), or airport code (DEL).
              </p>
            </div>
          )}

          {/* Results List */}
          {!fetchError && filteredResults.length > 0 && (
            <div className="py-1">
              {filteredResults.map((item, idx) => {
                const isHighlighted = idx === highlightedIndex;
                const isSelected = item.id === selectedLocationId;

                return (
                  <div
                    key={item.id}
                    id={`${id}-opt-${idx}`}
                    role="option"
                    aria-selected={isSelected || isHighlighted}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3.5 py-2.5 cursor-pointer transition-colors duration-150 flex items-center justify-between gap-3 border-b border-white/5 last:border-0 ${
                      isHighlighted
                        ? 'bg-[#0FA77A]/20 text-white border-l-2 border-l-[#0FA77A]'
                        : isSelected
                        ? 'bg-emerald-950/30 text-emerald-200'
                        : 'text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {/* Left Icon & Text */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-white/5 border border-white/10 flex-shrink-0">
                        {getEntityIcon(item.entity_type, item.facility_type)}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white truncate">
                            {item.canonical_name}
                          </span>

                          {/* Station / Airport Code Badges */}
                          {item.codes && item.codes.length > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                              {item.codes.map((c) => c.code).join(' / ')}
                            </span>
                          )}

                          {/* Matched On / Transliteration Indicator */}
                          {item.matched_on === 'exact_alias' && item.matched_name && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({item.matched_name})
                            </span>
                          )}
                        </div>

                        {/* Admin Hierarchy / Context */}
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.display_name}
                        </p>
                      </div>
                    </div>

                    {/* Right Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Coverage Badge */}
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          item.coverage_status === 'COVERED'
                            ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50'
                            : item.coverage_status === 'PARTIAL'
                            ? 'bg-amber-900/40 text-amber-300 border-amber-700/50'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700/50'
                        }`}
                      >
                        {item.coverage_status === 'COVERED'
                          ? 'COVERED'
                          : item.coverage_status === 'PARTIAL'
                          ? 'PARTIAL'
                          : 'UNCOVERED'}
                      </span>

                      {isSelected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
