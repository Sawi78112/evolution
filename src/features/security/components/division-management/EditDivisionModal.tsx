"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, SearchIcon } from '@/assets/icons';
import Button from '@/components/ui/button/Button';
import { useEditableDivisionManagers, DivisionManagerUser } from '../../hooks/useDivisionManagers';
import { useNotification } from '@/components/ui/notification';

interface EditDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (divisionData: DivisionFormData) => void;
  onRefetch?: () => void;
  divisionData: {
    id: string;
    name: string;
    abbreviation: string;
    manager: {
      name: string;
      abbreviation: string;
      image: string;
    } | null;
  };
}

export interface DivisionFormData {
  name: string;
  abbreviation: string;
  managerId: string;
}

export function EditDivisionModal({ isOpen, onClose, onSubmit, onRefetch, divisionData }: EditDivisionModalProps) {
  const { divisionManagers, loading, error } = useEditableDivisionManagers(divisionData.id);
  const notification = useNotification();
  
  const [formData, setFormData] = useState<DivisionFormData>({
    name: '',
    abbreviation: '',
    managerId: '',
  });

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Initialize form with existing data when modal opens
  useEffect(() => {
    if (isOpen && divisionData && !loading) {
      // Find manager ID by matching username and abbreviation from division manager users
      const existingManager = divisionManagers.find(
        manager => manager.username === divisionData.manager?.name && 
                   manager.abbreviation === divisionData.manager?.abbreviation
      );
      
      setFormData({
        name: divisionData.name,
        abbreviation: divisionData.abbreviation,
        managerId: existingManager?.id || '',
      });
      
      // Mark data as ready when hook finishes loading (regardless of whether there are available managers)
      setIsDataReady(true);
    }
  }, [isOpen, divisionData, divisionManagers, loading]);

  // Fallback to ensure form loads even if there's an error with division managers
  useEffect(() => {
    if (isOpen && divisionData && error && !isDataReady) {
      console.warn('Division managers failed to load, but allowing form to display:', error);
      setFormData({
        name: divisionData.name,
        abbreviation: divisionData.abbreviation,
        managerId: '',
      });
      setIsDataReady(true);
    }
  }, [isOpen, divisionData, error, isDataReady]);

  // Reset data ready state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsDataReady(false);
      setFormData({
        name: '',
        abbreviation: '',
        managerId: '',
      });
    }
  }, [isOpen]);

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

  // Check if all required fields are filled
  const areRequiredFieldsFilled = () => {
    return formData.name.trim() && formData.abbreviation.trim();
  };

  const handleInputChange = (field: keyof DivisionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredManagers = divisionManagers.filter((manager: DivisionManagerUser) =>
    `${manager.username} - ${manager.abbreviation}`.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const selectedManager = divisionManagers.find((m: DivisionManagerUser) => m.id === formData.managerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!areRequiredFieldsFilled()) {
      return;
    }
    
    onSubmit(formData);
    onClose();
    setSearchQuery('');
  };

  const handleUpdateDivision = async () => {
    if (!areRequiredFieldsFilled()) {
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await fetch('/api/divisions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          divisionId: divisionData.id,
          name: formData.name,
          abbreviation: formData.abbreviation,
          managerId: formData.managerId
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update division');
      }

      console.log('Division updated successfully:', result.message);
      
      // Call the callback to refresh the table data
      if (onRefetch) {
        onRefetch();
      }
      
      // Close the modal
      onClose();
      setSearchQuery('');
      
      // Show success notification
      notification.success(
        'Division Updated',
        `"${formData.name}" has been successfully updated.`
      );
      
    } catch (error) {
      console.error('Failed to update division:', error);
      setUpdateError(error instanceof Error ? error.message : 'Failed to update division');
      
      // Show error notification
      notification.error(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update division'
      );
    } finally {
      setIsUpdating(false);
    }
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
      <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Division
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the division information below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="custom-scrollbar overflow-y-auto px-2 pb-3">
            {/* Loading State */}
            {!isDataReady && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading division data...</p>
                </div>
              </div>
            )}

            {/* Form Content - Only show when data is ready */}
            {isDataReady && (
              <div className="space-y-6">
                {/* Error Message */}
                {updateError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-500/10 dark:border-red-500/30">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Update Failed
                        </h3>
                        <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                          {updateError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Division Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Division Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter division name"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-evolution-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    required
                  />
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Abbreviation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.abbreviation}
                    onChange={(e) => handleInputChange('abbreviation', e.target.value.toUpperCase())}
                    placeholder="Enter abbreviation (e.g., ALPH)"
                    maxLength={4}
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-evolution-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    required
                  />
                </div>

                {/* Manager */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Manager <span className="text-gray-500">(Optional - Division manager users only)</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsManagerDropdownOpen(!isManagerDropdownOpen)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 flex items-center justify-between"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {selectedManager ? `${selectedManager.username} - ${selectedManager.abbreviation}` : 'Select manager (optional)'}
                      </span>
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    </button>

                    {isManagerDropdownOpen && (
                      <div className="absolute z-10 w-full bottom-full mb-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                        {/* Search */}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                          <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search managers..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                        </div>
                        {/* Options */}
                        <div className="max-h-40 overflow-y-auto">
                          {/* Add "No Manager" option */}
                          <div
                            onClick={() => {
                              handleInputChange('managerId', '');
                              setIsManagerDropdownOpen(false);
                              setSearchQuery('');
                            }}
                            className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600"
                          >
                            <span className="italic text-gray-500">No Manager</span>
                          </div>
                          
                          {loading ? (
                            <div className="px-3 py-2 text-gray-500 text-center">
                              Loading managers...
                            </div>
                          ) : error ? (
                            <div className="px-3 py-2 text-red-500 text-center text-sm">
                              Error: {error}
                            </div>
                          ) : filteredManagers.length > 0 ? (
                            filteredManagers.map((manager: DivisionManagerUser) => (
                              <div
                                key={manager.id}
                                onClick={() => {
                                  handleInputChange('managerId', manager.id);
                                  setIsManagerDropdownOpen(false);
                                  setSearchQuery('');
                                }}
                                className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-300"
                              >
                                {manager.username} - {manager.abbreviation}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-500 text-center">
                              No managers found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Only show when data is ready */}
          {isDataReady && (
            <div className="flex justify-end gap-2 px-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isUpdating}
                className="px-6 py-2.5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateDivision}
                disabled={!areRequiredFieldsFilled() || isUpdating}
                className={`px-6 py-2.5 flex items-center gap-2 ${
                  areRequiredFieldsFilled() && !isUpdating
                    ? 'bg-brand-500 hover:bg-brand-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isUpdating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isUpdating ? 'Updating...' : 'Update Division'}
              </Button>
            </div>
          )}
        </form>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 lg:right-6 lg:top-6"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
} 