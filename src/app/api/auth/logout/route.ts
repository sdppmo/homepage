import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Server-side logout handler.
 * Properly clears Supabase session cookies via @supabase/ssr.
 * 
 * The client-side signOut() alone doesn't reliably clear server-side cookies,
 * which can cause the user to appear still logged in after page refresh.
 */
export async function POST() {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('[logout] Error signing out:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ success: true });
}
