import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SIGNUP_RATE_LIMIT = 3;
const SIGNUP_WINDOW_MS = 60 * 1000;

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';
}

interface SignupRequest {
  email: string;
  password: string;
  business_name: string;
  business_number: string;
  phone: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: '비밀번호는 8자 이상이어야 합니다' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '비밀번호에 소문자가 포함되어야 합니다' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '비밀번호에 대문자가 포함되어야 합니다' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '비밀번호에 숫자가 포함되어야 합니다' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: '비밀번호에 특수문자가 포함되어야 합니다' };
  }
  return { valid: true, message: '' };
}

function validateBusinessNumber(bizNum: string): boolean {
  const digits = bizNum.replace(/-/g, '');
  return /^\d{10}$/.test(digits);
}

function validatePhone(phone: string): boolean {
  const digits = phone.replace(/-/g, '');
  return /^\d{10,11}$/.test(digits);
}

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

async function notifyAdmins(
  supabase: SupabaseClient,
  record: {
    id: string;
    email: string;
    business_name: string;
    business_number: string;
    phone: string;
    created_at: string;
  }
) {
  try {
    const { error } = await supabase.functions.invoke('send-admin-alert', {
      body: { record },
    });

    if (error) {
      console.error('[signup] Admin notification error:', error);
    }
  } catch (err) {
    console.error('[signup] Admin notification error:', err);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  if (!rateLimit(`signup:${ip}`, SIGNUP_RATE_LIMIT, SIGNUP_WINDOW_MS)) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again later.' },
      { status: 429, headers: corsHeaders }
    );
  }

  try {
    let supabase: SupabaseClient;
    try {
      supabase = createAdminClient();
    } catch {
      console.error('[signup] Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500, headers: corsHeaders }
      );
    }

    const body: SignupRequest = await request.json();

    const { email, password, business_name, business_number, phone } = body;

    const errors: string[] = [];

    if (!email || !validateEmail(email)) {
      errors.push('유효한 이메일 주소를 입력해주세요');
    }

    const passwordCheck = validatePassword(password || '');
    if (!passwordCheck.valid) {
      errors.push(passwordCheck.message);
    }

    if (!business_name || business_name.trim().length === 0) {
      errors.push('회사명을 입력해주세요');
    }

    if (!business_number || !validateBusinessNumber(business_number)) {
      errors.push('사업자등록번호를 정확히 입력해주세요 (000-00-00000)');
    }

    if (!phone || !validatePhone(phone)) {
      errors.push('전화번호를 정확히 입력해주세요 (010-0000-0000)');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: errors[0],
          errors: errors,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        {
          error: 'user_exists',
          message: '이미 가입된 이메일입니다',
        },
        { status: 409, headers: corsHeaders }
      );
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: password,
      email_confirm: false,
      user_metadata: {
        business_name: business_name.trim(),
        business_number: business_number,
        phone: phone,
      },
    });

    if (authError || !authData.user) {
      console.error('[signup] Auth error:', JSON.stringify(authError));

      const errorMsg = authError?.message?.toLowerCase() || '';
      if (
        errorMsg.includes('already registered') ||
        errorMsg.includes('already been registered') ||
        errorMsg.includes('user already exists') ||
        errorMsg.includes('duplicate')
      ) {
        return NextResponse.json(
          {
            error: 'user_exists',
            message: '이미 가입된 이메일입니다',
          },
          { status: 409, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        {
          error: 'signup_error',
          message: authError?.message || '회원가입 중 오류가 발생했습니다',
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const userId = authData.user.id;
    const now = new Date().toISOString();

    const { error: profileError } = await supabase.from('user_profiles').upsert(
      {
        id: userId,
        email: normalizedEmail,
        business_name: business_name.trim(),
        business_number: business_number,
        phone: phone,
        role: 'user',
        is_approved: false,
        access_beam: false,
        access_column: false,
        created_at: now,
        updated_at: now,
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      console.error('[signup] Profile creation error:', JSON.stringify(profileError));

      if (profileError.code === '23505' || profileError.message?.includes('duplicate')) {
        return NextResponse.json(
          {
            error: 'user_exists',
            message: '이미 가입된 이메일입니다',
          },
          { status: 409, headers: corsHeaders }
        );
      }

      await supabase.auth.admin.deleteUser(userId);

      return NextResponse.json(
        {
          error: 'signup_error',
          message: '프로필 생성 중 오류가 발생했습니다',
        },
        { status: 500, headers: corsHeaders }
      );
    }

    notifyAdmins(supabase, {
      id: userId,
      email: normalizedEmail,
      business_name: business_name.trim(),
      business_number: business_number,
      phone: phone,
      created_at: now,
    });

    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다. 이메일 인증 후 관리자 승인을 기다려주세요.',
        user: {
          id: userId,
          email: normalizedEmail,
        },
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[signup] UNCAUGHT ERROR:', error);
    console.error('[signup] Error stack:', error instanceof Error ? error.stack : 'no stack');
    return NextResponse.json(
      {
        error: 'server_error',
        message: '서버 오류가 발생했습니다',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
