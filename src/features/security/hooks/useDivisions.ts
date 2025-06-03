import { useState, useEffect, useRef } from 'react';

// Interface for division data
export interface DivisionData {
  id: string;
  name: string;
  abbreviation: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  manager: {
    id: string;
    name: string;
    abbreviation: string;
    image: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
    abbreviation: string;
  } | null;
  totalUsers: number;
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
export interface DivisionsResponse {
  success: boolean;
  data: DivisionData[];
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

// Hook to fetch divisions from API with server-side pagination
export const useDivisions = (params: QueryParams = {}) => {
  const [divisions, setDivisions] = useState<DivisionData[]>([]);
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
    field: 'createdAt',
    direction: 'desc'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false); // Prevent multiple simultaneous requests

  const fetchDivisions = async (queryParams: QueryParams = {}) => {
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

      const url = `/api/divisions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch divisions');
      }
      
      const data: DivisionsResponse = await response.json();
      
      setDivisions(data.data || []);
      setPagination(data.pagination);
      setFilters(data.filters);
      setSorting(data.sorting);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setDivisions([]);
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
    fetchDivisions();
  }, []);

  // Function to manually refetch data with new parameters
  const refetch = (newParams: QueryParams = {}) => {
    fetchDivisions(newParams);
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
    divisions, 
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