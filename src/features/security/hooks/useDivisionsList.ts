import { useState, useEffect } from 'react';

// Interface for division with manager info for user modals
export interface DivisionWithManager {
  id: string;
  name: string;
  abbreviation: string;
  manager: {
    id: string;
    name: string;
    abbreviation: string;
    image: string;
  } | null;
}

// Hook to fetch divisions list with manager information
export const useDivisionsList = () => {
  const [divisions, setDivisions] = useState<DivisionWithManager[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDivisions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all divisions without pagination to get the full list
        const response = await fetch('/api/divisions?limit=1000', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch divisions: ${response.status}`);
        }

        const data = await response.json();
        
        // Transform to the expected format
        const transformedDivisions: DivisionWithManager[] = data.data.map((division: any) => ({
          id: division.id,
          name: division.name,
          abbreviation: division.abbreviation,
          manager: division.manager
        }));
        
        setDivisions(transformedDivisions);
        console.log('Loaded divisions for user modals:', transformedDivisions.length);
      } catch (error) {
        console.error('Failed to fetch divisions:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch divisions');
        setDivisions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDivisions();
  }, []);

  // Helper function to get manager by division name
  const getManagerByDivisionName = (divisionName: string) => {
    const division = divisions.find(d => d.name === divisionName);
    return division?.manager || null;
  };

  // Helper function to get division names only
  const getDivisionNames = () => {
    return divisions.map(d => d.name);
  };

  return { 
    divisions, 
    loading, 
    error, 
    getManagerByDivisionName, 
    getDivisionNames 
  };
}; 