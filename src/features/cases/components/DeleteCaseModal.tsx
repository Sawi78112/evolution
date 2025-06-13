"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/assets/icons';

interface DeleteCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  caseId: string;
  caseName: string;
  loading?: boolean;
}

export function DeleteCaseModal({ isOpen, onClose, onConfirm, caseName, loading = false }: DeleteCaseModalProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black bg-opacity-10 backdrop-blur-[2px] flex items-center justify-center p-4" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        margin: 0,
        padding: '1rem',
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.15)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md flex flex-col shadow-2xl border-0 mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Delete Case</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete case{' '}
            <strong className="text-gray-900 dark:text-white">{caseName}</strong>?
          </p>
          {loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Please wait while we process the deletion...
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? 'Deleting...' : 'Delete Case'}
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document root level
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
} 