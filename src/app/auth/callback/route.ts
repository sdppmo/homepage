import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * OAuth callback handler - exchanges auth code for session.
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
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(new URL(next, baseUrl));
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', baseUrl));
}
