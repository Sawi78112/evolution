import { SecurityEntry, RoleType, SortConfig } from '../types';
import { roleOrderMap } from '../constants';

// Function to sort roles in the correct order
export const sortRoles = (roles: RoleType[]): RoleType[] => {
  // If Administrator is present, return just Administrator
  if (roles.includes("Administrator")) {
    return ["Administrator"];
  }
  
  // Sort roles based on their position in the order
  return [...roles].sort((a, b) => roleOrderMap[a] - roleOrderMap[b]);
};

// Sort data based on sort configuration
export const sortSecurityData = (
  data: SecurityEntry[], 
  sortConfig: SortConfig
): SecurityEntry[] => {
  if (!sortConfig.key || !sortConfig.direction) {
    return data;
  }

  return [...data].sort((a, b) => {
    let aValue, bValue;
    
    // Handle nested properties
    switch (sortConfig.key) {
      case 'user.name':
        aValue = a.user.name;
        bValue = b.user.name;
        break;
      case 'user.role':
        aValue = a.user.role;
        bValue = b.user.role;
        break;
      case 'abbreviation':
        aValue = a.abbreviation;
        bValue = b.abbreviation;
        break;
      case 'roles':
        aValue = a.roles.join(',');
        bValue = b.roles.join(',');
        break;
      case 'manager.name':
        aValue = a.manager.name;
        bValue = b.manager.name;
        break;
      case 'manager.abbreviation':
        aValue = a.manager.abbreviation;
        bValue = b.manager.abbreviation;
        break;
      default:
        if (sortConfig.key && sortConfig.key in a) {
          aValue = a[sortConfig.key as keyof SecurityEntry];
          bValue = b[sortConfig.key as keyof SecurityEntry];
        } else {
          return 0;
        }
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
};

// Get sort direction indicator
export const getSortDirectionIndicator = (
  key: keyof SecurityEntry | 'user.name' | 'user.role' | 'abbreviation' | 'roles' | 'manager.name' | 'manager.abbreviation',
  sortConfig: SortConfig
): string | null => {
  if (sortConfig.key !== key) return null;
  return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
}; 