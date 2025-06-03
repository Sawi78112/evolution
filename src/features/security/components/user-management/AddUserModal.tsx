"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronDownIcon, CheckLineIcon, EyeIcon, EyeCloseIcon, SearchIcon } from '@/assets/icons';
import { RoleType, StatusType } from '../../types';
import { ROLE_COLORS, statusConfig } from '../../constants';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useDivisionsList } from '../../hooks/useDivisionsList';
import { useNotification } from '@/components/ui/notification';
import { useRoleContext } from '@/context/RoleContext';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => void;
  prefilledDivision?: string;
  prefilledManagerId?: string;
  disableDivisionFields?: boolean;
}

export interface UserFormData {
  username: string;
  abbreviation: string;
  roles: RoleType[];
  division: string;
  managerId: string;
  email: string;
  officePhone: string;
  homePhone?: string;
  homeAddress?: string;
  status: StatusType;
  passwordType: 'admin' | 'system';
  password?: string;
}

// Mock data for divisions and managers
const divisions = ['Alpha', 'Beta', 'Delta', 'Gamma'];

const managers = [
  { id: '1', name: 'Maria Pulera', abbreviation: 'MAPL' },
  { id: '2', name: 'James Wilson', abbreviation: 'JAWL' },
  { id: '3', name: 'Robert Chen', abbreviation: 'ROCH' },
  { id: '4', name: 'Sarah Johnson', abbreviation: 'SAJO' },
  { id: '5', name: 'Michael Brown', abbreviation: 'MIBR' },
  { id: '6', name: 'Lisa Anderson', abbreviation: 'LIAN' },
];

