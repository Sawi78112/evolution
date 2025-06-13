import { ENV_CONFIG } from '../../environment.config';

// Types
export interface Country {
  code: string;
  name: string;
  capital?: string;
  region?: string;
}

export interface State {
  code: string;
  name: string;
  countryCode: string;
}

export interface City {
  id: number;
  name: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  components: {
    country?: string;
    state?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
  };
}

// GeoDB API Headers
const geoDbHeaders = {
  'X-RapidAPI-Key': ENV_CONFIG.RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
};

/**
 * Fetch countries from REST Countries API
 */
export async function fetchCountries(): Promise<Country[]> {
  try {
    const response = await fetch(`${ENV_CONFIG.COUNTRIES_API_BASE}/all?fields=name,cca2,capital,region`);
    
    if (!response.ok) {
      throw new Error(`REST Countries API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const countries: Country[] = data.map((country: any) => ({
      code: country.cca2,
      name: country.name.common,
      capital: country.capital?.[0],
      region: country.region
    })).sort((a: Country, b: Country) => a.name.localeCompare(b.name));
    
    console.log(`Loaded ${countries.length} countries from REST Countries API`);
    return countries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    // Fallback to basic country list
    return getFallbackCountries();
  }
}

/**
 * Fetch ALL states/regions for a specific country using GeoDB (tries higher limits)
 */
export async function fetchAllStates(countryCode: string): Promise<State[]> {
  // For countries with comprehensive fallback data, use fallback first to avoid API limits
  const countriesWithGoodFallback = ['US', 'CA', 'AU', 'JP', 'DE', 'IN'];
  if (countriesWithGoodFallback.includes(countryCode)) {
    console.log(`📋 Using comprehensive fallback data for ${countryCode}`);
    const fallbackStates = getFallbackStates(countryCode);
    if (fallbackStates.length > 0) {
      return fallbackStates;
    }
  }
  
  // For Basic plan, only try small limits with delays
  const limitsToTry = [10, 5, 3];
  
  for (let i = 0; i < limitsToTry.length; i++) {
    const limit = limitsToTry[i];
    try {
      // Add delay between attempts to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
      
      const states = await fetchStates(countryCode, limit);
      if (states.length > 0) {
        console.log(`Successfully loaded ${states.length} states with limit ${limit}`);
        return states;
      }
    } catch (error: any) {
      console.warn(`Failed with limit ${limit}: ${error.message}`);
      
      // If it's a rate limit error, wait longer
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        console.log('Rate limited, waiting 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // If it's the last attempt, return fallback data
      if (i === limitsToTry.length - 1) {
        console.log('All API attempts failed, using fallback data');
        return getFallbackStates(countryCode);
      }
    }
  }
  
  return getFallbackStates(countryCode);
}

/**
 * Fetch states/regions for a specific country using GeoDB
 */
export async function fetchStates(countryCode: string, limit: number = 50): Promise<State[]> {
  try {
    if (!ENV_CONFIG.RAPIDAPI_KEY || ENV_CONFIG.RAPIDAPI_KEY === 'your_rapidapi_key_here') {
      throw new Error('GeoDB API key not configured');
    }

    console.log('Making request to GeoDB API with key:', ENV_CONFIG.RAPIDAPI_KEY.substring(0, 10) + '...');
    console.log('Request URL:', `${ENV_CONFIG.GEODB_API_BASE}/countries/${countryCode}/regions?limit=100`);

    const response = await fetch(
      `${ENV_CONFIG.GEODB_API_BASE}/countries/${countryCode}/regions?limit=${limit}`,
      { headers: geoDbHeaders }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GeoDB API Error Response:', errorText);
      throw new Error(`GeoDB API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('GeoDB States API Response:', data);
    
    const states: State[] = data.data.map((region: any) => ({
      code: region.isoCode || region.fipsCode || region.name.substring(0, 3).toUpperCase(),
      name: region.name,
      countryCode: region.countryCode
    })).sort((a: State, b: State) => a.name.localeCompare(b.name));
    
    console.log(`Loaded ${states.length} states for ${countryCode}`);
    return states;
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
}

/**
 * Fetch ALL cities for a specific country and state using GeoDB (tries higher limits)
 */
export async function fetchAllCities(countryCode: string, stateCode?: string): Promise<City[]> {
  // For countries with comprehensive fallback data, use fallback first to avoid API limits
  const countriesWithGoodFallback = ['US', 'CA', 'AU', 'JP', 'DE', 'GB', 'IN'];
  if (countriesWithGoodFallback.includes(countryCode)) {
    console.log(`📋 Using comprehensive fallback cities for ${countryCode}`);
    const fallbackCities = getFallbackCities(countryCode, stateCode);
    if (fallbackCities.length > 0) {
      return fallbackCities;
    }
  }
  
  // For Basic plan, only try small limits with delays
  const limitsToTry = [10, 5, 3];
  
  for (let i = 0; i < limitsToTry.length; i++) {
    const limit = limitsToTry[i];
    try {
      // Add delay between attempts to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
      
      const cities = await fetchCities(countryCode, stateCode, limit);
      if (cities.length > 0) {
        console.log(`Successfully loaded ${cities.length} cities with limit ${limit}`);
        return cities;
      }
    } catch (error: any) {
      console.warn(`Failed with limit ${limit}: ${error.message}`);
      
      // If it's a rate limit error, wait longer
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        console.log('Rate limited, waiting 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // If it's the last attempt, return fallback data
      if (i === limitsToTry.length - 1) {
        console.log('All API attempts failed, using fallback data');
        return getFallbackCities(countryCode, stateCode);
      }
    }
  }
  
  return getFallbackCities(countryCode, stateCode);
}

/**
 * Fetch cities for a specific country and state using GeoDB
 * Uses the correct API endpoint: /v1/geo/countries/{countryCode}/places?types=CITY
 */
export async function fetchCities(countryCode: string, stateCode?: string, limit: number = 50): Promise<City[]> {
  try {
    if (!ENV_CONFIG.RAPIDAPI_KEY || ENV_CONFIG.RAPIDAPI_KEY === 'your_rapidapi_key_here') {
      throw new Error('GeoDB API key not configured');
    }

    // GeoDB API only has one endpoint for cities: /countries/{countryCode}/places?types=CITY
    // We filter by region/state in the frontend if needed
    const url = `${ENV_CONFIG.GEODB_API_BASE}/countries/${countryCode}/places?types=CITY&limit=${limit}`;
    
    if (stateCode) {
      console.log(`🏙️ Fetching cities for ${countryCode}/${stateCode} (will filter by region)`);
    } else {
      console.log(`🌍 Fetching cities for country: ${countryCode}`);
    }

    console.log('🔗 GeoDB Cities API URL:', url);
    const response = await fetch(url, { headers: geoDbHeaders });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GeoDB Cities API Error Response:', errorText);
      throw new Error(`GeoDB API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📊 GeoDB Cities API Response:', data);
    
    if (!data.data || !Array.isArray(data.data)) {
      console.warn('⚠️ No cities data in response:', data);
      return [];
    }
    
    let cities: City[] = data.data.map((place: any) => ({
      id: place.id,
      name: place.name || place.city,
      region: place.region,
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude
    }));
    
    // Filter by state/region if specified
    if (stateCode) {
      const originalCount = cities.length;
      // Try to match by region name or code
      cities = cities.filter(city => {
        if (!city.region) return false;
        
        // Try exact match with state code
        if (city.region.toLowerCase().includes(stateCode.toLowerCase())) return true;
        
        // Try to find state name from our fallback data
        const fallbackStates = getFallbackStates(countryCode);
        const matchingState = fallbackStates.find(state => state.code === stateCode);
        if (matchingState && city.region.toLowerCase().includes(matchingState.name.toLowerCase())) {
          return true;
        }
        
        return false;
      });
      
      console.log(`🔍 Filtered cities: ${originalCount} → ${cities.length} for region ${stateCode}`);
    }
    
    cities.sort((a: City, b: City) => a.name.localeCompare(b.name));
    
    console.log(`✅ Loaded ${cities.length} cities for ${countryCode}${stateCode ? `/${stateCode}` : ''}`);
    return cities;
  } catch (error) {
    console.error('❌ Error fetching cities:', error);
    return [];
  }
}

/**
 * Search cities by name using GeoDB
 */
export async function searchCities(query: string, countryCode?: string): Promise<City[]> {
  try {
    if (!ENV_CONFIG.RAPIDAPI_KEY || ENV_CONFIG.RAPIDAPI_KEY === 'your_rapidapi_key_here') {
      throw new Error('GeoDB API key not configured');
    }

    if (query.length < 2) return [];

    // Use the correct GeoDB API format for city search
    let url = `${ENV_CONFIG.GEODB_API_BASE}/cities?namePrefix=${encodeURIComponent(query)}&limit=25`;
    if (countryCode) {
      url += `&countryIds=${countryCode}`;
    }
    
    console.log('🔍 GeoDB City Search URL:', url);

    const response = await fetch(url, { headers: geoDbHeaders });
    
    if (!response.ok) {
      throw new Error(`GeoDB API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const cities: City[] = data.data.map((place: any) => ({
      id: place.id,
      name: place.name,
      region: place.region,
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude
    }));
    
    return cities;
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
}

/**
 * Geocode an address to get coordinates using LocationIQ or OpenCage
 */
export async function geocodeAddress(address: string, city?: string, state?: string, country?: string): Promise<GeocodingResult | null> {
  const fullAddress = [address, city, state, country].filter(Boolean).join(', ');
  
  // Try LocationIQ first
  if (ENV_CONFIG.LOCATIONIQ_API_KEY && ENV_CONFIG.LOCATIONIQ_API_KEY !== 'your_locationiq_api_key_here') {
    try {
      const result = await geocodeWithLocationIQ(fullAddress);
      if (result) return result;
    } catch (error) {
      console.warn('LocationIQ geocoding failed:', error);
    }
  }
  
  // Try OpenCage as fallback
  if (ENV_CONFIG.OPENCAGE_API_KEY && ENV_CONFIG.OPENCAGE_API_KEY !== 'your_opencage_api_key_here') {
    try {
      const result = await geocodeWithOpenCage(fullAddress);
      if (result) return result;
    } catch (error) {
      console.warn('OpenCage geocoding failed:', error);
    }
  }
  
  // If no geocoding service is available, try to get coordinates from city data
  if (city && country) {
    try {
      const countryData = await fetchCountries();
      const selectedCountry = countryData.find(c => c.name.toLowerCase() === country.toLowerCase());
      if (selectedCountry) {
        const cities = await fetchCities(selectedCountry.code);
        const selectedCity = cities.find(c => c.name.toLowerCase() === city.toLowerCase());
        if (selectedCity && selectedCity.latitude && selectedCity.longitude) {
          return {
            latitude: selectedCity.latitude,
            longitude: selectedCity.longitude,
            formattedAddress: fullAddress,
            components: {
              country,
              state,
              city,
              street: address
            }
          };
        }
      }
    } catch (error) {
      console.warn('Failed to get coordinates from city data:', error);
    }
  }
  
  // Return null if all methods fail
  console.warn('All geocoding methods failed for address:', fullAddress);
  return null;
}

/**
 * Geocode using LocationIQ API
 */
async function geocodeWithLocationIQ(address: string): Promise<GeocodingResult | null> {
  const response = await fetch(
    `${ENV_CONFIG.LOCATIONIQ_API_BASE}/search.php?key=${ENV_CONFIG.LOCATIONIQ_API_KEY}&q=${encodeURIComponent(address)}&format=json&limit=1`
  );
  
  if (!response.ok) {
    throw new Error(`LocationIQ API Error: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.length === 0) return null;
  
  const result = data[0];
  return {
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    formattedAddress: result.display_name,
    components: {
      country: result.address?.country,
      state: result.address?.state || result.address?.region,
      city: result.address?.city || result.address?.town || result.address?.village,
      street: result.address?.road,
      houseNumber: result.address?.house_number
    }
  };
}

/**
 * Geocode using OpenCage API
 */
async function geocodeWithOpenCage(address: string): Promise<GeocodingResult | null> {
  const response = await fetch(
    `${ENV_CONFIG.OPENCAGE_API_BASE}/json?key=${ENV_CONFIG.OPENCAGE_API_KEY}&q=${encodeURIComponent(address)}&limit=1`
  );
  
  if (!response.ok) {
    throw new Error(`OpenCage API Error: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.results.length === 0) return null;
  
  const result = data.results[0];
  return {
    latitude: result.geometry.lat,
    longitude: result.geometry.lng,
    formattedAddress: result.formatted,
    components: {
      country: result.components.country,
      state: result.components.state || result.components.region,
      city: result.components.city || result.components.town || result.components.village,
      street: result.components.road,
      houseNumber: result.components.house_number
    }
  };
}

/**
 * Get fallback countries list when API fails
 */
function getFallbackCountries(): Country[] {
  return [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'MX', name: 'Mexico' },
    { code: 'RU', name: 'Russia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'KR', name: 'South Korea' },
    { code: 'SG', name: 'Singapore' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'BE', name: 'Belgium' },
    { code: 'AT', name: 'Austria' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'HU', name: 'Hungary' },
    { code: 'PT', name: 'Portugal' },
    { code: 'GR', name: 'Greece' },
    { code: 'TR', name: 'Turkey' },
    { code: 'IL', name: 'Israel' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'EG', name: 'Egypt' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'KE', name: 'Kenya' },
    { code: 'GH', name: 'Ghana' },
    { code: 'MA', name: 'Morocco' },
    { code: 'TH', name: 'Thailand' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'PH', name: 'Philippines' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'UY', name: 'Uruguay' }
  ].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get fallback states list when API fails
 */
function getFallbackStates(countryCode: string): State[] {
  const fallbackStates: { [key: string]: State[] } = {
    'US': [
      { code: 'AL', name: 'Alabama', countryCode: 'US' },
      { code: 'AK', name: 'Alaska', countryCode: 'US' },
      { code: 'AZ', name: 'Arizona', countryCode: 'US' },
      { code: 'AR', name: 'Arkansas', countryCode: 'US' },
      { code: 'CA', name: 'California', countryCode: 'US' },
      { code: 'CO', name: 'Colorado', countryCode: 'US' },
      { code: 'CT', name: 'Connecticut', countryCode: 'US' },
      { code: 'DE', name: 'Delaware', countryCode: 'US' },
      { code: 'FL', name: 'Florida', countryCode: 'US' },
      { code: 'GA', name: 'Georgia', countryCode: 'US' },
      { code: 'HI', name: 'Hawaii', countryCode: 'US' },
      { code: 'ID', name: 'Idaho', countryCode: 'US' },
      { code: 'IL', name: 'Illinois', countryCode: 'US' },
      { code: 'IN', name: 'Indiana', countryCode: 'US' },
      { code: 'IA', name: 'Iowa', countryCode: 'US' },
      { code: 'KS', name: 'Kansas', countryCode: 'US' },
      { code: 'KY', name: 'Kentucky', countryCode: 'US' },
      { code: 'LA', name: 'Louisiana', countryCode: 'US' },
      { code: 'ME', name: 'Maine', countryCode: 'US' },
      { code: 'MD', name: 'Maryland', countryCode: 'US' },
      { code: 'MA', name: 'Massachusetts', countryCode: 'US' },
      { code: 'MI', name: 'Michigan', countryCode: 'US' },
      { code: 'MN', name: 'Minnesota', countryCode: 'US' },
      { code: 'MS', name: 'Mississippi', countryCode: 'US' },
      { code: 'MO', name: 'Missouri', countryCode: 'US' },
      { code: 'MT', name: 'Montana', countryCode: 'US' },
      { code: 'NE', name: 'Nebraska', countryCode: 'US' },
      { code: 'NV', name: 'Nevada', countryCode: 'US' },
      { code: 'NH', name: 'New Hampshire', countryCode: 'US' },
      { code: 'NJ', name: 'New Jersey', countryCode: 'US' },
      { code: 'NM', name: 'New Mexico', countryCode: 'US' },
      { code: 'NY', name: 'New York', countryCode: 'US' },
      { code: 'NC', name: 'North Carolina', countryCode: 'US' },
      { code: 'ND', name: 'North Dakota', countryCode: 'US' },
      { code: 'OH', name: 'Ohio', countryCode: 'US' },
      { code: 'OK', name: 'Oklahoma', countryCode: 'US' },
      { code: 'OR', name: 'Oregon', countryCode: 'US' },
      { code: 'PA', name: 'Pennsylvania', countryCode: 'US' },
      { code: 'RI', name: 'Rhode Island', countryCode: 'US' },
      { code: 'SC', name: 'South Carolina', countryCode: 'US' },
      { code: 'SD', name: 'South Dakota', countryCode: 'US' },
      { code: 'TN', name: 'Tennessee', countryCode: 'US' },
      { code: 'TX', name: 'Texas', countryCode: 'US' },
      { code: 'UT', name: 'Utah', countryCode: 'US' },
      { code: 'VT', name: 'Vermont', countryCode: 'US' },
      { code: 'VA', name: 'Virginia', countryCode: 'US' },
      { code: 'WA', name: 'Washington', countryCode: 'US' },
      { code: 'WV', name: 'West Virginia', countryCode: 'US' },
      { code: 'WI', name: 'Wisconsin', countryCode: 'US' },
      { code: 'WY', name: 'Wyoming', countryCode: 'US' }
    ],
    'CA': [
      { code: 'AB', name: 'Alberta', countryCode: 'CA' },
      { code: 'BC', name: 'British Columbia', countryCode: 'CA' },
      { code: 'MB', name: 'Manitoba', countryCode: 'CA' },
      { code: 'NB', name: 'New Brunswick', countryCode: 'CA' },
      { code: 'NL', name: 'Newfoundland and Labrador', countryCode: 'CA' },
      { code: 'NT', name: 'Northwest Territories', countryCode: 'CA' },
      { code: 'NS', name: 'Nova Scotia', countryCode: 'CA' },
      { code: 'NU', name: 'Nunavut', countryCode: 'CA' },
      { code: 'ON', name: 'Ontario', countryCode: 'CA' },
      { code: 'PE', name: 'Prince Edward Island', countryCode: 'CA' },
      { code: 'QC', name: 'Quebec', countryCode: 'CA' },
      { code: 'SK', name: 'Saskatchewan', countryCode: 'CA' },
      { code: 'YT', name: 'Yukon', countryCode: 'CA' }
    ],
    'AU': [
      { code: 'NSW', name: 'New South Wales', countryCode: 'AU' },
      { code: 'VIC', name: 'Victoria', countryCode: 'AU' },
      { code: 'QLD', name: 'Queensland', countryCode: 'AU' },
      { code: 'WA', name: 'Western Australia', countryCode: 'AU' },
      { code: 'SA', name: 'South Australia', countryCode: 'AU' },
      { code: 'TAS', name: 'Tasmania', countryCode: 'AU' },
      { code: 'NT', name: 'Northern Territory', countryCode: 'AU' },
      { code: 'ACT', name: 'Australian Capital Territory', countryCode: 'AU' }
    ],
    'JP': [
      { code: 'TOKYO', name: 'Tokyo', countryCode: 'JP' },
      { code: 'OSAKA', name: 'Osaka', countryCode: 'JP' },
      { code: 'KANAGAWA', name: 'Kanagawa', countryCode: 'JP' },
      { code: 'AICHI', name: 'Aichi', countryCode: 'JP' },
      { code: 'SAITAMA', name: 'Saitama', countryCode: 'JP' },
      { code: 'CHIBA', name: 'Chiba', countryCode: 'JP' },
      { code: 'HYOGO', name: 'Hyogo', countryCode: 'JP' },
      { code: 'HOKKAIDO', name: 'Hokkaido', countryCode: 'JP' },
      { code: 'FUKUOKA', name: 'Fukuoka', countryCode: 'JP' },
      { code: 'KYOTO', name: 'Kyoto', countryCode: 'JP' }
    ],
    'DE': [
      { code: 'BW', name: 'Baden-Württemberg', countryCode: 'DE' },
      { code: 'BY', name: 'Bavaria', countryCode: 'DE' },
      { code: 'BE', name: 'Berlin', countryCode: 'DE' },
      { code: 'BB', name: 'Brandenburg', countryCode: 'DE' },
      { code: 'HB', name: 'Bremen', countryCode: 'DE' },
      { code: 'HH', name: 'Hamburg', countryCode: 'DE' },
      { code: 'HE', name: 'Hesse', countryCode: 'DE' },
      { code: 'NI', name: 'Lower Saxony', countryCode: 'DE' },
      { code: 'NW', name: 'North Rhine-Westphalia', countryCode: 'DE' },
      { code: 'SN', name: 'Saxony', countryCode: 'DE' }
    ],
    'IN': [
      { code: 'AP', name: 'Andhra Pradesh', countryCode: 'IN' },
      { code: 'AR', name: 'Arunachal Pradesh', countryCode: 'IN' },
      { code: 'AS', name: 'Assam', countryCode: 'IN' },
      { code: 'BR', name: 'Bihar', countryCode: 'IN' },
      { code: 'CT', name: 'Chhattisgarh', countryCode: 'IN' },
      { code: 'DL', name: 'Delhi', countryCode: 'IN' },
      { code: 'GA', name: 'Goa', countryCode: 'IN' },
      { code: 'GJ', name: 'Gujarat', countryCode: 'IN' },
      { code: 'HR', name: 'Haryana', countryCode: 'IN' },
      { code: 'KA', name: 'Karnataka', countryCode: 'IN' },
      { code: 'KL', name: 'Kerala', countryCode: 'IN' },
      { code: 'MH', name: 'Maharashtra', countryCode: 'IN' },
      { code: 'MP', name: 'Madhya Pradesh', countryCode: 'IN' },
      { code: 'OR', name: 'Odisha', countryCode: 'IN' },
      { code: 'PB', name: 'Punjab', countryCode: 'IN' },
      { code: 'RJ', name: 'Rajasthan', countryCode: 'IN' },
      { code: 'TN', name: 'Tamil Nadu', countryCode: 'IN' },
      { code: 'TS', name: 'Telangana', countryCode: 'IN' },
      { code: 'UP', name: 'Uttar Pradesh', countryCode: 'IN' },
      { code: 'WB', name: 'West Bengal', countryCode: 'IN' }
    ]
  };

  return fallbackStates[countryCode] || [];
}

/**
 * Get fallback cities list when API fails
 */
function getFallbackCities(countryCode: string, stateCode?: string): City[] {
  const fallbackCities: { [key: string]: City[] } = {
    'US': [
      { id: 1, name: 'New York', region: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
      { id: 2, name: 'Los Angeles', region: 'California', country: 'United States', latitude: 34.0522, longitude: -118.2437 },
      { id: 3, name: 'Chicago', region: 'Illinois', country: 'United States', latitude: 41.8781, longitude: -87.6298 },
      { id: 4, name: 'Houston', region: 'Texas', country: 'United States', latitude: 29.7604, longitude: -95.3698 },
      { id: 5, name: 'Phoenix', region: 'Arizona', country: 'United States', latitude: 33.4484, longitude: -112.0740 },
      { id: 6, name: 'Philadelphia', region: 'Pennsylvania', country: 'United States', latitude: 39.9526, longitude: -75.1652 },
      { id: 7, name: 'San Antonio', region: 'Texas', country: 'United States', latitude: 29.4241, longitude: -98.4936 },
      { id: 8, name: 'San Diego', region: 'California', country: 'United States', latitude: 32.7157, longitude: -117.1611 },
      { id: 9, name: 'Dallas', region: 'Texas', country: 'United States', latitude: 32.7767, longitude: -96.7970 },
      { id: 10, name: 'San Jose', region: 'California', country: 'United States', latitude: 37.3382, longitude: -121.8863 }
    ],
    'CA': [
      { id: 11, name: 'Toronto', region: 'Ontario', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
      { id: 12, name: 'Montreal', region: 'Quebec', country: 'Canada', latitude: 45.5017, longitude: -73.5673 },
      { id: 13, name: 'Vancouver', region: 'British Columbia', country: 'Canada', latitude: 49.2827, longitude: -123.1207 },
      { id: 14, name: 'Calgary', region: 'Alberta', country: 'Canada', latitude: 51.0447, longitude: -114.0719 },
      { id: 15, name: 'Edmonton', region: 'Alberta', country: 'Canada', latitude: 53.5461, longitude: -113.4938 },
      { id: 16, name: 'Ottawa', region: 'Ontario', country: 'Canada', latitude: 45.4215, longitude: -75.6972 },
      { id: 17, name: 'Winnipeg', region: 'Manitoba', country: 'Canada', latitude: 49.8951, longitude: -97.1384 },
      { id: 18, name: 'Quebec City', region: 'Quebec', country: 'Canada', latitude: 46.8139, longitude: -71.2080 }
    ],
    'GB': [
      { id: 19, name: 'London', region: 'England', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
      { id: 20, name: 'Manchester', region: 'England', country: 'United Kingdom', latitude: 53.4808, longitude: -2.2426 },
      { id: 21, name: 'Birmingham', region: 'England', country: 'United Kingdom', latitude: 52.4862, longitude: -1.8904 },
      { id: 22, name: 'Liverpool', region: 'England', country: 'United Kingdom', latitude: 53.4084, longitude: -2.9916 },
      { id: 23, name: 'Edinburgh', region: 'Scotland', country: 'United Kingdom', latitude: 55.9533, longitude: -3.1883 },
      { id: 24, name: 'Glasgow', region: 'Scotland', country: 'United Kingdom', latitude: 55.8642, longitude: -4.2518 },
      { id: 25, name: 'Cardiff', region: 'Wales', country: 'United Kingdom', latitude: 51.4816, longitude: -3.1791 }
    ],
    'AU': [
      { id: 26, name: 'Sydney', region: 'New South Wales', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
      { id: 27, name: 'Melbourne', region: 'Victoria', country: 'Australia', latitude: -37.8136, longitude: 144.9631 },
      { id: 28, name: 'Brisbane', region: 'Queensland', country: 'Australia', latitude: -27.4698, longitude: 153.0251 },
      { id: 29, name: 'Perth', region: 'Western Australia', country: 'Australia', latitude: -31.9505, longitude: 115.8605 },
      { id: 30, name: 'Adelaide', region: 'South Australia', country: 'Australia', latitude: -34.9285, longitude: 138.6007 }
    ],
    'JP': [
      { id: 31, name: 'Tokyo', region: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
      { id: 32, name: 'Osaka', region: 'Osaka', country: 'Japan', latitude: 34.6937, longitude: 135.5023 },
      { id: 33, name: 'Yokohama', region: 'Kanagawa', country: 'Japan', latitude: 35.4438, longitude: 139.6380 },
      { id: 34, name: 'Nagoya', region: 'Aichi', country: 'Japan', latitude: 35.1815, longitude: 136.9066 },
      { id: 35, name: 'Sapporo', region: 'Hokkaido', country: 'Japan', latitude: 43.0642, longitude: 141.3469 },
      { id: 36, name: 'Fukuoka', region: 'Fukuoka', country: 'Japan', latitude: 33.5904, longitude: 130.4017 },
      { id: 37, name: 'Kyoto', region: 'Kyoto', country: 'Japan', latitude: 35.0116, longitude: 135.7681 },
      { id: 38, name: 'Kobe', region: 'Hyogo', country: 'Japan', latitude: 34.6901, longitude: 135.1956 },
      { id: 39, name: 'Kawasaki', region: 'Kanagawa', country: 'Japan', latitude: 35.5308, longitude: 139.7029 },
      { id: 40, name: 'Saitama', region: 'Saitama', country: 'Japan', latitude: 35.8617, longitude: 139.6455 }
    ],
    'DE': [
      { id: 41, name: 'Berlin', region: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050 },
      { id: 42, name: 'Hamburg', region: 'Hamburg', country: 'Germany', latitude: 53.5511, longitude: 9.9937 },
      { id: 43, name: 'Munich', region: 'Bavaria', country: 'Germany', latitude: 48.1351, longitude: 11.5820 },
      { id: 44, name: 'Cologne', region: 'North Rhine-Westphalia', country: 'Germany', latitude: 50.9375, longitude: 6.9603 },
      { id: 45, name: 'Frankfurt', region: 'Hesse', country: 'Germany', latitude: 50.1109, longitude: 8.6821 },
      { id: 46, name: 'Stuttgart', region: 'Baden-Württemberg', country: 'Germany', latitude: 48.7758, longitude: 9.1829 },
      { id: 47, name: 'Düsseldorf', region: 'North Rhine-Westphalia', country: 'Germany', latitude: 51.2277, longitude: 6.7735 },
      { id: 48, name: 'Leipzig', region: 'Saxony', country: 'Germany', latitude: 51.3397, longitude: 12.3731 },
      { id: 49, name: 'Dortmund', region: 'North Rhine-Westphalia', country: 'Germany', latitude: 51.5136, longitude: 7.4653 },
      { id: 50, name: 'Essen', region: 'North Rhine-Westphalia', country: 'Germany', latitude: 51.4556, longitude: 7.0116 }
    ],
    'IN': [
      { id: 51, name: 'Mumbai', region: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777 },
      { id: 52, name: 'Delhi', region: 'Delhi', country: 'India', latitude: 28.7041, longitude: 77.1025 },
      { id: 53, name: 'Bangalore', region: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
      { id: 54, name: 'Hyderabad', region: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867 },
      { id: 55, name: 'Chennai', region: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707 },
      { id: 56, name: 'Kolkata', region: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639 },
      { id: 57, name: 'Pune', region: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567 },
      { id: 58, name: 'Ahmedabad', region: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714 },
      { id: 59, name: 'Jaipur', region: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873 },
      { id: 60, name: 'Guwahati', region: 'Assam', country: 'India', latitude: 26.1445, longitude: 91.7362 }
    ]
  };

  let cities = fallbackCities[countryCode] || [];
  
  // Filter by state if provided
  if (stateCode && cities.length > 0) {
    const stateNames: { [key: string]: string } = {
      // US States
      'CA': 'California', 'NY': 'New York', 'TX': 'Texas', 'FL': 'Florida',
      // Canada Provinces
      'ON': 'Ontario', 'QC': 'Quebec', 'BC': 'British Columbia',
      // Australia States
      'NSW': 'New South Wales', 'VIC': 'Victoria', 'QLD': 'Queensland',
      // Japan Prefectures
      'TOKYO': 'Tokyo', 'OSAKA': 'Osaka', 'KANAGAWA': 'Kanagawa', 'AICHI': 'Aichi',
      'SAITAMA': 'Saitama', 'CHIBA': 'Chiba', 'HYOGO': 'Hyogo', 'HOKKAIDO': 'Hokkaido',
      'FUKUOKA': 'Fukuoka', 'KYOTO': 'Kyoto',
      // Germany States
      'BW': 'Baden-Württemberg', 'BY': 'Bavaria', 'BE': 'Berlin', 'BB': 'Brandenburg',
      'HB': 'Bremen', 'HH': 'Hamburg', 'HE': 'Hesse', 'NI': 'Lower Saxony',
      'NW': 'North Rhine-Westphalia', 'SN': 'Saxony',
      // India States
      'AP': 'Andhra Pradesh', 'AR': 'Arunachal Pradesh', 'AS': 'Assam', 'BR': 'Bihar',
      'CT': 'Chhattisgarh', 'DL': 'Delhi', 'GA': 'Goa', 'GJ': 'Gujarat', 'HR': 'Haryana',
      'KA': 'Karnataka', 'KL': 'Kerala', 'MH': 'Maharashtra', 'MP': 'Madhya Pradesh',
      'OR': 'Odisha', 'PB': 'Punjab', 'RJ': 'Rajasthan', 'TN': 'Tamil Nadu',
      'TS': 'Telangana', 'UP': 'Uttar Pradesh', 'WB': 'West Bengal'
    };
    
    const stateName = stateNames[stateCode];
    if (stateName) {
      cities = cities.filter(city => city.region === stateName);
    }
  }

  return cities;
} 