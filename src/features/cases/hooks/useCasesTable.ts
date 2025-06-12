"use client";

import { useState, useRef, useEffect } from 'react';
import { useCases } from './useCases';
import { SortField } from '../types';

export function useCasesTable() {
  // Core table state
  const [currentParams, setCurrentParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    sortField: 'case_added_date',
    sortDirection: 'desc' as 'asc' | 'desc'
  });

  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook for cases data
  const { 
    cases, 
    pagination, 
    filters, 
    sorting, 
    loading, 
    error, 
    refetch
  } = useCases(currentParams);

  // Sort handler
  const requestSort = (field: SortField) => {
    const newDirection: 'asc' | 'desc' = sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc';
    const newParams = { ...currentParams, sortField: field, sortDirection: newDirection, page: 1 };
    setCurrentParams(newParams);
  };

  // Debounced search function
  const performSearch = (searchTerm: string) => {
    const newParams = { ...currentParams, search: searchTerm.trim(), page: 1 };
    setCurrentParams(newParams);
  };

  // Search handlers
  const handleExplicitSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    performSearch(searchInput);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExplicitSearch();
    }
  };

  const handleSearchChange = (term: string) => {
    setSearchInput(term);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Only search immediately when input is cleared (empty)
    if (term === '') {
      performSearch('');
    }
    // Remove the automatic debounced search - user must click search icon or press Enter
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    const newParams = { ...currentParams, page };
    setCurrentParams(newParams);
  };

  const handleItemsPerPageChange = (items: number) => {
    const newParams = { ...currentParams, limit: items, page: 1 };
    setCurrentParams(newParams);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Format datetime for display
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return {
    // Data
    cases,
    pagination,
    filters,
    sorting,
    loading,
    error,
    
    // Search
    searchInput,
    currentParams,
    
    // Handlers
    requestSort,
    handleExplicitSearch,
    handleSearchKeyPress,
    handleSearchChange,
    handlePageChange,
    handleItemsPerPageChange,
    refetch,
    
    // Utilities
    formatDate,
    formatDateTime
  };
} 