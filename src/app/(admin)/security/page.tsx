"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { SecurityTable, DivisionTable } from "@/features/security";
import { RoleGuard, RoleChecker } from "@/components/auth/RoleGuard";
import { useRoleContext } from "@/context/RoleContext";
import React, { useState } from "react";

type TabType = 'users' | 'divisions';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const { canManageDivisions, loading: roleLoading, isAdmin } = useRoleContext();

  return (
    <RoleGuard 
      allowedRoles={['Administrator', 'Divisional Manager']}
      redirect="/alerts"
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="mb-4">
              <svg 
                className="mx-auto h-12 w-12 text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Only Administrators and Divisional Managers can access the Security section.
            </p>
          </div>
        </div>
      }
    >
      <div>
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
                
                {/* Division Management tab - ONLY for Administrators (not Divisional Managers) */}
                {!roleLoading && (
                  <RoleChecker allowedRoles={['Administrator']}>
                    <>
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
                    </>
                  </RoleChecker>
                )}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'users' && <SecurityTable />}
            {activeTab === 'divisions' && !roleLoading && isAdmin() && <DivisionTable />}
            
            
            {activeTab === 'divisions' && roleLoading && (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            )}
            
            {/* No access message for division tab - only for non-Administrators */}
            {activeTab === 'divisions' && !roleLoading && !isAdmin() && (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    You don't have permission to manage divisions.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Only Administrators can access Division Management.
                  </p>
                </div>
              </div>
            )}
          </ComponentCard>
        </div>
      </div>
    </RoleGuard>
  );
}
