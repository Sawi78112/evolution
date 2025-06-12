export const itemsPerPageOptions = [5, 10, 15, 20, 25, 30];

export const CASE_TYPES = [
  'Disinformation',
  'Cybercrime',
  'Terrorism',
  'Financial Fraud',
  'Impersonation',
  'Internal Risk',
  'Public Threat',
  'Misuse of Media',
  'Other'
] as const;

export const CASE_STATUS = [
  'Open',
  'Closed'
] as const;

export const CASE_PRIORITY = [
  'Low',
  'Medium',
  'High',
  'Critical'
] as const;

export const SORT_FIELDS = {
  NO: 'case_added_date',
  NAME: 'case_name',
  CLIENT_ID: 'client_case_id',
  TYPE: 'case_type',
  SUB_TYPE: 'case_sub_type',
  CASE_STATUS: 'case_status',
  PRIORITY: 'case_priority',
  DIVISION: 'division',
  OWNER: 'owner',
  INIT_OCCUR: 'incident_date',
  ADDED_DATE: 'case_added_date',
  LAST_UPDATED: 'last_updated_date',
  LOCATION: 'location'
} as const;

// Priority color mapping for Badge component - Vibrant and meaningful colors
export const PRIORITY_COLORS = {
  Low: 'info',        // Blue - calm, low urgency  
  Medium: 'warning',  // Orange/Yellow - moderate attention
  High: 'error',      // Red - urgent attention
  Critical: 'dark'    // Dark/Black - highest urgency (solid variant)
} as const;

// Status color mapping for Badge component - More meaningful colors
export const STATUS_COLORS = {
  Open: 'success',    // Green - active/open cases
  Closed: 'light'     // Gray - completed/closed cases
} as const;

// Priority background colors for visual appeal in details
export const PRIORITY_BG_COLORS = {
  Low: 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20',
  Medium: 'bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20',
  High: 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20',
  Critical: 'bg-gray-50 border-gray-300 dark:bg-gray-500/10 dark:border-gray-500/20'
} as const;

// Status background colors for visual appeal in details
export const STATUS_BG_COLORS = {
  Open: 'bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/20',
  Closed: 'bg-gray-50 border-gray-200 dark:bg-gray-500/10 dark:border-gray-500/20'
} as const; 