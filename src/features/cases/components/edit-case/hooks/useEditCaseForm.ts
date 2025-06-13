"use client";

import { useState, useEffect, useRef } from 'react';
import { FormData, Country, State, City } from '../types';
import { CASE_SUB_TYPES, WORLD_DATA, LOCATION_ADDRESSES } from '../constants';

export function useEditCaseForm(initialData?: any) {
  // Helper function to format date for display
  const formatDateForDisplay = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return '';
    }
  };

  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  // Helper function to extract coordinates from PostGIS geometry
  const extractCoordinatesFromGeometry = (geometry: any): { latitude: string; longitude: string } => {
    if (!geometry) return { latitude: '', longitude: '' };
    
    try {
      if (geometry.coordinates && Array.isArray(geometry.coordinates) && geometry.coordinates.length === 2) {
        const [longitude, latitude] = geometry.coordinates;
        return {
          latitude: latitude.toString(),
          longitude: longitude.toString()
        };
      }
    } catch (error) {
      console.warn('Failed to extract coordinates from geometry:', error);
    }
    
    return { latitude: '', longitude: '' };
  };

  // Extract coordinates from initial data
  const coordinatesData = extractCoordinatesFromGeometry(initialData?.gps_coordinates);

  // Track if this is the initial load to prevent clearing pre-populated data
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Extract initial GPS coordinates
  const getInitialGpsCoordinates = () => {
    if (initialData?.gpsCoordinates?.coordinates) {
      return {
        latitude: initialData.gpsCoordinates.coordinates[1]?.toString() || '',
        longitude: initialData.gpsCoordinates.coordinates[0]?.toString() || ''
      };
    }
    return { latitude: '', longitude: '' };
  };

  const initialGps = getInitialGpsCoordinates();

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    clientId: initialData?.clientId || '',
    type: initialData?.type || '',
    subType: (initialData?.subType && initialData.subType !== 'None') ? initialData.subType : '',
    division: (initialData?.division && initialData.division !== 'None') ? initialData.division : '',
    description: initialData?.description || '',
    incidentDate: formatDateForInput(initialData?.incidentDate),
    country: initialData?.country || '',
    state: initialData?.state || '',
    city: initialData?.city || '',
    address: initialData?.address || '',
    gpsLatitude: initialGps.latitude,
    gpsLongitude: initialGps.longitude,
    caseStatus: initialData?.caseStatus || 'Open',
    priority: initialData?.priority || 'Low',
    caseAdded: formatDateForDisplay(initialData?.caseAddedDate),
    lastUpdated: formatDateForDisplay(initialData?.lastUpdatedDate)
  });

  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  
  // Location API state
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  
  // Loading states
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCoordinates, setLoadingCoordinates] = useState(false);
  
  // Error states
  const [apiError, setApiError] = useState<string | null>(null);
  
  // API call tracking to prevent multiple simultaneous calls
  const [activeApiCalls, setActiveApiCalls] = useState<Set<string>>(new Set());
  const apiCallTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const loadCountries = async () => {
    if (loadingCountries || activeApiCalls.has('countries')) {
      return;
    }
    
    setLoadingCountries(true);
    setActiveApiCalls(prev => new Set(prev).add('countries'));
    
    try {
      const response = await fetch('https://api.countrystatecity.in/v1/countries', {
        headers: {
          'X-CSCAPI-KEY': process.env.NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY || ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCountries(data);
      setApiError(null);
    } catch (error) {
      console.warn('Country API failed, using fallback data:', error);
      
      // Create proper country codes mapping
      const countryCodeMap: Record<string, string> = {
        'Afghanistan': 'AF', 'Albania': 'AL', 'Algeria': 'DZ', 'Argentina': 'AR', 'Armenia': 'AM',
        'Australia': 'AU', 'Austria': 'AT', 'Azerbaijan': 'AZ', 'Bahrain': 'BH', 'Bangladesh': 'BD',
        'Belarus': 'BY', 'Belgium': 'BE', 'Bolivia': 'BO', 'Brazil': 'BR', 'Bulgaria': 'BG',
        'Cambodia': 'KH', 'Canada': 'CA', 'Chile': 'CL', 'China': 'CN', 'Colombia': 'CO',
        'Croatia': 'HR', 'Czech Republic': 'CZ', 'Denmark': 'DK', 'Ecuador': 'EC', 'Egypt': 'EG',
        'Estonia': 'EE', 'Ethiopia': 'ET', 'Finland': 'FI', 'France': 'FR', 'Georgia': 'GE',
        'Germany': 'DE', 'Ghana': 'GH', 'Greece': 'GR', 'Hungary': 'HU', 'Iceland': 'IS',
        'India': 'IN', 'Indonesia': 'ID', 'Iran': 'IR', 'Iraq': 'IQ', 'Ireland': 'IE',
        'Israel': 'IL', 'Italy': 'IT', 'Japan': 'JP', 'Jordan': 'JO', 'Kazakhstan': 'KZ',
        'Kenya': 'KE', 'Kuwait': 'KW', 'Latvia': 'LV', 'Lebanon': 'LB', 'Lithuania': 'LT',
        'Luxembourg': 'LU', 'Malaysia': 'MY', 'Mexico': 'MX', 'Morocco': 'MA', 'Netherlands': 'NL',
        'New Zealand': 'NZ', 'Nigeria': 'NG', 'Norway': 'NO', 'Pakistan': 'PK', 'Peru': 'PE',
        'Philippines': 'PH', 'Poland': 'PL', 'Portugal': 'PT', 'Qatar': 'QA', 'Romania': 'RO',
        'Russia': 'RU', 'Saudi Arabia': 'SA', 'Singapore': 'SG', 'Slovakia': 'SK', 'Slovenia': 'SI',
        'South Africa': 'ZA', 'South Korea': 'KR', 'Spain': 'ES', 'Sri Lanka': 'LK', 'Sweden': 'SE',
        'Switzerland': 'CH', 'Thailand': 'TH', 'Turkey': 'TR', 'Ukraine': 'UA', 'United Arab Emirates': 'AE',
        'United Kingdom': 'GB', 'United States': 'US', 'Uruguay': 'UY', 'Venezuela': 'VE', 'Vietnam': 'VN'
      };
      
      const fallbackCountries = WORLD_DATA.countries.map((country) => ({
        code: countryCodeMap[country] || country.substring(0, 2).toUpperCase(),
        name: country
      }));
      setCountries(fallbackCountries);
      setApiError('Using offline country data. For full location features, configure the Country State City API.');
    } finally {
      setLoadingCountries(false);
      setActiveApiCalls(prev => {
        const newSet = new Set(prev);
        newSet.delete('countries');
        return newSet;
      });
    }
  };

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      // Extract GPS coordinates from initialData if available
      let gpsLat = '';
      let gpsLng = '';
      if (initialData?.gpsCoordinates?.coordinates) {
        gpsLng = initialData.gpsCoordinates.coordinates[0]?.toString() || '';
        gpsLat = initialData.gpsCoordinates.coordinates[1]?.toString() || '';
      }
      
      const newFormData = {
        name: initialData?.name || '',
        clientId: initialData?.clientId || '',
        type: initialData?.type || '',
        subType: (initialData?.subType && initialData.subType !== 'None') ? initialData.subType : '',
        division: (initialData?.division && initialData.division !== 'None') ? initialData.division : '',
        description: initialData?.description || '',
        incidentDate: formatDateForInput(initialData?.incidentDate),
        country: initialData?.country || '',
        state: initialData?.state || '',
        city: initialData?.city || '',
        address: initialData?.address || '',
        gpsLatitude: gpsLat,
        gpsLongitude: gpsLng,
        caseStatus: initialData?.caseStatus || 'Open',
        priority: initialData?.priority || 'Low',
        caseAdded: formatDateForDisplay(initialData?.caseAddedDate),
        lastUpdated: formatDateForDisplay(initialData?.lastUpdatedDate)
      };
      
      setFormData(newFormData);
    }
  }, [initialData]);

  // Load countries on component mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Auto-generate coordinates when location is complete (but only if not already set)
  useEffect(() => {
    if (formData.country && formData.city && !formData.gpsLatitude && !formData.gpsLongitude && !loadingCoordinates) {
      generateCoordinates();
    }
  }, [formData.country, formData.city, formData.state]);

  // Load states and cities for initial data
  useEffect(() => {
    if (formData.country && countries.length > 0) {
      const selectedCountry = countries.find(c => c.name === formData.country);
      if (selectedCountry) {
        loadStates(selectedCountry.code);
        // After first load, mark as no longer initial load
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    }
  }, [formData.country, countries, isInitialLoad]);

  useEffect(() => {
    if (formData.state && formData.country && states.length > 0) {
      const selectedState = states.find(s => s.name === formData.state);
      const selectedCountry = countries.find(c => c.name === formData.country);
      if (selectedCountry && selectedState) {
        loadCities(selectedCountry.code, selectedState.code);
      }
    } else if (formData.country && !formData.state && countries.length > 0 && states.length === 0) {
      // If no state but has country, load cities directly
      const selectedCountry = countries.find(c => c.name === formData.country);
      if (selectedCountry) {
        loadCities(selectedCountry.code);
      }
    }
  }, [formData.state, formData.country, states, countries]);

  const loadStates = async (countryCode: string) => {
    if (!countryCode || loadingStates || activeApiCalls.has(`states-${countryCode}`)) return;
    
    setLoadingStates(true);
    setActiveApiCalls(prev => new Set(prev).add(`states-${countryCode}`));
    
    // Clear existing states and cities when country changes (but not on initial load)
    if (!isInitialLoad) {
      setStates([]);
      setCities([]);
      setFormData(prev => ({ ...prev, state: '', city: '' }));
    }
    
    try {
      const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, {
        headers: {
          'X-CSCAPI-KEY': process.env.NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY || ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStates(data);
      
      // If no states available, load cities directly for the country
      if (data.length === 0) {
        loadCities(countryCode);
      }
    } catch (error) {
      console.warn('States API failed, using fallback data:', error);
      const countryName = countries.find(c => c.code === countryCode)?.name;
      if (countryName && WORLD_DATA.states[countryName as keyof typeof WORLD_DATA.states]) {
        const fallbackStates = WORLD_DATA.states[countryName as keyof typeof WORLD_DATA.states].map((state, index) => ({
          code: state.substring(0, 2).toUpperCase() + index,
          name: state
        }));
        setStates(fallbackStates);
      } else {
        setStates([]);
        // Load cities directly if no states
        loadCities(countryCode);
      }
    } finally {
      setLoadingStates(false);
      setActiveApiCalls(prev => {
        const newSet = new Set(prev);
        newSet.delete(`states-${countryCode}`);
        return newSet;
      });
    }
  };

  const loadCities = async (countryCode: string, stateCode?: string) => {
    if (!countryCode || loadingCities || activeApiCalls.has(`cities-${countryCode}-${stateCode || ''}`)) return;
    
    setLoadingCities(true);
    setActiveApiCalls(prev => new Set(prev).add(`cities-${countryCode}-${stateCode || ''}`));
    
    try {
      const url = stateCode 
        ? `https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`
        : `https://api.countrystatecity.in/v1/countries/${countryCode}/cities`;
        
      const response = await fetch(url, {
        headers: {
          'X-CSCAPI-KEY': process.env.NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY || ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCities(data.slice(0, 100)); // Limit to first 100 cities
    } catch (error) {
      console.warn('Cities API failed, using fallback data:', error);
      const countryName = countries.find(c => c.code === countryCode)?.name;
      const stateName = stateCode ? states.find(s => s.code === stateCode)?.name : undefined;
      
      let fallbackCities: City[] = [];
      if (stateName && WORLD_DATA.cities[stateName as keyof typeof WORLD_DATA.cities]) {
        fallbackCities = WORLD_DATA.cities[stateName as keyof typeof WORLD_DATA.cities].map((city, index) => ({
          id: index,
          name: city
        }));
      } else if (countryName) {
        // Get cities from any state of this country
        Object.entries(WORLD_DATA.cities).forEach(([state, cities]) => {
          if (countryName === 'United States' && WORLD_DATA.states['United States'].includes(state)) {
            cities.forEach((city, index) => {
              fallbackCities.push({ id: fallbackCities.length + index, name: city });
            });
          }
        });
      }
      setCities(fallbackCities.slice(0, 50));
    } finally {
      setLoadingCities(false);
      setActiveApiCalls(prev => {
        const newSet = new Set(prev);
        newSet.delete(`cities-${countryCode}-${stateCode || ''}`);
        return newSet;
      });
    }
  };

  const generateCoordinates = async () => {
    if (!formData.country || loadingCoordinates) return;
    
    setLoadingCoordinates(true);
    
    try {
      // For demo purposes, we'll use mock coordinates based on country
      // In production, you'd use a real geocoding service
      const mockCoords = getMockCoordinates(formData.country);
      
      setFormData(prev => ({
        ...prev,
        gpsLatitude: mockCoords.latitude.toString(),
        gpsLongitude: mockCoords.longitude.toString()
      }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Failed to generate coordinates:', error);
      // Fallback to mock coordinates
      const mockCoords = getMockCoordinates(formData.country);
      setFormData(prev => ({
        ...prev,
        gpsLatitude: mockCoords.latitude.toString(),
        gpsLongitude: mockCoords.longitude.toString()
      }));
    } finally {
      setLoadingCoordinates(false);
    }
  };

  const getMockCoordinates = (country: string) => {
    const coordinates: Record<string, { latitude: number; longitude: number }> = {
      'United States': { latitude: 39.8283, longitude: -98.5795 },
      'Canada': { latitude: 56.1304, longitude: -106.3468 },
      'United Kingdom': { latitude: 55.3781, longitude: -3.4360 },
      'Germany': { latitude: 51.1657, longitude: 10.4515 },
      'France': { latitude: 46.2276, longitude: 2.2137 },
      'Australia': { latitude: -25.2744, longitude: 133.7751 },
      'India': { latitude: 20.5937, longitude: 78.9629 },
      'China': { latitude: 35.8617, longitude: 104.1954 },
      'Japan': { latitude: 36.2048, longitude: 138.2529 },
      'Brazil': { latitude: -14.2350, longitude: -51.9253 },
      'Russia': { latitude: 61.5240, longitude: 105.3188 },
      'South Africa': { latitude: -30.5595, longitude: 22.9375 },
      'Mexico': { latitude: 23.6345, longitude: -102.5528 },
      'Italy': { latitude: 41.8719, longitude: 12.5674 },
      'Spain': { latitude: 40.4637, longitude: -3.7492 },
      'Netherlands': { latitude: 52.1326, longitude: 5.2913 },
      'Sweden': { latitude: 60.1282, longitude: 18.6435 },
      'Norway': { latitude: 60.4720, longitude: 8.4689 },
      'Switzerland': { latitude: 46.8182, longitude: 8.2275 },
      'Belgium': { latitude: 50.5039, longitude: 4.4699 }
    };
    
    return coordinates[country] || { latitude: 0, longitude: 0 };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Handle cascading changes
    if (field === 'country') {
      const selectedCountry = countries.find(c => c.name === value);
      if (selectedCountry) {
        loadStates(selectedCountry.code);
      }
      setFormData(prev => ({ ...prev, state: '', city: '', gpsLatitude: '', gpsLongitude: '' }));
    } else if (field === 'state') {
      const selectedState = states.find(s => s.name === value);
      const selectedCountry = countries.find(c => c.name === formData.country);
      if (selectedCountry && selectedState) {
        loadCities(selectedCountry.code, selectedState.code);
      }
      setFormData(prev => ({ ...prev, city: '', gpsLatitude: '', gpsLongitude: '' }));
    } else if (field === 'city' && value && formData.country) {
      // Auto-generate coordinates when city is selected
      setTimeout(() => {
        generateCoordinates();
      }, 100);
    } else if (field === 'type') {
      setFormData(prev => ({ ...prev, subType: '' }));
    }
  };

  const handleCitySearch = (value: string) => {
    setFormData(prev => ({ ...prev, city: value }));
    
    if (value.length >= 2) {
      const selectedCountry = countries.find(c => c.name === formData.country);
      const selectedState = states.find(s => s.name === formData.state);
      
      if (selectedCountry) {
        searchCities(value, selectedCountry.code, selectedState?.code);
        setShowCitySuggestions(true);
      }
    } else {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    }
  };

  const searchCities = async (query: string, countryCode: string, stateCode?: string) => {
    if (!query || query.length < 2 || activeApiCalls.has(`search-${query}-${countryCode}-${stateCode || ''}`)) return;
    
    setActiveApiCalls(prev => new Set(prev).add(`search-${query}-${countryCode}-${stateCode || ''}`));
    
    // Clear previous timeout
    const timeoutKey = `search-${query}`;
    if (apiCallTimeouts.current.has(timeoutKey)) {
      clearTimeout(apiCallTimeouts.current.get(timeoutKey));
    }
    
    // Set new timeout
    const timeout = setTimeout(async () => {
      try {
        const url = stateCode 
          ? `https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`
          : `https://api.countrystatecity.in/v1/countries/${countryCode}/cities`;
          
        const response = await fetch(url, {
          headers: {
            'X-CSCAPI-KEY': process.env.NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY || ''
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const filteredCities = data.filter((city: City) => 
          city.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);
        
        setCitySuggestions(filteredCities);
      } catch (error) {
        console.warn('City search API failed, using fallback:', error);
        const countryName = countries.find(c => c.code === countryCode)?.name;
        setCitySuggestions(getBasicCities(countryName || '', query));
      } finally {
        setActiveApiCalls(prev => {
          const newSet = new Set(prev);
          newSet.delete(`search-${query}-${countryCode}-${stateCode || ''}`);
          return newSet;
        });
        apiCallTimeouts.current.delete(timeoutKey);
      }
    }, 300);
    
    apiCallTimeouts.current.set(timeoutKey, timeout);
  };

  const getBasicCities = (countryName: string, query: string): City[] => {
    const allCities: City[] = [];
    
    // Get cities from WORLD_DATA based on country
    if (countryName === 'United States') {
      Object.entries(WORLD_DATA.cities).forEach(([state, cities]) => {
        if (WORLD_DATA.states['United States'].includes(state)) {
          cities.forEach((city, index) => {
            allCities.push({ 
              id: allCities.length + index, 
              name: city, 
              region: state, 
              country: countryName 
            });
          });
        }
      });
    }
    
    return allCities
      .filter(city => city.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  };

  const selectCity = (city: City) => {
    setFormData(prev => ({ ...prev, city: city.name, gpsLatitude: '', gpsLongitude: '' }));
    setShowCitySuggestions(false);
    
    // Auto-generate coordinates after city selection
    setTimeout(() => {
      if (formData.country && city.name) {
        generateCoordinates();
      }
    }, 100);
  };

  const handleAddressSearch = (value: string) => {
    setFormData(prev => ({ ...prev, address: value }));
    
    if (value.length >= 2 && formData.city) {
      const suggestions = LOCATION_ADDRESSES[formData.city as keyof typeof LOCATION_ADDRESSES] || [];
      const filteredSuggestions = suggestions.filter(addr => 
        addr.toLowerCase().includes(value.toLowerCase())
      );
      setAddressSuggestions(filteredSuggestions);
    } else {
      setAddressSuggestions([]);
    }
  };

  const selectAddress = (address: string) => {
    setFormData(prev => ({ ...prev, address }));
    setShowAddressSuggestions(false);
  };

  const getAvailableSubTypes = () => {
    return formData.type ? CASE_SUB_TYPES[formData.type as keyof typeof CASE_SUB_TYPES] || [] : [];
  };

  return {
    formData,
    setFormData,
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
    loadCountries,
    generateCoordinates,
    handleInputChange,
    handleCitySearch,
    selectCity,
    handleAddressSearch,
    selectAddress,
    getAvailableSubTypes
  };
} 