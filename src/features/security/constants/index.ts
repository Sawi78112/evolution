import { RoleType, StatusType, RoleConfig, StatusConfig } from '../types';

// Role color mappings and configurations
export const ROLE_COLORS = {
  "Administrator": { color: "bg-blue-500", abbr: "AD" },
  "Divisional Manager": { color: "bg-green-500", abbr: "D" },
  "Analyst": { color: "bg-purple-500", abbr: "A" },
  "Investigator": { color: "bg-orange-500", abbr: "I" },
  "System Support": { color: "bg-gray-500", abbr: "S" },
} as const;

// Role priority for sorting (higher number = higher priority)
export const ROLE_PRIORITY = [
  "Administrator",
  "Divisional Manager",
  "Analyst", 
  "Investigator",
  "System Support"
] as const;

// Role counts for statistics (example data)
export const ROLE_COUNTS = {
  "Active Users": 24,
  "Inactive Users": 3,
  "Administrators": 2,
  "Divisional Manager": 1,
  "Analysts": 8,
  "Investigators": 12,
  "System Support": 4
} as const;

// Status configuration with proper badge colors
export const statusConfig: Record<StatusType, StatusConfig> = {
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

// List of all possible status types
export const allStatusTypes: StatusType[] = ["Active", "Inactive", "Transferred", "Canceled"];

// Pagination options
export const itemsPerPageOptions = [5, 10, 15, 20];

// Role order mapping for sorting
export const roleOrderMap: Record<RoleType, number> = {
  "Administrator": 0,
  "Divisional Manager": 1,
  "Analyst": 2,
  "Investigator": 3,
  "System Support": 4
}; 