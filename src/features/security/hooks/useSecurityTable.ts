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
  
  // Filtering and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('username');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
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
  
  // Refs for click outside
  const statusDropdownRef = useClickOutside(() => setStatusDropdownOpen(false));
  const roleDropdownRef = useClickOutside(() => setRoleDropdownOpen(false));
  const divisionDropdownRef = useClickOutside(() => setDivisionDropdownOpen(false));
  const statusPopoverRef = useClickOutside(() => setOpenStatusPopover(null));
  const rolePopoverRef = useClickOutside(() => setOpenRolePopover(null));
  
  // Use the users list hook
  const { users, loading, error, pagination, refetch } = useUsersList({
    page: currentPage,
    limit: pageSize,
    search: searchQuery,
    status: statusFilter,
    // TODO: Add role and division filters when API supports them
  });
  
  // Current params for tracking
  const currentParams = {
    page: currentPage,
    limit: pageSize,
    search: searchQuery,
    status: statusFilter,
    role: roleFilter,
    division: divisionFilter,
    sortField,
    sortDirection
  };
  
  // Filters object
  const filters = {
    search: searchQuery,
    status: statusFilter,
    role: roleFilter,
    division: divisionFilter
  };
  
  // Sorting object
  const sorting = {
    field: sortField,
    direction: sortDirection
  };
  
  // Filter handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };
  
  const handleSearchChange = (query: string) => {
    setSearchInput(query);
  };
  
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleExplicitSearch();
    }
  };
  
  const handleExplicitSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };
  
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    setStatusDropdownOpen(false);
  };
  
  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
    setRoleDropdownOpen(false);
  };
  
  const handleDivisionFilter = (division: string) => {
    setDivisionFilter(division);
    setCurrentPage(1);
    setDivisionDropdownOpen(false);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSearchInput('');
    setStatusFilter('');
    setRoleFilter('');
    setDivisionFilter('');
    setCurrentPage(1);
  };
  
  // Sorting handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const requestSort = (field: SortField) => {
    handleSort(field);
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleItemsPerPageChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
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
  
  const handleModalSubmit = (userData: UserFormData) => {
    // Handle form submission
    refetch();
  };

  const handleEditModalSubmit = (userData: UserFormData) => {
    // Handle edit submission
    refetch();
  };

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    
    if (user) {
      const userData = {
        id: user.id,
        name: user.username
      };
      setSelectedUserForEdit(userData);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    
    if (user) {
      const deleteData = {
        id: user.id,
        name: user.username
      };
      setSelectedUserForDelete(deleteData);
      setIsDeleteModalOpen(true);
    }
  };

  const handleTransferUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    
    if (user) {
      const transferData = {
        id: user.id,
        name: user.username
      };
      setSelectedUserForTransfer(transferData);
      setIsTransferModalOpen(true);
    }
  };

  // Status change handler
  const handleStatusChange = async (userId: string, newStatus: StatusType) => {
    try {
      // Implement status change logic here
      console.log(`Changing status for user ${userId} to ${newStatus}`);
      await refetch();
    } catch (error) {
      console.error('Failed to change user status:', error);
    }
  };

  // Delete confirmation handler
  const handleConfirmDelete = async () => {
    if (!selectedUserForDelete) return;
    
    setDeletingUser(true);
    try {
      // Implement delete logic here
      console.log(`Deleting user ${selectedUserForDelete.id}`);
      await refetch();
      setIsDeleteModalOpen(false);
      setSelectedUserForDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setDeletingUser(false);
    }
  };

  // Modal close handlers
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedUserForEdit(null);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedUserForDelete(null);
  };

  const handleTransferModalClose = () => {
    setIsTransferModalOpen(false);
    setSelectedUserForTransfer(null);
  };

  return {
    // Data
    users,
    loading,
    error,
    pagination,
    filters,
    sorting,
    
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
    
    // Filters and search
    searchQuery,
    statusFilter,
    roleFilter,
    divisionFilter,
    handleSearch,
    handleStatusFilter,
    handleRoleFilter,
    handleDivisionFilter,
    clearFilters,
    
    // Sorting
    sortField,
    sortDirection,
    handleSort,
    
    // Pagination
    currentPage,
    
    // Selection
    selectedUsers,
    handleSelectAll,
    handleSelectUser,
    
    // Modals
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isTransferModalOpen,
    selectedUserForEdit,
    selectedUserForDelete,
    selectedUserForTransfer,
    deletingUser,
    handleModalClose,
    handleModalSubmit,
    handleEditModalSubmit,
    handleEditModalClose,
    handleDeleteModalClose,
    handleTransferModalClose,
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
    
    // Dropdown states and refs
    statusDropdownOpen,
    setStatusDropdownOpen,
    roleDropdownOpen,
    setRoleDropdownOpen,
    divisionDropdownOpen,
    setDivisionDropdownOpen,
    statusDropdownRef,
    roleDropdownRef,
    divisionDropdownRef
  };
} 