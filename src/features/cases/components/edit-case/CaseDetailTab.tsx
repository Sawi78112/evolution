"use client";

import React from 'react';
import { BoxIcon, ArrowRightIcon, CalenderIcon } from '@/assets/icons';
import { InteractiveMap } from '@/components/ui/InteractiveMap';
import { BadgeDropdown } from './BadgeDropdown';
import { useEditCaseForm } from './hooks/useEditCaseForm';
import { CASE_SUB_TYPES } from './constants';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../constants';
import { CaseData } from './types';

interface CaseDetailTabProps {
  onSubmit: (formData: any) => void;
  initialData?: CaseData;
  onClose?: () => void;
  isSubmitting?: boolean;
}

export function CaseDetailTab({ onSubmit, initialData, onClose, isSubmitting = false }: CaseDetailTabProps) {
  const {
    formData,
    addressSuggestions,
    showAddressSuggestions,
    setShowAddressSuggestions,
    countries,
    states,
    cities,
    citySuggestions,
    showCitySuggestions,
    setShowCitySuggestions,
    loadingCountries,
    loadingStates,
    loadingCities,
    loadingCoordinates,
    apiError,
    generateCoordinates,
    handleInputChange,
    handleCitySearch,
    selectCity,
    handleAddressSearch,
    selectAddress,
    getAvailableSubTypes,
  } = useEditCaseForm(initialData);

  const statusOptions = [
    { value: 'Open', label: 'Open', color: STATUS_COLORS.Open },
    { value: 'In Progress', label: 'In Progress', color: STATUS_COLORS['In Progress'] },
    { value: 'Under Review', label: 'Under Review', color: STATUS_COLORS['Under Review'] },
    { value: 'Closed', label: 'Closed', color: STATUS_COLORS.Closed },
    { value: 'Archived', label: 'Archived', color: STATUS_COLORS.Archived }
  ];

  const priorityOptions = [
    { value: 'Low', label: 'Low', color: PRIORITY_COLORS.Low },
    { value: 'Medium', label: 'Medium', color: PRIORITY_COLORS.Medium },
    { value: 'High', label: 'High', color: PRIORITY_COLORS.High },
    { value: 'Critical', label: 'Critical', color: PRIORITY_COLORS.Critical }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:gap-4 lg:h-[620px]">
        
        {/* Case Information Form */}
        <div className="w-full lg:col-span-2 bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-500/10 dark:to-blue-500/10 rounded-2xl p-5 sm:p-6 border border-brand-100 dark:border-brand-500/20">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <BoxIcon className="h-5.5 w-5.5 text-brand-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Case Information</h3>
                <p className="text-base text-gray-600 dark:text-gray-400">Enter case details</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</label>
              <BadgeDropdown
                value={formData.caseStatus}
                onChange={(value) => handleInputChange('caseStatus', value)}
                options={statusOptions}
                placeholder="Select status"
                className="w-32"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* First Row - 3 Features */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Case Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 text-base font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter case name"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Client ID</label>
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                  className="w-full px-3 py-2 text-base font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter client ID"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Case Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 text-base font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  <option value="">Select case type</option>
                  {Object.keys(CASE_SUB_TYPES).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Second Row - 3 Features */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Division</label>
                <select
                  value={formData.division}
                  onChange={(e) => handleInputChange('division', e.target.value)}
                  className="w-full px-3 py-2 text-base font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select division</option>
                  <option value="Elastic">Elastic</option>
                  <option value="Alpha Division">Alpha Division</option>
                  <option value="Beta Division">Beta Division</option>
                  <option value="Gamma Division">Gamma Division</option>
                  <option value="Delta Division">Delta Division</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Sub Type *</label>
                <select
                  value={formData.subType}
                  onChange={(e) => handleInputChange('subType', e.target.value)}
                  className="w-full px-3 py-2 text-base font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                  disabled={!formData.type}
                >
                  <option value="">Select sub type</option>
                  {getAvailableSubTypes().map(subType => (
                    <option key={subType} value={subType}>{subType}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Priority Level *</label>
                <BadgeDropdown
                  value={formData.priority}
                  onChange={(value) => handleInputChange('priority', value)}
                  options={priorityOptions}
                  placeholder="Select priority"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Incident Location Form */}
        <div className="w-full lg:row-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
              <ArrowRightIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Incident Location</h3>
          </div>
          
          {/* Location Details */}
          <div className="space-y-4 mb-4">
            {/* Country and State Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Country Dropdown */}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
                  Country *
                </label>
                <div className="relative">
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 text-base font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    disabled={loadingCountries}
                    required
                  >
                    <option value="">
                      {loadingCountries ? 'Loading countries...' : 'Select country'}
                    </option>
                    {countries.map(country => (
                      <option key={country.code} value={country.name}>{country.name}</option>
                    ))}
                  </select>
                  {loadingCountries && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* State Dropdown - Always visible */}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
                  State / Province
                </label>
                <div className="relative">
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 text-base font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 dark:disabled:text-gray-400"
                    disabled={!formData.country || loadingStates || (!!formData.country && !loadingStates && states.length === 0)}
                  >
                    <option value="">
                      {!formData.country 
                        ? 'Select State' 
                        : loadingStates 
                        ? 'Loading regions...' 
                        : states.length === 0 
                        ? 'No regions - cities loading automatically' 
                        : 'Select state/province/region'
                      }
                    </option>
                    {states.map(state => (
                      <option key={state.code} value={state.name}>{state.name}</option>
                    ))}
                  </select>
                  {loadingStates && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
                    </div>
                  )}
                  {/* Show info icon when no regions available */}
                  {formData.country && !loadingStates && states.length === 0 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* City and Address Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* City Input with Autocomplete */}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
                  City *
                </label>
                <div className="relative">
                  {cities.length > 0 ? (
                    // Show dropdown when cities are loaded
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 text-base font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      disabled={loadingCities}
                      required
                    >
                      <option value="">
                        {loadingCities ? 'Loading cities...' : 'Select city'}
                      </option>
                      {cities.map(city => (
                        <option key={city.id} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  ) : (
                    // Show search input when no cities loaded
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleCitySearch(e.target.value)}
                      onFocus={() => formData.city.length >= 2 && setShowCitySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                      className="w-full px-3 py-2 text-base font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                      placeholder={!formData.country ? "Select City" : (formData.country && !loadingStates && states.length === 0) ? "Cities loading automatically..." : "Start typing city name..."}
                      disabled={!formData.country}
                      required
                    />
                  )}
                  {loadingCities && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
                    </div>
                  )}
                  
                  {/* City Suggestions Dropdown */}
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {citySuggestions.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => selectCity(city)}
                          className="w-full px-3 py-2 text-left text-base hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="font-medium">{city.name}</div>
                          {city.region && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {city.region}, {city.country}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Address Input */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleAddressSearch(e.target.value)}
                  onFocus={() => setShowAddressSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                  className="w-full px-3 py-2 text-base font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  placeholder={(!formData.country || !formData.city) ? "Enter street address..." : "Enter street address..."}
                  disabled={!formData.country || !formData.city}
                />
                {showAddressSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {addressSuggestions.map((address, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectAddress(address)}
                        className="w-full px-3 py-2 text-left text-base hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                      >
                        {address}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">GPS Coordinates</label>
              {loadingCoordinates && (
                <div className="flex items-center gap-1 text-sm text-brand-500">
                  <div className="animate-spin rounded-full h-3 w-3 border border-brand-500 border-t-transparent"></div>
                  <span>Generating...</span>
                </div>
              )}
            </div>
            {/* GPS Coordinates Display */}
            {formData.gpsLatitude && formData.gpsLongitude ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-around gap-6 text-sm font-mono">
                  <span className="text-gray-900 dark:text-white">
                    <span className="text-gray-500 dark:text-gray-400">Latitude :</span> {formData.gpsLatitude}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    <span className="text-gray-500 dark:text-gray-400">Longitude :</span> {formData.gpsLongitude}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                  GPS coordinates will appear here after generation
                </div>
              </div>
            )}
          </div>

          {/* Map Preview */}
          <div className="flex-1 min-h-0">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location Map</label>
              {formData.country && (
                <button
                  type="button"
                  onClick={generateCoordinates}
                  disabled={loadingCoordinates}
                  className="px-3 py-1 text-xs bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingCoordinates ? 'Generating...' : 'Generate GPS'}
                </button>
              )}
            </div>
            
            {formData.gpsLatitude && formData.gpsLongitude ? (
              <div className="rounded-xl p-3 overflow-hidden h-[280px] border border-gray-200 dark:border-gray-700">
                <InteractiveMap
                  coordinates={{
                    latitude: parseFloat(formData.gpsLatitude),
                    longitude: parseFloat(formData.gpsLongitude)
                  }}
                  height="h-full"
                  zoom={13}
                  popupContent={
                    <div className="text-center">
                      <strong>Case Location</strong><br />
                      {formData.address && <>{formData.address}<br /></>}
                      {formData.city && <>{formData.city}, </>}
                      {formData.state && <>{formData.state}, </>}
                      {formData.country}
                      <br />
                      <small className="text-gray-600">
                        GPS: {parseFloat(formData.gpsLatitude).toFixed(4)}, {parseFloat(formData.gpsLongitude).toFixed(4)}
                      </small>
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="bg-gray-50 p-3 dark:bg-gray-900 rounded-xl h-[257px] flex items-center justify-center border border-gray-200 dark:border-gray-700">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-base font-medium">Select Location</p>
                  <p className="text-sm">Choose location details and generate coordinates to view map</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Important Dates Form */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-500/10 dark:to-indigo-500/10 rounded-2xl p-5 border border-purple-100 dark:border-purple-500/20 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
              <CalenderIcon className="h-5.5 w-5.5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Important Dates</h3>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Incident Date</label>
              <input
                type="datetime-local"
                value={formData.incidentDate}
                onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                className="w-full px-3 py-2 text-sm font-medium bg-white dark:bg-gray-700 border border-purple-200 dark:border-purple-600/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Case Added</label>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-2 border border-purple-200 dark:border-purple-600/30">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.caseAdded || 'Will be set automatically'}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Last Updated</label>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-2 border border-purple-200 dark:border-purple-600/30">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.lastUpdated || 'Will be set automatically'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-green-100 dark:bg-green-500/20 rounded-lg">
              <svg className="h-5.5 w-5.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Description</h3>
          </div>
          <div className="flex-1">
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full h-full min-h-[150px] px-4 py-3 text-base bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Enter case description..."
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center gap-2"
        >
          {isSubmitting && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 