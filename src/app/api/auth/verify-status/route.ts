import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email } = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('check_email_verified', {
    email_address: email,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ verified: data });
}
