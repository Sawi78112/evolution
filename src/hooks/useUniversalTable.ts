import { useState, useEffect, useRef } from 'react';
import { TableSearchConfig } from '@/lib/search/SearchConfig';
import { UniversalSearch } from '@/lib/search/UniversalSearch';

// Generic interfaces for any table
export interface UniversalTableData {
  [key: string]: any; // Dynamic structure based on table config
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FiltersData {
  search: string | null;
  status: string | null;
}

export interface TableResponse {
  success: boolean;
  data: UniversalTableData[];
  pagination: PaginationData;
  filters: FiltersData;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

// Universal Table Hook - works with any table
export const useUniversalTable = (config: TableSearchConfig, params: QueryParams = {}) => {
  const [data, setData] = useState<UniversalTableData[]>([]);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  const searchInstanceRef = useRef<UniversalSearch | null>(null);

  // Initialize search instance
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && serviceRoleKey) {
      searchInstanceRef.current = new UniversalSearch(config, supabaseUrl, serviceRoleKey);
    }
  }, [config]);

  const fetchData = async (queryParams: QueryParams = {}) => {
    if (!searchInstanceRef.current || fetchingRef.current) {
      return;
    }
    
    setLoading(true);
    setError(null);
    fetchingRef.current = true;
    
    try {
      const finalParams = { ...params, ...queryParams };
      
      const result = await searchInstanceRef.current.search(
        finalParams.search || '',
        finalParams.page || 1,
        finalParams.limit || 10,
        finalParams.status
      );
      
      setData(result.data);
      setPagination(result.pagination);
      setFilters({
        search: finalParams.search || null,
        status: finalParams.status || null
      });
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setData([]);
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
    fetchData();
  }, []);

  // Function to manually refetch data with new parameters
  const refetch = (newParams: QueryParams = {}) => {
    fetchData(newParams);
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

  return { 
    data, 
    pagination,
    filters,
    loading, 
    error, 
    refetch,
    goToPage,
    changeLimit,
    search,
    filterByStatus,
    config // Return config for component customization
  };
}; 