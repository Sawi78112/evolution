"use client";

import React from 'react';
import { PencilIcon, TrashBinIcon, EyeIcon } from '@/assets/icons';

interface CaseActionButtonsProps {
  caseId: string;
  onDetail: (caseId: string) => void;
  onEdit: (caseId: string) => void;
  onRemove: (caseId: string) => void;
}

export function CaseActionButtons({ caseId, onDetail, onEdit, onRemove }: CaseActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Detail Button */}
      <button
        onClick={() => onDetail(caseId)}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-green-50 text-green-600 transition-colors hover:bg-green-100 dark:bg-green-500/15 dark:text-green-400 dark:hover:bg-green-500/25"
        title="View Case Details"
      >
        <EyeIcon />
      </button>
      
      {/* Edit Button */}
      <button
        onClick={() => onEdit(caseId)}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25"
        title="Edit Case"
      >
        <PencilIcon />
      </button>
      
      {/* Remove Button */}
      <button
        onClick={() => onRemove(caseId)}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25"
        title="Remove Case"
      >
        <TrashBinIcon />
      </button>
    </div>
  );
} 