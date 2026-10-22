'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ALL_DESTINATION_COORDS, getDestinationCoords } from '@/lib/destinations-data';

// Custom SVG Icons with vibrant Sunlit palette
function createCustomPin(color: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="36" filter="drop-shadow(0px 2px 4px rgba(25, 52, 81, 0.2))">
    <path fill="${color}" stroke="#FFFFFF" stroke-width="1.5" d="M12 0C5.37 0 0 5.37 0 12c0 8.5 12 20 12 20s12-11.5 12-20c0-6.63-5.37-12-12-12z"/>
    <circle fill="#FFFFFF" cx="12" cy="11" r="5"/>
    <text x="12" y="14" font-size="8" font-family="sans-serif" font-weight="bold" fill="${color}" text-anchor="middle">${label}</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'custom-map-pin',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -34]
  });
}

const originIcon = createCustomPin('#246BCE', 'A');
const destIcon = createCustomPin('#F46F58', 'B');
const transitIcon = createCustomPin('#F7C963', 'T');
const attractionIcon = createCustomPin('#246BCE', '★');
const foodIcon = createCustomPin('#F46F58', '🍴');
const hotelIcon = createCustomPin('#8B5CF6', '🏨');

interface NodePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'origin' | 'dest' | 'transit' | 'attraction' | 'food' | 'hotel';
}

export interface InteractiveMapProps {
  origin?: string;
  destination?: string;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  segments?: Array<{
    source_city: string;
    source_node_name: string;
    dest_city: string;
    dest_node_name: string;
    transport_mode: string;
  }>;
  attractions?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    category?: string;
  }>;
  foodPlaces?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    speciality?: string;
  }>;
  hotel?: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

// Controller to auto-invalidate size and fit bounds safely
function MapViewController({
  points,
  centerLat,
  centerLng,
  zoom = 12
}: {
  points: NodePoint[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}) {
  const map = useMap();
  const prevKeyRef = React.useRef<string>('');

  const pointsKey = `${centerLat ?? ''},${centerLng ?? ''},${zoom},${points.length},${points.map(p => `${p.lat.toFixed(4)}_${p.lng.toFixed(4)}`).join('|')}`;

  useEffect(() => {
    if (prevKeyRef.current === pointsKey) return;
    prevKeyRef.current = pointsKey;

    const t1 = setTimeout(() => {
      try {
        map.invalidateSize();
        if (points.length > 1) {
          const latLngs = points.map((p) => [p.lat, p.lng] as [number, number]);
          const bounds = L.latLngBounds(latLngs);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
          }
        } else if (points.length === 1) {
          map.setView([points[0].lat, points[0].lng], zoom);
        } else if (centerLat !== undefined && centerLng !== undefined) {
          map.setView([centerLat, centerLng], zoom);
        }
      } catch (err) {
        console.warn('Map fitBounds suppressed error:', err);
      }
    }, 150);

    return () => {
      clearTimeout(t1);
    };
  }, [map, pointsKey, points, centerLat, centerLng, zoom]);

  return null;
}

