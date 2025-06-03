// Generic Search Configuration System for All Tables

export type SearchFieldType = 
  | 'text'           // ILIKE search for strings
  | 'exact'          // Exact match
  | 'number'         // Numeric search
  | 'date'           // Date parsing and range search
  | 'status'         // Enum/status values
  | 'boolean'        // True/false values
  | 'foreign_key'    // Search in related table
  | 'json'           // JSON field search
  | 'array';         // Array contains search

export interface SearchField {
  name: string;                    // Database column name
  type: SearchFieldType;           // Type of search to perform
  label?: string;                  // Human-readable label
  tableName?: string;              // For foreign key searches
  foreignKey?: string;             // Foreign key column name
  searchColumns?: string[];        // Columns to search in foreign table
  enumValues?: string[];           // Valid enum values for status type
  dateFormats?: string[];          // Supported date formats
  caseSensitive?: boolean;         // Case sensitivity for text search
  exactMatchKeywords?: string[];   // Keywords that trigger exact match
}

export interface TableSearchConfig {
  tableName: string;               // Main table name
  primaryKey: string;              // Primary key column
  searchFields: SearchField[];     // Searchable fields configuration
  defaultSortField?: string;       // Default sort field
  selectColumns: string[];         // Columns to select in query
  joins?: JoinConfig[];            // Table joins for foreign data
}

export interface JoinConfig {
  table: string;                   // Table to join
  alias: string;                   // Table alias
  on: string;                      // Join condition
  type: 'LEFT' | 'INNER' | 'RIGHT'; // Join type
  selectColumns: string[];         // Columns to select from joined table
}

// Pre-configured search configs for common tables
export const DIVISIONS_SEARCH_CONFIG: TableSearchConfig = {
  tableName: 'divisions',
  primaryKey: 'division_id',
  defaultSortField: 'created_at',
  selectColumns: ['division_id', 'name', 'abbreviation', 'status', 'created_at', 'manager_user_id', 'created_by'],
  joins: [
    {
      table: 'users',
      alias: 'manager',
      on: 'divisions.manager_user_id = manager.user_id',
      type: 'LEFT',
      selectColumns: ['user_id', 'username', 'user_abbreviation', 'avatar_url']
    },
    {
      table: 'users', 
      alias: 'creator',
      on: 'divisions.created_by = creator.user_id',
      type: 'LEFT',
      selectColumns: ['user_id', 'username', 'user_abbreviation']
    }
  ],
  searchFields: [
    {
      name: 'name',
      type: 'text',
      label: 'Division Name',
      caseSensitive: false
    },
    {
      name: 'abbreviation',
      type: 'text', 
      label: 'Abbreviation',
      caseSensitive: false
    },
    {
      name: 'status',
      type: 'status',
      label: 'Status',
      enumValues: ['Active', 'Inactive'],
      exactMatchKeywords: ['active', 'inactive']
    },
    {
      name: 'created_by',
      type: 'foreign_key',
      label: 'Created By',
      tableName: 'users',
      foreignKey: 'created_by',
      searchColumns: ['username', 'user_abbreviation']
    },
    {
      name: 'manager_user_id',
      type: 'foreign_key',
      label: 'Manager',
      tableName: 'users', 
      foreignKey: 'manager_user_id',
      searchColumns: ['username', 'user_abbreviation']
    },
    {
      name: 'created_at',
      type: 'date',
      label: 'Creation Date',
      dateFormats: ['MM/DD/YYYY', 'YYYY-MM-DD', 'MMM', 'MMMM']
    },
    {
      name: 'total_users',
      type: 'number',
      label: 'Total Users'
    }
  ]
};

// Example config for Users table
export const USERS_SEARCH_CONFIG: TableSearchConfig = {
  tableName: 'users',
  primaryKey: 'user_id',
  defaultSortField: 'created_at',
  selectColumns: ['user_id', 'username', 'email', 'status', 'role', 'created_at', 'division_id'],
  joins: [
    {
      table: 'divisions',
      alias: 'division',
      on: 'users.division_id = division.division_id',
      type: 'LEFT',
      selectColumns: ['division_id', 'name', 'abbreviation']
    }
  ],
  searchFields: [
    {
      name: 'username',
      type: 'text',
      label: 'Username'
    },
    {
      name: 'email',
      type: 'text',
      label: 'Email'
    },
    {
      name: 'status',
      type: 'status',
      enumValues: ['Active', 'Inactive', 'Suspended']
    },
    {
      name: 'role',
      type: 'text',
      label: 'Role'
    },
    {
      name: 'division_id',
      type: 'foreign_key',
      tableName: 'divisions',
      foreignKey: 'division_id',
      searchColumns: ['name', 'abbreviation']
    },
    {
      name: 'created_at',
      type: 'date',
      label: 'Join Date'
    }
  ]
};

// Example config for Projects table
export const PROJECTS_SEARCH_CONFIG: TableSearchConfig = {
  tableName: 'projects',
  primaryKey: 'project_id',
  defaultSortField: 'created_at',
  selectColumns: ['project_id', 'name', 'description', 'status', 'priority', 'created_at', 'assigned_to', 'budget'],
  joins: [
    {
      table: 'users',
      alias: 'assignee',
      on: 'projects.assigned_to = assignee.user_id',
      type: 'LEFT',
      selectColumns: ['user_id', 'username', 'avatar_url']
    }
  ],
  searchFields: [
    {
      name: 'name',
      type: 'text',
      label: 'Project Name'
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description'
    },
    {
      name: 'status',
      type: 'status',
      enumValues: ['Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled']
    },
    {
      name: 'priority',
      type: 'status',
      enumValues: ['Low', 'Medium', 'High', 'Urgent']
    },
    {
      name: 'assigned_to',
      type: 'foreign_key',
      tableName: 'users',
      foreignKey: 'assigned_to',
      searchColumns: ['username']
    },
    {
      name: 'budget',
      type: 'number',
      label: 'Budget'
    },
    {
      name: 'created_at',
      type: 'date',
      label: 'Creation Date'
    }
  ]
}; 