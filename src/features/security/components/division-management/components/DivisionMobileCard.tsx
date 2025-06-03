import React from 'react';
import Badge from '@/components/ui/badge/Badge';
import { ChevronDownIcon } from '@/assets/icons';
import { DivisionActionButtons } from './DivisionActionButtons';
import { StatusPopover } from './StatusPopover';
import { formatCreatedAt, getStatusConfig } from '../utils';
import { DivisionMobileCardProps } from '../types';

export function DivisionMobileCard({
  division,
  index,
  currentPage,
  limit,
  selectedStatuses,
  onStatusChange,
  onEdit,
  onDelete,
  onToggleStatusPopover,
  openStatusPopover,
  statusDropdownPosition,
  clickCoordinates
}: DivisionMobileCardProps) {
  const statusPopoverRef = React.useRef<HTMLDivElement>(null);

  return (
    <div key={division.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full flex-shrink-0">
            <img
              src={division.manager?.image || '/images/default-avatar.svg'}
              alt={division.manager?.name || 'No manager'}
              width={40}
              height={40}
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white">{division.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{division.abbreviation}</p>
          </div>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">#{index + 1}</span>
      </div>
      
      <div className="space-y-2 mb-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Manager</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {division.manager ? `${division.manager.name} - ${division.manager.abbreviation}` : 'None'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Created By</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {division.createdBy ? `${division.createdBy.name} - ${division.createdBy.abbreviation}` : 'Unknown'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{formatCreatedAt(division.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{division.totalUsers}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
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
        <DivisionActionButtons
          divisionId={division.id}
          onEdit={onEdit}
          onRemove={onDelete}
        />
      </div>
    </div>
  );
} 