export default function InteractiveMap({
  origin,
  destination,
  centerLat: customCenterLat,
  centerLng: customCenterLng,
  zoom = 12,
  segments = [],
  attractions = [],
  foodPlaces = [],
  hotel
}: InteractiveMapProps) {
  const { points, polylineCoords } = useMemo(() => {
    const pts: NodePoint[] = [];
    const poly: [number, number][] = [];

    // Valid coordinate boundary check for India
    const isValidIndiaCoord = (lat?: number, lng?: number): boolean => {
      if (lat === undefined || lng === undefined) return false;
      if (isNaN(lat) || isNaN(lng)) return false;
      return lat >= 6.0 && lat <= 38.0 && lng >= 68.0 && lng <= 98.0;
    };

    if (segments.length > 0) {
      segments.forEach((seg, idx) => {
        const srcCoord = ALL_DESTINATION_COORDS[seg.source_city] || ALL_DESTINATION_COORDS[seg.source_node_name] || getDestinationCoords(seg.source_city);
        const destCoord = ALL_DESTINATION_COORDS[seg.dest_city] || ALL_DESTINATION_COORDS[seg.dest_node_name] || getDestinationCoords(seg.dest_city);

        if (idx === 0 && isValidIndiaCoord(srcCoord[0], srcCoord[1])) {
          pts.push({
            id: `src-${idx}`,
            name: `${seg.source_city} (${seg.source_node_name})`,
            lat: srcCoord[0],
            lng: srcCoord[1],
            type: 'origin'
          });
          poly.push(srcCoord);
        }
        if (isValidIndiaCoord(destCoord[0], destCoord[1])) {
          pts.push({
            id: `dest-${idx}`,
            name: `${seg.dest_city} (${seg.dest_node_name})`,
            lat: destCoord[0],
            lng: destCoord[1],
            type: idx === segments.length - 1 ? 'dest' : 'transit'
          });
          poly.push(destCoord);
        }
      });
    } else if (origin && destination) {
      // True origin-to-destination routing query
      const oCoord = getDestinationCoords(origin);
      const dCoord = getDestinationCoords(destination);
      if (isValidIndiaCoord(oCoord[0], oCoord[1])) {
        pts.push({ id: 'origin', name: origin, lat: oCoord[0], lng: oCoord[1], type: 'origin' });
        poly.push(oCoord);
      }
      if (isValidIndiaCoord(dCoord[0], dCoord[1])) {
        pts.push({ id: 'dest', name: destination, lat: dCoord[0], lng: dCoord[1], type: 'dest' });
        poly.push(dCoord);
      }
    } else if (destination) {
      // Single destination exploration: show destination center pin without any false route lines
      const dCoord = (customCenterLat !== undefined && customCenterLng !== undefined && isValidIndiaCoord(customCenterLat, customCenterLng))
        ? [customCenterLat, customCenterLng] as [number, number]
        : getDestinationCoords(destination);
      if (isValidIndiaCoord(dCoord[0], dCoord[1])) {
        pts.push({ id: 'dest', name: destination, lat: dCoord[0], lng: dCoord[1], type: 'dest' });
      }
    } else if (origin) {
      const oCoord = (customCenterLat !== undefined && customCenterLng !== undefined && isValidIndiaCoord(customCenterLat, customCenterLng))
        ? [customCenterLat, customCenterLng] as [number, number]
        : getDestinationCoords(origin);
      if (isValidIndiaCoord(oCoord[0], oCoord[1])) {
        pts.push({ id: 'origin', name: origin, lat: oCoord[0], lng: oCoord[1], type: 'origin' });
      }
    } else if (attractions.length === 0 && foodPlaces.length === 0 && !hotel) {
      // Fallback only when absolutely no entities or locations are provided
      const sCoord = getDestinationCoords('Sangli');
      const mCoord = getDestinationCoords('Old Manali');
      poly.push(sCoord, mCoord);
      pts.push(
        { id: '1', name: 'Sangli Hub', lat: sCoord[0], lng: sCoord[1], type: 'origin' },
        { id: '2', name: 'Old Manali', lat: mCoord[0], lng: mCoord[1], type: 'dest' }
      );
    }

    // Plot verified attractions with valid coordinates
    attractions.forEach((a, i) => {
      if (isValidIndiaCoord(a.latitude, a.longitude)) {
        pts.push({
          id: `att-${i}`,
          name: a.name,
          lat: a.latitude,
          lng: a.longitude,
          type: 'attraction'
        });
      }
    });

    // Plot food places with valid coordinates
    foodPlaces.forEach((f, i) => {
      if (isValidIndiaCoord(f.latitude, f.longitude)) {
        pts.push({
          id: `food-${i}`,
          name: f.name,
          lat: f.latitude,
          lng: f.longitude,
          type: 'food'
        });
      }
    });

    // Plot hotel with valid coordinates
    if (hotel && isValidIndiaCoord(hotel.latitude, hotel.longitude)) {
      pts.push({
        id: 'hotel',
        name: hotel.name,
        lat: hotel.latitude,
        lng: hotel.longitude,
        type: 'hotel'
      });
    }

    return { points: pts, polylineCoords: poly };
  }, [segments, origin, destination, customCenterLat, customCenterLng, attractions, foodPlaces, hotel]);

  const effectiveLat = customCenterLat !== undefined
    ? customCenterLat
    : points.length > 0
    ? points[0].lat
    : 24.5;

  const effectiveLng = customCenterLng !== undefined
    ? customCenterLng
    : points.length > 0
    ? points[0].lng
    : 76.0;

  const getPinIcon = (type: NodePoint['type']) => {
    switch (type) {
      case 'origin': return originIcon;
      case 'dest': return destIcon;
      case 'transit': return transitIcon;
      case 'attraction': return attractionIcon;
      case 'food': return foodIcon;
      case 'hotel': return hotelIcon;
      default: return attractionIcon;
    }
  };

  return (
    <div className="w-full h-[380px] sm:h-[450px] min-h-[360px] rounded-3xl overflow-hidden border border-[#EADBCE] shadow-sm relative z-0 bg-[#FFF9F2]">
      <MapContainer
        center={[effectiveLat, effectiveLng]}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController
          points={points}
          centerLat={customCenterLat}
          centerLng={customCenterLng}
          zoom={zoom}
        />

        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{ color: '#246BCE', weight: 4, opacity: 0.85, dashArray: '6, 6' }}
          />
        )}

        {points.map((pt) => (
          <Marker key={pt.id} position={[pt.lat, pt.lng]} icon={getPinIcon(pt.type)}>
            <Popup>
              <div className="text-xs font-sans p-1">
                <strong className="block text-[#193451] font-bold text-xs">{pt.name}</strong>
                <span className="text-[#64748B] text-[10px] font-mono">
                  {pt.lat.toFixed(4)}, {pt.lng.toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
