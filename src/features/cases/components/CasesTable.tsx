"use client";

import React from 'react';
import { ChevronDownIcon } from '@/assets/icons';
import { CaseData, SortField } from '../types';
import { PRIORITY_COLORS, STATUS_COLORS } from '../constants';
import { CaseActionButtons } from './CaseActionButtons';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';

interface CasesTableProps {
  cases: CaseData[];
  loading: boolean;
  error: string | null;
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  };
  onSort: (field: SortField) => void;
  formatDate: (date: string | null) => string;
  formatDateTime: (date: string | null) => string;
  onDetail: (caseId: string) => void;
  onEdit: (caseId: string) => void;
  onRemove: (caseId: string) => void;
}

export function CasesTable({
  cases,
  loading,
  error,
  sorting,
  onSort,
  formatDate,
  formatDateTime,
  onDetail,
  onEdit,
  onRemove
}: CasesTableProps) {
  const getSortDirectionIndicator = (field: string) => {
    if (sorting.field !== field) {
      return <ChevronDownIcon className="h-4 w-4 text-gray-400 rotate-0 flex-shrink-0" />;
    }
    return (
      <ChevronDownIcon 
        className={`h-4 w-4 text-gray-600 transition-transform flex-shrink-0 ${
          sorting.direction === 'asc' ? 'rotate-180' : 'rotate-0'
        }`} 
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading cases...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500">Error loading cases: {error}</div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-gray-50 dark:bg-gray-800">
        <TableRow>
          <TableCell isHeader className="px-4 py-0.5 w-16">
            <div className="flex items-center">
              <span className="font-medium text-gray-500 dark:text-gray-400">No</span>
            </div>
          </TableCell>
          <TableCell isHeader className="px-4 py-0.5 w-48">
            <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => onSort('case_name')}>
              <span className="font-medium text-gray-500 dark:text-gray-400">Name</span>
              {getSortDirectionIndicator('case_name')}
            </div>
          </TableCell>
          <TableCell isHeader className="px-4 py-0.5 w-32">
            <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => onSort('case_type')}>
              <span className="font-medium text-gray-500 dark:text-gray-400">Type</span>
              {getSortDirectionIndicator('case_type')}
            </div>
          </TableCell>
          <TableCell isHeader className="px-4 py-0.5 w-36">
            <div className="flex items-center">
              <span className="font-medium text-gray-500 dark:text-gray-400">Sub Type</span>
            </div>
          </TableCell>
          <TableCell isHeader className="px-4 py-0.5 w-32">
            <div className="flex items-center">
              <span className="font-medium text-gray-500 dark:text-gray-400">Division</span>
            </div>
          </TableCell>
          <TableCell isHeader className="px-4 py-0.5 w-40">
            <div className="flex items-center">
              <span className="font-medium text-gray-500 dark:text-gray-400">Owner</span>
            </div>
          </TableCell>
          <TableCell isHeader className="px-4 py-0.5 w-28">
            <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => onSort('incident_date')}>
              <span className="font-medium text-gray-500 dark:text-gray-400">Init Occur</span>
              {getSortDirectionIndicator('incident_date')}
            </div>
          </TableCell>
          <TableCell isHeader className="px-4 py-0.5 w-44">
            <div className="flex items-center">
              <span className="font-medium text-gray-500 dark:text-gray-400">Location</span>
            </div>
          </TableCell>
          <TableCell isHeader className="px-4 py-0.5 w-28">
            <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => onSort('case_status')}>
              <span className="font-medium text-gray-500 dark:text-gray-400">Status</span>
              {getSortDirectionIndicator('case_status')}
            </div>
          </TableCell>
          <TableCell isHeader className="px-4 py-0.5 w-24">
            <div className="flex items-center gap-2 text-left cursor-pointer" onClick={() => onSort('case_priority')}>
              <span className="font-medium text-gray-500 dark:text-gray-400">Priority</span>
              {getSortDirectionIndicator('case_priority')}
            </div>
          </TableCell>
          <TableCell isHeader className="px-4 py-0.5 w-32">
            <div className="flex items-center">
              <span className="font-medium text-gray-500 dark:text-gray-400">Action</span>
            </div>
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
        {cases.map((caseItem) => (
          <TableRow key={caseItem.id}>
            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              {caseItem.no}
            </TableCell>
            <TableCell className="px-4 py-3 text-start">
              <div className="min-w-0">
                <span className="block text-sm font-medium text-gray-800 dark:text-white truncate" title={caseItem.name}>
                  {caseItem.name}
                </span>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              {caseItem.type}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              {caseItem.subType}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              {caseItem.division}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              {caseItem.owner}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              {formatDate(caseItem.initOccur)}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="max-w-xs truncate" title={caseItem.location}>
                {caseItem.location}
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              <Badge
                size="sm"
                color={STATUS_COLORS[caseItem.caseStatus as keyof typeof STATUS_COLORS]}
              >
                {caseItem.caseStatus}
              </Badge>
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              <Badge
                size="sm"
                color={PRIORITY_COLORS[caseItem.priority as keyof typeof PRIORITY_COLORS]}
              >
                {caseItem.priority}
              </Badge>
            </TableCell>
            <TableCell className="px-4 py-3">
              <CaseActionButtons
                caseId={caseItem.id}
                onDetail={onDetail}
                onEdit={onEdit}
                onRemove={onRemove}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 