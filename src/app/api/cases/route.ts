import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search')?.trim() || '';
    const sortField = searchParams.get('sortField') || 'case_added_date';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

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

    // Get all cases first, then do post-processing search for comprehensive functionality
    let query = supabase
      .from('cases')
      .select(`
        case_id,
        client_case_id,
        case_name,
        case_type,
        case_sub_type_id,
        case_status,
        case_priority,
        case_owner_user_id,
        division_id,
        incident_date,
        case_added_date,
        last_updated_date,
        incident_address
      `, { count: 'exact' });

    // Apply basic search filter on main table fields
    if (search) {
      query = query.or(`
        case_name.ilike.%${search}%,
        client_case_id.ilike.%${search}%,
        case_type.ilike.%${search}%,
        case_status.ilike.%${search}%,
        case_priority.ilike.%${search}%,
        incident_address.ilike.%${search}%
      `);
    }

    // Apply sorting
    const ascending = sortDirection === 'asc';
    switch (sortField) {
      case 'case_name':
        query = query.order('case_name', { ascending });
        break;
      case 'client_case_id':
        query = query.order('client_case_id', { ascending });
        break;
      case 'case_type':
        query = query.order('case_type', { ascending });
        break;
      case 'case_status':
        query = query.order('case_status', { ascending });
        break;
      case 'case_priority':
        query = query.order('case_priority', { ascending });
        break;
      case 'incident_date':
        query = query.order('incident_date', { ascending });
        break;
      case 'last_updated_date':
        query = query.order('last_updated_date', { ascending });
        break;
      case 'case_added_date':
      default:
        query = query.order('case_added_date', { ascending });
        break;
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: cases, count, error } = await query;

    if (error) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch cases',
          details: error.message
        },
        { status: 500 }
      );
    }

    if (!cases) {
      return NextResponse.json(
        { 
          error: 'No cases data returned'
        },
        { status: 500 }
      );
    }

    // Fetch related data separately for lookup
    const userIds = [...new Set(cases.map(c => c.case_owner_user_id).filter(Boolean))];
    const divisionIds = [...new Set(cases.map(c => c.division_id).filter(Boolean))];
    const subTypeIds = [...new Set(cases.map(c => c.case_sub_type_id).filter(Boolean))];

    // Fetch users
    let usersMap = new Map();
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('user_id, username, user_abbreviation')
        .in('user_id', userIds);
      
      if (users) {
        users.forEach(user => {
          usersMap.set(user.user_id, user);
        });
      }
    }

    // Fetch divisions
    let divisionsMap = new Map();
    if (divisionIds.length > 0) {
      const { data: divisions } = await supabase
        .from('divisions')
        .select('division_id, name')
        .in('division_id', divisionIds);
      
      if (divisions) {
        divisions.forEach(division => {
          divisionsMap.set(division.division_id, division);
        });
      }
    }

    // Fetch case sub types
    let subTypesMap = new Map();
    if (subTypeIds.length > 0) {
      const { data: subTypes } = await supabase
        .from('case_sub_types')
        .select('id, sub_type, case_type')
        .in('id', subTypeIds);
      
      if (subTypes) {
        subTypes.forEach(subType => {
          subTypesMap.set(subType.id, subType);
        });
      }
    }

    // Transform the data for frontend consumption
    let transformedCases = cases.map((caseItem, index) => {
      const user = usersMap.get(caseItem.case_owner_user_id);
      const division = divisionsMap.get(caseItem.division_id);
      const subType = subTypesMap.get(caseItem.case_sub_type_id);

      return {
        id: caseItem.case_id,
        no: offset + index + 1, // Row number
        name: caseItem.case_name,
        clientId: caseItem.client_case_id || 'None',
        type: caseItem.case_type,
        subType: subType?.sub_type || 'None',
        caseStatus: caseItem.case_status,
        priority: caseItem.case_priority,
        division: division?.name || 'None',
        owner: user ? `${user.username} - ${user.user_abbreviation}` : 'None',
        initOccur: caseItem.incident_date,
        addedDate: caseItem.case_added_date,
        lastUpdated: caseItem.last_updated_date,
        location: caseItem.incident_address || 'None'
      };
    });

    // If search was provided, also search in the transformed data for joined fields
    if (search) {
      const searchLower = search.toLowerCase();
      transformedCases = transformedCases.filter(caseItem => 
        caseItem.name.toLowerCase().includes(searchLower) ||
        caseItem.clientId.toLowerCase().includes(searchLower) ||
        caseItem.type.toLowerCase().includes(searchLower) ||
        caseItem.subType.toLowerCase().includes(searchLower) ||
        caseItem.caseStatus.toLowerCase().includes(searchLower) ||
        caseItem.priority.toLowerCase().includes(searchLower) ||
        caseItem.division.toLowerCase().includes(searchLower) ||
        caseItem.owner.toLowerCase().includes(searchLower) ||
        caseItem.location.toLowerCase().includes(searchLower)
      );

      // Recalculate pagination for search results
      const totalCount = transformedCases.length;
      const totalPages = Math.ceil(totalCount / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // Apply pagination to search results
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      transformedCases = transformedCases.slice(startIndex, endIndex);

      // Update row numbers for paginated search results
      transformedCases = transformedCases.map((caseItem, index) => ({
        ...caseItem,
        no: startIndex + index + 1
      }));

      // Return search results with corrected pagination
      const response = {
        success: true,
        data: transformedCases,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNext,
          hasPrev
        },
        filters: {
          search: search || null
        },
        sorting: {
          field: sortField,
          direction: sortDirection
        }
      };

      return NextResponse.json(response);
    }

    // Calculate pagination metadata
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Prepare response
    const response = {
      success: true,
      data: transformedCases,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext,
        hasPrev
      },
      filters: {
        search: search || null
      },
      sorting: {
        field: sortField,
        direction: sortDirection
      }
    };

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