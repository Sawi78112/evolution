"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";
import Pagination from "@/components/tables/Pagination";
import { ChevronDownIcon, CheckLineIcon } from "@/assets/icons";

// Import from our new modular structure
import { useSecurityTable } from '../hooks/useSecurityTable';
import { useClickOutside } from '@/hooks/useClickOutside';
import { SearchAndFilters } from './SearchAndFilters';
import { ActionButtons } from './ActionButtons';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { AddUserModal, UserFormData } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { DeleteModal } from './DeleteModal';
import { TransferUserModal, TransferFormData } from './TransferUserModal';
import { roleConfig, statusConfig } from '../constants';
import { getSortDirectionIndicator, sortRoles, calculateDropdownPosition } from '../utils';
import { RoleType, StatusType } from '../types';

export default function SecurityTable() {
  const {
    // Data
    currentItems,
    sortedData,
    
    // Pagination
    currentPage,
    itemsPerPage,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    
    // Search
    searchTerm,
    
    // Sorting
    sortConfig,
    
    // Role management
    openPopover,
    selectedRoles,
    dropdownPosition,
    
    // Status management
    openStatusPopover,
    selectedStatuses,
    statusDropdownPosition,
    clickCoordinates,
    
    // Handlers
    handlePageChange,
    handleItemsPerPageChange,
    handleSearchChange,
    requestSort,
    toggleRole,
    changeStatus,
    closePopover,
    closeStatusPopover,
    setOpenPopover,
    setDropdownPosition,
    setOpenStatusPopover,
    setStatusDropdownPosition,
    setClickCoordinates,
  } = useSecurityTable();

  const popoverRef = useClickOutside(closePopover);
  const statusPopoverRef = useClickOutside(closeStatusPopover);

  // Toggle popover with smart positioning
  const togglePopover = (id: number, event: React.MouseEvent) => {
    const targetElement = event.currentTarget as HTMLElement;
    const position = calculateDropdownPosition(targetElement, 300);
    setDropdownPosition(position.direction);
    setOpenPopover(openPopover === id ? null : id);
  };

  // Toggle status popover with smart positioning
  const toggleStatusPopover = (id: number, event: React.MouseEvent) => {
    const targetElement = event.currentTarget as HTMLElement;
    const position = calculateDropdownPosition(targetElement, 250);
    
    setStatusDropdownPosition(position.direction);
    setClickCoordinates({ x: position.x, y: position.y });
    setOpenStatusPopover(openStatusPopover === id ? null : id);
  };

  // Modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserFormData | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<{id: number, name: string} | null>(null);
  const [selectedUserForTransfer, setSelectedUserForTransfer] = useState<{id: number, name: string} | null>(null);

  // Action handlers
  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleAddUserSubmit = (userData: UserFormData) => {
    console.log('New user data:', userData);
    // Here you would typically send the data to your API
    // For now, we'll just log it
  };

  const handleEditUserSubmit = (userData: UserFormData) => {
    console.log('Updated user data:', userData);
    // Here you would typically send the data to your API to update the user
    // For now, we'll just log it
  };

  const handleEditUser = (userId: number) => {
    // Find the user data from current items
    const userToEdit = currentItems.find(user => user.id === userId);
    if (userToEdit) {
      // Convert the user data to the expected format
      const userData = {
        id: userToEdit.id,
        username: userToEdit.user.name,
        abbreviation: userToEdit.abbreviation,
        roles: userToEdit.roles,
        division: userToEdit.division,
        managerId: '1', // Default to first manager, will need to map properly
        email: userToEdit.user.name.toLowerCase().replace(' ', '.') + '@company.com', // Generate email from name
        officePhone: '+1 (555) 123-4567', // Default phone
        homePhone: '',
        homeAddress: '',
        status: userToEdit.status,
        passwordType: 'admin' as const,
        password: '',
      };
      setSelectedUserForEdit(userData);
      setIsEditUserModalOpen(true);
    }
  };

  const handleTransferUser = (userId: number) => {
    // Find the user data from current items
    const userToTransfer = currentItems.find(user => user.id === userId);
    if (userToTransfer) {
      setSelectedUserForTransfer({
        id: userToTransfer.id,
        name: userToTransfer.user.name
      });
      setIsTransferModalOpen(true);
    }
  };

  const handleTransferSubmit = (transferData: TransferFormData) => {
    if (selectedUserForTransfer) {
      console.log('Transfer data:', {
        userId: selectedUserForTransfer.id,
        userName: selectedUserForTransfer.name,
        ...transferData
      });
      // Here you would typically call your API to process the transfer
      // For now, we'll just log it
      setIsTransferModalOpen(false);
      setSelectedUserForTransfer(null);
    }
  };

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false);
    setSelectedUserForTransfer(null);
  };

  const handleRemoveUser = (userId: number) => {
    // Find the user data from current items
    const userToDelete = currentItems.find(user => user.id === userId);
    if (userToDelete) {
      setSelectedUserForDelete({
        id: userToDelete.id,
        name: userToDelete.user.name
      });
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedUserForDelete) {
      console.log('Confirmed delete user:', selectedUserForDelete.id);
      // Here you would typically call your API to delete the user
      // For now, we'll just log it
      setIsDeleteModalOpen(false);
      setSelectedUserForDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUserForDelete(null);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-gray-800 dark:bg-gray-900" style={{ overflow: 'visible' }}>
      <SearchAndFilters
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onAddUser={handleAddUser}
      />

      {/* Mobile Card View (hidden on lg and up) */}
      <div className="lg:hidden space-y-4">
        {currentItems.map((item, index) => (
          <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full flex-shrink-0">
                  <Image
                    src={item.user.image}
                    alt={item.user.name}
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">{item.user.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.abbreviation}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">#{indexOfFirstItem + index + 1}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Roles</p>
                <div className="flex -space-x-1">
                  {sortRoles(selectedRoles[item.id] || item.roles).slice(0, 3).map((role, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-center h-6 w-6 rounded-full text-white font-medium text-xs ${roleConfig[role].color} border border-white dark:border-gray-800`}
                      title={role}
                    >
                      {roleConfig[role].abbr}
                    </div>
                  ))}
                  {(selectedRoles[item.id] || item.roles).length > 3 && (
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-400 text-white font-medium text-xs border border-white dark:border-gray-800">
                      +{(selectedRoles[item.id] || item.roles).length - 3}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <Badge
                  size="sm"
                  color={statusConfig[selectedStatuses[item.id] || item.status].color}
                >
                  {selectedStatuses[item.id] || item.status}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2 mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Division</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.division}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manager</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.manager.name} - {item.manager.abbreviation}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last Login: {item.lastLoginIn}
              </div>
              <ActionButtons
                userId={item.id}
                onEdit={handleEditUser}
                onTransfer={handleTransferUser}
                onRemove={handleRemoveUser}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden lg:block">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 w-16">
                    <span className="font-medium text-gray-500 dark:text-gray-400">No</span>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 min-w-[200px]">
                    <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('user.name')}>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Username</span>
                      {getSortDirectionIndicator('user.name', sortConfig)}
                    </div>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 w-24">
                    <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('abbreviation')}>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Abbr.</span>
                      {getSortDirectionIndicator('abbreviation', sortConfig)}
                    </div>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 min-w-[120px]">
                    <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('roles')}>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Role(s)</span>
                      {getSortDirectionIndicator('roles', sortConfig)}
                    </div>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 min-w-[120px]">
                    <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('division')}>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Division</span>
                      {getSortDirectionIndicator('division', sortConfig)}
                    </div>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 min-w-[150px]">
                    <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('manager.name')}>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Manager</span>
                      {getSortDirectionIndicator('manager.name', sortConfig)}
                    </div>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 min-w-[120px] hidden xl:table-cell">
                    <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('lastLoginIn')}>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Last Login</span>
                      {getSortDirectionIndicator('lastLoginIn', sortConfig)}
                    </div>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 min-w-[120px] hidden xl:table-cell">
                    <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('lastLogOff')}>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Last Logout</span>
                      {getSortDirectionIndicator('lastLogOff', sortConfig)}
                    </div>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 w-24">
                    <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('status')}>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Status</span>
                      {getSortDirectionIndicator('status', sortConfig)}
                    </div>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 w-32">
                    <span className="font-medium text-gray-500 dark:text-gray-400">Action</span>
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {currentItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {indexOfFirstItem + index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full flex-shrink-0">
                          <Image
                            src={item.user.image}
                            alt={item.user.name}
                            width={40}
                            height={40}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-sm font-medium text-gray-800 dark:text-white truncate">
                            {item.user.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.abbreviation}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="relative">
                        <div 
                          className="flex items-center gap-1 cursor-pointer relative"
                          onClick={(e) => togglePopover(item.id, e)}
                        >
                          <div className="flex -space-x-2 flex-wrap">
                            {sortRoles(selectedRoles[item.id] || item.roles).map((role, index) => (
                              <div 
                                key={index} 
                                className={`flex items-center justify-center h-8 w-8 rounded-full text-white font-medium text-xs ${roleConfig[role].color} border-2 border-white dark:border-gray-800`}
                                title={role}
                              >
                                {roleConfig[role].abbr}
                              </div>
                            ))}
                          </div>
                          <ChevronDownIcon 
                            className="ml-1 text-gray-500 flex-shrink-0"
                          />
                        </div>
                        
                        {openPopover === item.id && (
                          <div 
                            ref={popoverRef}
                            className={`absolute z-50 left-0 w-64 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 max-h-[300px] overflow-auto ${
                              dropdownPosition === 'top' 
                                ? 'bottom-full mb-2 transform -translate-y-2' 
                                : 'top-full mt-2 transform translate-y-2'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2">
                              {/* Administrator role shown separately */}
                              <div
                                key="Administrator"
                                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer mb-2 border-b border-gray-200 dark:border-gray-700 pb-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRole(item.id, "Administrator");
                                }}
                              >
                                <Checkbox 
                                  checked={(selectedRoles[item.id] || []).includes("Administrator")}
                                  onChange={() => {}}
                                />
                                <div className={`flex items-center justify-center h-6 w-6 rounded-full text-white text-xs ${roleConfig["Administrator"].color} mr-2`}>
                                  {roleConfig["Administrator"].abbr}
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">Administrator</span>
                                {(selectedRoles[item.id] || []).includes("Administrator") && (
                                  <CheckLineIcon className="ml-auto h-4 w-4 text-green-500" />
                                )}
                              </div>
                              
                              {/* Other roles in specified order */}
                              {["Division Manager", "Analyst", "Investigator", "System Support"].map((role) => {
                                const isSelected = (selectedRoles[item.id] || []).includes(role as RoleType);
                                return (
                                  <div
                                    key={role}
                                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleRole(item.id, role as RoleType);
                                    }}
                                  >
                                    <Checkbox 
                                      checked={isSelected}
                                      onChange={() => {}}
                                    />
                                    <div className={`flex items-center justify-center h-6 w-6 rounded-full text-white text-xs ${roleConfig[role as RoleType].color} mr-2`}>
                                      {roleConfig[role as RoleType].abbr}
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{role}</span>
                                    {isSelected && (
                                      <CheckLineIcon className="ml-auto h-4 w-4 text-green-500" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.division}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="truncate">
                        {item.manager.name} - {item.manager.abbreviation}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 hidden xl:table-cell">
                      {item.lastLoginIn}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 hidden xl:table-cell">
                      {item.lastLogOff}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="relative" style={{ position: 'static' }}>
                        <div 
                          className="flex items-center gap-1 cursor-pointer relative"
                          onClick={(e) => toggleStatusPopover(item.id, e)}
                        >
                          <Badge
                            size="sm"
                            color={statusConfig[selectedStatuses[item.id] || item.status].color}
                          >
                            {selectedStatuses[item.id] || item.status}
                          </Badge>
                          <ChevronDownIcon 
                            className="ml-1 text-gray-500 flex-shrink-0"
                          />
                        </div>
                        
                        {openStatusPopover === item.id && (
                          <div 
                            ref={statusPopoverRef}
                            className={`fixed z-50 w-40 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
                              statusDropdownPosition === 'top' 
                                ? 'transform -translate-y-2' 
                                : 'transform translate-y-2'
                            }`}
                            style={{
                              left: `${clickCoordinates.x - 20}px`,
                              top: statusDropdownPosition === 'top' ? 
                                `${clickCoordinates.y - 150}px` : 
                                `${clickCoordinates.y + 40}px`
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2">
                              {(Object.keys(statusConfig) as StatusType[]).map((status) => {
                                const isSelected = (selectedStatuses[item.id] || item.status) === status;
                                return (
                                  <div
                                    key={status}
                                    className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      changeStatus(item.id, status);
                                    }}
                                  >
                                    <Badge
                                      size="sm"
                                      color={statusConfig[status].color}
                                    >
                                      {status}
                                    </Badge>
                                    {isSelected && (
                                      <CheckLineIcon className="h-4 w-4 text-green-500" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <ActionButtons
                        userId={item.id}
                        onEdit={handleEditUser}
                        onTransfer={handleTransferUser}
                        onRemove={handleRemoveUser}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedData.length)} of {sortedData.length} entries
        </p>
        <div className="flex justify-center sm:justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSubmit={handleAddUserSubmit}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        onSubmit={handleEditUserSubmit}
        userData={selectedUserForEdit}
      />

      {/* Delete User Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        userId={selectedUserForDelete?.id || 0}
        userName={selectedUserForDelete?.name || ''}
      />

      {/* Transfer User Modal */}
      <TransferUserModal
        isOpen={isTransferModalOpen}
        onClose={handleCloseTransferModal}
        onSubmit={handleTransferSubmit}
        userId={selectedUserForTransfer?.id || 0}
        userName={selectedUserForTransfer?.name || ''}
      />
    </div>
  );
} 