import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * Determines the base URL from request headers.
 * Checks x-forwarded-host first (set by load balancers), then host header.
 * Falls back to NEXT_PUBLIC_SITE_URL env var if available.
 */
function getBaseUrl(headersList: Headers): string {
  // Check x-forwarded-host first (more reliable behind load balancers)
  const forwardedHost = headersList.get('x-forwarded-host');
  const host = forwardedHost || headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  
  if (host) {
    return `${protocol}://${host}`;
  }
  
  // Fallback to environment variable if set
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Last resort fallback
  return 'https://kcol.kr';
}

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
  const baseUrl = getBaseUrl(headersList);

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
