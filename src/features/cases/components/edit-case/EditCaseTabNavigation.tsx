"use client";

import React from 'react';
import { DocsIcon } from '@/assets/icons';

// Tab type for Edit Case Modal
export type EditCaseTab = 'case-detail' | 'people' | 'artifacts' | 'notes' | 'related-cases';

// Tab Navigation Component
interface EditCaseTabNavigationProps {
  activeTab: EditCaseTab;
  onTabChange: (tab: EditCaseTab) => void;
}

export function EditCaseTabNavigation({ activeTab, onTabChange }: EditCaseTabNavigationProps) {
  const getTabClassName = (tabName: EditCaseTab) => {
    return `flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
      activeTab === tabName
        ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
    }`;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
      <button
        type="button"
        onClick={() => onTabChange('case-detail')}
        className={getTabClassName('case-detail')}
      >
        <DocsIcon className="h-5.5 w-5" />
        Case Detail
      </button>
      
      <button
        type="button"
        onClick={() => onTabChange('people')}
        className={getTabClassName('people')}
      >
        <svg className="h-5.5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        People
      </button>
      
      <button
        type="button"
        onClick={() => onTabChange('artifacts')}
        className={getTabClassName('artifacts')}
      >
        <svg className="h-5.5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Artifacts
      </button>
      
      <button
        type="button"
        onClick={() => onTabChange('notes')}
        className={getTabClassName('notes')}
      >
        <svg className="h-5.5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Notes
      </button>
      
      <button
        type="button"
        onClick={() => onTabChange('related-cases')}
        className={getTabClassName('related-cases')}
      >
        <svg className="h-5.5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Related Cases
      </button>
    </div>
  );
} 