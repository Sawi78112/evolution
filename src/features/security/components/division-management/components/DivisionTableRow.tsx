import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { ChevronDownIcon } from '@/assets/icons';
import { DivisionActionButtons } from './DivisionActionButtons';
import { StatusPopover } from './StatusPopover';
import { formatCreatedAt, getStatusConfig } from '../utils';
import { DivisionTableRowProps } from '../types';

export function DivisionTableRow({
  division,
  index,
  currentPage,
  limit,
  selectedStatuses,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleStatusPopover,
  openStatusPopover,
  statusDropdownPosition,
  clickCoordinates
}: DivisionTableRowProps) {
  const statusPopoverRef = React.useRef<HTMLDivElement>(null);
  
  return (
    <TableRow key={division.id}>
      <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
        {((currentPage - 1) * limit) + index + 1}
      </TableCell>
      <TableCell className="px-4 py-4 text-start">
        <div className="min-w-0">
          <span className="block text-sm font-medium text-gray-800 dark:text-white truncate">
            {division.name}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium">{division.abbreviation}</span>
      </TableCell>
      <TableCell className="px-4 py-4 text-start">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full flex-shrink-0">
            <img
              src={division.manager?.image || '/images/default-avatar.svg'}
              alt={division.manager?.name || 'No manager'}
              width={32}
              height={32}
            />
          </div>
          <div className="min-w-0">
            <span className="block text-sm text-gray-700 dark:text-gray-300 truncate">
              {division.manager ? `${division.manager.name} - ${division.manager.abbreviation}` : 'None'}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
        {division.createdBy ? `${division.createdBy.name} - ${division.createdBy.abbreviation}` : 'Unknown'}
      </TableCell>
      <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
        {formatCreatedAt(division.createdAt)}
      </TableCell>
      <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium">{division.totalUsers}</span>
      </TableCell>
      <TableCell className="px-4 py-4">
        <div className="relative" style={{ position: 'static' }}>
          <div 
            className="flex items-center gap-1 cursor-pointer relative"
            onClick={(e) => onToggleStatusPopover(division.id, e)}
          >
            <Badge
              size="sm"
              color={getStatusConfig(selectedStatuses[division.id] || division.status).color}
            >
              {selectedStatuses[division.id] || division.status}
            </Badge>
            <ChevronDownIcon 
              className="ml-1 text-gray-500 flex-shrink-0"
            />
          </div>
          
          <StatusPopover
            isOpen={openStatusPopover === division.id}
            position={statusDropdownPosition}
            coordinates={clickCoordinates}
            selectedStatus={selectedStatuses[division.id] || division.status}
            onStatusChange={(status) => onStatusChange(division.id, status)}
            onClose={() => {}}
            statusPopoverRef={statusPopoverRef}
          />
        </div>
      </TableCell>
      <TableCell className="px-4 py-4">
        <DivisionActionButtons
          divisionId={division.id}
          onEdit={onEdit}
          onRemove={onDelete}
        />
      </TableCell>
    </TableRow>
  );
} 