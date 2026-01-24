'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lower: false,
    upper: false,
    number: false,
    special: false,
  });
  const [passwordMatch, setPasswordMatch] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    if (!token || type !== 'recovery') {
    }
  }, [token, type]);

  useEffect(() => {
    validatePassword(password);
    setPasswordMatch(password === passwordConfirm && password !== '');
  }, [password, passwordConfirm]);

  const validatePassword = (pwd: string) => {
    setPasswordRequirements({
      length: pwd.length >= 8,
      lower: /[a-z]/.test(pwd),
      upper: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });
  };

  const isPasswordValid = () => {
    return (
      Object.values(passwordRequirements).every(Boolean) && passwordMatch
    );
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid()) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as HTMLFormElement).email.value;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-green-500/10 bg-[linear-gradient(135deg,#22c55e_0%,#16a34a_100%)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 text-white"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2 className="text-[20px] font-bold text-slate-50 mb-2">
          {token ? '비밀번호가 변경되었습니다' : '이메일을 확인해주세요'}
        </h2>
        <p className="text-[14px] text-slate-400 leading-relaxed mb-5">
          {token
            ? '새로운 비밀번호로 로그인해주세요.'
            : '비밀번호 재설정 링크가 포함된 이메일을 발송했습니다.'}
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-white no-underline rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(102,126,234,0.4)]"
        >
          로그인 페이지로 이동
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <>
        <div className="text-center mb-6">
          <h1 className="text-[22px] font-bold mb-0 text-slate-50 tracking-tighter">
            비밀번호 찾기
          </h1>
          <p className="text-[14px] text-slate-400 leading-relaxed mt-2">
            가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSendResetEmail}>
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

          {error && (
            <div className="p-3.5 text-[14px] rounded-xl text-center leading-normal text-red-300 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3 text-[14px] font-semibold font-inherit text-white bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] border-none rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 mt-2 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(102,126,234,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading && (
              <span className="block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
            <span className={loading ? 'opacity-80' : ''}>
              재설정 링크 보내기
            </span>
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-[22px] font-bold mb-0 text-slate-50 tracking-tighter">
          새 비밀번호 설정
        </h1>
        <p className="text-[14px] text-slate-400 leading-relaxed mt-2">
          새로운 비밀번호를 입력해주세요.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-[13px] font-semibold text-slate-300 tracking-wide"
          >
            새 비밀번호
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="새 비밀번호 입력"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <div className="grid grid-cols-3 gap-x-1.5 gap-y-0.5 mt-1 p-1.5 bg-slate-900/40 rounded-md border border-slate-600/10">
            <div
              className={`flex items-center gap-1 text-[11px] transition-colors ${
                passwordRequirements.length ? 'text-green-400' : 'text-slate-500'
              }`}
            >
              <span className="text-[12px] transition-all">
                {passwordRequirements.length ? '●' : '○'}
              </span>{' '}
              8자 이상
            </div>
            <div
              className={`flex items-center gap-1 text-[11px] transition-colors ${
                passwordRequirements.lower ? 'text-green-400' : 'text-slate-500'
              }`}
            >
              <span className="text-[12px] transition-all">
                {passwordRequirements.lower ? '●' : '○'}
              </span>{' '}
              소문자 (a-z)
            </div>
            <div
              className={`flex items-center gap-1 text-[11px] transition-colors ${
                passwordRequirements.upper ? 'text-green-400' : 'text-slate-500'
              }`}
            >
              <span className="text-[12px] transition-all">
                {passwordRequirements.upper ? '●' : '○'}
              </span>{' '}
              대문자 (A-Z)
            </div>
            <div
              className={`flex items-center gap-1 text-[11px] transition-colors ${
                passwordRequirements.number ? 'text-green-400' : 'text-slate-500'
              }`}
            >
              <span className="text-[12px] transition-all">
                {passwordRequirements.number ? '●' : '○'}
              </span>{' '}
              숫자 (0-9)
            </div>
            <div
              className={`flex items-center gap-1 text-[11px] transition-colors ${
                passwordRequirements.special ? 'text-green-400' : 'text-slate-500'
              }`}
            >
              <span className="text-[12px] transition-all">
                {passwordRequirements.special ? '●' : '○'}
              </span>{' '}
              특수문자
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="passwordConfirm"
            className="text-[13px] font-semibold text-slate-300 tracking-wide"
          >
            새 비밀번호 확인
          </label>
          <div className="relative flex items-center">
            <input
              type={showPasswordConfirm ? 'text' : 'password'}
              id="passwordConfirm"
              name="passwordConfirm"
              placeholder="새 비밀번호 재입력"
              required
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full px-3.5 py-3 text-base font-inherit border-2 border-slate-600/20 rounded-xl bg-slate-900/60 text-slate-100 outline-none transition-all hover:border-slate-600/30 focus:border-[#667eea] focus:bg-slate-900/80 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.15)] placeholder:text-slate-500 pr-12"
            />
            <button
              type="button"
              className="absolute right-3 bg-none border-none cursor-pointer p-1 text-slate-500 transition-colors hover:text-slate-400"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              aria-label="비밀번호 보기"
            >
              {showPasswordConfirm ? (
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
          <div
            className={`text-[13px] mt-2 font-medium ${
              passwordMatch ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {passwordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
          </div>
        </div>

        {error && (
          <div className="p-3.5 text-[14px] rounded-xl text-center leading-normal text-red-300 bg-red-500/10 border border-red-500/20">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isPasswordValid()}
          className="w-full px-5 py-3 text-[14px] font-semibold font-inherit text-white bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] border-none rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 mt-2 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(102,126,234,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading && (
            <span className="block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          )}
          <span className={loading ? 'opacity-80' : ''}>
            비밀번호 변경하기
          </span>
        </button>
      </form>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
