import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

export function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <div 
      className={`flex h-4 w-4 items-center justify-center rounded border ${
        checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'
      } cursor-pointer`}
      onClick={onChange}
    >
      {checked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3 text-white"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
} 