'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { login } from './actions';
import { Suspense, useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-5 py-3 text-[14px] font-semibold font-inherit text-white bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] border-none rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 mt-2 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(102,126,234,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
    >
      {pending && (
        <span className="block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      )}
      <span className={pending ? 'opacity-80' : ''}>로그인</span>
    </button>
  );
}

function LoginContent() {
  const [state, formAction] = useFormState(login, null);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  return (
    <>
      <div className="text-center mb-5">
        <span className="text-xl font-bold bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] bg-clip-text text-transparent tracking-tighter">
          송도파트너스피엠오
        </span>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-[22px] font-bold mb-0 text-slate-50 tracking-tighter">
          로그인
        </h1>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="redirect" value={redirectUrl} />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-[13px] font-semibold text-slate-300 tracking-wide"
          >
            이메일 주소
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="example@company.com"
            required
            autoComplete="email"
            className="w-full px-3.5 py-3 text-base font-inherit border-2 border-slate-600/20 rounded-xl bg-slate-900/60 text-slate-100 outline-none transition-all hover:border-slate-600/30 focus:border-[#667eea] focus:bg-slate-900/80 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.15)] placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="password"
              className="text-[13px] font-semibold text-slate-300 tracking-wide"
            >
              비밀번호
            </label>
            <Link
              href="/reset-password"
              className="text-[14px] font-medium text-indigo-400 no-underline cursor-pointer transition-colors hover:text-indigo-300"
            >
              비밀번호 찾기
            </Link>
          </div>
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              required
              autoComplete="current-password"
              className="w-full px-3.5 py-3 text-base font-inherit border-2 border-slate-600/20 rounded-xl bg-slate-900/60 text-slate-100 outline-none transition-all hover:border-slate-600/30 focus:border-[#667eea] focus:bg-slate-900/80 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.15)] placeholder:text-slate-500 pr-12"
            />
            <button
              type="button"
              className="absolute right-3 bg-none border-none cursor-pointer p-1 text-slate-500 transition-colors hover:text-slate-400"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="비밀번호 보기"
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {state?.error && (
          <div className="p-3.5 text-[14px] rounded-xl text-center leading-normal text-red-300 bg-red-500/10 border border-red-500/20">
            {state.error}
          </div>
        )}

        <SubmitButton />
      </form>

      <div className="text-center mt-5 pt-4 border-t border-slate-600/10 text-[13px] text-slate-400">
        계정이 없으신가요?{' '}
        <Link
          href="/signup"
          className="text-indigo-400 no-underline font-semibold transition-colors hover:text-indigo-300"
        >
          회원가입
        </Link>
      </div>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="text-center">
      <div className="w-8 h-8 mx-auto border-2 border-slate-600/20 border-t-[#667eea] rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-400 text-sm">로딩 중...</p>
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
