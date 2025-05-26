// Table Component Types

export type RoleType = "Administrator" | "Division Manager" | "Analyst" | "Investigator" | "System Support";

export type StatusType = "Active" | "Inactive" | "Transferred" | "Canceled";

export type BadgeColor = "success" | "warning" | "error" | "info" | "primary" | "light" | "dark";

export interface SecurityEntry {
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

export interface RoleConfig {
  color: string;
  abbr: string;
}

export interface StatusConfig {
  color: BadgeColor;
  description: string;
}

export interface SortConfig {
  key: keyof SecurityEntry | 'user.name' | 'user.role' | 'abbreviation' | 'roles' | 'manager.name' | 'manager.abbreviation' | null;
  direction: 'ascending' | 'descending' | null;
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface DropdownPosition {
  x: number;
  y: number;
  direction: 'top' | 'bottom';
}

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  onItemsPerPageChange?: (items: number) => void;
};

export interface Order {
  id: string;
  customer: string;
  date: string;
  status: string;
  amount: number;
}

export interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
} 