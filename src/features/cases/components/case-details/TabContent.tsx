"use client";

import React from 'react';

interface TabPlaceholderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
}

function TabPlaceholder({ icon, title, description, bgColor }: TabPlaceholderProps) {
  return (
    <div className="h-[650px] flex items-center justify-center">
      <div className="text-center">
        <div className={`p-4 ${bgColor} rounded-2xl mb-4 inline-block`}>
          {icon}
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{description}</p>
        <p className="text-base text-gray-400 dark:text-gray-500 mt-4">Feature coming soon...</p>
      </div>
    </div>
  );
}

export function PeopleTabContent() {
  return (
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
  );
}

export function ArtifactsTabContent() {
  return (
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
  );
}

export function NotesTabContent() {
  return (
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
  );
}

export function RelatedCasesTabContent() {
  return (
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
  );
} 