export interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export type AddCaseTab = 'case-detail' | 'people' | 'artifacts' | 'notes' | 'related-cases';

export interface FormData {
  name: string;
  clientId: string;
  type: string;
  subType: string;
  division: string;
  description: string;
  incidentDate: string;
  country: string;
  state: string;
  city: string;
  address: string;
  gpsLatitude: string;
  gpsLongitude: string;
  caseStatus: 'Open' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface Country {
  code: string;
  name: string;
}

export interface State {
  code: string;
  name: string;
}

export interface City {
  id: number;
  name: string;
  region?: string;
  country?: string;
}

export interface LocationApiState {
  countries: Country[];
  states: State[];
  cities: City[];
  citySuggestions: City[];
  addressSuggestions: string[];
  showCitySuggestions: boolean;
  showAddressSuggestions: boolean;
}

export interface LoadingState {
  loadingCountries: boolean;
  loadingStates: boolean;
  loadingCities: boolean;
  loadingCoordinates: boolean;
}

export interface ErrorState {
  apiError: string | null;
} 