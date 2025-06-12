"use client";

import React, { useState, useEffect } from 'react';
import { CloseIcon, CalenderIcon, UserIcon, BoxIcon, TimeIcon, ArrowRightIcon, BoxCubeIcon, DocsIcon } from '@/assets/icons';
import Badge from '@/components/ui/badge/Badge';
import { InteractiveMap } from '@/components/ui/InteractiveMap';
import { STATUS_COLORS, PRIORITY_COLORS, STATUS_BG_COLORS, PRIORITY_BG_COLORS } from '../constants';
import { parseGPSCoordinates, formatGPSCoordinates, GPSCoordinate } from '@/lib/gpsUtils';

interface CaseDetailsData {
  id: string;
  name: string;
  clientId: string | null;
  type: string;
  subType: string;
  division: string;
  owner: string;
  description: string | null;
  incidentDate: string | null;
  caseAddedDate: string;
  lastUpdatedDate: string;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  gpsCoordinates: string | null | {
    type: string;
    coordinates: number[];
    crs?: any;
  };
  caseStatus: 'Open' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

export function CaseDetailsModal({ isOpen, onClose, caseId }: CaseDetailsModalProps) {
  const [caseData, setCaseData] = useState<CaseDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'case-detail' | 'people' | 'artifacts' | 'notes' | 'related-cases'>('case-detail');

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const fetchCaseDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/cases/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch case details');
      }
      
