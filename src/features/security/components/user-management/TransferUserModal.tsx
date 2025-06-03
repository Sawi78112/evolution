"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, ChevronDownIcon, CheckLineIcon, SearchIcon } from '@/assets/icons';

interface TransferUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transferData: TransferFormData) => void;
  userId: number;
  userName: string;
}

export interface TransferFormData {
  transferToUserId: string;
  transferScope: TransferScopeType[];
  transferReason: string;
}

type TransferScopeType = 'Cases' | 'Alerts' | 'Notifications' | 'Activity Logs' | 'Manager' | 'Division';

// Mock data for managers/users to transfer to
const availableUsers = [
  { id: '1', name: 'Maria Pulera', abbreviation: 'MAPL' },
  { id: '2', name: 'James Wilson', abbreviation: 'JAWL' },
  { id: '3', name: 'Robert Chen', abbreviation: 'ROCH' },
  { id: '4', name: 'Sarah Johnson', abbreviation: 'SAJO' },
  { id: '5', name: 'Michael Brown', abbreviation: 'MIBR' },
  { id: '6', name: 'Lisa Anderson', abbreviation: 'LIAN' },
];

const transferScopeOptions: TransferScopeType[] = [
  'Cases', 'Alerts', 'Notifications', 'Activity Logs', 'Manager', 'Division'
];

export function TransferUserModal({ isOpen, onClose, onSubmit, userName }: TransferUserModalProps) {
  const [formData, setFormData] = useState<TransferFormData>({
    transferToUserId: '',
    transferScope: [],
    transferReason: '',
  });

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const handleInputChange = (field: keyof TransferFormData, value: string | TransferScopeType[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleScopeItem = (scope: TransferScopeType) => {
    setFormData(prev => ({
      ...prev,
      transferScope: prev.transferScope.includes(scope)
        ? prev.transferScope.filter(s => s !== scope)
        : [...prev.transferScope, scope]
    }));
  };

  const filteredUsers = availableUsers.filter(user =>
    `${user.name} - ${user.abbreviation}`.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const selectedUser = availableUsers.find(u => u.id === formData.transferToUserId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.transferToUserId || formData.transferScope.length === 0 || 
        formData.transferReason.trim().length < 50 || formData.transferReason.trim().length > 500) {
      return;
    }
    
    onSubmit(formData);
    onClose();
    handleClear();
  };

  const handleClear = () => {
    setFormData({
      transferToUserId: '',
      transferScope: [],
      transferReason: '',
    });
    setSearchQuery('');
  };

  const isFormValid = () => {
    return formData.transferToUserId && 
           formData.transferScope.length > 0 && 
           formData.transferReason.trim().length >= 50 && 
           formData.transferReason.trim().length <= 500;
  };

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
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl flex flex-col shadow-2xl border-0 mx-auto relative z-10 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transfer User</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* User Info */}
            <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Transferring: <strong>{userName}</strong>
              </p>
            </div>

            {/* Transfer To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transfer To <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 flex items-center justify-between"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedUser ? `${selectedUser.name} - ${selectedUser.abbreviation}` : 'Select user to transfer to'}
                  </span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>
                    {/* Options */}
                    <div className="max-h-40 overflow-y-auto">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => {
                            handleInputChange('transferToUserId', user.id);
                            setDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-300"
                        >
                          {user.name} - {user.abbreviation}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transfer Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transfer Scope <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {transferScopeOptions.map((scope) => (
                  <div
                    key={scope}
                    className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => toggleScopeItem(scope)}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.transferScope.includes(scope)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 dark:border-gray-500'
                      }`}
                    >
                      {formData.transferScope.includes(scope) && (
                        <CheckLineIcon className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{scope}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transfer Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transfer Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.transferReason}
                onChange={(e) => handleInputChange('transferReason', e.target.value)}
                rows={4}
                minLength={50}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Please provide a detailed reason for this transfer (50-500 characters)"
              />
              <div className="mt-1 flex justify-between text-xs">
                <span className={`${
                  formData.transferReason.length < 50 
                    ? 'text-red-500' 
                    : formData.transferReason.length > 500 
                      ? 'text-red-500' 
                      : 'text-green-500'
                }`}>
                  {formData.transferReason.length < 50 
                    ? `Minimum 50 characters (${50 - formData.transferReason.length} more needed)`
                    : formData.transferReason.length > 500
                      ? `Maximum 500 characters (${formData.transferReason.length - 500} over limit)`
                      : 'Valid length'
                  }
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {formData.transferReason.length}/500
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`px-4 py-1.5 rounded-lg transition-colors ${
                isFormValid()
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              }`}
            >
              Transfer User
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Use portal to render modal at document root level
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
} 