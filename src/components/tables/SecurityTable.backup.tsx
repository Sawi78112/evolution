"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import Pagination from "./Pagination";
import { 
  BellIcon,
  SearchIcon,
  UserPlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckLineIcon,
  PencilIcon,
  ShootingStarIcon,
  TrashBinIcon,
} from "../../icons/index"
// Define role types
type RoleType = "Administrator" | "Division Manager" | "Analyst" | "Investigator" | "System Support";

// Role configuration including colors and abbreviations
const roleConfig: Record<RoleType, {color: string, abbr: string}> = {
  "Administrator": { color: "bg-blue-500", abbr: "A" },
  "Division Manager": { color: "bg-green-500", abbr: "M" },
  "Analyst": { color: "bg-purple-500", abbr: "N" },
  "Investigator": { color: "bg-amber-500", abbr: "V" },
  "System Support": { color: "bg-rose-500", abbr: "S" },
};

// Available role options for dropdown
const roleOptions: RoleType[] = [
  "Administrator",
  "Division Manager",
  "Analyst",
  "Investigator",
  "System Support",
];

// Define status types
type StatusType = "Active" | "Inactive" | "Transferred" | "Canceled";

// Status configuration with proper badge colors
const statusConfig: Record<StatusType, {color: "success" | "warning" | "error" | "info" | "primary" | "light" | "dark", description: string}> = {
  "Active": { 
    color: "success", 
    description: "User can log in, perform transactions, manage cases, and use the system."
  },
  "Inactive": { 
    color: "warning", 
    description: "Temporarily disabled — used for vacation, leave, or extended absence."
  },
  "Transferred": { 
    color: "info", 
    description: "User's active work has been moved to another user. The user remains visible in audit logs."
  },
  "Canceled": { 
    color: "error", 
    description: "Permanently deactivated — cannot log in or perform actions, but remains in the system for historical traceability."
  },
};

interface SecurityEntry {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  abbreviation: string;
  action: string;
  division: string;
  manager: {
    name: string;
    abbreviation: string;
  };
  lastLoginIn: string;
  lastLogOff: string;
  status: StatusType;
  roles: RoleType[];
}

// Custom hook for click outside detection
function useClickOutside(handler: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handler]);

  return ref;
}

// Custom Checkbox component
function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div 
      className={`flex h-4 w-4 items-center justify-center rounded border ${
        checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'
      } cursor-pointer`}
      onClick={onChange}
    >
      {checked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3 text-white"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
}

