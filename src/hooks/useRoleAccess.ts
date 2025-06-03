"use client";

import { useRoleContext, UserRole } from '@/context/RoleContext';

// Re-export the type for backward compatibility
export type { UserRole };

interface UserRoleData {
  roles: UserRole[];
  divisionId: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
}

export function useRoleAccess(): UserRoleData & {
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccessSecurity: () => boolean;
  canManageDivisions: () => boolean;
  isAdmin: () => boolean;
  isDivisionManager: () => boolean;
  refetch: () => Promise<void>;
} {
  // Use the centralized role context instead of making individual API calls
  return useRoleContext();
} 