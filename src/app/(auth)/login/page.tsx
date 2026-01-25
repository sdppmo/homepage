'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { login, signInWithGoogle, signInWithKakao } from './actions';
import { Suspense, useState, useEffect } from 'react';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#000000"
        d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
      />
    </svg>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-5 py-3 text-sm font-medium text-white bg-slate-800 border border-slate-700 rounded-lg cursor-pointer transition-all hover:bg-slate-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending && (
        <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      )}
      <span>이메일로 계속하기</span>
    </button>
  );
}

function SocialButton({ 
  onClick, 
  icon, 
  label, 
  bgColor = 'bg-white',
  textColor = 'text-slate-800',
  borderColor = 'border-slate-200'
}: { 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => setLoading(false), 10000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const handleClick = async () => {
    setLoading(true);
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`w-full px-5 py-3 text-sm font-medium ${textColor} ${bgColor} border ${borderColor} rounded-lg cursor-pointer transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3`}
    >
      {loading ? (
        <span className="block w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></span>
      ) : (
        icon
      )}
      <span>{label}</span>
    </button>
  );
}

function LoginContent() {
  const [state, formAction] = useFormState(login, null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const errorParam = searchParams.get('error');

  const handleGoogleLogin = async () => {
    await signInWithGoogle(redirectUrl);
  };

  const handleKakaoLogin = async () => {
    await signInWithKakao(redirectUrl);
  };

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          송도파트너스피엠오
        </h1>
        <p className="text-slate-400 text-sm">
          K-COL 철골기둥 설계 플랫폼
        </p>
      </div>

      {(state?.error || errorParam) && (
        <div className="mb-6 p-3 text-sm rounded-lg text-center text-red-300 bg-red-500/10 border border-red-500/20">
          {state?.error || (errorParam === 'auth_failed' ? '인증에 실패했습니다. 다시 시도해주세요.' : errorParam)}
        </div>
      )}

      <div className="space-y-3 mb-6">
        <SocialButton
          onClick={handleGoogleLogin}
          icon={<GoogleIcon />}
          label="Google로 계속하기"
          bgColor="bg-white"
          textColor="text-slate-800"
          borderColor="border-slate-200"
        />
        <SocialButton
          onClick={handleKakaoLogin}
          icon={<KakaoIcon />}
          label="카카오로 계속하기"
          bgColor="bg-[#FEE500]"
          textColor="text-[#191919]"
          borderColor="border-[#FEE500]"
        />
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-slate-800 text-slate-500">또는</span>
        </div>
      </div>

      {!showEmailForm ? (
        <button
          type="button"
          onClick={() => setShowEmailForm(true)}
          className="w-full px-5 py-3 text-sm font-medium text-slate-300 bg-transparent border border-slate-700 rounded-lg cursor-pointer transition-all hover:bg-slate-800/50 hover:border-slate-600"
        >
          이메일로 로그인
        </button>
      ) : (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirect" value={redirectUrl} />
          
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="example@company.com"
              required
              autoComplete="email"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-lg bg-slate-900/60 text-slate-100 outline-none transition-all focus:border-slate-500 focus:ring-1 focus:ring-slate-500 placeholder:text-slate-600"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1.5">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-700 rounded-lg bg-slate-900/60 text-slate-100 outline-none transition-all focus:border-slate-500 focus:ring-1 focus:ring-slate-500 placeholder:text-slate-600 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/reset-password" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <SubmitButton />
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
        <p className="text-sm text-slate-500">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-slate-300 hover:text-white font-medium transition-colors">
            회원가입
          </Link>
        </p>
      </div>

    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full max-w-[400px] mx-auto text-center">
      <div className="w-8 h-8 mx-auto border-2 border-slate-600/20 border-t-slate-400 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 text-sm">로딩 중...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
}