// Sample security data
const securityData: SecurityEntry[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Isabella Davis",
      role: "Administrator",
    },
    abbreviation: "LGIN",
    action: "Login Attempt",
    division: "Alpha",
    manager: {
      name: "Maria Pulera",
      abbreviation: "MAPL",
    },
    lastLoginIn: "2025-05-22 09:34:55",
    lastLogOff: "2025-05-23 17:15:22",
    status: "Active",
    roles: ["Administrator"],
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Ethan Brown",
      role: "Analyst",
    },
    abbreviation: "FDWN",
    action: "File Download",
    division: "Beta",
    manager: {
      name: "James Wilson",
      abbreviation: "JAWL",
    },
    lastLoginIn: "2025-05-21 08:45:12",
    lastLogOff: "2025-05-21 18:22:03",
    status: "Inactive",
    roles: ["Analyst"],
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-19.jpg",
      name: "Sophia Martinez",
      role: "Investigator",
    },
    abbreviation: "CACC",
    action: "Case Access",
    division: "Gamma",
    manager: {
      name: "Robert Chen",
      abbreviation: "ROCH",
    },
    lastLoginIn: "2025-05-20 07:30:45",
    lastLogOff: "2025-05-20 16:50:33",
    status: "Active",
    roles: ["Investigator", "Analyst"],
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
      role: "Division Manager",
    },
    abbreviation: "PWCH",
    action: "Password Change",
    division: "Delta",
    manager: {
      name: "Sarah Johnson",
      abbreviation: "SAJO",
    },
    lastLoginIn: "2025-05-19 10:15:22",
    lastLogOff: "2025-05-19 19:05:17",
    status: "Active",
    roles: ["Division Manager"],
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Charlotte Anderson",
      role: "Analyst",
    },
    abbreviation: "LGIN",
    action: "Login Attempt",
    division: "Alpha",
    manager: {
      name: "Maria Pulera",
      abbreviation: "MAPL",
    },
    lastLoginIn: "2025-05-18 08:10:45",
    lastLogOff: "2025-05-18 17:30:12",
    status: "Canceled",
    roles: ["Analyst"],
  },
  {
    id: 6,
    user: {
      image: "/images/user/user-22.jpg",
      name: "Liam Wilson",
      role: "Administrator",
    },
    abbreviation: "UCRT",
    action: "User Creation",
    division: "Beta",
    manager: {
      name: "James Wilson",
      abbreviation: "JAWL",
    },
    lastLoginIn: "2025-05-17 09:22:33",
    lastLogOff: "2025-05-17 18:15:44",
    status: "Active",
    roles: ["Administrator"],
  },
  {
    id: 7,
    user: {
      image: "/images/user/user-23.jpg",
      name: "Olivia Johnson",
      role: "Investigator",
    },
    abbreviation: "APIC",
    action: "API Access",
    division: "Gamma",
    manager: {
      name: "Robert Chen",
      abbreviation: "ROCH",
    },
    lastLoginIn: "2025-05-16 07:45:12",
    lastLogOff: "2025-05-16 16:30:55",
    status: "Inactive",
    roles: ["Investigator"],
  },
  {
    id: 8,
    user: {
      image: "/images/user/user-24.jpg",
      name: "Noah Garcia",
      role: "Division Manager",
    },
    abbreviation: "SYCF",
    action: "System Configuration",
    division: "Delta",
    manager: {
      name: "Sarah Johnson",
      abbreviation: "SAJO",
    },
    lastLoginIn: "2025-05-15 08:30:45",
    lastLogOff: "2025-05-15 17:45:22",
    status: "Active",
    roles: ["Division Manager", "System Support"],
  },
  {
    id: 9,
    user: {
      image: "/images/user/user-25.jpg",
      name: "Emma Miller",
      role: "Analyst",
    },
    abbreviation: "LGIN",
    action: "Login Attempt",
    division: "Alpha",
    manager: {
      name: "Maria Pulera",
      abbreviation: "MAPL",
    },
    lastLoginIn: "2025-05-14 09:15:33",
    lastLogOff: "2025-05-14 18:20:11",
    status: "Transferred",
    roles: ["Analyst", "Investigator"],
  },
  {
    id: 10,
    user: {
      image: "/images/user/user-26.jpg",
      name: "William Davis",
      role: "Administrator",
    },
    abbreviation: "PRCH",
    action: "Permission Change",
    division: "Beta",
    manager: {
      name: "James Wilson",
      abbreviation: "JAWL",
    },
    lastLoginIn: "2025-05-13 08:45:22",
    lastLogOff: "2025-05-13 17:30:45",
    status: "Active",
    roles: ["Administrator"],
  },
];

// List of all possible status types
const allStatusTypes: StatusType[] = ["Active", "Inactive", "Transferred", "Canceled"];

// Function to sort roles in the correct order
const sortRoles = (roles: RoleType[]): RoleType[] => {
  // If Administrator is present, return just Administrator
  if (roles.includes("Administrator")) {
    return ["Administrator"];
  }
  
  // Order for non-Administrator roles
  const orderMap: Record<RoleType, number> = {
    "Administrator": 0, // Not used but included for completeness
    "Division Manager": 1,
    "Analyst": 2,
    "Investigator": 3,
    "System Support": 4
  };
  
  // Sort roles based on their position in the order
  return [...roles].sort((a, b) => orderMap[a] - orderMap[b]);
};

