export interface CaseData {
  id: string;
  no: number;
  name: string;
  clientId: string;
  type: string;
  subType: string;
  caseStatus: 'Open' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  division: string;
  owner: string;
  initOccur: string | null;
  addedDate: string;
  lastUpdated: string;
  location: string;
}

export interface CasesResponse {
  success: boolean;
  data: CaseData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    search: string | null;
  };
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface CasesTableProps {
  cases: CaseData[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  };
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
}

export type SortField = 
  | 'case_name'
  | 'client_case_id'
  | 'case_type'
  | 'case_status'
  | 'case_priority'
  | 'incident_date'
  | 'case_added_date'
  | 'last_updated_date';

export interface CasesFilters {
  search: string;
  status?: 'Open' | 'Closed';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  type?: string;
}

export interface CasesSearchAndFiltersProps {
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchSubmit: () => void;
  onSearchKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onAddCase: () => void;
  disableAddCase?: boolean;
} 