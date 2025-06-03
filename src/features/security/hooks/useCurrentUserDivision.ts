import { useState, useEffect } from 'react';
import { useRoleContext } from '@/context/RoleContext';
import { useAuth } from '@/context/AuthContext';
import { useDivisionsList } from './useDivisionsList';

export interface CurrentUserDivision {
  divisionId: string | null;
  divisionName: string | null;
  isManager: boolean;
  managerId: string | null;
  loading: boolean;
  error: string | null;
}

export const useCurrentUserDivision = (): CurrentUserDivision => {
  const { divisionId, isDivisionManager, userId, loading: roleLoading } = useRoleContext();
  const { divisions, loading: divisionsLoading, error: divisionsError } = useDivisionsList();

  // Find current user's division from divisions list
  const currentDivision = divisions.find(division => division.id === divisionId);

  return {
    divisionId,
    divisionName: currentDivision?.name || null,
    isManager: isDivisionManager(),
    managerId: currentDivision?.manager?.id || userId || null,
    loading: roleLoading || divisionsLoading,
    error: divisionsError
  };
}; 