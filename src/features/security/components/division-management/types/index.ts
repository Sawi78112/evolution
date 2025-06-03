export interface SortConfig {
  field: SortField;
  direction: 'asc' | 'desc';
}

export type SortField = 'name' | 'abbreviation' | 'manager.name' | 'createdBy.name' | 'createdAt' | 'totalUsers' | 'status';

export interface DivisionActionButtonsProps {
  divisionId: string;
  onEdit: (divisionId: string) => void;
  onRemove: (divisionId: string) => void;
}

export interface DivisionSearchAndFiltersProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onAddDivision: () => void;
}

export interface StatusPopoverProps {
  isOpen: boolean;
  position: 'top' | 'bottom';
  coordinates: { x: number; y: number };
  selectedStatus: string;
  onStatusChange: (status: 'Active' | 'Inactive') => void;
  onClose: () => void;
}

export interface DivisionMobileCardProps {
  division: any; // This should match your DivisionData type
  index: number;
  currentPage: number;
  limit: number;
  selectedStatuses: Record<string, string>;
  onStatusChange: (divisionId: string, status: 'Active' | 'Inactive') => void;
  onEdit: (divisionId: string) => void;
  onDelete: (divisionId: string) => void;
  onToggleStatusPopover: (id: string, event: React.MouseEvent) => void;
  openStatusPopover: string | null;
  statusDropdownPosition: 'top' | 'bottom';
  clickCoordinates: { x: number; y: number };
}

export interface DivisionTableRowProps {
  division: any; // This should match your DivisionData type
  index: number;
  currentPage: number;
  limit: number;
  selectedStatuses: Record<string, string>;
  onEdit: (divisionId: string) => void;
  onDelete: (divisionId: string) => void;
  onStatusChange: (divisionId: string, status: 'Active' | 'Inactive') => void;
  onToggleStatusPopover: (id: string, event: React.MouseEvent) => void;
  openStatusPopover: string | null;
  statusDropdownPosition: 'top' | 'bottom';
  clickCoordinates: { x: number; y: number };
}

export interface DivisionTableHeaderProps {
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
} 