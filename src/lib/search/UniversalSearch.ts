import { createClient } from '@supabase/supabase-js';
import { TableSearchConfig, SearchField, SearchFieldType } from './SearchConfig';

// Universal Search Query Builder
export class UniversalSearch {
  private supabase: any;
  private config: TableSearchConfig;

  constructor(config: TableSearchConfig, supabaseUrl: string, serviceRoleKey: string) {
    this.config = config;
    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  // Parse search term and determine search strategy
  private parseSearchTerm(searchTerm: string): {
    type: 'text' | 'number' | 'date' | 'status';
    value: string;
    parsedDate?: { startDate: Date; endDate: Date };
  } {
    const trimmed = searchTerm.trim();
    
    // Check if it's a number
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return { type: 'number', value: trimmed };
    }

    // Check if it's a date
    const dateFormats = [
      /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/,           // MM/DD/YYYY
      /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,             // YYYY-MM-DD
      /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i // Month names
    ];

    if (dateFormats.some(pattern => pattern.test(trimmed))) {
      const parsedDate = this.parseDateString(trimmed);
      return { 
        type: 'date', 
        value: trimmed,
        parsedDate: parsedDate || undefined
      };
    }

    // Check if it's a status value
    const statusFields = this.config.searchFields.filter(field => field.type === 'status');
    for (const field of statusFields) {
      if (field.enumValues?.some(val => val.toLowerCase() === trimmed.toLowerCase())) {
        return { type: 'status', value: trimmed };
      }
    }

    // Default to text search
    return { type: 'text', value: trimmed };
  }

  // Parse date string into date range
  private parseDateString(dateStr: string): { startDate: Date; endDate: Date } | null {
    const searchLower = dateStr.toLowerCase().trim();
    
    // MM/DD/YYYY format
    const mmddyyyyPattern = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/;
    if (mmddyyyyPattern.test(searchLower)) {
      const match = searchLower.match(mmddyyyyPattern);
      if (match) {
        let year = parseInt(match[3]);
        if (year < 100) year += 2000;
        const date = new Date(year, parseInt(match[1]) - 1, parseInt(match[2]));
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate };
      }
    }

