"use client";

import React from 'react';
import { CaseData } from './CaseInformation';

interface CaseDescriptionProps {
  caseData: CaseData;
}

export function CaseDescription({ caseData }: CaseDescriptionProps) {
  if (!caseData.description) {
    return null;
  }

  return (
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
  );
} 