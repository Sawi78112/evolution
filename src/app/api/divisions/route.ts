import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple in-memory cache
interface CacheEntry {
  data: Record<string, any>;
  timestamp: number;
}

let divisionsCache: CacheEntry | null = null;
const CACHE_TTL = 30000; // 30 seconds

// Helper function to convert status string to database enum value
const getStatusValue = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'Active'; // Database expects "Active" with capital A
    case 'inactive':
      return 'Inactive'; // Database expects "Inactive" with capital I
    default:
      return 'Active'; // default to Active
  }
};

// Helper function to parse search date strings
const parseSearchDate = (searchTerm: string): { startDate: Date | null; endDate: Date | null } => {
  const searchLower = searchTerm.toLowerCase().trim();
  
  // Try MM/DD/YYYY or MM-DD-YYYY format
  const mmddyyyyPattern = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/;
  if (mmddyyyyPattern.test(searchLower)) {
    const match = searchLower.match(mmddyyyyPattern);
    if (match) {
      let year = parseInt(match[3]);
      if (year < 100) year += 2000; // Convert 2-digit year
      const date = new Date(year, parseInt(match[1]) - 1, parseInt(match[2]));
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      return { startDate, endDate };
    }
  }
  
  // Try YYYY/MM/DD or YYYY-MM-DD format
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
  
  // Try month name (jan, feb, etc.)
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
  
  return { startDate: null, endDate: null };
};

