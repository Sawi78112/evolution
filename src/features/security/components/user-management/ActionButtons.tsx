import React from 'react';
import { PencilIcon, ShootingStarIcon, TrashBinIcon } from '@/assets/icons';

interface ActionButtonsProps {
  userId: string;
  onEdit: (userId: string) => void;
  onTransfer?: (userId: string) => void;
  onRemove: (userId: string) => void;
}

export function ActionButtons({ userId, onEdit, onTransfer, onRemove }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Edit Button */}
      <button
        onClick={() => onEdit(userId)}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25"
        title="Edit User"
      >
        <PencilIcon />
      </button>
      
      {/* Transfer Button */}
      <button
        onClick={() => onTransfer?.(userId)}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-600 transition-colors hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25"
        title="Transfer User"
      >
        <ShootingStarIcon />
      </button>
      
      {/* Remove Button */}
      <button
        onClick={() => onRemove(userId)}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25"
        title="Remove User"
      >
        <TrashBinIcon />
      </button>
    </div>
  );
} 