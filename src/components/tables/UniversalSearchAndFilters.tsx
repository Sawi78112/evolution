import React from 'react';
import { SearchIcon } from '@/assets/icons';
import { itemsPerPageOptions } from '@/features/security/constants';

interface UniversalSearchAndFiltersProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  addButtonIcon?: React.ReactNode;
  onAddClick?: () => void;
  customFilters?: React.ReactNode; // For additional custom filters
}

export function UniversalSearchAndFilters({
  itemsPerPage,
  onItemsPerPageChange,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onSearchKeyPress,
  searchPlaceholder = "Search...",
  showAddButton = true,
  addButtonText = "Add New",
  addButtonIcon,
  onAddClick,
  customFilters
}: UniversalSearchAndFiltersProps) {
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
      
      {/* Search, Custom Filters, and Add Button */}
      <div className="flex flex-col gap-3 order-1 sm:order-2 sm:flex-row sm:items-center">
        {/* Custom Filters (if provided) */}
        {customFilters && (
          <div className="flex items-center gap-3">
            {customFilters}
          </div>
        )}
        
        {/* Search Input */}
        <div className="relative flex-1 sm:flex-none">
          <span 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 cursor-pointer"
            onClick={onSearchSubmit}
          >
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={onSearchKeyPress}
            className="w-full sm:w-64 rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        
        {/* Add Button */}
        {showAddButton && onAddClick && (
          <button
            onClick={onAddClick}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 min-w-[120px] sm:min-w-0"
          >
            {addButtonIcon}
            <span>{addButtonText}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Enhanced Search Tips Component
export function SearchTips({ tableName, searchFields }: { tableName: string; searchFields: string[] }) {
  return (
    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
        🔍 Search Tips for {tableName}
      </h4>
      <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
        <p><strong>Searchable fields:</strong> {searchFields.join(', ')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          <div>
            <p><strong>Text:</strong> marketing, john, ADMIN</p>
            <p><strong>Status:</strong> active, inactive</p>
          </div>
          <div>
            <p><strong>Numbers:</strong> 0, 5, 100</p>
            <p><strong>Dates:</strong> 12/15/2024, dec, january</p>
          </div>
        </div>
      </div>
    </div>
  );
} 