'use client';

import { useRequireAdmin } from "@/hooks/useRequireAuth";
import UnauthorizedAccess from "@/components/common/UnauthorizedAccess";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Component that protects routes to be accessible only by admin users
 */
export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isUnauthorized, isLoading } = useRequireAdmin();

  // Show loading skeleton while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-[1400px] mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized message if user is not admin
  if (isUnauthorized) {
    return <UnauthorizedAccess />;
  }

  // If admin, render the protected content
  return <>{children}</>;
} 