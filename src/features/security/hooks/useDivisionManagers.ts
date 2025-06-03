import { useState, useEffect } from 'react';

// Interface for Divisional Manager user from database
export interface DivisionManagerUser {
  id: string;
  username: string;
  abbreviation: string;
}

// Hook options for filtering divisional managers
export interface UseDivisionManagersOptions {
  excludeExistingManagers?: boolean; // Exclude users who are already divisional managers
  includeDivisionId?: string;        // For edit mode - include current manager of this division
}

// Hook to fetch Divisional Manager users from database
export const useDivisionManagers = (options: UseDivisionManagersOptions = {}) => {
  const [divisionManagers, setDivisionManagers] = useState<DivisionManagerUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { excludeExistingManagers = false, includeDivisionId } = options;

  useEffect(() => {
    const fetchDivisionManagers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (excludeExistingManagers) {
          params.append('excludeManagers', 'true');
        }
        if (includeDivisionId) {
          params.append('includeDivisionId', includeDivisionId);
        }

        const queryString = params.toString();
        const url = `/api/users/division-managers${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch division managers: ${response.status}`);
        }

        const data = await response.json();
        setDivisionManagers(data);
        console.log('Loaded division managers:', data.length, excludeExistingManagers ? '(excluding existing managers)' : '(all division managers)');
      } catch (error) {
        console.error('Failed to fetch division managers:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch division managers');
        setDivisionManagers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDivisionManagers();
  }, [excludeExistingManagers, includeDivisionId]);

  return { divisionManagers, loading, error };
};

// Convenience hooks for specific use cases
export const useAvailableDivisionManagers = () => {
  return useDivisionManagers({ excludeExistingManagers: true });
};

export const useEditableDivisionManagers = (divisionId: string) => {
  return useDivisionManagers({ 
    excludeExistingManagers: true, 
    includeDivisionId: divisionId 
  });
}; 