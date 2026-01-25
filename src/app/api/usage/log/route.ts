import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface LogUsageRequest {
  feature_name: string;
  metadata?: Record<string, unknown>;
}

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }
    const token = authHeader.replace('Bearer ', '');

    const body: LogUsageRequest = await request.json();
    const featureName = body.feature_name;

    if (!featureName || typeof featureName !== 'string') {
      return NextResponse.json(
        { error: 'feature_name required' },
        { status: 400, headers: corsHeaders }
      );
    }

    let supabase;
    try {
      supabase = createAdminClient();
    } catch {
      console.error('[log-usage] Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server error' },
        { status: 500, headers: corsHeaders }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401, headers: corsHeaders }
      );
    }

    const { error: insertError } = await supabase.from('usage_logs').insert({
      user_id: user.id,
      feature_name: featureName,
      metadata: body.metadata || {},
    });

    if (insertError) {
      console.error('[log-usage] Failed to log usage:', insertError);
      return NextResponse.json(
        { ok: true, logged: false },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { ok: true, logged: true },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[log-usage] Error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
