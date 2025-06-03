"use client";

import React from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/tables/Pagination";
import { AddDivisionModal } from "./AddDivisionModal";
import { EditDivisionModal } from "./EditDivisionModal";
import { DeleteDivisionModal } from "./DeleteDivisionModal";

// Extracted components
import {
  DivisionSearchAndFilters,
  DivisionTableHeader,
  DivisionTableRow,
  DivisionMobileCard
} from "./components";

// Custom hook and types
import { useDivisionTable } from "./hooks/useDivisionTable";
import { SortField } from "./types";

export default function DivisionTable() {
  const {
    // Data
    divisions,
    pagination,
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
    handleAddDivision,
    handleEditDivision,
    handleDeleteDivision,
    handleStatusChange,
    toggleStatusPopover,
    
    // Modal state
    isAddModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    selectedDivision,
    selectedDivisionForDelete,
    deletingDivision,
    handleModalClose,
    handleEditModalClose,
    handleDeleteModalClose,
    handleModalSubmit,
    handleEditModalSubmit,
    handleConfirmDelete,
    refetch,
    
    // Status popover state
    openStatusPopover,
    selectedStatuses,
    statusDropdownPosition,
    clickCoordinates
  } = useDivisionTable();

  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading divisions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400 mb-2">Error loading divisions</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-gray-800 dark:bg-gray-900" style={{ overflow: 'visible' }}>
      <DivisionSearchAndFilters
        itemsPerPage={currentParams.limit}
        onItemsPerPageChange={handleItemsPerPageChange}
        searchTerm={searchInput}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleExplicitSearch}
        onSearchKeyPress={handleSearchKeyPress}
        onAddDivision={handleAddDivision}
      />

      {/* Mobile Card View (hidden on lg and up) */}
      <div className="lg:hidden space-y-4">
        {divisions.map((division, index) => (
          <DivisionMobileCard
            key={division.id}
            division={division}
            index={index}
            currentPage={pagination.currentPage}
            limit={pagination.limit}
            selectedStatuses={selectedStatuses}
            onStatusChange={handleStatusChange}
            onEdit={handleEditDivision}
            onDelete={handleDeleteDivision}
            onToggleStatusPopover={toggleStatusPopover}
            openStatusPopover={openStatusPopover}
            statusDropdownPosition={statusDropdownPosition}
            clickCoordinates={clickCoordinates}
          />
        ))}
      </div>

      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden lg:block">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1200px]">
            <Table>
              <DivisionTableHeader
                sortConfig={{
                  field: sorting.field as SortField,
                  direction: sorting.direction
                }}
                onSort={requestSort}
              />
              
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {divisions.map((division, index) => (
                  <DivisionTableRow
                    key={division.id}
                    division={division}
                    index={index}
                    currentPage={pagination.currentPage}
                    limit={pagination.limit}
                    selectedStatuses={selectedStatuses}
                        onEdit={handleEditDivision}
                    onDelete={handleDeleteDivision}
                    onStatusChange={handleStatusChange}
                    onToggleStatusPopover={toggleStatusPopover}
                    openStatusPopover={openStatusPopover}
                    statusDropdownPosition={statusDropdownPosition}
                    clickCoordinates={clickCoordinates}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} entries
        </div>
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddDivisionModal
          isOpen={isAddModalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          onRefetch={refetch}
        />
      )}

      {isEditModalOpen && selectedDivision && (
        <EditDivisionModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSubmit={handleEditModalSubmit}
          onRefetch={refetch}
          divisionData={selectedDivision}
        />
      )}

      {isDeleteModalOpen && selectedDivisionForDelete && (
        <DeleteDivisionModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          onConfirm={handleConfirmDelete}
          divisionId={selectedDivisionForDelete.id}
          divisionName={selectedDivisionForDelete.name}
          loading={deletingDivision}
        />
      )}
    </div>
  );
} 