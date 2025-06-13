"use client";

import React, { useState, useEffect } from 'react';
import { BoxIcon } from '@/assets/icons';
import { 
  CaseTabNavigation, 
  CaseDetailTab,
  PeopleTabContent,
  ArtifactsTabContent,
  NotesTabContent,
  RelatedCasesTabContent,
  type CaseTab,
  type CaseData
} from './case-details';

interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

export function CaseDetailsModal({ isOpen, onClose, caseId }: CaseDetailsModalProps) {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<CaseTab>('case-detail');

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
          
          <CaseTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
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
          {caseData && (
            <>
              {activeTab === 'case-detail' && <CaseDetailTab caseData={caseData} />}
              {activeTab === 'people' && <PeopleTabContent />}
              {activeTab === 'artifacts' && <ArtifactsTabContent />}
              {activeTab === 'notes' && <NotesTabContent />}
              {activeTab === 'related-cases' && <RelatedCasesTabContent />}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return modalContent;
} 