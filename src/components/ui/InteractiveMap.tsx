"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { GPSCoordinate, formatGPSCoordinates } from '@/lib/gpsUtils';

// Dynamically import the LeafletMap component to avoid SSR issues
const DynamicLeafletMap = dynamic(
  () => import('./LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg h-64 overflow-hidden flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
      </div>
    )
  }
);

interface InteractiveMapProps {
  coordinates: GPSCoordinate | null;
  height?: string;
  zoom?: number;
  showCoordinates?: boolean;
  popupContent?: React.ReactNode;
  className?: string;
}

export function InteractiveMap({
  coordinates,
  height = 'h-64',
  zoom = 13,
  showCoordinates = true,
  popupContent,
  className = ''
}: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg ${height} overflow-hidden flex items-center justify-center ${className}`}>
        <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
      </div>
    );
  }

  if (!coordinates) {
    return (
      <div className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg ${height} overflow-hidden flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="mb-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p>No GPS coordinates available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <DynamicLeafletMap
        coordinates={coordinates}
        zoom={zoom}
        popupContent={popupContent}
        showCoordinates={showCoordinates}
      />
    </div>
  );
} 