export default function SecurityTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SecurityEntry | 'user.name' | 'user.role' | 'abbreviation' | 'roles' | 'manager.name' | 'manager.abbreviation' | null;
    direction: 'ascending' | 'descending' | null;
  }>({
    key: null,
    direction: null,
  });
  
  // State for managing role selection
  const [openPopover, setOpenPopover] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<number, RoleType[]>>({});
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');

  const closePopover = () => setOpenPopover(null);
  const popoverRef = useClickOutside(closePopover);

  // Toggle popover with smart positioning
  const togglePopover = (id: number, event: React.MouseEvent) => {
    const targetElement = event.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 300; // Approximate max height of dropdown
    
    // Determine if dropdown should appear above or below
    // Use above if not enough space below but enough space above
    const position = (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) 
      ? 'top' 
      : 'bottom';
      
    setDropdownPosition(position);
    setOpenPopover(openPopover === id ? null : id);
  };

  // Initialize selected roles from data
  useEffect(() => {
    const initialRoles: Record<number, RoleType[]> = {};
    securityData.forEach(item => {
      // Ensure each record has at least one role
      const roles = item.roles.length > 0 ? [...item.roles] : ["Division Manager" as RoleType];
      initialRoles[item.id] = sortRoles(roles);
    });
    setSelectedRoles(initialRoles);
  }, []);

  // Handle role toggling
  const toggleRole = (userId: number, role: RoleType) => {
    setSelectedRoles(prev => {
      // Create a deep copy of the current roles to ensure no shared references
      const currentRoles = [...(prev[userId] || [])];
      let newRoles: RoleType[];
      
      // Handle Administrator role separately
      if (role === "Administrator") {
        // If toggling Administrator, either select only Administrator or remove it
        // Only allow removing Administrator if there are other roles to select
        if (currentRoles.includes("Administrator")) {
          // If removing Administrator, ensure there's at least one role to replace it
          newRoles = ["Division Manager"]; // Default to Division Manager if removing admin
        } else {
          newRoles = ["Administrator"];
        }
      } else {
        // For other roles
        if (currentRoles.includes(role)) {
          // If the role is already selected, remove it only if it's not the last role
          const roleIndex = currentRoles.indexOf(role);
          if (currentRoles.length > 1) {
            currentRoles.splice(roleIndex, 1);
            newRoles = [...currentRoles];
          } else {
            // Cannot remove the last role
            newRoles = [...currentRoles];
          }
        } else {
          // If the role is not selected, add it and remove Administrator if present
          newRoles = [...currentRoles.filter(r => r !== "Administrator"), role];
        }
      }
      
      // Sort the roles in the correct order
      return {
        ...prev,
        [userId]: sortRoles(newRoles)
      };
    });
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    return securityData.filter((item) => {
      return (
        item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [searchTerm]);

  // Sort data based on sort configuration
  const sortedData = useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig.key && sortConfig.direction) {
      sortableData.sort((a, b) => {
        let aValue, bValue;
        
        // Handle nested properties
        if (sortConfig.key === 'user.name') {
          aValue = a.user.name;
          bValue = b.user.name;
        } else if (sortConfig.key === 'user.role') {
          aValue = a.user.role;
          bValue = b.user.role;
        } else if (sortConfig.key === 'abbreviation') {
          aValue = a.abbreviation;
          bValue = b.abbreviation;
        } else if (sortConfig.key === 'roles') {
          aValue = a.roles.join(',');
          bValue = b.roles.join(',');
        } else if (sortConfig.key === 'manager.name') {
          aValue = a.manager.name;
          bValue = b.manager.name;
        } else if (sortConfig.key === 'manager.abbreviation') {
          aValue = a.manager.abbreviation;
          bValue = b.manager.abbreviation;
        } else if (sortConfig.key && sortConfig.key in a) {
          aValue = a[sortConfig.key as keyof SecurityEntry];
          bValue = b[sortConfig.key as keyof SecurityEntry];
        } else {
          return 0;
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  // Get current items based on pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle sort
  const requestSort = (key: keyof SecurityEntry | 'user.name' | 'user.role' | 'abbreviation' | 'roles' | 'manager.name' | 'manager.abbreviation') => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction indicator
  const getSortDirectionIndicator = (key: keyof SecurityEntry | 'user.name' | 'user.role' | 'abbreviation' | 'roles' | 'manager.name' | 'manager.abbreviation') => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  // State for managing status dropdown
  const [openStatusPopover, setOpenStatusPopover] = useState<number | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, StatusType>>({});
  const [statusDropdownPosition, setStatusDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const [clickCoordinates, setClickCoordinates] = useState({ x: 0, y: 0 });
  
  const closeStatusPopover = () => setOpenStatusPopover(null);
  const statusPopoverRef = useClickOutside(closeStatusPopover);
  
  // Toggle status popover with smart positioning
  const toggleStatusPopover = (id: number, event: React.MouseEvent) => {
    const targetElement = event.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 250; // Approximate max height of dropdown
    
    // Determine if dropdown should appear above or below
    const position = (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) 
      ? 'top' 
      : 'bottom';
      
    setStatusDropdownPosition(position);
    
    // Store click coordinates
    setClickCoordinates({
      x: rect.left,
      y: rect.top
    });
    
    setOpenStatusPopover(openStatusPopover === id ? null : id);
  };
  
  // Initialize selected statuses from data
  useEffect(() => {
    const initialStatuses: Record<number, StatusType> = {};
    securityData.forEach(item => {
      initialStatuses[item.id] = item.status;
    });
    setSelectedStatuses(initialStatuses);
  }, []);
  
  // Change user status
  const changeStatus = (userId: number, status: StatusType) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [userId]: status
    }));
    // Close popover after selection
    setOpenStatusPopover(null);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-gray-800 dark:bg-gray-900" style={{ overflow: 'visible' }}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-500 dark:text-gray-400">Show</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-500 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
          <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">entries</span>
        </div>
        <div className="flex items-center gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-transparent py-2 pl-10 pr-4 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          </div>
          <button
            onClick={() => {
              // Add user functionality here
              console.log('Add User clicked');
            }}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:px-4 px-3"
          >
            <UserPlusIcon />
            <span className="hidden sm:inline">Add User</span>
          </button>
        </div>
      </div>

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
                  {getSortDirectionIndicator('user.name')}
                </div>
              </TableCell>
              <TableCell isHeader className="px-4 py-3">
                <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('abbreviation')}>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Abbreviation</span>
                  {getSortDirectionIndicator('abbreviation')}
                </div>
              </TableCell>
              <TableCell isHeader className="px-4 py-3">
                  <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('roles')}>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Role(s)</span>
                    {getSortDirectionIndicator('roles')}
                </div>
              </TableCell>
              <TableCell isHeader className="px-4 py-3">
                <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('division')}>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Division</span>
                  {getSortDirectionIndicator('division')}
                </div>
              </TableCell>
              <TableCell isHeader className="px-4 py-3">
                <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('manager.name')}>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Manager</span>
                  {getSortDirectionIndicator('manager.name')}
                </div>
              </TableCell>
              <TableCell isHeader className="px-4 py-3">
                <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('lastLoginIn')}>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Last Login-In</span>
                  {getSortDirectionIndicator('lastLoginIn')}
                </div>
              </TableCell>
              <TableCell isHeader className="px-4 py-3">
                <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('lastLogOff')}>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Last Log-Off</span>
                  {getSortDirectionIndicator('lastLogOff')}
                </div>
              </TableCell>
              <TableCell isHeader className="px-4 py-3">
                <div className="flex items-center gap-1 text-left cursor-pointer" onClick={() => requestSort('status')}>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Status</span>
                  {getSortDirectionIndicator('status')}
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
                  <div className="flex items-center gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        console.log('Edit user:', item.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25"
                      title="Edit User"
                    >
                      <PencilIcon />
                    </button>
                    
                    {/* Transfer Button */}
                    <button
                      onClick={() => {
                        console.log('Transfer user:', item.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-600 transition-colors hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25"
                      title="Transfer User"
                    >
                      <ShootingStarIcon />
                    </button>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => {
                        console.log('Remove user:', item.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25"
                      title="Remove User"
                    >
                      <TrashBinIcon />
                    </button>
                  </div>
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