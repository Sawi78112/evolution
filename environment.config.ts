// Environment Configuration
// Note: These values are loaded from .env.local file
export const ENV_CONFIG = {
  // GeoDB Cities API (RapidAPI)
  RAPIDAPI_KEY: process.env.NEXT_PUBLIC_RAPIDAPI_KEY || 'your_rapidapi_key_here',
  
  // LocationIQ API for geocoding (you can sign up for free at locationiq.com)
  LOCATIONIQ_API_KEY: process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY || 'your_locationiq_api_key_here',
  
  // OpenCage API for geocoding (alternative to LocationIQ)
  OPENCAGE_API_KEY: process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'your_opencage_api_key_here',
  
  // API Base URLs
  GEODB_API_BASE: 'https://wft-geo-db.p.rapidapi.com/v1/geo',
  COUNTRIES_API_BASE: 'https://restcountries.com/v3.1',
  LOCATIONIQ_API_BASE: 'https://locationiq.com/v1',
  OPENCAGE_API_BASE: 'https://api.opencagedata.com/geocode/v1'
}; 