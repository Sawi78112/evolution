"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { GPSCoordinate, formatGPSCoordinates } from '@/lib/gpsUtils';

// Create custom GPS icon
const gpsIcon = new L.DivIcon({
  html: `
    <div style="
      background: #3B82F6;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg style="
        width: 16px;
        height: 16px;
        transform: rotate(45deg);
        fill: white;
      " viewBox="0 0 24 24">
        <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z" />
      </svg>
    </div>
  `,
  className: 'custom-gps-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

interface LeafletMapProps {
  coordinates: GPSCoordinate;
  zoom?: number;
  popupContent?: React.ReactNode;
  showCoordinates?: boolean;
}

export default function LeafletMap({
  coordinates,
  zoom = 13,
  popupContent,
  showCoordinates = true
}: LeafletMapProps) {
  return (
    <div className="relative rounded-lg h-64 overflow-hidden">
      <MapContainer
        center={[coordinates.latitude, coordinates.longitude]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={[coordinates.latitude, coordinates.longitude]}
          icon={gpsIcon}
        >
          <Popup>
            {popupContent || (
              <div className="text-center">
                <strong>Location</strong><br />
                Coordinates: {formatGPSCoordinates(coordinates)}
              </div>
            )}
          </Popup>
        </Marker>
      </MapContainer>
      
      {showCoordinates && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded z-[1000]">
          GPS: {formatGPSCoordinates(coordinates)}
        </div>
      )}
    </div>
  );
}

// Keep the named export for backward compatibility
export { LeafletMap }; 