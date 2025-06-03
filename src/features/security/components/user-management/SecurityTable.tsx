"use client";

import React, { useState, useEffect } from "react";
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
import { ChevronDownIcon, PencilIcon, TrashBinIcon, CheckLineIcon } from "@/assets/icons";
import { SearchAndFilters } from "./SearchAndFilters";
import { ActionButtons } from "./ActionButtons";
import { AddUserModal, UserFormData } from "./AddUserModal";
import { EditUserModal } from "./EditUserModal";
import { DeleteModal } from "./DeleteModal";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useSecurityTable } from "../../hooks/useSecurityTable";
import { ROLE_COLORS, statusConfig } from '../../constants';
import { RoleType, StatusType } from '../../types';
import { sortRoles, calculateDropdownPosition } from '../../utils';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { useNotification } from '@/components/ui/notification';
import { useCurrentUserDivision } from '../../hooks/useCurrentUserDivision';
import { useRoleContext } from '@/context/RoleContext';

const AVAILABLE_ROLES: RoleType[] = [
  "Administrator",
  "Divisional Manager", 
  "Analyst",
  "Investigator",
  "System Support"
];

const AVAILABLE_STATUSES: StatusType[] = [
  "Active",
  "Transferred", 
  "Inactive",
  "Canceled"
];

// Role order for display: D, A, I, S (Divisional Manager, Analyst, Investigator, System Support)
const ROLE_DISPLAY_ORDER: RoleType[] = [
  "Divisional Manager",
  "Analyst", 
  "Investigator",
  "System Support"
];

