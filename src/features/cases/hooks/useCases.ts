"use client";

import { useState, useEffect, useCallback } from 'react';
import { CasesResponse, CaseData, SortField } from '../types';

interface UseCasesParams {
  page: number;
  limit: number;
  search: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

export function useCases(params: UseCasesParams) {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    search: null as string | null
  });
  const [sorting, setSorting] = useState({
    field: 'case_added_date',
    direction: 'desc' as 'asc' | 'desc'
  });

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        sortField: params.sortField,
        sortDirection: params.sortDirection
      });

      if (params.search) {
        searchParams.append('search', params.search);
      }

      const response = await fetch(`/api/cases?${searchParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch cases');
      }

      const data: CasesResponse = await response.json();
      
      setCases(data.data);
      setPagination(data.pagination);
      setFilters(data.filters);
      setSorting(data.sorting);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, params.search, params.sortField, params.sortDirection]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const refetch = useCallback(() => {
    fetchCases();
  }, [fetchCases]);

  const goToPage = useCallback((page: number) => {
    // This will be handled by the parent component
    // by updating the params which will trigger a refetch
  }, []);

  const changeLimit = useCallback((limit: number) => {
    // This will be handled by the parent component
    // by updating the params which will trigger a refetch
  }, []);

  const search = useCallback((searchTerm: string) => {
    // This will be handled by the parent component
    // by updating the params which will trigger a refetch
  }, []);

  const sort = useCallback((field: SortField, direction: 'asc' | 'desc') => {
    // This will be handled by the parent component
    // by updating the params which will trigger a refetch
  }, []);

  return {
    cases,
    pagination,
    filters,
    sorting,
    loading,
    error,
    refetch,
    goToPage,
    changeLimit,
    search,
    sort
  };
} 