      const data = await response.json();
      setCaseData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && caseId) {
      fetchCaseDetails(caseId);
    }
  }, [isOpen, caseId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const gpsCoords = caseData ? parseGPSCoordinates(caseData.gpsCoordinates) : null;

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black bg-opacity-10 backdrop-blur-[2px] flex items-center justify-center p-4" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        margin: 0,
        padding: '1rem',
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.15)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="no-scrollbar relative w-full max-w-[1300px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors z-10"
        >
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-50 dark:bg-brand-500/20 rounded-xl">
              <BoxIcon className="h-5 w-5 text-brand-500 dark:text-brand-400" />
            </div>
            <h4 className="text-3xl font-semibold text-gray-800 dark:text-white/90">
              Case Details
            </h4>
          </div>
          
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('case-detail')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'case-detail'
                  ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <DocsIcon className="h-5.5 w-5" />
              Case Detail
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'people'
                  ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <UserIcon className="h-5.5 w-5" />
              People
            </button>
            <button
              onClick={() => setActiveTab('artifacts')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'artifacts'
                  ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="h-5.5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Artifacts
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="h-5.5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Notes
            </button>
            <button
              onClick={() => setActiveTab('related-cases')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'related-cases'
                  ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Related Cases
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                <span className="text-lg text-gray-600 dark:text-gray-400">Loading case details...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="p-3 bg-red-50 dark:bg-red-500/20 rounded-xl mb-3 inline-block">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-lg text-red-600 dark:text-red-400 font-medium">Error loading case details</div>
                <div className="text-base text-gray-500 dark:text-gray-400 mt-1">{error}</div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {caseData && activeTab === 'case-detail' && (
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:gap-4 lg:h-[650px]">
              {/* Case Information */}
              <div className="w-full lg:col-span-2 bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-500/10 dark:to-blue-500/10 rounded-2xl p-5 sm:p-6 border border-brand-100 dark:border-brand-500/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <BoxCubeIcon className="h-5.5 w-5.5 text-brand-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{caseData.name}</h3>
                      <p className="text-base text-gray-600 dark:text-gray-400">Case #{caseData.clientId || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <Badge
                      size="md"
                      color={STATUS_COLORS[caseData.caseStatus as keyof typeof STATUS_COLORS]}
                    >
                      {caseData.caseStatus}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  {/* First Row - 3 Features */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-5">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Client ID</label>
                      <p className="text-base font-medium text-gray-900 dark:text-white mt-1.5">{caseData.clientId || 'Not specified'}</p>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Case Type</label>
                      <p className="text-base font-medium text-gray-900 dark:text-white mt-1.5">{caseData.type}</p>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Division</label>
                      <p className="text-base font-medium text-gray-900 dark:text-white mt-1.5">{caseData.division}</p>
                    </div>
                  </div>
                  
                  {/* Second Row - 3 Features */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-5">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sub Type</label>
                      <p className="text-base font-medium text-gray-900 dark:text-white mt-1.5">{caseData.subType}</p>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Priority Level</label>
                      <div className="mt-1.5">
                        <Badge
                          size="sm"
                          color={PRIORITY_COLORS[caseData.priority as keyof typeof PRIORITY_COLORS]}
                          variant={caseData.priority === 'Critical' ? 'solid' : 'light'}
                        >
                          {caseData.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Case Owner</label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="p-1 bg-blue-100 dark:bg-blue-500/20 rounded">
                          <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-base font-medium text-gray-900 dark:text-white">{caseData.owner}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Incident Location */}
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
                    <label className="text-sm mt-5 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">GPS Coordinates</label>
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

              {/* D: Important Dates */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-500/10 dark:to-indigo-500/10 rounded-2xl p-5 border border-purple-100 dark:border-purple-500/20 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                    <CalenderIcon className="h-5.5 w-5.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Important Dates</h3>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Incident Date</label>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-purple-200 dark:border-purple-600/30">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(caseData.incidentDate)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Case Added</label>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-purple-200 dark:border-purple-600/30">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(caseData.caseAddedDate)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Last Updated</label>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-purple-200 dark:border-purple-600/30">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(caseData.lastUpdatedDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* E: Description */}
              {caseData.description && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-green-100 dark:bg-green-500/20 rounded-lg">
                      <svg className="h-5.5 w-5.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Description</h3>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 flex-1 overflow-y-auto custom-scrollbar">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-base break-words">{caseData.description}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Other Tabs Content */}
          {caseData && activeTab === 'people' && (
            <div className="h-[650px] flex items-center justify-center">
              <div className="text-center">
                <div className="p-4 bg-blue-50 dark:bg-blue-500/20 rounded-2xl mb-4 inline-block">
                  <svg className="h-16 w-16 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">People Management</h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Manage case participants, witnesses, and involved parties</p>
                <p className="text-base text-gray-400 dark:text-gray-500 mt-4">Feature coming soon...</p>
              </div>
            </div>
          )}

          {caseData && activeTab === 'artifacts' && (
            <div className="h-[650px] flex items-center justify-center">
              <div className="text-center">
                <div className="p-4 bg-orange-50 dark:bg-orange-500/20 rounded-2xl mb-4 inline-block">
                  <svg className="h-16 w-16 text-orange-500 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Digital Artifacts</h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Manage evidence, documents, and digital forensics</p>
                <p className="text-base text-gray-400 dark:text-gray-500 mt-4">Feature coming soon...</p>
              </div>
            </div>
          )}

          {caseData && activeTab === 'notes' && (
            <div className="h-[650px] flex items-center justify-center">
              <div className="text-center">
                <div className="p-4 bg-green-50 dark:bg-green-500/20 rounded-2xl mb-4 inline-block">
                  <svg className="h-16 w-16 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Case Notes</h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Investigation notes, observations, and updates</p>
                <p className="text-base text-gray-400 dark:text-gray-500 mt-4">Feature coming soon...</p>
              </div>
            </div>
          )}

          {caseData && activeTab === 'related-cases' && (
            <div className="h-[650px] flex items-center justify-center">
              <div className="text-center">
                <div className="p-4 bg-purple-50 dark:bg-purple-500/20 rounded-2xl mb-4 inline-block">
                  <svg className="h-16 w-16 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Related Cases</h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Linked cases, similar patterns, and connections</p>
                <p className="text-base text-gray-400 dark:text-gray-500 mt-4">Feature coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return modalContent;
} 