"use client";

import React from 'react';
import { DocsIcon, UserIcon, BoxCubeIcon } from '@/assets/icons';

export type CaseTab = 'case-detail' | 'people' | 'artifacts' | 'notes' | 'related-cases';

interface CaseTabNavigationProps {
  activeTab: CaseTab;
  onTabChange: (tab: CaseTab) => void;
}

export function CaseTabNavigation({ activeTab, onTabChange }: CaseTabNavigationProps) {
  const getTabClassName = (tabName: CaseTab) => {
    return `flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
      activeTab === tabName
        ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
    }`;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
      <button
        onClick={() => onTabChange('case-detail')}
        className={getTabClassName('case-detail')}
      >
        <DocsIcon className="h-5.5 w-5" />
        Case Detail
      </button>
      
      <button
        onClick={() => onTabChange('people')}
        className={getTabClassName('people')}
      >
        <UserIcon className="h-5.5 w-5" />
        People
      </button>
      
      <button
        onClick={() => onTabChange('artifacts')}
        className={getTabClassName('artifacts')}
      >
        <svg className="h-5.5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Artifacts
      </button>
      
      <button
        onClick={() => onTabChange('notes')}
        className={getTabClassName('notes')}
      >
        <svg className="h-5.5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Notes
      </button>
      
      <button
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