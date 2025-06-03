"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

export type UserRole = 'Administrator' | 'Divisional Manager' | 'Analyst' | 'Investigator' | 'System Support';

interface RoleContextType {
  roles: UserRole[];
  divisionId: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccessSecurity: () => boolean;
  canManageDivisions: () => boolean;
  isAdmin: () => boolean;
  isDivisionManager: () => boolean;
  refetch: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const { user, session } = useAuth();
  const [roleData, setRoleData] = useState({
    roles: [] as UserRole[],
    divisionId: null as string | null,
    userId: null as string | null,
    loading: false,
    error: null as string | null
  });
  const [isFetching, setIsFetching] = useState(false);

  const fetchUserRoles = async () => {
    if (!user || !session || isFetching) {
      return;
    }

    try {
      setIsFetching(true);
      setRoleData(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/user-roles', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user roles');
      }

      const data = await response.json();

      setRoleData({
        roles: data.roles as UserRole[],
        divisionId: data.divisionId,
        userId: user.id,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRoleData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!user || !session) {
      setRoleData({
        roles: [],
        divisionId: null,
        userId: null,
        loading: false,
        error: null
      });
      return;
    }

    // Only fetch if we don't have data for this user
    if (roleData.userId !== user.id && !isFetching) {
      fetchUserRoles();
    }
  }, [user?.id, session?.access_token]); // Only depend on user ID and access token

  // Helper functions
  const hasRole = (role: UserRole): boolean => {
    return roleData.roles.includes(role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => roleData.roles.includes(role));
  };

  const canAccessSecurity = (): boolean => {
    return hasAnyRole(['Administrator', 'Divisional Manager']);
  };

  const canManageDivisions = (): boolean => {
    return hasRole('Administrator');
  };

  const isAdmin = (): boolean => {
    return hasRole('Administrator');
  };

  const isDivisionManager = (): boolean => {
    return hasRole('Divisional Manager');
  };

  const refetch = async (): Promise<void> => {
    await fetchUserRoles();
  };

  const value: RoleContextType = {
    ...roleData,
    hasRole,
    hasAnyRole,
    canAccessSecurity,
    canManageDivisions,
    isAdmin,
    isDivisionManager,
    refetch
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoleContext(): RoleContextType {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }
  return context;
} 