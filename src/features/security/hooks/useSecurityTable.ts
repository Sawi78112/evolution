"use client";

import { useState, useRef, useEffect } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useUsersList } from './useUsersList';
import { UserFormData } from '../components/user-management/AddUserModal';
import { useNotification } from '@/components/ui/notification';
import { RoleType, StatusType } from '../types';

export type SortField = 'username' | 'abbreviation' | 'roles' | 'division' | 'manager' | 'lastLogin' | 'status';
export type SortDirection = 'asc' | 'desc';

export function useSecurityTable() {
  const notification = useNotification();
  
  // Core search and pagination state
  const [currentParams, setCurrentParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    sortField: 'username' as SortField,
    sortDirection: 'asc' as SortDirection
  });

  const [searchInput, setSearchInput] = useState('');

  // Use the actual API hook with proper params
  const { 
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
  } = useUsersList(currentParams);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  
  // Selected items for modals
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<{ id: string; name: string } | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<{ id: string; name: string } | null>(null);
  const [selectedUserForTransfer, setSelectedUserForTransfer] = useState<{ id: string; name: string } | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  
  // Bulk selection
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Dropdown states for filters
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [divisionDropdownOpen, setDivisionDropdownOpen] = useState(false);
  
  // Status popover state
  const [openStatusPopover, setOpenStatusPopover] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, StatusType>>({});
  const [statusDropdownPosition, setStatusDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const [clickCoordinates, setClickCoordinates] = useState({ x: 0, y: 0 });
  
  // Role popover state
  const [openRolePopover, setOpenRolePopover] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>([]);
  const [roleDropdownPosition, setRoleDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const [roleClickCoordinates, setRoleClickCoordinates] = useState({ x: 0, y: 0 });
  
  // Refs for click outside handling
  const statusPopoverRef = useClickOutside(() => setOpenStatusPopover(null));
  const rolePopoverRef = useClickOutside(() => setOpenRolePopover(null));
  
  // Search handlers
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };
  
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleExplicitSearch();
    }
  };
  
  const handleExplicitSearch = () => {
    const newParams = { ...currentParams, search: searchInput.trim(), page: 1 };
    setCurrentParams(newParams);
    search(searchInput.trim());
  };
  
  // Filter handlers
  const handleStatusFilter = (status: string) => {
    const newParams = { ...currentParams, status, page: 1 };
    setCurrentParams(newParams);
    filterByStatus(status);
    setStatusDropdownOpen(false);
  };
  
  const handleRoleFilter = (role: string) => {
    // Note: Role filtering would need to be implemented in the API
    console.log('Role filter not yet implemented:', role);
    setRoleDropdownOpen(false);
  };
  
  const handleDivisionFilter = (division: string) => {
    // Note: Division filtering would need to be implemented in the API
    console.log('Division filter not yet implemented:', division);
    setDivisionDropdownOpen(false);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchInput('');
    const newParams = { ...currentParams, search: '', status: '', page: 1 };
    setCurrentParams(newParams);
    refetch(newParams);
  };
  
  // Sorting handlers
  const requestSort = (field: SortField) => {
    const newDirection: SortDirection = (currentParams.sortField === field && currentParams.sortDirection === 'asc') 
      ? 'desc' 
      : 'asc';
    
    const newParams = { 
      ...currentParams, 
      sortField: field, 
      sortDirection: newDirection,
      page: 1 
    };
    
    setCurrentParams(newParams);
    sort(field, newDirection);
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    const newParams = { ...currentParams, page };
    setCurrentParams(newParams);
    goToPage(page);
  };
  
  const handleItemsPerPageChange = (newPageSize: number) => {
    const newParams = { ...currentParams, limit: newPageSize, page: 1 };
    setCurrentParams(newParams);
    changeLimit(newPageSize);
  };
  
  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };
  
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };
  
  // Modal handlers
  const handleModalClose = () => {
    setIsAddModalOpen(false);
  };
  
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedUserForEdit(null);
  };
  
  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedUserForDelete(null);
  };
  
  const handleModalSubmit = (userData: UserFormData) => {
    console.log('Adding user:', userData);
    // Handle form submission
    setIsAddModalOpen(false);
  };
  
  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };
  
  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUserForEdit({ id: user.id, name: user.username });
      setIsEditModalOpen(true);
    }
  };
  
  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUserForDelete({ id: user.id, name: user.username });
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserForDelete) return;

    setDeletingUser(true);

    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserForDelete.id
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      // Refresh the data
      refetch(currentParams);
      
      notification.success(
        'User Deleted',
        `"${selectedUserForDelete.name}" has been successfully deleted.`
      );
      
      handleDeleteModalClose();
    } catch (error) {
      notification.error(
        'Delete Failed',
        error instanceof Error ? error.message : 'Failed to delete user'
      );
    } finally {
      setDeletingUser(false);
    }
  };
  
  const handleStatusChange = async (userId: string, newStatus: StatusType) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          status: newStatus
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }

      // Update local state
      setSelectedStatuses(prev => ({
        ...prev,
        [userId]: newStatus
      }));

      // Refresh the data
      refetch(currentParams);
      
      notification.success(
        'Status Updated',
        `User status has been updated to ${newStatus}.`
      );
    } catch (error) {
      notification.error(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update status'
      );
    }
  };

  return {
    // Data from API
    users,
    pagination,
    filters,
    sorting,
    loading,
    error,
    
    // Search state
    searchInput,
    currentParams,
    
    // Search and filter handlers
    handleSearchChange,
    handleSearchKeyPress,
    handleExplicitSearch,
    handleStatusFilter,
    handleRoleFilter,
    handleDivisionFilter,
    clearFilters,
    
    // Sorting
    requestSort,
    
    // Pagination
    handlePageChange,
    handleItemsPerPageChange,
    
    // User actions
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handleStatusChange,
    refetch,
    
    // Selection
    selectedUsers,
    handleSelectAll,
    handleSelectUser,
    
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
    rolePopoverRef,

    // Dropdown states
    statusDropdownOpen,
    setStatusDropdownOpen,
    roleDropdownOpen,
    setRoleDropdownOpen,
    divisionDropdownOpen,
    setDivisionDropdownOpen
  };
} 