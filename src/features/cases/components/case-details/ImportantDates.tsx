"use client";

import React from 'react';
import { CalenderIcon } from '@/assets/icons';
import { CaseData } from './CaseInformation';

interface ImportantDatesProps {
  caseData: CaseData;
}

export function ImportantDates({ caseData }: ImportantDatesProps) {
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

  return (
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
  );
} 