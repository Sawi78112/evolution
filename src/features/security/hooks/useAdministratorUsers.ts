import { useState, useEffect } from 'react';

// Interface for Administrator user from database
export interface AdministratorUser {
  id: string;
  username: string;
  abbreviation: string;
}

// Hook options for filtering administrators
export interface UseAdministratorUsersOptions {
  excludeExistingManagers?: boolean; // Exclude users who are already division managers
  includeDivisionId?: string;        // For edit mode - include current manager of this division
}

// Hook to fetch Administrator users from database
export const useAdministratorUsers = (options: UseAdministratorUsersOptions = {}) => {
  const [administrators, setAdministrators] = useState<AdministratorUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { excludeExistingManagers = false, includeDivisionId } = options;

  useEffect(() => {
    const fetchAdministrators = async () => {
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
        const url = `/api/users/administrators${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch administrators: ${response.status}`);
        }

        const data = await response.json();
        setAdministrators(data);
        console.log('Loaded administrators:', data.length, excludeExistingManagers ? '(excluding existing managers)' : '(all administrators)');
      } catch (error) {
        console.error('Failed to fetch administrators:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch administrators');
        setAdministrators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdministrators();
  }, [excludeExistingManagers, includeDivisionId]);

  return { administrators, loading, error };
};

// Convenience hooks for specific use cases
export const useAvailableAdministrators = () => {
  return useAdministratorUsers({ excludeExistingManagers: true });
};

export const useEditableAdministrators = (divisionId: string) => {
  return useAdministratorUsers({ 
    excludeExistingManagers: true, 
    includeDivisionId: divisionId 
  });
}; 