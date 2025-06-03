import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

// Interface for user data
export interface UserData {
  id: string;
  no: number;
  username: string;
  abbreviation: string;
  avatar_url?: string;
  division: string;
  manager: string;
  lastLogin?: string;
  status: string;
  email: string;
  roles: string[];
}

// Interface for pagination metadata
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Interface for filters
export interface FiltersData {
  search: string | null;
  status: string | null;
}

// Interface for sorting
export interface SortingData {
  field: string;
  direction: 'asc' | 'desc';
}

// Interface for API response
export interface UsersResponse {
  success: boolean;
  data: UserData[];
  pagination: PaginationData;
  filters: FiltersData;
  sorting: SortingData;
}

// Interface for query parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// Hook to fetch users from API with server-side pagination
export const useUsersList = (params: QueryParams = {}) => {
  const { session } = useAuth(); // Get session for auth headers
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState<FiltersData>({
    search: null,
    status: null
  });
  const [sorting, setSorting] = useState<SortingData>({
    field: 'username',
    direction: 'asc'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false); // Prevent multiple simultaneous requests

  const fetchUsers = async (queryParams: QueryParams = {}) => {
    // Prevent multiple simultaneous requests
    if (fetchingRef.current) {
      return;
    }
    
    setLoading(true);
    setError(null);
    fetchingRef.current = true;
    
    try {
      // Build query string
      const searchParams = new URLSearchParams();
      
      // Merge default params with provided params
      const finalParams = { ...params, ...queryParams };
      
      if (finalParams.page) searchParams.set('page', finalParams.page.toString());
      if (finalParams.limit) searchParams.set('limit', finalParams.limit.toString());
      if (finalParams.search) searchParams.set('search', finalParams.search);
      if (finalParams.status) searchParams.set('status', finalParams.status);
      if (finalParams.sortField) searchParams.set('sortField', finalParams.sortField);
      if (finalParams.sortDirection) searchParams.set('sortDirection', finalParams.sortDirection);
      
      // Add cache-busting parameter to ensure fresh data
      searchParams.set('_t', Date.now().toString());

      const url = `/api/users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      
      // Prepare headers with authorization
      const headers: Record<string, string> = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Content-Type': 'application/json'
      };

      // Add authorization header if session exists
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      
      const data: UsersResponse = await response.json();
      
      setUsers(data.data || []);
      setPagination(data.pagination);
      setFilters(data.filters);
      setSorting(data.sorting);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setUsers([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    // Only fetch when session is available (for auth header)
    if (session) {
      fetchUsers();
    }
  }, [session?.access_token]); // Depend on session token

  // Function to manually refetch data with new parameters
  const refetch = (newParams: QueryParams = {}) => {
    fetchUsers(newParams);
  };

  // Function to go to specific page
  const goToPage = (page: number) => {
    refetch({ ...params, page });
  };

  // Function to change items per page
  const changeLimit = (limit: number) => {
    refetch({ ...params, limit, page: 1 });
  };

  // Function to search
  const search = (searchTerm: string) => {
    refetch({ ...params, search: searchTerm, page: 1 });
  };

  // Function to filter by status
  const filterByStatus = (status: string) => {
    refetch({ ...params, status, page: 1 });
  };

  // Function to sort
  const sort = (sortField: string, sortDirection: 'asc' | 'desc') => {
    refetch({ ...params, sortField, sortDirection, page: 1 });
  };

  return { 
    users, 
    pagination,
    filters,
    sorting,
    loading, 
    error, 
    refetch,
    goToPage,
    changeLimit,
    search,
    filterByStatus,
    sort
  };
}; 