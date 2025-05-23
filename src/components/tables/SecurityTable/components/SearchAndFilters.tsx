import React from 'react';
import { SearchIcon, UserPlusIcon } from '../../../../icons';
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
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center">
        <label className="mr-2 text-sm font-medium text-gray-500 dark:text-gray-400">Show</label>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="rounded border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-500 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-transparent py-2 pl-10 pr-4 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        
        <button
          onClick={onAddUser}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:px-4 px-3"
        >
          <UserPlusIcon />
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>
    </div>
  );
} 