    // YYYY/MM/DD format
    const yyyymmddPattern = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
    if (yyyymmddPattern.test(searchLower)) {
      const match = searchLower.match(yyyymmddPattern);
      if (match) {
        const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate };
      }
    }

    // Month name
    const monthPattern = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
    if (monthPattern.test(searchLower)) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                         'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIndex = monthNames.findIndex(month => searchLower.startsWith(month));
      if (monthIndex !== -1) {
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, monthIndex, 1);
        const endDate = new Date(currentYear, monthIndex + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate };
      }
    }

    return null;
  }

  // Build search conditions for different field types
  private buildSearchConditions(searchTerm: string): string[] {
    const conditions: string[] = [];
    const parsedSearch = this.parseSearchTerm(searchTerm);

    for (const field of this.config.searchFields) {
      const fieldConditions = this.buildFieldCondition(field, parsedSearch);
      if (fieldConditions.length > 0) {
        conditions.push(...fieldConditions);
      }
    }

    return conditions;
  }

  // Build condition for a specific field
  private buildFieldCondition(field: SearchField, parsedSearch: any): string[] {
    const conditions: string[] = [];
    
    switch (field.type) {
      case 'text':
        if (parsedSearch.type === 'text') {
          const caseSensitive = field.caseSensitive ?? false;
          const operator = caseSensitive ? 'like' : 'ilike';
          conditions.push(`${field.name}.${operator}.%${parsedSearch.value}%`);
        }
        break;

      case 'exact':
        conditions.push(`${field.name}.eq.${parsedSearch.value}`);
        break;

      case 'number':
        if (parsedSearch.type === 'number') {
          conditions.push(`${field.name}.eq.${parsedSearch.value}`);
        }
        break;

      case 'status':
        if (parsedSearch.type === 'status' || 
            (field.exactMatchKeywords && 
             field.exactMatchKeywords.includes(parsedSearch.value.toLowerCase()))) {
          const matchingValue = field.enumValues?.find(val => 
            val.toLowerCase() === parsedSearch.value.toLowerCase()
          );
          if (matchingValue) {
            conditions.push(`${field.name}.eq.${matchingValue}`);
          }
        }
        break;

      case 'date':
        if (parsedSearch.type === 'date' && parsedSearch.parsedDate) {
          const { startDate, endDate } = parsedSearch.parsedDate;
          conditions.push(`${field.name}.gte.${startDate.toISOString()}`);
          conditions.push(`${field.name}.lte.${endDate.toISOString()}`);
        }
        break;

      case 'boolean':
        const booleanValue = parsedSearch.value.toLowerCase();
        if (['true', 'false', 'yes', 'no', '1', '0'].includes(booleanValue)) {
          const value = ['true', 'yes', '1'].includes(booleanValue);
          conditions.push(`${field.name}.eq.${value}`);
        }
        break;

      case 'foreign_key':
        // Handle foreign key search separately (requires subquery)
        break;
    }

    return conditions;
  }

  // Get foreign key conditions (requires separate query)
  private async getForeignKeyConditions(searchTerm: string): Promise<string[]> {
    const conditions: string[] = [];
    const foreignKeyFields = this.config.searchFields.filter(field => field.type === 'foreign_key');

    for (const field of foreignKeyFields) {
      if (field.tableName && field.searchColumns) {
        const searchConditions = field.searchColumns.map(col => 
          `${col}.ilike.%${searchTerm}%`
        ).join(',');

        const { data: matchingRecords } = await this.supabase
          .from(field.tableName)
          .select(field.foreignKey || 'id')
          .or(searchConditions);

        if (matchingRecords && matchingRecords.length > 0) {
          const ids = matchingRecords.map((record: any) => 
            record[field.foreignKey || 'id']
          ).join(',');
          conditions.push(`${field.name}.in.(${ids})`);
        }
      }
    }

    return conditions;
  }

  // Main search method
  async search(
    searchTerm: string, 
    page: number = 1, 
    limit: number = 10, 
    statusFilter?: string,
    sortField?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<{
    data: any[];
    count: number;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    sorting: {
      field: string;
      direction: string;
    };
  }> {
    // Build base query with joins
    const selectClause = this.buildSelectClause();
    let query = this.supabase
      .from(this.config.tableName)
      .select(selectClause, { count: 'exact' });

    // Add search conditions
    if (searchTerm) {
      const basicConditions = this.buildSearchConditions(searchTerm);
      const foreignKeyConditions = await this.getForeignKeyConditions(searchTerm);
      
      const allConditions = [...basicConditions, ...foreignKeyConditions];
      if (allConditions.length > 0) {
        query = query.or(allConditions.join(','));
      }
    }

    // Add status filter
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    // Add sorting
    const finalSortField = sortField || this.config.defaultSortField || this.config.primaryKey;
    const finalSortDirection = sortDirection || 'desc';
    const ascending = finalSortDirection === 'asc';
    
    query = query.order(finalSortField, { ascending });

    // Add pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    // Calculate pagination
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: data || [],
      count: totalCount,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext,
        hasPrev
      },
      sorting: {
        field: finalSortField,
        direction: finalSortDirection
      }
    };
  }

  // Build SELECT clause with joins
  private buildSelectClause(): string {
    const mainColumns = this.config.selectColumns.map(col => `${this.config.tableName}.${col}`);
    
    if (!this.config.joins) {
      return mainColumns.join(', ');
    }

    const joinColumns = this.config.joins.flatMap(join => 
      join.selectColumns.map(col => `${join.alias}.${col}`)
    );

    return [...mainColumns, ...joinColumns].join(', ');
  }
} 