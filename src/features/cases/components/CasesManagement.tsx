"use client";

import React, { useState } from 'react';
import { CasesSearchAndFilters } from './CasesSearchAndFilters';
import { CasesTable } from './CasesTable';
import { CaseDetailsModal } from './CaseDetailsModal';
import Pagination from '@/components/tables/Pagination';
import { useCasesTable } from '../hooks/useCasesTable';

export function CasesManagement() {
  const {
    // Data
    cases,
    pagination,
    sorting,
    loading,
    error,
    
    // Search
    searchInput,
    
    // Handlers
    requestSort,
    handleExplicitSearch,
    handleSearchKeyPress,
    handleSearchChange,
    handlePageChange,
    handleItemsPerPageChange,
    
    // Utilities
    formatDate,
    formatDateTime
  } = useCasesTable();

  // Modal state
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Action handlers
  const handleDetailCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCaseId(null);
  };

  const handleEditCase = (caseId: string) => {
    console.log('Edit case:', caseId);
    // TODO: Implement case edit modal
  };

  const handleRemoveCase = (caseId: string) => {
    console.log('Remove case:', caseId);
    // TODO: Implement case removal confirmation modal
  };

  const handleAddCase = () => {
    console.log('Add new case');
    // TODO: Implement add case modal or navigation
  };

  return (
    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-gray-800 dark:bg-gray-900" style={{ overflow: 'visible' }}>
      {/* Search and Filters */}
      <CasesSearchAndFilters
        itemsPerPage={pagination.limit}
        onItemsPerPageChange={handleItemsPerPageChange}
        searchTerm={searchInput}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleExplicitSearch}
        onSearchKeyPress={handleSearchKeyPress}
        onAddCase={handleAddCase}
      />

      {/* Desktop Table View */}
      <div className="max-w-full overflow-x-auto custom-scrollbar overflow-y-visible" style={{ overflowY: 'visible' }}>
        <div className="min-w-[1400px]" style={{ overflow: 'visible' }}>
          <CasesTable
            cases={cases}
            loading={loading}
            error={error}
            sorting={sorting}
            onSort={requestSort}
            formatDate={formatDate}
            formatDateTime={formatDateTime}
            onDetail={handleDetailCase}
            onEdit={handleEditCase}
            onRemove={handleRemoveCase}
          />
        </div>
      </div>

      {/* Pagination */}
      {!loading && !error && cases.length > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
            {pagination.totalCount} results
          </div>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Case Details Modal */}
      {selectedCaseId && (
        <CaseDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          caseId={selectedCaseId}
        />
      )}
    </div>
  );
} 