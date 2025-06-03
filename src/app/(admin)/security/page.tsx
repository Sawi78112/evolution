"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { SecurityTable, DivisionTable } from "@/features/security";
import React, { useState } from "react";

type TabType = 'users' | 'divisions';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('users');

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Security" />
      <div className="space-y-6">
        <ComponentCard title="">
          {/* Tab Navigation - Simple Breadcrumb Style */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('users')}
                className={`text-lg font-medium transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-300 ${
                  activeTab === 'users'
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                User Management
              </button>
              <span className="text-gray-400 dark:text-gray-600">/</span>
              <button
                onClick={() => setActiveTab('divisions')}
                className={`text-lg font-medium transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-300 ${
                  activeTab === 'divisions'
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                Division Management
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'users' && <SecurityTable />}
          {activeTab === 'divisions' && <DivisionTable />}
        </ComponentCard>
      </div>
    </div>
  );
}
