import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { rateLimit } from './lib/rate-limit';

const PROTECTED_PATTERNS = [
  '/k-col/auto-find-section',
  '/k-col/calculator',
  '/k-col/boq-report',
  '/k-col/user-guide',
  '/k-col/developer-guide',
  '/k-col/print',
  '/k-col/calc-data-1',
  '/k-col/calc-data-2',
  '/admin',
];

const BLOCKED_PATTERNS = [
  /^\/\.git/,
  /^\/\.env/,
  /\/wp-admin/,
  /\/wp-login/,
  /\.php$/,
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown';
  if (!rateLimit(ip, 10)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  const { user, response } = await updateSession(request);

  const isProtectedRoute = PROTECTED_PATTERNS.some(pattern => 
    pathname.startsWith(pattern)
  );

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
