"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, ChevronDownIcon, CheckLineIcon, EyeIcon, EyeCloseIcon, SearchIcon } from '@/assets/icons';
import { RoleType, StatusType } from '../types';
import { roleConfig, statusConfig } from '../constants';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => void;
  userData: UserFormData | null;
}

export interface UserFormData {
  id?: number;
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

export function EditUserModal({ isOpen, onClose, onSubmit, userData }: EditUserModalProps) {
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
    passwordType: 'admin',
    password: '',
  });

  const [originalData, setOriginalData] = useState<UserFormData | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQueries, setSearchQueries] = useState({
    division: '',
    manager: '',
  });
  const [dropdownStates, setDropdownStates] = useState({
    roles: false,
    division: false,
    manager: false,
    status: false,
  });

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill form with user data when modal opens
  useEffect(() => {
    if (isOpen && userData) {
      const initialData: UserFormData = {
        id: userData.id,
        username: userData.username || '',
        abbreviation: userData.abbreviation || '',
        roles: userData.roles || [],
        division: userData.division || '',
        managerId: userData.managerId || '',
        email: userData.email || '',
        officePhone: userData.officePhone || '',
        homePhone: userData.homePhone || '',
        homeAddress: userData.homeAddress || '',
        status: userData.status || 'Active',
        passwordType: 'admin' as const,
        password: '',
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [isOpen, userData]);

  // Generate password when password type changes to system
  useEffect(() => {
    if (formData.passwordType === 'system') {
      const password = generatePassword();
      setGeneratedPassword(password);
      setFormData(prev => ({ ...prev, password }));
    }
  }, [formData.passwordType]);

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

  // Check if form has been modified
  const hasFormChanged = () => {
    if (!originalData) return false;
    
    // Compare all fields except password (password is optional)
    const fieldsToCompare: (keyof UserFormData)[] = [
      'username', 'abbreviation', 'roles', 'division', 'managerId', 
      'email', 'officePhone', 'homePhone', 'homeAddress', 'status'
    ];
    
    return fieldsToCompare.some(field => {
      if (field === 'roles') {
        // Special comparison for roles array
        const original = originalData[field] || [];
        const current = formData[field] || [];
        return JSON.stringify(original.sort()) !== JSON.stringify(current.sort());
      }
      return originalData[field] !== formData[field];
    }) || (formData.passwordType === 'admin' && formData.password !== '') || 
       (formData.passwordType === 'system' && generatedPassword !== '');
  };

  const handleInputChange = (field: keyof UserFormData, value: string | string[] | RoleType[] | StatusType) => {
    if (field === 'passwordType' && value === 'system') {
      const password = generatePassword();
      setGeneratedPassword(password);
      setFormData(prev => ({ ...prev, [field]: value, password }));
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

  const filteredDivisions = divisions.filter(division =>
    division.toLowerCase().includes(searchQueries.division.toLowerCase())
  );

  const filteredManagers = managers.filter(manager =>
    `${manager.name} - ${manager.abbreviation}`.toLowerCase()
      .includes(searchQueries.manager.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only include password in submission if it was actually changed
    let submitData = { ...formData };
    
    // If password wasn't changed, don't include it in the update
    if (formData.passwordType === 'admin' && formData.password === '') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, passwordType, ...dataWithoutPassword } = submitData;
      submitData = dataWithoutPassword as UserFormData;
    } else if (formData.passwordType === 'system' && generatedPassword === '') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, passwordType, ...dataWithoutPassword } = submitData;
      submitData = dataWithoutPassword as UserFormData;
    }
    
    onSubmit(submitData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
    // Reset form to original data
    if (originalData) {
      setFormData(originalData);
      setGeneratedPassword('');
    }
  };

  const selectedManager = managers.find(m => m.id === formData.managerId);

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
            Edit User
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update user information and settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter username"
                  />
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Abbreviation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.abbreviation}
                    onChange={(e) => handleInputChange('abbreviation', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="ABCD"
                    maxLength={4}
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
                              className={`flex items-center justify-center h-8 w-8 rounded-full text-white font-medium text-xs ${roleConfig[role].color} border-2 border-white dark:border-gray-800`}
                              title={role}
                            >
                              {roleConfig[role].abbr}
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
                        {/* Administrator role shown separately */}
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
                          <div className={`flex items-center justify-center h-6 w-6 rounded-full text-white text-xs ${roleConfig["Administrator"].color} mr-2`}>
                            {roleConfig["Administrator"].abbr}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Administrator</span>
                          {formData.roles.includes("Administrator") && (
                            <CheckLineIcon className="ml-auto h-4 w-4 text-green-500" />
                          )}
                        </div>
                        
                        {/* Other roles in specified order */}
                        {["Division Manager", "Analyst", "Investigator", "System Support"].map((role) => {
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
                              <div className={`flex items-center justify-center h-6 w-6 rounded-full text-white text-xs ${roleConfig[role as RoleType].color} mr-2`}>
                                {roleConfig[role as RoleType].abbr}
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
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown('division')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 flex items-center justify-between"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {formData.division || 'Select division'}
                      </span>
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    </button>

                    {dropdownStates.division && (
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
                    Manager <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown('manager')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 flex items-center justify-between"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {selectedManager ? `${selectedManager.name} - ${selectedManager.abbreviation}` : 'Select manager'}
                      </span>
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    </button>

                    {dropdownStates.manager && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                        {/* Search */}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                          <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search managers..."
                              value={searchQueries.manager}
                              onChange={(e) => setSearchQueries(prev => ({ ...prev, manager: e.target.value }))}
                              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                        </div>
                        {/* Options */}
                        <div className="max-h-40 overflow-y-auto">
                          {filteredManagers.map((manager) => (
                            <div
                              key={manager.id}
                              onClick={() => {
                                handleInputChange('managerId', manager.id);
                                toggleDropdown('manager');
                                setSearchQueries(prev => ({ ...prev, manager: '' }));
                              }}
                              className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-300"
                            >
                              {manager.name} - {manager.abbreviation}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="user@company.com"
                    />
                  </div>

                  {/* Office Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Office Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.officePhone}
                      onChange={(e) => handleInputChange('officePhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Home Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Home Phone <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.homePhone}
                      onChange={(e) => handleInputChange('homePhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="+1 (555) 123-4567"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Home Address <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    value={formData.homeAddress}
                    onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter home address"
                  />
                </div>
              </div>

              {/* Password Setup */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Password Setup</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="text-gray-500">(Optional)</span> Only change if you want to update the user&apos;s password
                </p>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password <span className="text-gray-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.passwordType === 'system' ? generatedPassword : formData.password}
                        onChange={(e) => formData.passwordType === 'admin' && handleInputChange('password', e.target.value)}
                        readOnly={formData.passwordType === 'system'}
                        className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                          formData.passwordType === 'system' ? 'bg-gray-50 dark:bg-gray-600' : ''
                        }`}
                        placeholder={formData.passwordType === 'system' ? 'System generated password' : 'Enter new password'}
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
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              disabled={!hasFormChanged()}
              onClick={() => {
                const e = { preventDefault: () => {} } as React.FormEvent;
                handleSubmit(e);
              }}
            >
              Update User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  // Use portal to render modal at document root level
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
} 