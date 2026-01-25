import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const CLEANUP_THRESHOLD_MS = 48 * 60 * 60 * 1000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function createAdminClient(): SupabaseClient {
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
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[cleanup] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500, headers: corsHeaders }
      );
    }

    const expectedAuth = `Bearer ${cronSecret}`;
    if (authHeader !== expectedAuth) {
      console.error('[cleanup] Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    let supabase: SupabaseClient;
    try {
      supabase = createAdminClient();
    } catch {
      console.error('[cleanup] Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('[cleanup] Starting cleanup of unverified users (threshold: 48 hours)');

    const cutoffDate = new Date(Date.now() - CLEANUP_THRESHOLD_MS);
    console.log('[cleanup] Cutoff date:', cutoffDate.toISOString());

    const { data: authData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('[cleanup] Failed to list users:', listError);
      return NextResponse.json(
        { error: listError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    const users = authData?.users ?? [];
    console.log('[cleanup] Total users:', users.length);

    const unverifiedToDelete = users.filter((user) => {
      if (user.email_confirmed_at) {
        return false;
      }

      const createdAt = new Date(user.created_at);
      return createdAt < cutoffDate;
    });

    console.log('[cleanup] Unverified users to delete:', unverifiedToDelete.length);

    const results: {
      deleted: string[];
      failed: { id: string; email: string; error: string }[];
    } = {
      deleted: [],
      failed: [],
    };

    for (const user of unverifiedToDelete) {
      console.log('[cleanup] Deleting user:', user.id, user.email);

      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error('[cleanup] Failed to delete user:', user.id, deleteError);
        results.failed.push({
          id: user.id,
          email: user.email ?? '',
          error: deleteError.message,
        });
      } else {
        console.log('[cleanup] Successfully deleted user:', user.id);
        results.deleted.push(user.id);
      }
    }

    console.log(
      '[cleanup] Cleanup complete. Deleted:',
      results.deleted.length,
      'Failed:',
      results.failed.length
    );

    return NextResponse.json(
      {
        success: true,
        threshold_hours: 48,
        cutoff_date: cutoffDate.toISOString(),
        total_users: users.length,
        deleted_count: results.deleted.length,
        failed_count: results.failed.length,
        deleted: results.deleted,
        failed: results.failed,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[cleanup] Error:', error);
    return NextResponse.json(
      {
        error: 'Cleanup failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
