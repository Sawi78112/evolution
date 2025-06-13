"use client";

import React from 'react';
import { CaseData } from './CaseInformation';

interface EditCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseData | null;
  onSuccess?: () => void;
}

export function EditCaseModal({ isOpen, onClose, caseData, onSuccess }: EditCaseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Edit Case: {caseData?.name || 'Unknown Case'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="text-center py-12">
          <div className="p-4 bg-orange-50 dark:bg-orange-500/20 rounded-2xl mb-4 inline-block">
            <svg className="h-12 w-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Edit Case Modal
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            This feature will be implemented soon
          </p>
          {caseData && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Case ID: {caseData.id}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 