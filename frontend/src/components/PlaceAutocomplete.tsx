'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, X, Loader2, AlertCircle, Check, Search, Globe, Compass } from 'lucide-react';
import { searchPlaces, PlaceSearchError } from '@/lib/places-api';
import { ExternalPlaceRef } from '@/types';

export interface PlaceAutocompleteProps {
  id: string;
  label: string;
  value: string;
  selectedPlace?: ExternalPlaceRef;
  onSelectPlace: (place: ExternalPlaceRef) => void;
  onClear: () => void;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  iconColor?: string;
  disabled?: boolean;
  error?: string;
  excludePlaceId?: string;
  subLabel?: string;
}

export const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({
  id,
  label,
  value,
  selectedPlace,
  onSelectPlace,
  onClear,
  onChangeText,
  placeholder = 'Search cities, towns, destinations...',
  iconColor = '#0E9F7A',
  disabled = false,
  error,
  excludePlaceId,
  subLabel
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<ExternalPlaceRef[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync internal text state when value or selectedPlace props change
  const [prevPropValue, setPrevPropValue] = useState(value);
  const [prevPropSelected, setPrevPropSelected] = useState(selectedPlace);
  if (value !== prevPropValue || selectedPlace !== prevPropSelected) {
    setPrevPropValue(value);
    setPrevPropSelected(selectedPlace);
    setQuery(selectedPlace ? selectedPlace.display_name : (value || ''));
  }

  // Filter out excluded place (e.g., origin place when picking destination)
  const filteredResults = excludePlaceId
    ? results.filter((r) => r.provider_place_id !== excludePlaceId)
    : results;

  // Debounced search with AbortController
  const executeSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      setFetchError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await searchPlaces(trimmed, {
        limit: 8,
        signal: controller.signal
      });

      setResults(response.results);
      setIsOpen(true);
      setHighlightedIndex(-1);
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;

      if (err instanceof PlaceSearchError) {
        setFetchError(err.message);
      } else {
        setFetchError('Location search is temporarily unavailable.');
      }
      setResults([]);
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle typing input with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setQuery(nextVal);
    onChangeText?.(nextVal);

    if (selectedPlace) {
      onClear();
    }

    const debounceTimer = setTimeout(() => {
      executeSearch(nextVal);
    }, 280);

    return () => clearTimeout(debounceTimer);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        if (query.trim().length >= 2) executeSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredResults.length) {
          handleSelect(filteredResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (place: ExternalPlaceRef) => {
    onSelectPlace(place);
    setQuery(place.display_name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setFetchError(null);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setFetchError(null);
    onClear();
    onChangeText?.('');
    inputRef.current?.focus();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full text-left" id={`${id}-container`}>
      {/* Label and Sublabel */}
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" style={{ color: iconColor }} />
          <span>{label}</span>
        </label>
        {subLabel && <span className="text-[11px] text-slate-400 font-normal">{subLabel}</span>}
      </div>

      {/* Input container */}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length >= 2 && !selectedPlace) {
              executeSearch(query);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full px-4 py-3 pl-10 pr-10 bg-slate-900/90 border rounded-xl text-sm font-medium text-white placeholder-slate-500 shadow-inner backdrop-blur-md transition-all focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-500/70 focus:ring-rose-500/40 bg-rose-950/20'
              : selectedPlace
              ? 'border-[#0E9F7A]/60 focus:ring-[#0E9F7A]/40 bg-slate-900'
              : 'border-slate-800 focus:border-[#0E9F7A] focus:ring-[#0E9F7A]/20 hover:border-slate-700'
          }`}
          data-testid={`${id}-input`}
        />

        {/* Left Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#0E9F7A]" />
          ) : (
            <Search className="w-4 h-4" style={{ color: selectedPlace ? '#0E9F7A' : undefined }} />
          )}
        </div>

        {/* Right Clear or Status Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {selectedPlace && (
            <span className="w-5 h-5 rounded-full bg-[#0E9F7A]/20 text-[#0E9F7A] flex items-center justify-center">
              <Check className="w-3 h-3" />
            </span>
          )}
          {query && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Clear location input"
              data-testid={`${id}-clear-btn`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Place Badge & Provenance Details */}
      {selectedPlace && (
        <div className="mt-2 p-2.5 bg-slate-950/80 border border-[#0E9F7A]/30 rounded-xl flex items-center justify-between text-xs text-slate-300 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <Compass className="w-4 h-4 text-[#0E9F7A] flex-shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-white">{selectedPlace.display_name}</span>
              {(selectedPlace.region || selectedPlace.country) && (
                <span className="text-slate-400 text-[11px] ml-1.5">
                  ({[selectedPlace.region, selectedPlace.country].filter(Boolean).join(', ')})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {selectedPlace.latitude.toFixed(4)}°, {selectedPlace.longitude.toFixed(4)}°
            </span>
            <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/40">
              Foursquare Places
            </span>
          </div>
        </div>
      )}

      {/* Validation or Input Error */}
      {error && (
        <div className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dropdown Results Menu */}
      {isOpen && (
        <div
          id={`${id}-dropdown`}
          className="absolute z-50 left-0 right-0 mt-2 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
          data-testid={`${id}-dropdown`}
        >
          {/* Header Attribution */}
          <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-medium flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0E9F7A]" />
              Real Place Discovery
            </span>
            <span className="text-[10px] text-teal-400/90 font-semibold tracking-wide">
              Powered by Foursquare Places
            </span>
          </div>

          {/* Provider Error State - Never Seed Fallback */}
          {fetchError && (
            <div className="p-4 text-center space-y-1.5" data-testid={`${id}-error-state`}>
              <div className="w-8 h-8 mx-auto rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-rose-200">{fetchError}</p>
              <p className="text-[11px] text-slate-400">
                Live location resolution is required for truthful multi-modal planning.
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && !fetchError && (
            <div className="p-5 flex items-center justify-center gap-3 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-[#0E9F7A]" />
              <span>Searching authoritative place registry...</span>
            </div>
          )}

          {/* No Results State */}
          {!isLoading && !fetchError && filteredResults.length === 0 && (
            <div className="p-5 text-center text-xs text-slate-400 space-y-1" data-testid={`${id}-empty-state`}>
              <p className="font-medium text-slate-300">No locations found for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-slate-500">
                Try searching for the city or town name (e.g. Manali, Sangli, Mumbai).
              </p>
            </div>
          )}

          {/* Results List */}
          {!isLoading && !fetchError && filteredResults.length > 0 && (
            <ul className="py-1 divide-y divide-slate-800/60" role="listbox">
              {filteredResults.map((item, index) => {
                const isHighlighted = index === highlightedIndex;
                const isSelected = selectedPlace?.provider_place_id === item.provider_place_id;

                return (
                  <li
                    key={item.provider_place_id || index}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isHighlighted
                        ? 'bg-slate-800/80 text-white'
                        : isSelected
                        ? 'bg-slate-800/40 text-white'
                        : 'text-slate-200 hover:bg-slate-800/50'
                    }`}
                    data-testid="place-result-item"
                  >
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-[#0E9F7A] flex items-center justify-center flex-shrink-0 mt-0.5 border border-teal-500/20">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate text-white">
                            {item.display_name}
                          </span>
                          {item.categories && item.categories.length > 0 && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 truncate max-w-[120px]">
                              {item.categories[0]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {item.formatted_address || [item.locality, item.region, item.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0 text-right">
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                      </span>
                      {isSelected && (
                        <span className="text-[10px] text-[#0E9F7A] font-semibold flex items-center gap-1 mt-0.5">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
