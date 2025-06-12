import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;

    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

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

    // Fetch detailed case information
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select(`
        case_id,
        case_name,
        client_case_id,
        case_type,
        case_sub_type_id,
        case_status,
        case_priority,
        case_owner_user_id,
        division_id,
        case_description,
        incident_date,
        case_added_date,
        last_updated_date,
        incident_country,
        incident_state,
        incident_city,
        incident_address,
        gps_coordinates
      `)
      .eq('case_id', caseId)
      .single();

    if (caseError) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch case details',
          details: caseError.message
        },
        { status: 500 }
      );
    }

    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Fetch related data separately
    const [userResult, divisionResult, subTypeResult] = await Promise.all([
      // Fetch user details
      caseData.case_owner_user_id ? supabase
        .from('users')
        .select('user_id, username, user_abbreviation')
        .eq('user_id', caseData.case_owner_user_id)
        .single() : Promise.resolve({ data: null, error: null }),
      
      // Fetch division details
      caseData.division_id ? supabase
        .from('divisions')
        .select('division_id, name')
        .eq('division_id', caseData.division_id)
        .single() : Promise.resolve({ data: null, error: null }),
      
      // Fetch case sub type details
      caseData.case_sub_type_id ? supabase
        .from('case_sub_types')
        .select('id, sub_type, case_type')
        .eq('id', caseData.case_sub_type_id)
        .single() : Promise.resolve({ data: null, error: null })
    ]);

    // Transform the data for frontend consumption
    const transformedCase = {
      id: caseData.case_id,
      name: caseData.case_name,
      clientId: caseData.client_case_id,
      type: caseData.case_type,
      subType: subTypeResult.data?.sub_type || 'None',
      division: divisionResult.data?.name || 'None',
      owner: userResult.data ? `${userResult.data.username} - ${userResult.data.user_abbreviation}` : 'None',
      description: caseData.case_description,
      incidentDate: caseData.incident_date,
      caseAddedDate: caseData.case_added_date,
      lastUpdatedDate: caseData.last_updated_date,
      country: caseData.incident_country,
      state: caseData.incident_state,
      city: caseData.incident_city,
      address: caseData.incident_address,
      gpsCoordinates: caseData.gps_coordinates,
      caseStatus: caseData.case_status,
      priority: caseData.case_priority
    };

    return NextResponse.json(transformedCase);

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