export default function SecurityTable() {
  // Use the comprehensive security table hook
  const {
    // Data
    users,
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
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handleStatusChange,
    refetch,
    
    // Modal state
    isAddModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    selectedUserForEdit,
    selectedUserForDelete,
    deletingUser,
    handleModalClose,
    handleEditModalClose,
    handleDeleteModalClose,
    handleModalSubmit,
    handleConfirmDelete,
    
    // Status popover state
    openStatusPopover,
    setOpenStatusPopover,
    selectedStatuses,
    statusDropdownPosition,
    setStatusDropdownPosition,
    clickCoordinates,
    setClickCoordinates,
    statusPopoverRef,

    // Role popover state
    openRolePopover,
    setOpenRolePopover,
    selectedRoles,
    setSelectedRoles,
    roleDropdownPosition,
    setRoleDropdownPosition,
    roleClickCoordinates,
    setRoleClickCoordinates,
    rolePopoverRef
  } = useSecurityTable();

  // Get current user's division information and user ID
  const { divisionId, divisionName, isManager } = useCurrentUserDivision();
  const { isAdmin, userId } = useRoleContext();

  // Notification hook
  const notification = useNotification();

  // Local state for pending role changes
  const [pendingRoles, setPendingRoles] = useState<Record<string, RoleType[]>>({});
  const [originalRoles, setOriginalRoles] = useState<Record<string, RoleType[]>>({});

  // Filter out the current user from the displayed users
  const filteredUsers = users.filter(user => user.id !== userId);

  // Helper function to sort roles in the desired order (D, A, I, S)
  const sortRolesForDisplay = (roles: RoleType[]): RoleType[] => {
    const sorted: RoleType[] = [];
    
    // Add Administrator first if present
    if (roles.includes("Administrator")) {
      sorted.push("Administrator");
    }
    
    // Add other roles in the specified order: D, A, I, S
    ROLE_DISPLAY_ORDER.forEach(role => {
      if (roles.includes(role)) {
        sorted.push(role);
      }
    });
    
    return sorted;
  };

  // Handle edit user submit with proper typing for EditUserModal
  const handleEditUserSubmitLocal = async (formData: {
    username: string;
    abbreviation: string;
    roles: RoleType[];
    division: string;
    email: string;
    status: StatusType;
  }): Promise<void> => {
    if (!selectedUserForEdit) return;
    
    try {
      console.log('🔄 Submitting user update:', {
        userId: selectedUserForEdit.id,
        formData: {
          ...formData,
          email: formData.email // Log the email being sent
        }
      });

      // Update the user via API call
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserForEdit.id,
          roles: formData.roles,
          username: formData.username,
          abbreviation: formData.abbreviation,
          division: formData.division,
          email: formData.email,
          status: formData.status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }

      console.log('✅ User updated successfully:', result.message);

      // Show success notification
      notification.success(
        'User Updated Successfully',
        `"${formData.username}" has been updated successfully.`,
        4000
      );
      
      // Clear any cached or pending role states that might interfere
      setPendingRoles({});
      setOriginalRoles({});
      setOpenRolePopover(null);

      // Force refresh the table data with a small delay to ensure backend consistency
      setTimeout(() => {
      refetch();
      }, 200);
      
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      
      // Show error notification
      notification.error(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update user. Please try again.',
        6000
      );
      
      // Re-throw the error so the modal knows the update failed
      throw error;
    }
  };

  // Sort direction indicator
  const getSortDirectionIndicator = (field: string) => {
    if (sorting.field !== field) {
      return <ChevronDownIcon className="h-4 w-4 text-gray-400 rotate-0 flex-shrink-0" />;
    }
    return (
      <ChevronDownIcon 
        className={`h-4 w-4 text-gray-600 transition-transform flex-shrink-0 ${
          sorting.direction === 'asc' ? 'rotate-180' : 'rotate-0'
        }`} 
      />
    );
  };

  // Toggle role popover with smart positioning
  const toggleRolePopover = (id: string, event: React.MouseEvent) => {
    const targetElement = event.currentTarget as HTMLElement;
    const position = calculateDropdownPosition(targetElement, 250);
    
    setRoleDropdownPosition(position.direction);
    setRoleClickCoordinates({ x: position.x, y: position.y });
    
    if (openRolePopover === id) {
      // Closing the dropdown, clear pending changes
      console.log('🔒 Closing role dropdown for user:', id);
      setOpenRolePopover(null);
      setPendingRoles(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      setOriginalRoles(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } else {
      // Opening the dropdown, initialize pending roles with current user roles
      const user = users.find(u => u.id === id);
      if (user) {
        console.log('🔓 Opening role dropdown for user:', id);
        console.log('👤 User roles from API:', user.roles);
        console.log('👤 User roles type:', typeof user.roles, Array.isArray(user.roles));
        
        // Ensure we have the most current roles from the API data
        const userRoles = Array.isArray(user.roles) ? [...(user.roles as RoleType[])] : [];
        console.log('📋 Initial pending roles being set:', userRoles);
        
        setPendingRoles(prev => ({ ...prev, [id]: userRoles }));
        setOriginalRoles(prev => ({ ...prev, [id]: [...userRoles] }));
      }
      setOpenRolePopover(id);
    }
  };

  // Toggle status popover with smart positioning  
  const toggleStatusPopover = (id: string, event: React.MouseEvent) => {
    const targetElement = event.currentTarget as HTMLElement;
    const position = calculateDropdownPosition(targetElement, 250);
    
    setStatusDropdownPosition(position.direction);
    setClickCoordinates({ x: position.x, y: position.y });
    setOpenStatusPopover(openStatusPopover === id ? null : id);
  };

  // Handle role toggle in pending state
  const handleRoleToggle = (userId: string, role: RoleType) => {
    console.log('🎯 Role toggle called:', { userId, role });
    
    setPendingRoles(prev => {
      const currentRoles = prev[userId] || [];
      console.log('📋 Current roles before toggle:', currentRoles);
      
      const updatedRoles = currentRoles.includes(role)
        ? currentRoles.filter(r => r !== role)
        : [...currentRoles, role];
      
      console.log('📋 Updated roles after toggle:', updatedRoles);
      
      return { ...prev, [userId]: updatedRoles };
    });
  };

  // Debug function to check available roles in database
  const checkAvailableRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const result = await response.json();
      console.log('Available roles in database:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch available roles:', error);
    }
  };

  // Apply role changes
  const handleApplyRoleChanges = async (userId: string) => {
    const newRoles = pendingRoles[userId];
    if (!newRoles) return;

    // Remove duplicates from roles array
    const uniqueRoles = [...new Set(newRoles)];
    
    console.log('🔄 Original roles:', newRoles);
    console.log('🔄 Unique roles after deduplication:', uniqueRoles);

    try {
      console.log(`Applying role changes for user ${userId}:`, uniqueRoles);
      
      // Debug: Check available roles first
      await checkAvailableRoles();
      
      // Make API call to update user roles
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          roles: uniqueRoles  // Send deduplicated roles
        }),
      });

      console.log('📊 API Response status:', response.status);
      console.log('📊 API Response headers:', Object.fromEntries(response.headers.entries()));

      let result;
      try {
        result = await response.json();
        console.log('📊 API Response body:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        const textResponse = await response.text();
        console.log('📊 Raw response text:', textResponse);
        throw new Error(`Invalid JSON response: ${textResponse}`);
      }

      if (!response.ok) {
        console.error('❌ Role update failed:', {
          status: response.status,
          error: result.error,
          details: result.details,
          requestedRoles: result.requestedRoles,
          foundRoles: result.foundRoles,
          fullResult: result
        });
        
        // Show detailed error with role information
        let errorMessage = result.error || 'Failed to update user roles';
        if (result.requestedRoles && result.foundRoles) {
          errorMessage += `\n\nRequested: ${result.requestedRoles.join(', ')}\nFound in DB: ${result.foundRoles.join(', ')}`;
        }
        if (result.details) {
          errorMessage += `\n\nDetails: ${result.details}`;
        }
        
        throw new Error(errorMessage);
      }

      console.log('✅ User roles updated successfully:', result.message);
      
      // Show success notification
      notification.success(
        'Roles Updated Successfully',
        'User roles have been updated and saved.',
        4000
      );
      
      // Clean up pending state first
      setPendingRoles(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      setOriginalRoles(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      setOpenRolePopover(null);
      
      // Force refresh the table data to reflect the changes
      // Add a small delay to ensure backend consistency
      setTimeout(() => {
        refetch();
      }, 100);
      
    } catch (error) {
      console.error('❌ Failed to update user roles:', error);
      // Show error notification with detailed message
      notification.error(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update user roles. Please try again.',
        8000
      );
      
      // Reset pending roles to original on error
      if (originalRoles[userId]) {
        setPendingRoles(prev => ({
          ...prev,
          [userId]: [...originalRoles[userId]]
        }));
      }
    }
  };

  // Cancel role changes
  const handleCancelRoleChanges = (userId: string) => {
    setOpenRolePopover(null);
    setPendingRoles(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
    setOriginalRoles(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
  };

  // Handle role change (deprecated - kept for compatibility)
  const handleRoleChange = async (userId: string, role: RoleType) => {
    handleRoleToggle(userId, role);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 dark:text-gray-400">Loading users...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">Error loading users: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-gray-800 dark:bg-gray-900" style={{ overflow: 'visible' }}>
      <SearchAndFilters
        itemsPerPage={currentParams.limit}
        onItemsPerPageChange={handleItemsPerPageChange}
        searchTerm={searchInput}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleExplicitSearch}
        onSearchKeyPress={handleSearchKeyPress}
        onAddUser={handleAddUser}
        disableAddUser={isManager && !divisionId}
      />

      {/* Desktop Table View */}
      <div className="max-w-full overflow-x-auto custom-scrollbar overflow-y-visible" style={{ overflowY: 'visible' }}>
        <div className="min-w-[1200px]" style={{ overflow: 'visible' }}>
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableCell isHeader className="px-4 py-3 w-16">
                  <span className="font-medium text-gray-500 dark:text-gray-400">No</span>
                </TableCell>
                <TableCell isHeader className="px-4 py-3 min-w-[200px]">
                  <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => requestSort('username')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Username</span>
                    {getSortDirectionIndicator('username')}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3 min-w-[140px]">
                  <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => requestSort('abbreviation')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Abbreviation</span>
                    {getSortDirectionIndicator('abbreviation')}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3 min-w-[150px]">
                  <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => requestSort('roles')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Role(s)</span>
                    {getSortDirectionIndicator('roles')}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3 min-w-[120px]">
                  <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => requestSort('division')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Division</span>
                    {getSortDirectionIndicator('division')}
                  </div>
                </TableCell>
                {isAdmin() && (
                <TableCell isHeader className="px-4 py-3 min-w-[150px]">
                  <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => requestSort('manager')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Manager</span>
                    {getSortDirectionIndicator('manager')}
                  </div>
                </TableCell>
                )}
                <TableCell isHeader className="px-4 py-3 min-w-[120px] hidden xl:table-cell">
                  <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => requestSort('lastLogin')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Last Login</span>
                    {getSortDirectionIndicator('lastLogin')}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3 min-w-[100px]">
                  <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => requestSort('status')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Status</span>
                    {getSortDirectionIndicator('status')}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3 w-32">
                  <span className="font-medium text-gray-500 dark:text-gray-400">Action</span>
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.no}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src="/images/default-avatar.svg"
                            alt={user.username}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-gray-800 dark:text-white truncate">
                          {user.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.abbreviation}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="relative">
                      <button
                        onClick={(e) => toggleRolePopover(user.id, e)}
                        className="flex -space-x-2 flex-wrap hover:scale-105 transition-transform group relative"
                      >
                        {sortRolesForDisplay(pendingRoles[user.id] || user.roles).slice(0, 3).map((role, roleIndex) => (
                          <div 
                            key={roleIndex} 
                            className={`flex items-center justify-center h-8 w-8 rounded-full text-white font-medium text-xs ${ROLE_COLORS[role as RoleType]?.color || 'bg-gray-500'} border-2 border-white dark:border-gray-800`}
                            title={role}
                          >
                            {ROLE_COLORS[role as RoleType]?.abbr || role.charAt(0)}
                          </div>
                        ))}
                        {(pendingRoles[user.id] || user.roles).length > 3 && (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-500 text-white font-medium text-xs border-2 border-white dark:border-gray-800">
                            +{(pendingRoles[user.id] || user.roles).length - 3}
                          </div>
                        )}
                        
                        {/* Dropdown indicator icon */}
                        <div className="ml-3 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <ChevronDownIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                      </button>

                      {/* Role Dropdown - Updated to match AddUserModal style */}
                      {openRolePopover === user.id && (
                        <div
                          ref={rolePopoverRef}
                          className="fixed z-[9999] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-y-auto"
                          style={{ 
                            left: `${roleClickCoordinates.x}px`,
                            top: `${roleClickCoordinates.y}px`,
                            transform: roleDropdownPosition === 'top' ? 'translateY(-100%)' : 'none',
                            width: '280px'
                          }}
                        >
                          <div className="p-2">
                            {/* Administrator role shown separately - only for Administrators */}
                            {isAdmin() && (
                              <div
                                key="Administrator"
                                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer mb-2 border-b border-gray-200 dark:border-gray-600 pb-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRoleToggle(user.id, "Administrator");
                                }}
                              >
                                <div
                                  className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                    (pendingRoles[user.id] || user.roles).includes("Administrator")
                                      ? 'bg-blue-500 border-blue-500'
                                      : 'border-gray-300 dark:border-gray-500'
                                  }`}
                                >
                                  {(pendingRoles[user.id] || user.roles).includes("Administrator") && (
                                    <CheckLineIcon className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className={`flex items-center justify-center h-6 w-6 rounded-full text-white text-xs ${ROLE_COLORS["Administrator"].color} mr-2`}>
                                  {ROLE_COLORS["Administrator"].abbr}
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">Administrator</span>
                                {(pendingRoles[user.id] || user.roles).includes("Administrator") && (
                                  <CheckLineIcon className="ml-auto h-4 w-4 text-green-500" />
                                )}
                              </div>
                            )}
                            
                            {/* Other roles in specified order: D, A, I, S - filter out Divisional Manager for non-admins */}
                            {ROLE_DISPLAY_ORDER
                              .filter(role => isAdmin() || role !== "Divisional Manager")
                              .map((role) => {
                                const isSelected = (pendingRoles[user.id] || user.roles).includes(role as RoleType);
                                return (
                                  <div
                                    key={role}
                                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRoleToggle(user.id, role as RoleType);
                                    }}
                                  >
                                    <div
                                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                        isSelected
                                          ? 'bg-blue-500 border-blue-500'
                                          : 'border-gray-300 dark:border-gray-500'
                                      }`}
                                    >
                                      {isSelected && (
                                        <CheckLineIcon className="w-4 h-4 text-white" />
                                      )}
                                    </div>
                                    <div className={`flex items-center justify-center h-6 w-6 rounded-full text-white text-xs ${ROLE_COLORS[role as RoleType].color} mr-2`}>
                                      {ROLE_COLORS[role as RoleType].abbr}
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{role}</span>
                                    {isSelected && (
                                      <CheckLineIcon className="ml-auto h-4 w-4 text-green-500" />
                                    )}
                                  </div>
                                );
                              })}
                            
                            {/* Apply and Cancel buttons */}
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <button
                                onClick={() => handleApplyRoleChanges(user.id)}
                                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                              >
                                Apply
                              </button>
                              <button
                                onClick={() => handleCancelRoleChanges(user.id)}
                                className="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors"
                              >
                                Cancel
                              </button>
                              </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.division}
                  </TableCell>
                  {isAdmin() && (
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.manager}
                  </TableCell>
                  )}
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 hidden xl:table-cell">
                    {user.lastLogin || 'Never'}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="relative">
                      <div 
                        className="flex items-center gap-1 cursor-pointer relative"
                        onClick={(e) => toggleStatusPopover(user.id, e)}
                      >
                        <Badge
                          size="sm"
                          color={statusConfig[user.status as StatusType]?.color || 'gray'}
                        >
                          {selectedStatuses[user.id] || user.status}
                        </Badge>
                        <ChevronDownIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      </div>

                      {/* Status Dropdown */}
                      {openStatusPopover === user.id && (
                        <div 
                          ref={statusPopoverRef}
                          className="fixed z-50 w-32 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                          style={{
                            left: `${clickCoordinates.x}px`,
                            top: `${clickCoordinates.y}px`,
                            transform: statusDropdownPosition === 'top' ? 'translateY(-100%)' : 'none'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-2">
                            {AVAILABLE_STATUSES.map((status) => {
                              const isSelected = (selectedStatuses[user.id] || user.status) === status;
                              return (
                                <div
                                  key={status}
                                  className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(user.id, status);
                                  }}
                                >
                                  <Badge
                                    size="sm"
                                    color={statusConfig[status]?.color || 'gray'}
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
                      userId={user.id}
                      onEdit={(id) => handleEditUser(id)}
                      onRemove={(id) => handleDeleteUser(id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredUsers.length} of {pagination.totalCount > 0 ? pagination.totalCount - 1 : 0} users
        </div>
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        prefilledDivision={isManager && divisionName ? divisionName : undefined}
        prefilledManagerId={isManager && divisionId ? divisionId : undefined}
        disableDivisionFields={isManager && !!divisionId}
      />

      {selectedUserForEdit && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            handleEditModalClose();
          }}
          onSubmit={handleEditUserSubmitLocal}
          userData={{
            id: selectedUserForEdit.id,
            username: users.find(u => u.id === selectedUserForEdit.id)?.username || '',
            abbreviation: users.find(u => u.id === selectedUserForEdit.id)?.abbreviation || '',
            roles: users.find(u => u.id === selectedUserForEdit.id)?.roles || [],
            division: users.find(u => u.id === selectedUserForEdit.id)?.division || '',
            manager: users.find(u => u.id === selectedUserForEdit.id)?.manager || '',
            email: users.find(u => u.id === selectedUserForEdit.id)?.email || '',
            status: users.find(u => u.id === selectedUserForEdit.id)?.status || 'Active'
          }}
        />
      )}

      {selectedUserForDelete && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          onConfirm={handleConfirmDelete}
          userName={selectedUserForDelete.name}
          isDeleting={deletingUser}
        />
      )}
    </div>
  );
} 