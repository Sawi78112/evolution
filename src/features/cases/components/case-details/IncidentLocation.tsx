"use client";

import React from 'react';
import { ArrowRightIcon } from '@/assets/icons';
import { InteractiveMap } from '@/components/ui/InteractiveMap';
import { parseGPSCoordinates, formatGPSCoordinates } from '@/lib/gpsUtils';
import { CaseData } from './CaseInformation';

interface IncidentLocationProps {
  caseData: CaseData;
}

export function IncidentLocation({ caseData }: IncidentLocationProps) {
  const gpsCoords = parseGPSCoordinates(caseData.gpsCoordinates);

  return (
    <div className="w-full lg:row-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
          <ArrowRightIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Incident Location</h3>
      </div>
      
      {/* Location Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Country</label>
          <p className="text-base font-medium text-gray-900 dark:text-white mt-1">{caseData.country || 'Not specified'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">State</label>
          <p className="text-base font-medium text-gray-900 dark:text-white mt-1">{caseData.state || 'Not specified'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">City</label>
          <p className="text-base font-medium text-gray-900 dark:text-white mt-1">{caseData.city || 'Not specified'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Address</label>
          <p className="text-base font-medium text-gray-900 dark:text-white mt-1 break-words">{caseData.address || 'Not specified'}</p>
        </div>
      </div>

      {/* GPS Coordinates */}
      {gpsCoords && (
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">GPS Coordinates</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">Latitude</label>
              <input
                type="text"
                value={gpsCoords.latitude.toFixed(6)}
                readOnly
                className="w-full px-2 py-1.5 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">Longitude</label>
              <input
                type="text"
                value={gpsCoords.longitude.toFixed(6)}
                readOnly
                className="w-full px-2 py-1.5 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* World Map */}
      <div className="flex-1 min-h-0">
        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 mt-5 block">Location Map</label>
        {gpsCoords ? (
          <div className="rounded-xl overflow-hidden h-full min-h-[180px]">
            <InteractiveMap 
              coordinates={gpsCoords}
              height="h-full"
              zoom={15}
              popupContent={
                <div className="text-center">
                  <strong>Incident Location</strong><br />
                  {caseData.address || 'GPS Coordinates'}<br />
                  <small>{formatGPSCoordinates(gpsCoords)}</small>
                </div>
              }
            />
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl h-full min-h-[180px] flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-base">No GPS coordinates available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 