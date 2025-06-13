"use client";

import React from 'react';

// Placeholder Tab Component
interface TabPlaceholderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
}

export function TabPlaceholder({ icon, title, description, bgColor }: TabPlaceholderProps) {
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