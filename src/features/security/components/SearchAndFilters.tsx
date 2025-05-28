import React from 'react';
import { SearchIcon, UserPlusIcon } from '@/assets/icons';
import { itemsPerPageOptions } from '../constants';

interface SearchAndFiltersProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddUser: () => void;
}

export function SearchAndFilters({
  itemsPerPage,
  onItemsPerPageChange,
  searchTerm,
  onSearchChange,
  onAddUser
}: SearchAndFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Items per page selector */}
      <div className="flex items-center order-2 sm:order-1">
        <label className="mr-2 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Show</label>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 min-w-[70px]"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">entries</span>
      </div>
      
      {/* Search and Add User */}
      <div className="flex flex-col gap-3 order-1 sm:order-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:flex-none">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        
        <button
          onClick={onAddUser}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 min-w-[120px] sm:min-w-0"
        >
          <UserPlusIcon className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>
    </div>
  );
} 