// Generate random password
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export function AddUserModal({ isOpen, onClose, onSubmit, prefilledDivision, prefilledManagerId, disableDivisionFields }: AddUserModalProps) {
  const { divisions: divisionsData, getManagerByDivisionName, getDivisionNames } = useDivisionsList();
  const notification = useNotification();
  const { isAdmin } = useRoleContext();

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    abbreviation: '',
    roles: [],
    division: '',
    managerId: '',
    email: '',
    officePhone: '',
    homePhone: '',
    homeAddress: '',
    status: 'Active',
    passwordType: 'system',
    password: '',
  });

  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQueries, setSearchQueries] = useState({
    division: '',
  });
  const [dropdownStates, setDropdownStates] = useState({
    roles: false,
    division: false,
    status: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate password when modal opens or password type changes to system
  useEffect(() => {
    if (isOpen && formData.passwordType === 'system') {
      const password = generatePassword();
      setGeneratedPassword(password);
      setFormData(prev => ({ ...prev, password }));
    }
  }, [isOpen, formData.passwordType]);

  // Pre-fill division and manager when modal opens
  useEffect(() => {
    if (isOpen && prefilledDivision && disableDivisionFields) {
      const manager = getManagerByDivisionName(prefilledDivision);
      setFormData(prev => ({ 
        ...prev, 
        division: prefilledDivision,
        managerId: manager ? manager.id : (prefilledManagerId || '')
      }));
    }
  }, [isOpen, prefilledDivision, prefilledManagerId, disableDivisionFields]);

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

  // Helper function to get default form values (preserves prefilled values for Divisional Managers)
  const getDefaultFormData = (): UserFormData => {
    const manager = prefilledDivision ? getManagerByDivisionName(prefilledDivision) : null;
    return {
      username: '',
      abbreviation: '',
      roles: [],
      division: disableDivisionFields && prefilledDivision ? prefilledDivision : '',
      managerId: disableDivisionFields && manager ? manager.id : (prefilledManagerId || ''),
      email: '',
      officePhone: '',
      homePhone: '',
      homeAddress: '',
      status: 'Active',
      passwordType: 'system',
      password: '',
    };
  };

  // Check if all required fields are filled
  const areRequiredFieldsFilled = () => {
    const requiredFields = {
      username: formData.username.trim(),
      abbreviation: formData.abbreviation.trim(),
      roles: formData.roles.length > 0,
      division: formData.division,
      email: formData.email.trim(),
      officePhone: formData.officePhone.trim(),
      status: formData.status,
    };

    // Check password based on type
    const passwordValid = formData.passwordType === 'system' 
      ? generatedPassword.length > 0 
      : (formData.password || '').trim().length > 0;

    return Object.values(requiredFields).every(field => !!field) && passwordValid;
  };

  const handleInputChange = (field: keyof UserFormData, value: string | string[] | RoleType[] | StatusType) => {
    if (field === 'passwordType' && value === 'system') {
      const password = generatePassword();
      setGeneratedPassword(password);
      setFormData(prev => ({ ...prev, [field]: value, password }));
    } else if (field === 'division' && typeof value === 'string') {
      // When division changes, automatically set the manager
      const manager = getManagerByDivisionName(value);
      setFormData(prev => ({ 
        ...prev, 
        division: value,
        managerId: manager ? manager.id : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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

  const filteredDivisions = getDivisionNames().filter(division =>
    division.toLowerCase().includes(searchQueries.division.toLowerCase())
  );

  // Get the selected manager info for display based on the selected division
  const selectedManagerFromDivision = formData.division ? getManagerByDivisionName(formData.division) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Double-check validation before submitting
    if (!areRequiredFieldsFilled()) {
      return;
    }
    
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData(getDefaultFormData());
    setGeneratedPassword('');
  };

  const handleAddUser = async () => {
    if (!areRequiredFieldsFilled() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          abbreviation: formData.abbreviation.trim(),
          roles: formData.roles,
          division: formData.division,
          email: formData.email.trim(),
          officePhone: formData.officePhone.trim(),
          homePhone: formData.homePhone?.trim() || null,
          homeAddress: formData.homeAddress?.trim() || null,
          status: formData.status,
          password: formData.passwordType === 'system' ? generatedPassword : formData.password
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      // Show success notification
      notification.success(
        'User Created Successfully',
        `"${formData.username}" has been created and assigned ${formData.roles.length} role(s). A login email has been sent to ${formData.email}.`
      );

      // Call the original onSubmit callback for any additional handling
      onSubmit(formData);
      
      // Reset form and close modal
      setFormData(getDefaultFormData());
      setGeneratedPassword('');
      onClose();
      
      console.log('User created successfully:', result.message);
      
    } catch (error) {
      notification.error(
        'User Creation Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred while creating the user.'
      );
      console.error('Failed to create user:', error);
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
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add New User
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create a new user account with the required information.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Division and Manager */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Division */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Division <span className="text-red-500">*</span>
                    {disableDivisionFields && (
                      <span className="text-gray-500 ml-2">(Auto-assigned)</span>
                    )}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => !disableDivisionFields && toggleDropdown('division')}
                      disabled={disableDivisionFields}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-between ${
                        disableDivisionFields
                          ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-75'
                          : 'bg-white dark:bg-gray-700 dark:border-gray-600'
                      }`}
                    >
                      <span className={disableDivisionFields ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}>
                        {formData.division || 'Select division'}
                      </span>
                      <ChevronDownIcon className={`w-4 h-4 ${disableDivisionFields ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>

                    {dropdownStates.division && !disableDivisionFields && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                        {/* Search */}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                          <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search divisions..."
                              value={searchQueries.division}
                              onChange={(e) => setSearchQueries(prev => ({ ...prev, division: e.target.value }))}
                              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                        </div>
                        {/* Options */}
                        <div className="max-h-40 overflow-y-auto">
                          {filteredDivisions.map((division) => (
                            <div
                              key={division}
                              onClick={() => {
                                handleInputChange('division', division);
                                toggleDropdown('division');
                                setSearchQueries(prev => ({ ...prev, division: '' }));
                              }}
                              className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-300"
                            >
                              {division}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manager */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Manager <span className="text-gray-500">(Auto-selected from Division)</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-600 flex items-center justify-between cursor-not-allowed opacity-75"
                    >
                      <span className="text-gray-500 dark:text-gray-400">
                        {selectedManagerFromDivision ? `${selectedManagerFromDivision.name} - ${selectedManagerFromDivision.abbreviation}` : 'Select division first'}
                      </span>
                      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <Label>Email Address <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      placeholder="user@company.com"
                      defaultValue={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  {/* Office Phone */}
                  <div>
                    <Label>Office Phone <span className="text-red-500">*</span></Label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      defaultValue={formData.officePhone}
                      onChange={(e) => handleInputChange('officePhone', e.target.value)}
                    />
                  </div>

                  {/* Home Phone */}
                  <div>
                    <Label>Home Phone <span className="text-gray-500">(Optional)</span></Label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      defaultValue={formData.homePhone}
                      onChange={(e) => handleInputChange('homePhone', e.target.value)}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 flex items-center justify-between"
                      >
                        <span className="text-gray-700 dark:text-gray-300">{formData.status}</span>
                        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                      </button>

                      {dropdownStates.status && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                          {Object.keys(statusConfig).map((status) => (
                            <div
                              key={status}
                              onClick={() => {
                                handleInputChange('status', status as StatusType);
                                toggleDropdown('status');
                              }}
                              className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-300"
                            >
                              {status}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Home Address */}
                <div className="mt-6">
                  <Label>Home Address <span className="text-gray-500">(Optional)</span></Label>
                  <textarea
                    value={formData.homeAddress}
                    onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                    rows={3}
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-evolution-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    placeholder="Enter home address"
                  />
                </div>
              </div>

              {/* Password Setup */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Password Setup</h3>
                <div className="space-y-4">
                  {/* Password Type */}
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="passwordType"
                        value="system"
                        checked={formData.passwordType === 'system'}
                        onChange={(e) => handleInputChange('passwordType', e.target.value as 'admin' | 'system')}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300">System Generated</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="passwordType"
                        value="admin"
                        checked={formData.passwordType === 'admin'}
                        onChange={(e) => handleInputChange('passwordType', e.target.value as 'admin' | 'system')}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Admin Defined</span>
                    </label>
                  </div>

                  {/* Password Display */}
                  <div>
                    <Label>Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        defaultValue={formData.passwordType === 'system' ? generatedPassword : formData.password}
                        onChange={(e) => formData.passwordType === 'admin' && handleInputChange('password', e.target.value)}
                        disabled={formData.passwordType === 'system'}
                        placeholder={formData.passwordType === 'system' ? 'System generated password' : 'Enter password'}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeCloseIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formData.passwordType === 'system' && (
                      <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                        🔄 Password will be automatically generated
                      </p>
                    )}
                  </div>
                </div>
              </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setFormData(getDefaultFormData());
                  setGeneratedPassword('');
                }}
              >
                Clear
              </Button>
              <Button 
                size="sm" 
                disabled={!areRequiredFieldsFilled() || isSubmitting}
                onClick={handleAddUser}
              >
                {isSubmitting ? 'Creating User...' : 'Add User'}
              </Button>
            </div>
          </form>
        </div>
    </div>
  );

  // Use portal to render modal at document root level
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
} 