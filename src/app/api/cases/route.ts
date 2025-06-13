import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search')?.trim() || '';
    const sortField = searchParams.get('sortField') || 'case_added_date';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase environment variables' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

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
        incident_address,
        incident_country,
        incident_state,
        incident_city,
        case_description,
        gps_coordinates
      `, { count: 'exact' });

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

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: cases, count, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch cases', details: error.message },
        { status: 500 }
      );
    }

    if (!cases) {
      return NextResponse.json(
        { error: 'No cases data returned' },
        { status: 500 }
      );
    }

    const userIds = [...new Set(cases.map(c => c.case_owner_user_id).filter(Boolean))];
    const divisionIds = [...new Set(cases.map(c => c.division_id).filter(Boolean))];
    const subTypeIds = [...new Set(cases.map(c => c.case_sub_type_id).filter(Boolean))];

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

    let transformedCases = cases.map((caseItem, index) => {
      const user = usersMap.get(caseItem.case_owner_user_id);
      const division = divisionsMap.get(caseItem.division_id);
      const subType = subTypesMap.get(caseItem.case_sub_type_id);

      return {
        id: caseItem.case_id,
        no: offset + index + 1,
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
        location: caseItem.incident_address || 'None',
        incident_country: caseItem.incident_country,
        incident_state: caseItem.incident_state,
        incident_city: caseItem.incident_city,
        case_description: caseItem.case_description,
        gps_coordinates: caseItem.gps_coordinates
      };
    });

    if (search) {
      const searchLower = search.toLowerCase();
      
      transformedCases = transformedCases.filter(caseItem => {
        const toSearchableString = (value: any): string => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'string') return value.toLowerCase();
          if (typeof value === 'number') return value.toString();
          if (value instanceof Date) return value.toISOString().toLowerCase();
          return String(value).toLowerCase();
        };

        const formatDateForSearch = (dateString: string | null): string[] => {
          if (!dateString) return [''];
          try {
            const date = new Date(dateString);
            const formats = [
              date.toLocaleDateString('en-US'),
              date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
              date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              date.toISOString().split('T')[0],
              date.getFullYear().toString(),
              date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear(),
              (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getDate().toString().padStart(2, '0') + '/' + date.getFullYear(),
              dateString.toLowerCase(),
              date.toLocaleDateString('en-US', { month: 'short' }).toLowerCase(),
              date.toLocaleDateString('en-US', { month: 'long' }).toLowerCase(),
              date.getDate().toString(),
              (date.getMonth() + 1).toString()
            ];
            return formats;
          } catch {
            return [dateString.toLowerCase()];
          }
        };

        const textFieldMatches = 
          toSearchableString(caseItem.name).includes(searchLower) ||
          toSearchableString(caseItem.clientId).includes(searchLower) ||
          toSearchableString(caseItem.type).includes(searchLower) ||
          toSearchableString(caseItem.subType).includes(searchLower) ||
          toSearchableString(caseItem.caseStatus).includes(searchLower) ||
          toSearchableString(caseItem.priority).includes(searchLower) ||
          toSearchableString(caseItem.division).includes(searchLower) ||
          toSearchableString(caseItem.owner).includes(searchLower) ||
          toSearchableString(caseItem.location).includes(searchLower) ||
          toSearchableString(caseItem.case_description).includes(searchLower) ||
          toSearchableString(caseItem.incident_country).includes(searchLower) ||
          toSearchableString(caseItem.incident_state).includes(searchLower) ||
          toSearchableString(caseItem.incident_city).includes(searchLower);

        const dateFieldMatches = 
          formatDateForSearch(caseItem.initOccur).some(dateStr => dateStr.includes(searchLower)) ||
          formatDateForSearch(caseItem.addedDate).some(dateStr => dateStr.includes(searchLower)) ||
          formatDateForSearch(caseItem.lastUpdated).some(dateStr => dateStr.includes(searchLower));

        return textFieldMatches || dateFieldMatches;
      });

      const totalCount = transformedCases.length;
      const totalPages = Math.ceil(totalCount / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      transformedCases = transformedCases.slice(startIndex, endIndex);

      transformedCases = transformedCases.map((caseItem, index) => ({
        ...caseItem,
        no: startIndex + index + 1
      }));

      return NextResponse.json({
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
      });
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      type,
      subType,
      division,
      description,
      incidentDate,
      country,
      state,
      city,
      address,
      gpsLatitude,
      gpsLongitude,
      caseStatus,
      priority,
      clientId
    } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name and type are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase environment variables' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    let divisionId = null;
    if (division && division.trim() !== '') {
      const { data: divisionData } = await supabase
        .from('divisions')
        .select('division_id')
        .eq('name', division)
        .single();
      
      divisionId = divisionData?.division_id;
    }

    let caseSubTypeId = null;
    if (subType && subType !== 'None' && subType.trim() !== '') {
      const { data: subTypeData } = await supabase
        .from('case_sub_types')
        .select('id')
        .eq('sub_type', subType)
        .eq('case_type', type)
        .single();
      
      caseSubTypeId = subTypeData?.id;
    }

    let gpsCoordinates = null;
    if (gpsLatitude && gpsLongitude) {
      gpsCoordinates = {
        type: 'Point',
        coordinates: [parseFloat(gpsLongitude), parseFloat(gpsLatitude)]
      };
    }

    let defaultUserId = null;
    try {
      const { data: firstUser } = await supabase
        .from('users')
        .select('user_id')
        .limit(1)
        .single();
      defaultUserId = firstUser?.user_id || null;
    } catch (userError) {
      // Handle case where no users exist
    }

    const caseData = {
      case_name: name,
      client_case_id: clientId || null,
      case_type: type,
      case_sub_type_id: caseSubTypeId,
      case_status: caseStatus || 'Open',
      case_priority: priority || 'Low',
      case_owner_user_id: defaultUserId,
      division_id: divisionId,
      case_description: description || null,
      incident_date: incidentDate || null,
      incident_country: country || null,
      incident_state: state || null,
      incident_city: city || null,
      incident_address: address || null,
      gps_coordinates: gpsCoordinates,
      case_added_date: new Date().toISOString(),
      last_updated_date: new Date().toISOString()
    };

    const { data: newCase, error: insertError } = await supabase
      .from('cases')
      .insert(caseData)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { 
          error: 'Failed to create case',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Case created successfully',
      data: {
        id: newCase.case_id,
        name: newCase.case_name
      }
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