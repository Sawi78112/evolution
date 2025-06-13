"use client";

import React, { useState, useEffect } from 'react';
import { BoxIcon } from '@/assets/icons';
import { EditCaseTabNavigation, type EditCaseTab } from './EditCaseTabNavigation';
import { TabPlaceholder } from './TabPlaceholder';
import { CaseDetailTab } from './CaseDetailTab';
import { EditCaseModalProps } from './types';
import { useNotification } from '@/components/ui/notification';

export function EditCaseModal({ isOpen, onClose, caseData, onSave }: EditCaseModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<EditCaseTab>('case-detail');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullCaseData, setFullCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notification = useNotification();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch complete case data when modal opens
  useEffect(() => {
    if (isOpen && caseData?.id) {
      fetchFullCaseData(caseData.id);
    }
  }, [isOpen, caseData?.id]);

  const fetchFullCaseData = async (caseId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/cases/${caseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch case details');
      }
      
      const data = await response.json();
      setFullCaseData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      console.log('Updating case with data:', formData);
      
      const response = await fetch(`/api/cases/${caseData?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update case');
      }
      
      const result = await response.json();
      console.log('Case updated successfully:', result);
      
      // Show success notification
      notification.success(
        'Case Updated Successfully',
        `"${formData.name}" has been updated with the latest changes.`
      );
      
      // Close modal
      onClose();
      
      // Call save callback
      onSave(result.data);
      
      // The parent component will handle refreshing the cases list
      
    } catch (error) {
      console.error('Failed to update case:', error);
      
      // Show error notification
      notification.error(
        'Failed to Update Case',
        error instanceof Error ? error.message : 'An unexpected error occurred while updating the case.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !isOpen) return null;

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
      <div className="no-scrollbar relative w-full max-w-[1300px] max-h-[95vh] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
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
              Edit Case
            </h4>
          </div>
          
          <EditCaseTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="mb-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading case details...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Error loading case details: {error}</div>
            </div>
          ) : (
            <>
              {/* Case Detail Tab */}
              {activeTab === 'case-detail' && (
                <CaseDetailTab onSubmit={handleSubmit} initialData={fullCaseData} onClose={onClose} isSubmitting={isSubmitting} />
              )}

              {/* People Tab */}
              {activeTab === 'people' && (
                <TabPlaceholder
                  icon={
                    <svg className="h-16 w-16 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  }
                  title="People Management"
                  description="Manage case participants, witnesses, and involved parties"
                  bgColor="bg-blue-50 dark:bg-blue-500/20"
                />
              )}

              {/* Artifacts Tab */}
              {activeTab === 'artifacts' && (
                <TabPlaceholder
                  icon={
                    <svg className="h-16 w-16 text-orange-500 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                  }
                  title="Digital Artifacts"
                  description="Manage evidence, documents, and digital forensics"
                  bgColor="bg-orange-50 dark:bg-orange-500/20"
                />
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <TabPlaceholder
                  icon={
                    <svg className="h-16 w-16 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  }
                  title="Case Notes"
                  description="Investigation notes, observations, and updates"
                  bgColor="bg-green-50 dark:bg-green-500/20"
                />
              )}

              {/* Related Cases Tab */}
              {activeTab === 'related-cases' && (
                <TabPlaceholder
                  icon={
                    <svg className="h-16 w-16 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  }
                  title="Related Cases"
                  description="Linked cases, similar patterns, and connections"
                  bgColor="bg-purple-50 dark:bg-purple-500/20"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return modalContent;
} 