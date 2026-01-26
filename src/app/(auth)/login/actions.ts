'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

function getBaseUrl(headersList: Headers): string {
  const forwardedHost = headersList.get('x-forwarded-host');
  const host = forwardedHost || headersList.get('host');
  
  // Determine protocol - localhost should use http
  let protocol = headersList.get('x-forwarded-proto') || 'https';
  if (host?.includes('localhost')) {
    protocol = 'http';
  }
  
  if (host) {
    return `${protocol}://${host}`;
  }
  
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  return 'https://kcol.kr';
}

interface LoginState {
  error?: string;
}

export async function login(prevState: LoginState | null, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectUrl = (formData.get('redirect') as string) || '/';

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 모두 입력해주세요.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }
    return { error: error.message };
  }

  redirect(redirectUrl);
}

export async function signInWithGoogle(redirectTo: string = '/') {
  const supabase = await createClient();
  const headersList = await headers();
  const baseUrl = getBaseUrl(headersList);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: 'OAuth URL을 생성할 수 없습니다.' };
}

export async function signInWithKakao(redirectTo: string = '/') {
  const supabase = await createClient();
  const headersList = await headers();
  const baseUrl = getBaseUrl(headersList);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: 'OAuth URL을 생성할 수 없습니다.' };
}
