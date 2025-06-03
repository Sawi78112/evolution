import React from 'react';
import { PencilIcon, TrashBinIcon } from '@/assets/icons';
import { DivisionActionButtonsProps } from '../types';

export function DivisionActionButtons({ divisionId, onEdit, onRemove }: DivisionActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Edit Button */}
      <button
        onClick={() => onEdit(divisionId)}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25"
        title="Edit Division"
      >
        <PencilIcon />
      </button>
      
      {/* Remove Button */}
      <button
        onClick={() => onRemove(divisionId)}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25"
        title="Delete Division"
      >
        <TrashBinIcon />
      </button>
    </div>
  );
} 