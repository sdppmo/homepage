import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * OAuth callback handler - exchanges auth code for session.
 * Creates user_profile if it doesn't exist (for OAuth users).
 * Uses host header for redirect URL (NOT request.url which may be Supabase URL).
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  const headersList = await headers();
  const host = headersList.get('host') || 'kcol.kr';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Check if user_profile exists, create if not (for OAuth users)
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      if (!existingProfile) {
        // Create profile for OAuth user
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          email: data.user.email,
          business_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          is_approved: true, // Auto-approve OAuth users
          access_column: true, // Grant default access
          access_beam: false,
          role: 'user',
        });
      }
      
      return NextResponse.redirect(new URL(next, baseUrl));
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', baseUrl));
}
