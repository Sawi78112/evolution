"use client";

import React from 'react';
import { useRoleContext, UserRole } from '@/context/RoleContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAllRoles?: boolean;
  fallback?: React.ReactNode;
  redirect?: string;
  showLoadingSpinner?: boolean;
}

export function RoleGuard({ 
  children, 
  allowedRoles = [], 
  requireAllRoles = false,
  fallback = null,
  redirect,
  showLoadingSpinner = true
}: RoleGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading, hasAnyRole } = useRoleContext();
  const router = useRouter();

  // Show loading spinner while auth or roles are loading
  if ((authLoading || roleLoading) && showLoadingSpinner) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // If user is not authenticated, don't render anything (middleware should handle this)
  if (!user) {
    return null;
  }

  // If no roles specified, allow access
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check role access
  const hasAccess = requireAllRoles 
    ? allowedRoles.every(role => roles.includes(role))
    : hasAnyRole(allowedRoles);

  if (!hasAccess) {
    // Redirect if specified
    if (redirect) {
      router.push(redirect);
      return null;
    }

    // Show fallback or nothing
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Higher-order component version
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[],
  options: {
    requireAllRoles?: boolean;
    fallback?: React.ReactNode;
    redirect?: string;
  } = {}
) {
  return function RoleGuardedComponent(props: P) {
    return (
      <RoleGuard 
        allowedRoles={allowedRoles}
        requireAllRoles={options.requireAllRoles}
        fallback={options.fallback}
        redirect={options.redirect}
      >
        <Component {...props} />
      </RoleGuard>
    );
  };
}

// Simple role checker component for conditional rendering
interface RoleCheckerProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  requireAllRoles?: boolean;
}

export function RoleChecker({ children, allowedRoles, requireAllRoles = false }: RoleCheckerProps) {
  const { hasAnyRole, roles, loading } = useRoleContext();

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  const hasAccess = requireAllRoles 
    ? allowedRoles.every(role => roles.includes(role))
    : hasAnyRole(allowedRoles);

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
} 