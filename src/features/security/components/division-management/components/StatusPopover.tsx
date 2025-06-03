import React from 'react';
import Badge from '@/components/ui/badge/Badge';
import { CheckLineIcon } from '@/assets/icons';
import { getStatusConfig } from '../utils';

interface StatusPopoverProps {
  isOpen: boolean;
  position: 'top' | 'bottom';
  coordinates: { x: number; y: number };
  selectedStatus: string;
  onStatusChange: (status: 'Active' | 'Inactive') => void;
  onClose: () => void;
  statusPopoverRef?: React.RefObject<HTMLDivElement | null>;
}

export function StatusPopover({
  isOpen,
  position,
  coordinates,
  selectedStatus,
  onStatusChange,
  statusPopoverRef
}: StatusPopoverProps) {
  if (!isOpen) return null;

  return (
    <div 
      ref={statusPopoverRef}
      className="fixed z-50 w-32 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
      style={{
        left: `${coordinates.x}px`,
        top: `${coordinates.y}px`,
        transform: position === 'top' ? 'translateY(-100%)' : 'none'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2">
        {(['Active', 'Inactive'] as const).map((status) => {
          const isSelected = selectedStatus === status;
          return (
            <div
              key={status}
              className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(status);
              }}
            >
              <Badge
                size="sm"
                color={getStatusConfig(status).color}
              >
                {status}
              </Badge>
              {isSelected && (
                <CheckLineIcon className="h-4 w-4 text-green-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 