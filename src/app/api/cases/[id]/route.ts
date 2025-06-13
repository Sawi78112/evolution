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
      type: caseData.case_type || subTypeResult.data?.case_type || '',
      subType: subTypeResult.data?.sub_type || '',
      division: divisionResult.data?.name || '',
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

export async function DELETE(
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

    // First check if the case exists
    const { data: existingCase, error: fetchError } = await supabase
      .from('cases')
      .select('case_id, case_name')
      .eq('case_id', caseId)
      .single();

    if (fetchError || !existingCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Delete the case
    const { error: deleteError } = await supabase
      .from('cases')
      .delete()
      .eq('case_id', caseId);

    if (deleteError) {
      return NextResponse.json(
        { 
          error: 'Failed to delete case',
          details: deleteError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Case "${existingCase.case_name}" has been successfully deleted`,
      deletedCaseId: caseId
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;
    const body = await request.json();

    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
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

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase environment variables' },
        { status: 500 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if case exists
    const { data: existingCase, error: fetchError } = await supabase
      .from('cases')
      .select('case_id')
      .eq('case_id', caseId)
      .single();

    if (fetchError || !existingCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Look up division ID
    let divisionId = null;
    if (division) {
      const { data: divisionData } = await supabase
        .from('divisions')
        .select('division_id')
        .eq('name', division)
        .single();
      divisionId = divisionData?.division_id;
    }

    // Look up case sub type ID
    let caseSubTypeId = null;
    if (subType && subType !== 'None') {
      const { data: subTypeData } = await supabase
        .from('case_sub_types')
        .select('id')
        .eq('sub_type', subType)
        .eq('case_type', type)
        .single();
      caseSubTypeId = subTypeData?.id;
    }

    // Create GPS coordinates if provided
    let gpsCoordinates = null;
    if (gpsLatitude && gpsLongitude) {
      gpsCoordinates = {
        type: 'Point',
        coordinates: [parseFloat(gpsLongitude), parseFloat(gpsLatitude)]
      };
    }

    // Update the case
    const { data: updatedCase, error: updateError } = await supabase
      .from('cases')
      .update({
        case_name: name,
        client_case_id: clientId || null,
        case_type: type,
        case_sub_type_id: caseSubTypeId,
        case_status: caseStatus,
        case_priority: priority,
        division_id: divisionId,
        case_description: description || null,
        incident_date: incidentDate || null,
        incident_country: country || null,
        incident_state: state || null,
        incident_city: city || null,
        incident_address: address || null,
        gps_coordinates: gpsCoordinates,
        last_updated_date: new Date().toISOString()
      })
      .eq('case_id', caseId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { 
          error: 'Failed to update case',
          details: updateError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Case updated successfully',
      data: {
        id: updatedCase.case_id,
        name: updatedCase.case_name
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