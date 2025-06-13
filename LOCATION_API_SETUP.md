# Location API Setup Guide

This guide explains how to set up location services for the Add Case modal, which includes country lists, state/city lookup, and GPS coordinate generation.

## APIs Used

| Feature             | API                        | Status |
| ------------------- | -------------------------- | ------ |
| Country List        | REST Countries API         | ✅ Free |
| State + City Lookup | GeoDB Cities (RapidAPI)    | ✅ Configured |
| GPS & Map           | LocationIQ OR OpenCage API | ⚠️ Needs Setup |

## Current Configuration

### ✅ GeoDB Cities API (RapidAPI) - Already Configured
- **Status**: Configured with provided key
- **Usage**: State/province lookup and city search
- **Key**: Already added to `environment.config.ts`
- **Rate Limit**: Check your RapidAPI dashboard

### ✅ REST Countries API - Working
- **Status**: Free, no key required
- **Usage**: Complete country list with ISO codes
- **Rate Limit**: No limits

### ⚠️ Geocoding APIs - Need Setup (Optional)

For GPS coordinate generation, you can use either:

#### Option 1: LocationIQ (Recommended)
1. Sign up at [locationiq.com](https://locationiq.com)
2. Get your free API key (10,000 requests/month)
3. Update `environment.config.ts`:
   ```typescript
   LOCATIONIQ_API_KEY: 'your_locationiq_api_key_here'
   ```

#### Option 2: OpenCage Data
1. Sign up at [opencagedata.com](https://opencagedata.com)
2. Get your free API key (2,500 requests/day)
3. Update `environment.config.ts`:
   ```typescript
   OPENCAGE_API_KEY: 'your_opencage_api_key_here'
   ```

## Features

### ✅ Currently Working
- **Country Selection**: Full list from REST Countries API
- **State/Province Lookup**: Real-time from GeoDB for major countries
- **City Search**: Autocomplete search with GeoDB
- **Interactive Map**: Displays selected location with markers
- **Fallback Coordinates**: Mock GPS coordinates when geocoding fails

### 🔄 Working with Geocoding Setup
- **Precise GPS Coordinates**: Exact latitude/longitude from addresses
- **Address Validation**: Verify and format addresses

## Usage in Add Case Modal

1. **Select Country**: Choose from comprehensive country list
2. **Select State/Province**: Auto-loaded based on country selection
3. **Search City**: Type to search cities with autocomplete
4. **Enter Address**: Optional street address
5. **Generate GPS**: Click "Generate GPS" or auto-generated on city selection
6. **View Map**: Interactive world map shows the exact location

## File Structure

```
├── environment.config.ts          # API keys configuration
├── src/lib/locationAPI.ts         # Location API utilities
├── src/features/cases/components/
│   └── case-details/AddCaseModal.tsx  # Main modal with location features
└── src/components/ui/
    ├── InteractiveMap.tsx         # Map display component
    └── LeafletMap.tsx             # Leaflet integration
```

## Troubleshooting

### API Errors
- Check your internet connection
- Verify API keys in `environment.config.ts`
- Check rate limits on your API dashboards

### No Coordinates Generated
- Verify geocoding API setup
- Check if location details are complete
- Fallback coordinates will be used automatically

### Map Not Loading
- Ensure coordinates are valid numbers
- Check if Leaflet CSS is loaded
- Verify `InteractiveMap` component is imported

## Rate Limits & Quotas

| API | Free Tier | Rate Limit |
|-----|-----------|------------|
| REST Countries | Unlimited | No limits |
| GeoDB Cities | 1,000 requests/month | 10 requests/second |
| LocationIQ | 10,000 requests/month | 60 requests/minute |
| OpenCage | 2,500 requests/day | 1 request/second |

## Support

For issues with specific APIs:
- **GeoDB**: Check RapidAPI dashboard
- **LocationIQ**: Contact LocationIQ support
- **OpenCage**: Check OpenCage documentation
- **REST Countries**: Usually very reliable, check network

## Next Steps

1. ✅ GeoDB Cities is ready to use
2. 🔄 Set up geocoding API for precise coordinates (optional)
3. 🔄 Monitor API usage in your dashboards
4. 🔄 Consider paid plans if you exceed free limits 