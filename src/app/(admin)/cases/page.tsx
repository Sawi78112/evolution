"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { CasesManagement } from "@/features/cases/components/CasesManagement";
import { TimeIcon } from "@/assets/icons";
import React from "react";

export default function CasesPage() {
  const handleActivityClick = () => {
    console.log('Activity clicked');
    // TODO: Implement activity modal or navigation
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Cases" />
      <ComponentCard title="">
        {/* Tab Navigation - Simple Breadcrumb Style */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Cases Management
              </span>
            </div>
            <button
              onClick={handleActivityClick}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
            >
              <TimeIcon className="h-5 w-5 flex-shrink-0" />
              <span>Activity</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <CasesManagement />
      </ComponentCard>
    </div>
  );
}
