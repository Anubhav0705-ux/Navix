'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

interface NodePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const KNOWN_COORDS: Record<string, [number, number]> = {
  'Sangli': [16.8524, 74.5815],
  'Miraj': [16.8202, 74.6468],
  'Miraj Junction': [16.8202, 74.6468],
  'Pune': [18.5204, 73.8567],
  'Mumbai': [18.9400, 72.8354],
  'Delhi': [28.6430, 77.2194],
  'Delhi ISBT': [28.6675, 77.2285],
  'Chandigarh': [30.7046, 76.8013],
  'Manali': [32.2396, 77.1887],
  'Old Manali': [32.2548, 77.1751],
};

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

export default function InteractiveMap({
  origin,
  destination,
  centerLat: customCenterLat,
  centerLng: customCenterLng,
  zoom = 6,
  segments = [],
  attractions = [],
  foodPlaces = [],
  hotel
}: InteractiveMapProps) {
  const points: NodePoint[] = [];
  const polylineCoords: [number, number][] = [];

  if (segments.length > 0) {
    segments.forEach((seg, idx) => {
      const srcCoord = KNOWN_COORDS[seg.source_city] || KNOWN_COORDS[seg.source_node_name] || [16.8524, 74.5815];
      const destCoord = KNOWN_COORDS[seg.dest_city] || KNOWN_COORDS[seg.dest_node_name] || [32.2548, 77.1751];

      if (idx === 0) {
        points.push({ id: `src-${idx}`, name: `${seg.source_city} (${seg.source_node_name})`, lat: srcCoord[0], lng: srcCoord[1] });
        polylineCoords.push(srcCoord);
      }
      points.push({ id: `dest-${idx}`, name: `${seg.dest_city} (${seg.dest_node_name})`, lat: destCoord[0], lng: destCoord[1] });
      polylineCoords.push(destCoord);
    });
  } else if (origin || destination) {
    const oCoord = (origin && KNOWN_COORDS[origin]) || [16.8524, 74.5815];
    const dCoord = (destination && KNOWN_COORDS[destination]) || [32.2548, 77.1751];
    polylineCoords.push(oCoord, dCoord);
    if (origin) points.push({ id: 'origin', name: origin, lat: oCoord[0], lng: oCoord[1] });
    if (destination) points.push({ id: 'dest', name: destination, lat: dCoord[0], lng: dCoord[1] });
  } else {
    // Default Corridor Demo Points: Sangli -> Miraj -> Delhi -> Manali -> Old Manali
    polylineCoords.push([16.8524, 74.5815], [16.8202, 74.6468], [28.6430, 77.2194], [32.2396, 77.1887], [32.2548, 77.1751]);
    points.push(
      { id: '1', name: 'Sangli Hub', lat: 16.8524, lng: 74.5815 },
      { id: '2', name: 'Miraj Junction', lat: 16.8202, lng: 74.6468 },
      { id: '3', name: 'Delhi ISBT Hub', lat: 28.6675, lng: 77.2285 },
      { id: '4', name: 'Old Manali', lat: 32.2548, lng: 77.1751 }
    );
  }

  // Plot custom attraction points if available
  attractions.forEach((a, i) => {
    points.push({
      id: `att-${i}`,
      name: `★ ${a.name} (${a.category || 'Attraction'})`,
      lat: a.latitude,
      lng: a.longitude
    });
  });

  // Plot custom food points if available
  foodPlaces.forEach((f, i) => {
    points.push({
      id: `food-${i}`,
      name: `🍴 ${f.name} (${f.speciality || 'Food'})`,
      lat: f.latitude,
      lng: f.longitude
    });
  });

  // Plot hotel if available
  if (hotel) {
    points.push({
      id: 'hotel',
      name: `🏨 ${hotel.name}`,
      lat: hotel.latitude,
      lng: hotel.longitude
    });
  }

  const effectiveLat = customCenterLat !== undefined
    ? customCenterLat
    : polylineCoords.length > 0
    ? polylineCoords[Math.floor(polylineCoords.length / 2)][0]
    : 24.5;

  const effectiveLng = customCenterLng !== undefined
    ? customCenterLng
    : polylineCoords.length > 0
    ? polylineCoords[Math.floor(polylineCoords.length / 2)][1]
    : 76.0;

  return (
    <div className="w-full h-[450px] sm:h-full min-h-[400px] rounded-2xl overflow-hidden border border-[#E7E5E0] shadow-sm relative z-0">
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

        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{ color: '#0E9F7A', weight: 4, opacity: 0.8, dashArray: '6, 6' }}
          />
        )}

        {points.map((pt) => (
          <Marker key={pt.id} position={[pt.lat, pt.lng]}>
            <Popup>
              <div className="text-xs font-sans">
                <strong className="block text-[#0B1320]">{pt.name}</strong>
                <span className="text-[#667085] text-[11px]">Lat: {pt.lat.toFixed(4)}, Lng: {pt.lng.toFixed(4)}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

