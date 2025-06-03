import React from 'react';
import { TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDownIcon } from '@/assets/icons';
import { DivisionTableHeaderProps, SortField } from '../types';

export function DivisionTableHeader({ sortConfig, onSort }: DivisionTableHeaderProps) {
  const getSortDirectionIndicator = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronDownIcon className="h-4 w-4 text-gray-400 rotate-0 flex-shrink-0" />;
    }
    return (
      <ChevronDownIcon 
        className={`h-4 w-4 text-gray-600 transition-transform flex-shrink-0 ${
          sortConfig.direction === 'asc' ? 'rotate-180' : 'rotate-0'
        }`} 
      />
    );
  };

  return (
    <TableHeader className="bg-gray-50 dark:bg-gray-800">
      <TableRow>
        <TableCell isHeader className="px-4 py-3 w-16">
          <div className="flex items-center min-h-[20px]">
            <span className="font-medium text-gray-500 dark:text-gray-400">No</span>
          </div>
        </TableCell>
        <TableCell isHeader className="px-4 py-3 min-w-[200px]">
          <div className="flex items-center gap-2 text-left cursor-pointer min-h-[20px]" onClick={() => onSort('name')}>
            <span className="font-medium text-gray-500 dark:text-gray-400">Division Name</span>
            {getSortDirectionIndicator('name')}
          </div>
        </TableCell>
        <TableCell isHeader className="px-4 py-3 min-w-[120px]">
          <div className="flex items-center gap-2 text-left cursor-pointer min-h-[20px]" onClick={() => onSort('abbreviation')}>
            <span className="font-medium text-gray-500 dark:text-gray-400">Abbreviation</span>
            {getSortDirectionIndicator('abbreviation')}
          </div>
        </TableCell>
        <TableCell isHeader className="px-4 py-3 min-w-[180px]">
          <div className="flex items-center gap-2 text-left cursor-pointer min-h-[20px]" onClick={() => onSort('manager.name')}>
            <span className="font-medium text-gray-500 dark:text-gray-400">Manager</span>
            {getSortDirectionIndicator('manager.name')}
          </div>
        </TableCell>
        <TableCell isHeader className="px-4 py-3 min-w-[140px]">
          <div className="flex items-center gap-2 text-left cursor-pointer min-h-[20px]" onClick={() => onSort('createdBy.name')}>
            <span className="font-medium text-gray-500 dark:text-gray-400">Created By</span>
            {getSortDirectionIndicator('createdBy.name')}
          </div>
        </TableCell>
        <TableCell isHeader className="px-4 py-3 min-w-[130px]">
          <div className="flex items-center gap-2 text-left cursor-pointer min-h-[20px]" onClick={() => onSort('createdAt')}>
            <span className="font-medium text-gray-500 dark:text-gray-400">Created At</span>
            {getSortDirectionIndicator('createdAt')}
          </div>
        </TableCell>
        <TableCell isHeader className="px-4 py-3 min-w-[110px]">
          <div className="flex items-center gap-2 text-left cursor-pointer min-h-[20px]" onClick={() => onSort('totalUsers')}>
            <span className="font-medium text-gray-500 dark:text-gray-400">Total Users</span>
            {getSortDirectionIndicator('totalUsers')}
          </div>
        </TableCell>
        <TableCell isHeader className="px-4 py-3 min-w-[90px]">
          <div className="flex items-center gap-2 text-left cursor-pointer min-h-[20px]" onClick={() => onSort('status')}>
            <span className="font-medium text-gray-500 dark:text-gray-400">Status</span>
            {getSortDirectionIndicator('status')}
          </div>
        </TableCell>
        <TableCell isHeader className="px-4 py-3 w-32">
          <div className="flex items-center min-h-[20px]">
            <span className="font-medium text-gray-500 dark:text-gray-400">Action</span>
          </div>
        </TableCell>
      </TableRow>
    </TableHeader>
  );
} 