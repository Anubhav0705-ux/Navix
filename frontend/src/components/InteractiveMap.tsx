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

interface InteractiveMapProps {
  segments?: Array<{
    source_city: string;
    source_node_name: string;
    dest_city: string;
    dest_node_name: string;
    transport_mode: string;
  }>;
}

export default function InteractiveMap({ segments = [] }: InteractiveMapProps) {
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
  } else {
    // Default Corridor Demo Points: Sangli -> Miraj -> Delhi -> Manali -> Old Manali
    polylineCoords.push([16.8524, 74.5815], [16.8202, 74.6468], [28.6430, 77.2194], [32.2396, 77.1887], [32.2548, 77.1751]);
    points.push(
      { id: '1', name: 'Sangli', lat: 16.8524, lng: 74.5815 },
      { id: '2', name: 'Miraj Junction', lat: 16.8202, lng: 74.6468 },
      { id: '3', name: 'Delhi ISBT', lat: 28.6675, lng: 77.2285 },
      { id: '4', name: 'Old Manali', lat: 32.2548, lng: 77.1751 }
    );
  }

  const centerLat = polylineCoords.length > 0 ? polylineCoords[Math.floor(polylineCoords.length / 2)][0] : 24.5;
  const centerLng = polylineCoords.length > 0 ? polylineCoords[Math.floor(polylineCoords.length / 2)][1] : 76.0;

  return (
    <div className="w-full h-[450px] sm:h-full min-h-[400px] rounded-2xl overflow-hidden border border-[#E7E5E0] shadow-sm relative z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={5}
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
