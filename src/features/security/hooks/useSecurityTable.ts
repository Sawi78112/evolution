"use client";

import { useState, useEffect, useMemo } from 'react';
import { SecurityEntry, RoleType, StatusType, SortConfig } from '../types';
import { filterSecurityData, sortSecurityData, sortRoles } from '../utils';
import { securityData } from '../data/mockData';

export function useSecurityTable() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Search and filtering state
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });
  
  // Role management state
  const [openPopover, setOpenPopover] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<number, RoleType[]>>({});
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');

  // Status management state
  const [openStatusPopover, setOpenStatusPopover] = useState<number | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, StatusType>>({});
  const [statusDropdownPosition, setStatusDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const [clickCoordinates, setClickCoordinates] = useState({ x: 0, y: 0 });

  // Initialize selected roles from data
  useEffect(() => {
    const initialRoles: Record<number, RoleType[]> = {};
    securityData.forEach(item => {
      const roles = item.roles.length > 0 ? [...item.roles] : ["Division Manager" as RoleType];
      initialRoles[item.id] = sortRoles(roles);
    });
    setSelectedRoles(initialRoles);
  }, []);

  // Initialize selected statuses from data
  useEffect(() => {
    const initialStatuses: Record<number, StatusType> = {};
    securityData.forEach(item => {
      initialStatuses[item.id] = item.status;
    });
    setSelectedStatuses(initialStatuses);
  }, []);

  // Filter and sort data
  const filteredData = useMemo(() => {
    return filterSecurityData(securityData, searchTerm);
  }, [searchTerm]);

  const sortedData = useMemo(() => {
    return sortSecurityData(filteredData, sortConfig);
  }, [filteredData, sortConfig]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Handlers
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const requestSort = (key: keyof SecurityEntry | 'user.name' | 'user.role' | 'abbreviation' | 'roles' | 'manager.name' | 'manager.abbreviation') => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const toggleRole = (userId: number, role: RoleType) => {
    setSelectedRoles(prev => {
      const currentRoles = [...(prev[userId] || [])];
      let newRoles: RoleType[];
      
      if (role === "Administrator") {
        if (currentRoles.includes("Administrator")) {
          newRoles = ["Division Manager"];
        } else {
          newRoles = ["Administrator"];
        }
      } else {
        if (currentRoles.includes(role)) {
          if (currentRoles.length > 1) {
            const roleIndex = currentRoles.indexOf(role);
            currentRoles.splice(roleIndex, 1);
            newRoles = [...currentRoles];
          } else {
            newRoles = [...currentRoles];
          }
        } else {
          newRoles = [...currentRoles.filter(r => r !== "Administrator"), role];
        }
      }
      
      return {
        ...prev,
        [userId]: sortRoles(newRoles)
      };
    });
  };

  const changeStatus = (userId: number, status: StatusType) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [userId]: status
    }));
    setOpenStatusPopover(null);
  };

  const closePopover = () => setOpenPopover(null);
  const closeStatusPopover = () => setOpenStatusPopover(null);

  return {
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
  };
} 