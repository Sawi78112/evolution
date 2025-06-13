"use client";

import React, { useState } from 'react';
import { CasesSearchAndFilters } from './CasesSearchAndFilters';
import { CasesTable } from './CasesTable';
import { CaseDetailsModal } from './CaseDetailsModal';
import { AddCaseModal } from './add-case';
import { EditCaseModal } from './edit-case';
import { DeleteCaseModal } from './DeleteCaseModal';
import Pagination from '@/components/tables/Pagination';
import { useCasesTable } from '../hooks/useCasesTable';
import { useNotification } from '@/components/ui/notification';

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
    refetch,
    
    // Utilities
    formatDate,
    formatDateTime
  } = useCasesTable();

  const notification = useNotification();

  // Modal state
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCaseData, setSelectedCaseData] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    // Find the case data
    const caseData = cases.find(c => c.id === caseId);
    if (caseData) {
      setSelectedCaseId(caseId);
      setSelectedCaseData(caseData);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCaseId(null);
    setSelectedCaseData(null);
  };

  const handleSaveCase = (updatedCaseData: any) => {
    console.log('Saving updated case:', updatedCaseData);
    setIsEditModalOpen(false);
    setSelectedCaseId(null);
    setSelectedCaseData(null);
    // Refresh the cases list to show the updated case
    refetch();
  };

  const handleRemoveCase = (caseId: string) => {
    // Find the case data
    const caseData = cases.find(c => c.id === caseId);
    if (caseData) {
      setSelectedCaseId(caseId);
      setSelectedCaseData(caseData);
      setIsDeleteModalOpen(true);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCaseId(null);
    setSelectedCaseData(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCaseId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/cases/${selectedCaseId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete case');
      }
      
      const result = await response.json();
      console.log('Case deleted successfully:', result);
      
      // Show success notification
      notification.success(
        'Case Deleted Successfully',
        `"${selectedCaseData?.name}" has been permanently removed from the system.`
      );
      
      // Close modal and reset state
      setIsDeleteModalOpen(false);
      setSelectedCaseId(null);
      setSelectedCaseData(null);
      
      // Refresh the cases list
      refetch();
      
    } catch (error) {
      console.error('Failed to delete case:', error);
      
      // Show error notification
      notification.error(
        'Failed to Delete Case',
        error instanceof Error ? error.message : 'An unexpected error occurred while deleting the case.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddCase = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddCaseSuccess = () => {
    setIsAddModalOpen(false);
    console.log('Case added successfully');
    // Refresh the cases list to show the new case
    refetch();
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

      {/* Add Case Modal */}
      <AddCaseModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleAddCaseSuccess}
      />

      {/* Edit Case Modal */}
      {selectedCaseData && (
        <EditCaseModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          caseData={selectedCaseData}
          onSave={handleSaveCase}
        />
      )}

      {/* Case Details Modal */}
      {selectedCaseId && (
        <CaseDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          caseId={selectedCaseId}
        />
      )}

      {/* Delete Case Modal */}
      {selectedCaseData && (
        <DeleteCaseModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          caseId={selectedCaseData.id}
          caseName={selectedCaseData.name}
          loading={isDeleting}
        />
      )}
    </div>
  );
} 