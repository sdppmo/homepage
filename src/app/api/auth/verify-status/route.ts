import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  if (!rateLimit(ip, 5)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: corsHeaders }
    );
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400, headers: corsHeaders }
    );
  }

  const { email } = body;

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Valid email address required' },
      { status: 400, headers: corsHeaders }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('check_email_verified', {
    email_address: email.toLowerCase().trim(),
  });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500, headers: corsHeaders }
    );
  }

  return NextResponse.json({ verified: data }, { headers: corsHeaders });
}
