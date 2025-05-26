import { SecurityEntry } from '../types';

// Filter data based on search term
export const filterSecurityData = (
  data: SecurityEntry[], 
  searchTerm: string
): SecurityEntry[] => {
  if (!searchTerm.trim()) {
    return data;
  }

  const lowercaseSearchTerm = searchTerm.toLowerCase();

  return data.filter((item) => {
    return (
      item.user.name.toLowerCase().includes(lowercaseSearchTerm) ||
      item.user.role.toLowerCase().includes(lowercaseSearchTerm) ||
      item.abbreviation.toLowerCase().includes(lowercaseSearchTerm) ||
      item.action.toLowerCase().includes(lowercaseSearchTerm) ||
      item.division.toLowerCase().includes(lowercaseSearchTerm) ||
      item.manager.name.toLowerCase().includes(lowercaseSearchTerm) ||
      item.status.toLowerCase().includes(lowercaseSearchTerm) ||
      item.roles.some(role => role.toLowerCase().includes(lowercaseSearchTerm))
    );
  });
}; 