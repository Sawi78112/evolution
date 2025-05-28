"use client";

import AdminProtectedRoute from "@/components/common/AdminProtectedRoute";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";

export default function AdminSettingsPage() {
  return (
    <AdminProtectedRoute>
      <div>
        <PageBreadcrumb pageTitle="Admin Settings" />
        <div className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              System Administration
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This page is only accessible to administrators. It demonstrates the AdminProtectedRoute component.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">User Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage user accounts, roles, and permissions.
                </p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">System Configuration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure system-wide settings and preferences.
                </p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Security Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage security policies and access controls.
                </p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Audit Logs</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View system activity and audit trails.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
} 