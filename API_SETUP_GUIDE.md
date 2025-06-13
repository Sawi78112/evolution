# API Setup Guide for GeoDB Cities Integration

## Overview
The updated AddCaseModal now integrates with GeoDB Cities API for comprehensive global location data and OpenCage API for geocoding coordinates.

## Required API Keys

### 1. GeoDB Cities API (RapidAPI)
**Purpose**: Fetches countries, states/provinces, and cities with autocomplete search

**Setup Steps**:
1. Visit [RapidAPI GeoDB Cities](https://rapidapi.com/wirefreethought/api/geodb-cities)
2. Sign up for a free account
3. Subscribe to the GeoDB Cities API (Free tier available: 1000 requests/month)
4. Copy your RapidAPI key

### 2. OpenCage Geocoding API
**Purpose**: Converts city names to GPS coordinates

**Setup Steps**:
1. Visit [OpenCage Geocoding API](https://opencagedata.com/api)
2. Sign up for a free account
3. Get your API key (Free tier: 2500 requests/day)

## Configuration

Update the API keys in `src/features/cases/components/case-details/AddCaseModal.tsx`:

```typescript
// Replace these with your actual API keys
const GEODB_API_KEY = 'YOUR_RAPIDAPI_KEY'; // Replace with your RapidAPI key
const OPENCAGE_API_KEY = 'YOUR_OPENCAGE_API_KEY'; // Replace with your OpenCage key
```

## Features

### GeoDB Cities API Integration
- **Countries**: Automatically loads 200+ countries on modal open
- **States/Provinces**: Dynamically loads when country is selected
- **Cities**: Real-time search with autocomplete (minimum 2 characters)
- **Fallback**: If API fails, falls back to a basic country list

### Smart Location Flow
1. **Country Selection**: Required field, enables state dropdown
2. **State Selection**: Optional, depends on country (some countries don't have states)
3. **City Search**: Type-ahead search with region/country context
4. **Address Input**: Only enabled after country and city are selected
5. **GPS Generation**: Auto-generates coordinates from location data

### Error Handling
- API timeouts and failures are gracefully handled
- Fallback data ensures functionality even without API access
- Loading states provide user feedback
- Error messages guide users when issues occur

## Usage Flow

1. **Select Country**: Choose from 200+ countries
2. **Select State** (if applicable): States/provinces load automatically
3. **Search City**: Start typing city name (2+ characters) for suggestions
4. **Enter Address**: Street address field becomes available
5. **GPS Coordinates**: Auto-generated or manually editable
6. **Map Display**: Visual confirmation of selected location

## Cost & Limits

### GeoDB Cities (RapidAPI)
- **Free Tier**: 1000 requests/month
- **Basic**: $9.99/month for 10,000 requests
- **Pro**: Higher limits available

### OpenCage Geocoding
- **Free Tier**: 2500 requests/day
- **Paid Plans**: Starting at $50/month for higher limits

## Testing Without API Keys

The system includes fallback functionality:
- **Countries**: Basic list of 10 major countries
- **GPS Coordinates**: Mock coordinates for demo purposes
- **Error Handling**: Clear messages about missing API access

## Security Considerations

⚠️ **Important**: API keys should be stored securely:
- Use environment variables in production
- Never commit API keys to version control
- Consider using a backend proxy for sensitive keys

## Future Enhancements

- Environment variable configuration
- Backend API proxy for secure key handling
- Caching for frequently accessed data
- Additional geocoding providers for redundancy 