export async function POST(request: NextRequest) {
  try {
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { 
          error: 'Server configuration error: Missing Supabase environment variables'
        },
        { status: 500 }
      );
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse request body
    const body = await request.json();
    const { name, abbreviation, managerId, createdById } = body;

    // Validate required fields
    if (!name || !abbreviation || !createdById) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: name, abbreviation, and createdById are required'
        },
        { status: 400 }
      );
    }

    // Prepare division data
    const statusValue = getStatusValue('active'); // Convert "active" to "Active"
    const divisionData = {
      name: name.trim(),
      abbreviation: abbreviation.trim().toUpperCase(),
      manager_user_id: managerId || null, // null if no manager selected
      status: statusValue, // Store "Active" enum value
      created_by: createdById, // Store creator's UUID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert the new division
    const { data, error } = await supabase
      .from('divisions')
      .insert([divisionData])
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { 
          error: 'Failed to create division',
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    // Return data with status as it is from database
    const responseData = {
      ...data,
      status: data.status // Keep original "Active"/"Inactive" from database
    };

    // Invalidate cache when a new division is created
    divisionsCache = null;

    return NextResponse.json({
      success: true,
      division: responseData,
      message: 'Division created successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Invalidate cache to ensure fresh data after our changes
    divisionsCache = null;
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10'))); // Max 100 items per page
    const search = searchParams.get('search')?.trim() || '';
    const statusFilter = searchParams.get('status') || '';
    
    // New sorting parameters
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    // Create cache key based on query parameters (including sort params)
    const cacheKey = `${page}-${limit}-${search}-${statusFilter}-${sortField}-${sortDirection}`;
    
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { 
          error: 'Server configuration error: Missing Supabase environment variables'
        },
        { status: 500 }
      );
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Helper function to apply sorting based on field
    const applySorting = (query: any) => {
      const ascending = sortDirection === 'asc';
      
      switch (sortField) {
        case 'name':
          return query.order('name', { ascending });
        case 'abbreviation':
          return query.order('abbreviation', { ascending });
        case 'status':
          return query.order('status', { ascending });
        case 'createdAt':
        default:
          return query.order('created_at', { ascending });
      }
    };

    // For manager and createdBy sorting, we need special handling to ensure proper cross-page sorting
    const needsSpecialSorting = ['manager.name', 'createdBy.name', 'totalUsers'].includes(sortField);

    // Enhanced search implementation that supports createdBy and createdAt
    let divisions;
    let count;

    if (needsSpecialSorting) {
      // For fields that need special sorting, fetch ALL data first, then sort and paginate
      let allDataQuery;
      
      if (search) {
        // Handle search with special sorting
        const searchLower = search.toLowerCase().trim();
        const isDateSearch = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$|^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$|^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(searchLower);
        
        if (isDateSearch) {
          allDataQuery = supabase
            .from('divisions')
            .select('division_id, name, abbreviation, status, created_at, manager_user_id, created_by');

          const parsedDate = parseSearchDate(searchLower);
          if (parsedDate.startDate && parsedDate.endDate) {
            allDataQuery = allDataQuery.gte('created_at', parsedDate.startDate.toISOString())
                                      .lte('created_at', parsedDate.endDate.toISOString());
          }
        } else {
          // Text-based search - Enhanced to search across all table fields
          
          // First, find matching users for manager and created_by fields
          const { data: matchingUsers } = await supabase
            .from('users')
            .select('user_id, username, user_abbreviation')
            .or(`username.ilike.%${search}%, user_abbreviation.ilike.%${search}%`);

          const matchingUserIds = matchingUsers ? matchingUsers.map(user => user.user_id) : [];

          allDataQuery = supabase
            .from('divisions')
            .select('division_id, name, abbreviation, status, created_at, manager_user_id, created_by');

          const isStatusSearch = searchLower === 'active' || searchLower === 'inactive';
          const isNumberSearch = /^\d+$/.test(search.trim());

          const searchConditions = [
            `name.ilike.%${search}%`,              // Division Name
            `abbreviation.ilike.%${search}%`       // Abbreviation
          ];

          // Search in manager users (by username and abbreviation)
          if (matchingUserIds.length > 0) {
            searchConditions.push(`manager_user_id.in.(${matchingUserIds.join(',')})`);  // Manager
            searchConditions.push(`created_by.in.(${matchingUserIds.join(',')})`);       // Created By
          }

          // Status search
          if (isStatusSearch) {
            const statusValue = searchLower === 'active' ? 'Active' : 'Inactive';
            searchConditions.push(`status.eq.${statusValue}`);
          }

          // Number search (for Total Users - we'll handle this in post-processing)
          // We can't directly search total users in the database since it's calculated

          allDataQuery = allDataQuery.or(searchConditions.join(','));
        }

        // Apply status filter if provided
        if (statusFilter && (statusFilter === 'Active' || statusFilter === 'Inactive')) {
          allDataQuery = allDataQuery.eq('status', statusFilter);
        }
      } else {
        // No search - fetch all data
        allDataQuery = supabase
          .from('divisions')
          .select('division_id, name, abbreviation, status, created_at, manager_user_id, created_by');

        // Apply status filter if provided
        if (statusFilter && (statusFilter === 'Active' || statusFilter === 'Inactive')) {
          allDataQuery = allDataQuery.eq('status', statusFilter);
        }
      }

      // Fetch all data for special sorting
      const { data: allDivisions, error: allError } = await allDataQuery;
      
      if (allError || !allDivisions) {
        throw new Error('Failed to fetch divisions for sorting');
      }

      // Get all unique user IDs
      const allUserIds = new Set<string>();
      allDivisions.forEach(division => {
        if (division.manager_user_id) allUserIds.add(division.manager_user_id);
        if (division.created_by) allUserIds.add(division.created_by);
      });

      // Fetch all user data
      let userMap = new Map();
      if (allUserIds.size > 0) {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('user_id, username, user_abbreviation, avatar_url')
          .in('user_id', Array.from(allUserIds));

        if (!usersError && users) {
          users.forEach(user => {
            userMap.set(user.user_id, user);
          });
        }
      }

      // Calculate user counts for each division
      const divisionIds = allDivisions.map(d => d.division_id);
      let userCounts = new Map<string, number>();
      
      if (divisionIds.length > 0) {
        const { data: userCountData, error: userCountError } = await supabase
          .from('users')
          .select('division_id')
          .in('division_id', divisionIds);

        if (!userCountError && userCountData) {
          // Count users per division
          userCountData.forEach(user => {
            if (user.division_id) {
              const currentCount = userCounts.get(user.division_id) || 0;
              userCounts.set(user.division_id, currentCount + 1);
            }
          });
        }
      }

      // Transform all data
      let allTransformedDivisions = allDivisions.map(division => {
        const manager = division.manager_user_id ? userMap.get(division.manager_user_id) : null;
        const creator = division.created_by ? userMap.get(division.created_by) : null;

        return {
          id: division.division_id,
          name: division.name,
          abbreviation: division.abbreviation,
          status: division.status,
          createdAt: division.created_at,
          manager: manager ? {
            id: manager.user_id,
            name: manager.username,
            abbreviation: manager.user_abbreviation,
            image: manager.avatar_url || '/images/default-avatar.svg'
          } : null,
          createdBy: creator ? {
            id: creator.user_id,
            name: creator.username,
            abbreviation: creator.user_abbreviation
          } : null,
          totalUsers: userCounts.get(division.division_id) || 0
        };
      });

      // Sort all data
      const ascending = sortDirection === 'asc';
      allTransformedDivisions.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortField) {
          case 'manager.name':
            // Special sorting for manager: existing managers first, then none
            const aHasManager = a.manager ? 1 : 0;
            const bHasManager = b.manager ? 1 : 0;
            
            if (aHasManager !== bHasManager) {
              // Always prioritize divisions with managers first, regardless of asc/desc
              return bHasManager - aHasManager;
            }
            
            // If both have managers or both don't have managers, sort by name according to direction
            aValue = a.manager?.name.toLowerCase() || '';
            bValue = b.manager?.name.toLowerCase() || '';
            break;
          case 'createdBy.name':
            aValue = a.createdBy?.name.toLowerCase() || '';
            bValue = b.createdBy?.name.toLowerCase() || '';
            break;
          case 'totalUsers':
            aValue = a.totalUsers;
            bValue = b.totalUsers;
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) {
          return ascending ? -1 : 1;
        }
        if (aValue > bValue) {
          return ascending ? 1 : -1;
        }
        return 0;
      });

      // Apply pagination to sorted data
      const offset = (page - 1) * limit;
      divisions = allTransformedDivisions.slice(offset, offset + limit);
      count = allTransformedDivisions.length;

      // Post-process search for numeric fields like Total Users and Row Numbers
      if (search && /^\d+$/.test(search.trim())) {
        const searchNumber = parseInt(search.trim());
        const originalData = allTransformedDivisions;
        
        // Filter for Total Users matching the search number
        const totalUsersMatches = originalData.filter(division => 
          division.totalUsers === searchNumber
        );
        
        // Filter for Row Number (No column) matching the search number
        const rowNumberMatches = originalData.filter((division, index) => 
          (index + 1) === searchNumber
        );
        
        // Combine both matches (Total Users and Row Numbers)
        const combinedMatches = [
          ...totalUsersMatches,
          ...rowNumberMatches.filter(row => !totalUsersMatches.includes(row)) // Avoid duplicates
        ];
        
        // If we found matches, use those instead
        if (combinedMatches.length > 0) {
          allTransformedDivisions = combinedMatches;
          divisions = allTransformedDivisions.slice(offset, offset + limit);
          count = allTransformedDivisions.length;
        }
      }

      // For special sorting, we've already transformed the data, so we can skip the later transformation
      // Prepare response directly
      const totalCount = count;
      const totalPages = Math.ceil(totalCount / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      const response = {
        success: true,
        data: divisions,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNext,
          hasPrev
        },
        filters: {
          search: search || null,
          status: statusFilter || null
        },
        sorting: {
          field: sortField,
          direction: sortDirection
        }
      };

      // Update cache with new structure
      if (!divisionsCache) {
        divisionsCache = { data: {}, timestamp: Date.now() };
      }
      divisionsCache.data[cacheKey] = response;
      divisionsCache.timestamp = Date.now();

      return NextResponse.json(response);

    } else {
      // Original logic for simple sorting fields
      let query = supabase
        .from('divisions')
        .select('division_id, name, abbreviation, status, created_at, manager_user_id, created_by', { count: 'exact' });

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase().trim();
        const isDateSearch = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$|^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$|^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(searchLower);
        
        if (isDateSearch) {
          // Handle date search
          const parsedDate = parseSearchDate(searchLower);
          if (parsedDate.startDate && parsedDate.endDate) {
            query = query.gte('created_at', parsedDate.startDate.toISOString())
                        .lte('created_at', parsedDate.endDate.toISOString());
          }
        } else {
          // Text-based search for division name, abbreviation, and status
          const isStatusSearch = searchLower === 'active' || searchLower === 'inactive';
          
          let searchConditions = [
            `name.ilike.%${search}%`,              // Division Name
            `abbreviation.ilike.%${search}%`       // Abbreviation
          ];
          
          // Add status search if applicable
          if (isStatusSearch) {
            const statusValue = searchLower === 'active' ? 'Active' : 'Inactive';
            searchConditions.push(`status.eq.${statusValue}`);
          }
          
          // Apply OR conditions for text search
          query = query.or(searchConditions.join(','));
        }
      }

      // Apply status filter if provided
      if (statusFilter && (statusFilter === 'Active' || statusFilter === 'Inactive')) {
        query = query.eq('status', statusFilter);
      }

      // Apply sorting
      query = applySorting(query);

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Execute query
      const result = await query;
      divisions = result.data;
      count = result.count;
    }

    if (!divisions) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch divisions',
          details: 'No data returned from query'
        },
        { status: 500 }
      );
    }

    // Calculate pagination metadata
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Get unique user IDs for managers and creators (only for current page)
    const userIds = new Set<string>();
    divisions.forEach(division => {
      if (division.manager_user_id) userIds.add(division.manager_user_id);
      if (division.created_by) userIds.add(division.created_by);
    });

    // Calculate user counts for divisions on current page
    const divisionIds = divisions.map(d => d.division_id);
    let userCounts = new Map<string, number>();
    
    if (divisionIds.length > 0) {
      const { data: userCountData, error: userCountError } = await supabase
        .from('users')
        .select('division_id')
        .in('division_id', divisionIds);

      if (!userCountError && userCountData) {
        // Count users per division
        userCountData.forEach(user => {
          if (user.division_id) {
            const currentCount = userCounts.get(user.division_id) || 0;
            userCounts.set(user.division_id, currentCount + 1);
          }
        });
      }
    }

    // Fetch user data only for current page
    let userMap = new Map();
    if (userIds.size > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('user_id, username, user_abbreviation, avatar_url')
        .in('user_id', Array.from(userIds));

      if (usersError) {
        console.error('Failed to fetch user data:', usersError);
        // Continue without user data instead of failing completely
      } else {
        users.forEach(user => {
          userMap.set(user.user_id, user);
        });
      }
    }

    // For non-special sorting, we need to transform the raw database data
    const transformedDivisions = divisions.map(division => {
      const manager = division.manager_user_id ? userMap.get(division.manager_user_id) : null;
      const creator = division.created_by ? userMap.get(division.created_by) : null;

      return {
        id: division.division_id,
        name: division.name,
        abbreviation: division.abbreviation,
        status: division.status,
        createdAt: division.created_at,
        manager: manager ? {
          id: manager.user_id,
          name: manager.username,
          abbreviation: manager.user_abbreviation,
          image: manager.avatar_url || '/images/default-avatar.svg'
        } : null,
        createdBy: creator ? {
          id: creator.user_id,
          name: creator.username,
          abbreviation: creator.user_abbreviation
        } : null,
        totalUsers: userCounts.get(division.division_id) || 0 // Calculate actual user count
      };
    });

    // Prepare response
    const response = {
      success: true,
      data: transformedDivisions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext,
        hasPrev
      },
      filters: {
        search: search || null,
        status: statusFilter || null
      },
      sorting: {
        field: sortField,
        direction: sortDirection
      }
    };

    // Update cache with new structure
    if (!divisionsCache) {
      divisionsCache = { data: {}, timestamp: Date.now() };
    }
    divisionsCache.data[cacheKey] = response;
    divisionsCache.timestamp = Date.now();

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { 
          error: 'Server configuration error: Missing Supabase environment variables'
        },
        { status: 500 }
      );
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse request body
    const body = await request.json();
    const { divisionId, status, name, abbreviation, managerId } = body;

    // Validate required fields
    if (!divisionId) {
      return NextResponse.json(
        { 
          error: 'Missing required field: divisionId is required'
        },
        { status: 400 }
      );
    }

    // Determine what type of update this is
    const isStatusUpdate = status !== undefined;
    const isFullUpdate = name !== undefined || abbreviation !== undefined || managerId !== undefined;

    if (!isStatusUpdate && !isFullUpdate) {
      return NextResponse.json(
        { 
          error: 'No valid fields to update provided'
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Handle status update
    if (isStatusUpdate) {
      if (status !== 'Active' && status !== 'Inactive') {
        return NextResponse.json(
          { 
            error: 'Invalid status value. Must be "Active" or "Inactive"'
          },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // Handle full division update
    if (isFullUpdate) {
      if (name !== undefined) {
        if (!name.trim()) {
          return NextResponse.json(
            { 
              error: 'Division name cannot be empty'
            },
            { status: 400 }
          );
        }
        updateData.name = name.trim();
      }

      if (abbreviation !== undefined) {
        if (!abbreviation.trim()) {
          return NextResponse.json(
            { 
              error: 'Division abbreviation cannot be empty'
            },
            { status: 400 }
          );
        }
        updateData.abbreviation = abbreviation.trim().toUpperCase();
      }

      if (managerId !== undefined) {
        // managerId can be empty string (no manager) or a valid UUID
        updateData.manager_user_id = managerId || null;
      }
    }

    // Update the division
    const { data, error } = await supabase
      .from('divisions')
      .update(updateData)
      .eq('division_id', divisionId)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { 
          error: 'Failed to update division',
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { 
          error: 'Division not found'
        },
        { status: 404 }
      );
    }

    // Invalidate cache when a division is updated
    divisionsCache = null;

    // Return appropriate response based on update type
    if (isStatusUpdate && !isFullUpdate) {
      // Status-only update response (existing functionality)
      return NextResponse.json({
        success: true,
        division: {
          id: data.division_id,
          status: data.status
        },
        message: 'Division status updated successfully'
      });
    } else {
      // Full update response
      return NextResponse.json({
        success: true,
        division: {
          id: data.division_id,
          name: data.name,
          abbreviation: data.abbreviation,
          status: data.status,
          manager_user_id: data.manager_user_id,
          updated_at: data.updated_at
        },
        message: 'Division updated successfully'
      });
    }

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { 
          error: 'Server configuration error: Missing Supabase environment variables'
        },
        { status: 500 }
      );
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse request body
    const body = await request.json();
    const { divisionId } = body;

    // Validate required fields
    if (!divisionId) {
      return NextResponse.json(
        { 
          error: 'Missing required field: divisionId is required'
        },
        { status: 400 }
      );
    }

    // First, check if the division exists
    const { data: existingDivision, error: fetchError } = await supabase
      .from('divisions')
      .select('division_id, name')
      .eq('division_id', divisionId)
      .single();

    if (fetchError || !existingDivision) {
      return NextResponse.json(
        { 
          error: 'Division not found'
        },
        { status: 404 }
      );
    }

    // Delete the division
    const { error: deleteError } = await supabase
      .from('divisions')
      .delete()
      .eq('division_id', divisionId);

    if (deleteError) {
      return NextResponse.json(
        { 
          error: 'Failed to delete division',
          details: deleteError.message,
          code: deleteError.code,
          hint: deleteError.hint
        },
        { status: 500 }
      );
    }

    // Invalidate cache when a division is deleted
    divisionsCache = null;

    return NextResponse.json({
      success: true,
      message: `Division "${existingDivision.name}" has been successfully deleted`
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 