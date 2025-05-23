"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import Image from "next/image";
import Pagination from "../Pagination";
import { ChevronDownIcon, CheckLineIcon } from "../../../icons";

// Import from our new modular structure
import { useSecurityTable } from './hooks/useSecurityTable';
import { useClickOutside } from './hooks/useClickOutside';
import { SearchAndFilters } from './components/SearchAndFilters';
import { ActionButtons } from './components/ActionButtons';
import { Checkbox } from './components/Checkbox';
import { roleConfig, statusConfig } from './constants';
import { getSortDirectionIndicator, sortRoles, calculateDropdownPosition } from './utils';
import { RoleType, StatusType } from './types';

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

  // Action handlers
  const handleAddUser = () => {
    console.log('Add User clicked');
  };

  const handleEditUser = (userId: number) => {
    console.log('Edit user:', userId);
  };

  const handleTransferUser = (userId: number) => {
    console.log('Transfer user:', userId);
  };

  const handleRemoveUser = (userId: number) => {
    console.log('Remove user:', userId);
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

      <div className="max-w-full overflow-x-auto" style={{ overflow: 'auto', overflowY: 'visible' }}>
        <div className="min-w-[900px]" style={{ overflow: 'visible' }}>
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableCell isHeader className="px-4 py-3">
                  <span className="font-medium text-gray-500 dark:text-gray-400">No</span>
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('user.name')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Username</span>
                    {getSortDirectionIndicator('user.name', sortConfig)}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('abbreviation')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Abbreviation</span>
                    {getSortDirectionIndicator('abbreviation', sortConfig)}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('roles')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Role(s)</span>
                    {getSortDirectionIndicator('roles', sortConfig)}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('division')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Division</span>
                    {getSortDirectionIndicator('division', sortConfig)}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('manager.name')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Manager</span>
                    {getSortDirectionIndicator('manager.name', sortConfig)}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('lastLoginIn')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Last Login-In</span>
                    {getSortDirectionIndicator('lastLoginIn', sortConfig)}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('lastLogOff')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Last Log-Off</span>
                    {getSortDirectionIndicator('lastLogOff', sortConfig)}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('status')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Status</span>
                    {getSortDirectionIndicator('status', sortConfig)}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
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
                    {item.manager.name} - {item.manager.abbreviation}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {item.lastLoginIn}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
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

      <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedData.length)} of {sortedData.length} entries
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
} 