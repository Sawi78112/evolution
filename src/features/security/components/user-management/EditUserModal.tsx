"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, CheckLineIcon, CloseIcon } from '@/assets/icons';
import { RoleType, StatusType } from '../../types';
import { ROLE_COLORS, statusConfig } from '../../constants';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useDivisionsList } from '../../hooks/useDivisionsList';
import { useNotification } from '@/components/ui/notification';
import { useRoleContext } from '@/context/RoleContext';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => Promise<void>;
  userData: {
    id: string;
    username: string;
    abbreviation: string;
    roles: string[];
    division: string;
    manager: string;
    email: string;
    status: string;
  };
}

export interface UserFormData {
  username: string;
  abbreviation: string;
  roles: RoleType[];
  division: string;
  email: string;
  status: StatusType;
}

export function EditUserModal({ isOpen, onClose, onSubmit, userData }: EditUserModalProps) {
  const { getDivisionNames, getManagerByDivisionName } = useDivisionsList();
  const notification = useNotification();
  const { isAdmin } = useRoleContext();

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    abbreviation: '',
    roles: [],
    division: '',
    email: '',
    status: 'Active',
  });

  const [mounted, setMounted] = useState(false);
  const [dropdownStates, setDropdownStates] = useState({
    roles: false,
    division: false,
    status: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Search state for division dropdown
  const [divisionSearchTerm, setDivisionSearchTerm] = useState('');

  // Initialize form data when modal opens or userData changes
  useEffect(() => {
    if (isOpen && userData && !hasInitialized) {
      setFormData({
        username: userData.username || '',
        abbreviation: userData.abbreviation || '',
        roles: (userData.roles || []) as RoleType[],
        division: userData.division || 'None',
        email: userData.email || '',
        status: (userData.status || 'Active') as StatusType,
      });
      setHasInitialized(true);
    }
    
    // Reset when modal closes
    if (!isOpen) {
      setHasInitialized(false);
    }
  }, [isOpen, userData?.id, hasInitialized]);

  // Reset search term when dropdown closes
  useEffect(() => {
    if (!dropdownStates.division) {
      setDivisionSearchTerm('');
    }
  }, [dropdownStates.division]);

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
    const requiredFields = {
      username: formData.username.trim(),
      abbreviation: formData.abbreviation.trim(),
      roles: formData.roles.length > 0,
      division: formData.division,
      email: formData.email.trim(),
      status: formData.status,
    };

    return Object.values(requiredFields).every(field => !!field);
  };

  const handleInputChange = (field: keyof UserFormData, value: string | string[] | RoleType[] | StatusType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleRole = (role: RoleType) => {
    setFormData(prev => {
      if (role === 'Administrator') {
        // If selecting Administrator, clear all other roles
        return {
          ...prev,
          roles: prev.roles.includes('Administrator') ? [] : ['Administrator']
        };
      } else {
        // If selecting any other role, remove Administrator first
        const newRoles = prev.roles.filter(r => r !== 'Administrator');
        return {
          ...prev,
          roles: newRoles.includes(role)
            ? newRoles.filter(r => r !== role)
            : [...newRoles, role]
        };
      }
    });
  };

  const toggleDropdown = (dropdown: keyof typeof dropdownStates) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  // Get filtered division names based on search term
  const getFilteredDivisionNames = () => {
    const allDivisions = getDivisionNames();
    if (!divisionSearchTerm.trim()) {
      return allDivisions;
    }
    return allDivisions.filter(division => 
      division.toLowerCase().includes(divisionSearchTerm.toLowerCase())
    );
  };

  // Get the selected manager info for display based on the selected division
  const selectedManagerFromDivision = formData.division ? getManagerByDivisionName(formData.division) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!areRequiredFieldsFilled()) {
      return;
    }
    
    handleUpdateUser();
  };

  const handleUpdateUser = async () => {
    if (!areRequiredFieldsFilled() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Call the callback to handle the update
      await onSubmit(formData);
      
      // Only close modal after successful update
      onClose();
      
    } catch (error) {
      notification.error(
        'User Update Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred while updating the user.'
      );
      console.error('Failed to update user:', error);
    } finally {
      setIsSubmitting(false);
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
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          <div className="pr-12 mb-6">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit User
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update user information and settings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="custom-scrollbar max-h-[400px] overflow-y-auto mb-6">
              <div className="space-y-5">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <Label>Username <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    placeholder="Enter username"
                    defaultValue={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                  />
                </div>

                {/* Abbreviation */}
                <div>
                  <Label>Abbreviation <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    placeholder="ABCD"
                    defaultValue={formData.abbreviation}
                    onChange={(e) => handleInputChange('abbreviation', e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Roles <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('roles')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {formData.roles.length > 0 ? (
                        <div className="flex -space-x-2">
                          {formData.roles.slice(0, 3).map((role, index) => (
                            <div 
                              key={index} 
                              className={`flex items-center justify-center h-8 w-8 rounded-full text-white font-medium text-xs ${ROLE_COLORS[role].color} border-2 border-white dark:border-gray-800`}
                              title={role}
                            >
                              {ROLE_COLORS[role].abbr}
                            </div>
                          ))}
                          {formData.roles.length > 3 && (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-500 text-white font-medium text-xs border-2 border-white dark:border-gray-800">
                              +{formData.roles.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Select roles</span>
                      )}
                    </div>
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  </button>

                  {dropdownStates.roles && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2">
                        {/* Administrator role shown separately - only for Administrators */}
                        {isAdmin() && (
                          <div
                            key="Administrator"
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer mb-2 border-b border-gray-200 dark:border-gray-600 pb-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRole("Administrator");
                            }}
                          >
                            <div
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                formData.roles.includes("Administrator")
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-gray-300 dark:border-gray-500'
                              }`}
                            >
                              {formData.roles.includes("Administrator") && (
                                <CheckLineIcon className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div className={`flex items-center justify-center h-6 w-6 rounded-full text-white text-xs ${ROLE_COLORS["Administrator"].color} mr-2`}>
                              {ROLE_COLORS["Administrator"].abbr}
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Administrator</span>
                            {formData.roles.includes("Administrator") && (
                              <CheckLineIcon className="ml-auto h-4 w-4 text-green-500" />
                            )}
                          </div>
                        )}
                        
                        {/* Other roles in specified order - filter out Divisional Manager for non-admins */}
                        {["Divisional Manager", "Analyst", "Investigator", "System Support"]
                          .filter(role => isAdmin() || role !== "Divisional Manager")
                          .map((role) => {
                            const isSelected = formData.roles.includes(role as RoleType);
                            return (
                              <div
                                key={role}
                                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRole(role as RoleType);
                                }}
                              >
                                <div
                                  className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-blue-500 border-blue-500'
                                      : 'border-gray-300 dark:border-gray-500'
                                  }`}
                                >
                                  {isSelected && (
                                    <CheckLineIcon className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className={`flex items-center justify-center h-6 w-6 rounded-full text-white text-xs ${ROLE_COLORS[role as RoleType].color} mr-2`}>
                                  {ROLE_COLORS[role as RoleType].abbr}
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{role}</span>
                                {isSelected && (
                                  <CheckLineIcon className="ml-auto h-4 w-4 text-green-500" />
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Division and Manager in one row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Division */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Division <span className="text-red-500">*</span>
                    {!isAdmin() && (
                      <span className="text-gray-500 ml-2">(View only)</span>
                    )}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => isAdmin() && toggleDropdown('division')}
                      disabled={!isAdmin()}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-between text-left ${
                        !isAdmin()
                          ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-75'
                          : 'bg-white dark:bg-gray-700 dark:border-gray-600'
                      }`}
                    >
                      <span className={formData.division ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                        {formData.division || 'Select division'}
                      </span>
                      <ChevronDownIcon className={`w-4 h-4 ${!isAdmin() ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>

                    {dropdownStates.division && isAdmin() && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {/* Search Input */}
                        <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                          <input
                            type="text"
                            placeholder="Search divisions..."
                            value={divisionSearchTerm}
                            onChange={(e) => setDivisionSearchTerm(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        
                        <div className="p-2 max-h-48 overflow-y-auto">
                          {/* None option */}
                          <div
                            className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer flex items-center justify-between"
                            onClick={() => {
                              handleInputChange('division', 'None');
                              toggleDropdown('division');
                            }}
                          >
                            <span className="text-sm text-gray-700 dark:text-gray-300">None</span>
                            {formData.division === 'None' && (
                              <CheckLineIcon className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          
                          {/* Filtered divisions */}
                          {getFilteredDivisionNames().length > 0 ? (
                            getFilteredDivisionNames().map((division) => (
                              <div
                                key={division}
                                className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer flex items-center justify-between"
                                onClick={() => {
                                  handleInputChange('division', division);
                                  toggleDropdown('division');
                                }}
                              >
                                <span className="text-sm text-gray-700 dark:text-gray-300">{division}</span>
                                {formData.division === division && (
                                  <CheckLineIcon className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                              No divisions found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manager Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Manager
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[42px] flex items-center">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formData.division === 'None' || !formData.division
                        ? 'None'
                        : selectedManagerFromDivision 
                        ? `${selectedManagerFromDivision.name} - ${selectedManagerFromDivision.abbreviation}`
                        : 'None'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Email and Status in one row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <Label>Email <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    defaultValue={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown('status')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 flex items-center justify-between text-left"
                    >
                      <span className="text-gray-900 dark:text-white">{formData.status}</span>
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    </button>

                    {dropdownStates.status && (
                      <div className="absolute z-10 w-full bottom-full mb-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                          {["Active", "Transferred", "Inactive", "Canceled"].map((status) => (
                            <div
                              key={status}
                              className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer flex items-center justify-between"
                              onClick={() => {
                                handleInputChange('status', status as StatusType);
                                toggleDropdown('status');
                              }}
                            >
                              <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                              {formData.status === status && (
                                <CheckLineIcon className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
              <Button
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg min-w-[120px] flex items-center justify-center gap-2"
                disabled={!areRequiredFieldsFilled() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  'Update User'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
} 