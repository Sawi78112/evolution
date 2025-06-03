import { useState, useEffect } from 'react';

// Interface for current user
export interface CurrentUser {
  user_id: string;
  username: string;
  user_abbreviation: string;
}

// Hook to get current user information
export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // TODO: Replace this with your actual authentication logic
        // For now, using a mock current user
        // In a real app, you'd get this from your auth context or session
        
        const mockCurrentUser: CurrentUser = {
          user_id: '22b5ff5f-2fec-4c1e-9851-34ec3616d1d4', // Jasper Knox's ID from your DB
          username: 'Jasper Knox',
          user_abbreviation: 'JAKN'
        };
        
        setCurrentUser(mockCurrentUser);
      } catch (error) {
        setError('Failed to get current user');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  // Helper function to get created_by string (for display purposes)
  const getCreatedByString = (): string => {
    if (!currentUser) return '';
    return `${currentUser.username} - ${currentUser.user_abbreviation}`;
  };

  // Helper function to get user ID (for database storage)
  const getUserId = (): string => {
    if (!currentUser) return '';
    return currentUser.user_id;
  };

  return { 
    currentUser, 
    loading, 
    error, 
    getCreatedByString,
    getUserId
  };
}; 