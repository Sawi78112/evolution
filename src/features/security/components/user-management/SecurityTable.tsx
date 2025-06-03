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
import { ChevronDownIcon, PencilIcon, TrashBinIcon, CheckLineIcon } from "@/assets/icons";
import { SearchAndFilters } from "./SearchAndFilters";
import { ActionButtons } from "./ActionButtons";
import { AddUserModal, UserFormData } from "./AddUserModal";
import { EditUserModal } from "./EditUserModal";
import { TransferUserModal, TransferFormData } from "./TransferUserModal";
import { DeleteModal } from "./DeleteModal";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useUsersList } from "../../hooks/useUsersList";
import { ROLE_COLORS, statusConfig } from '../../constants';
import { RoleType, StatusType } from '../../types';
import { sortRoles, calculateDropdownPosition } from '../../utils';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';

const AVAILABLE_ROLES: RoleType[] = [
  "Administrator",
  "Divisional Manager", 
  "Analyst",
  "Investigator",
  "System Support"
];

export default function SecurityTable() {
  // Use real data instead of mock data
  const { users, loading, error, refetch } = useUsersList();
  
  // Search and filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{key: string; direction: 'ascending' | 'descending'}>({
    key: 'username',
    direction: 'ascending'
  });
  
  // Role and status management states
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string[]>>({});
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  
  const [openStatusPopover, setOpenStatusPopover] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, string>>({});
  const [statusDropdownPosition, setStatusDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const [clickCoordinates, setClickCoordinates] = useState({ x: 0, y: 0 });

  // Filter and sort data
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedData = [...filteredUsers].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortConfig.key) {
      case 'username':
        aValue = a.username;
        bValue = b.username;
        break;
      case 'abbreviation':
        aValue = a.abbreviation;
        bValue = b.abbreviation;
        break;
      case 'division':
        aValue = a.division;
        bValue = b.division;
        break;
      case 'manager':
        aValue = a.manager;
        bValue = b.manager;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'lastLogin':
        aValue = a.lastLogin || '';
        bValue = b.lastLogin || '';
        break;
      default:
        aValue = '';
        bValue = '';
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Handlers
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const toggleRole = (userId: string, role: RoleType) => {
    setSelectedRoles(prev => {
      const currentRoles = prev[userId] || users.find(u => u.id === userId)?.roles || [];
      const newRoles = currentRoles.includes(role)
        ? currentRoles.filter(r => r !== role)
        : [...currentRoles, role];
      return { ...prev, [userId]: newRoles };
    });
  };

  const changeStatus = (userId: string, status: StatusType) => {
    setSelectedStatuses(prev => ({ ...prev, [userId]: status }));
  };

  const closePopover = () => setOpenPopover(null);
  const closeStatusPopover = () => setOpenStatusPopover(null);

  const popoverRef = useClickOutside(closePopover);
  const statusPopoverRef = useClickOutside(closeStatusPopover);

  // Sort direction indicator (same style as DivisionTable)
  const getSortDirectionIndicator = (field: string) => {
    if (sortConfig.key !== field) {
      return <ChevronDownIcon className="h-4 w-4 text-gray-400 rotate-0 flex-shrink-0" />;
    }
    return (
      <ChevronDownIcon 
        className={`h-4 w-4 text-gray-600 transition-transform flex-shrink-0 ${
          sortConfig.direction === 'ascending' ? 'rotate-180' : 'rotate-0'
        }`} 
      />
    );
  };

  // Toggle popover with smart positioning
  const togglePopover = (id: string, event: React.MouseEvent) => {
    const targetElement = event.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    
    // Better smart positioning - check available space below vs above
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 300; // Approximate height of dropdown
    
    const shouldShowAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    const direction = shouldShowAbove ? 'top' : 'bottom';
    
    setDropdownPosition(direction);
    setClickCoordinates({ 
      x: rect.left, 
      y: direction === 'top' ? rect.top - 10 : rect.bottom + 10
    });
    setOpenPopover(openPopover === id ? null : id);
  };

  const handleRoleChange = async (userId: string, role: RoleType) => {
    // Here you would implement the API call to update user roles
    // For now, we'll just show console log and close the popover
    console.log(`Toggling role ${role} for user ${userId}`);
    setOpenPopover(null);
    // After successful API call, refresh the data
    // refetch();
  };

  // Toggle status popover with smart positioning
  const toggleStatusPopover = (id: string, event: React.MouseEvent) => {
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
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<{id: string, name: string} | null>(null);
  const [selectedUserForTransfer, setSelectedUserForTransfer] = useState<{id: string, name: string} | null>(null);

  // Action handlers
  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleAddUserSubmit = (userData: UserFormData) => {
    console.log('New user data:', userData);
    // Refresh the user list after adding
    refetch();
  };

  const handleEditUserSubmit = (userData: UserFormData) => {
    console.log('Updated user data:', userData);
    // Refresh the user list after editing
    refetch();
  };

  const handleEditUser = (userId: string) => {
    // Find the user data from current items
    const userToEdit = currentItems.find(user => user.id === userId);
    if (userToEdit) {
      // Convert the user data to the expected format
      const userData = {
        id: userToEdit.id,
        username: userToEdit.username,
        abbreviation: userToEdit.abbreviation,
        roles: userToEdit.roles as RoleType[],
        division: userToEdit.division,
        managerId: '1', // Default to first manager, will need to map properly
        email: userToEdit.email,
        officePhone: '+1 (555) 123-4567', // Default phone since not in current API
        homePhone: '',
        homeAddress: '',
        status: userToEdit.status as StatusType,
        passwordType: 'admin' as const,
        password: '',
      };
      setSelectedUserForEdit(userData);
      setIsEditUserModalOpen(true);
    }
  };

  const handleTransferUser = (userId: string) => {
    // Find the user data from current items
    const userToTransfer = currentItems.find(user => user.id === userId);
    if (userToTransfer) {
      setSelectedUserForTransfer({
        id: userToTransfer.id,
        name: userToTransfer.username
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

  const handleRemoveUser = (userId: string) => {
    // Find the user data from current items
    const userToDelete = currentItems.find(user => user.id === userId);
    if (userToDelete) {
      setSelectedUserForDelete({
        id: userToDelete.id,
        name: userToDelete.username
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
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onAddUser={handleAddUser}
      />

      {/* Desktop Table View */}
      <div className="max-w-full overflow-x-auto custom-scrollbar" style={{ overflow: 'visible' }}>
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
                <TableCell isHeader className="px-4 py-3 min-w-[120px]">
                  <div className="flex items-center gap-2 text-left">
                    <span className="font-medium text-gray-500 dark:text-gray-400">Role(s)</span>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400 rotate-0 flex-shrink-0" />
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3 min-w-[120px]">
                  <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => requestSort('division')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Division</span>
                    {getSortDirectionIndicator('division')}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3 min-w-[150px]">
                  <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => requestSort('manager')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Manager</span>
                    {getSortDirectionIndicator('manager')}
                  </div>
                </TableCell>
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
              {currentItems.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {indexOfFirstItem + index + 1}
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
                        onClick={(e) => togglePopover(user.id, e)}
                        className="flex -space-x-2 flex-wrap hover:scale-105 transition-transform group relative"
                      >
                        {user.roles.slice(0, 3).map((role, roleIndex) => (
                          <div 
                            key={roleIndex} 
                            className={`flex items-center justify-center h-8 w-8 rounded-full text-white font-medium text-xs ${ROLE_COLORS[role as RoleType]?.color || 'bg-gray-500'} border-2 border-white dark:border-gray-800`}
                            title={role}
                          >
                            {ROLE_COLORS[role as RoleType]?.abbr || role.charAt(0)}
                          </div>
                        ))}
                        {user.roles.length > 3 && (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-500 text-white font-medium text-xs border-2 border-white dark:border-gray-800">
                            +{user.roles.length - 3}
                          </div>
                        )}
                        
                        {/* Dropdown indicator icon */}
                        <div className="ml-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <ChevronDownIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                      </button>

                      {/* Role Dropdown */}
                      {openPopover === user.id && (
                        <div
                          ref={popoverRef}
                          className={`fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 w-48 ${
                            dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                          }`}
                          style={{ 
                            left: `${clickCoordinates.x}px`,
                            top: `${clickCoordinates.y}px`
                          }}
                        >
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                            Assign Roles
                          </div>
                          <div className="space-y-1">
                            {AVAILABLE_ROLES.map((role) => (
                              <div
                                key={role}
                                className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                                onClick={() => handleRoleChange(user.id, role)}
                              >
                                <Checkbox
                                  checked={user.roles.includes(role)}
                                  onChange={() => handleRoleChange(user.id, role)}
                                />
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium ${ROLE_COLORS[role]?.color || 'bg-gray-500'}`}
                                  >
                                    {ROLE_COLORS[role]?.abbr || role.charAt(0)}
                                  </div>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {role}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.division}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.manager}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 hidden xl:table-cell">
                    {user.lastLogin || 'Never'}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={statusConfig[user.status as StatusType]?.color || 'gray'}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <ActionButtons
                      userId={parseInt(user.id) || 0}
                      onEdit={(id) => handleEditUser(id.toString())}
                      onTransfer={(id) => handleTransferUser(id.toString())}
                      onRemove={(id) => handleRemoveUser(id.toString())}
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
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedData.length)} of {sortedData.length} entries
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSubmit={handleAddUserSubmit}
      />

      {selectedUserForEdit && (
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={() => setIsEditUserModalOpen(false)}
          onSubmit={handleEditUserSubmit}
          userData={selectedUserForEdit}
        />
      )}

      {selectedUserForDelete && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          userId={parseInt(selectedUserForDelete.id) || 0}
          userName={selectedUserForDelete.name}
        />
      )}

      {selectedUserForTransfer && (
        <TransferUserModal
          isOpen={isTransferModalOpen}
          onClose={handleCloseTransferModal}
          onSubmit={handleTransferSubmit}
          userId={parseInt(selectedUserForTransfer.id) || 0}
          userName={selectedUserForTransfer.name}
        />
      )}
    </div>
  );
} 