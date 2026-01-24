'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lower: false,
    upper: false,
    number: false,
    special: false,
  });
  const [passwordMatch, setPasswordMatch] = useState(false);
  const router = useRouter();

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid()) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName,
          business_number: businessNumber,
          phone: phone,
        },
        emailRedirectTo: `${window.location.origin}/pending`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      sessionStorage.setItem('pending_email', email);
      sessionStorage.setItem('pending_password', password);
      router.push('/pending');
    }
  };

  return (
    <>
      <div className="text-center mb-5">
        <span className="text-xl font-bold bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] bg-clip-text text-transparent tracking-tighter">
          송도파트너스피엠오
        </span>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-[22px] font-bold mb-0 text-slate-50 tracking-tighter">
          회원가입
        </h1>
      </div>

      <form className="flex flex-col gap-3" onSubmit={handleSignup}>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-[13px] font-semibold text-slate-300 tracking-wide"
          >
            이메일 주소 <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="example@company.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 text-[14px] font-inherit border-2 border-slate-600/20 rounded-[10px] bg-slate-900/60 text-slate-100 outline-none transition-all hover:border-slate-600/30 focus:border-[#667eea] focus:bg-slate-900/80 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.15)] placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-[13px] font-semibold text-slate-300 tracking-wide"
          >
            비밀번호 <span className="text-red-400">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="비밀번호 입력"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-[14px] font-inherit border-2 border-slate-600/20 rounded-[10px] bg-slate-900/60 text-slate-100 outline-none transition-all hover:border-slate-600/30 focus:border-[#667eea] focus:bg-slate-900/80 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.15)] placeholder:text-slate-500 pr-12"
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
            비밀번호 확인 <span className="text-red-400">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showPasswordConfirm ? 'text' : 'password'}
              id="passwordConfirm"
              name="passwordConfirm"
              placeholder="비밀번호 재입력"
              required
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full px-3 py-2.5 text-[14px] font-inherit border-2 border-slate-600/20 rounded-[10px] bg-slate-900/60 text-slate-100 outline-none transition-all hover:border-slate-600/30 focus:border-[#667eea] focus:bg-slate-900/80 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.15)] placeholder:text-slate-500 pr-12"
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

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="business"
            className="text-[13px] font-semibold text-slate-300 tracking-wide"
          >
            회사명
          </label>
          <input
            type="text"
            id="business"
            name="business"
            placeholder="회사명을 입력하세요"
            required
            autoComplete="organization"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-3 py-2.5 text-[14px] font-inherit border-2 border-slate-600/20 rounded-[10px] bg-slate-900/60 text-slate-100 outline-none transition-all hover:border-slate-600/30 focus:border-[#667eea] focus:bg-slate-900/80 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.15)] placeholder:text-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="bizNum"
              className="text-[13px] font-semibold text-slate-300 tracking-wide"
            >
              사업자등록번호
            </label>
            <input
              type="text"
              id="bizNum"
              name="bizNum"
              placeholder="000-00-00000"
              maxLength={12}
              required
              value={businessNumber}
              onChange={(e) => setBusinessNumber(e.target.value)}
              className="w-full px-3 py-2.5 text-[14px] font-inherit border-2 border-slate-600/20 rounded-[10px] bg-slate-900/60 text-slate-100 outline-none transition-all hover:border-slate-600/30 focus:border-[#667eea] focus:bg-slate-900/80 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.15)] placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="phone"
              className="text-[13px] font-semibold text-slate-300 tracking-wide"
            >
              전화번호
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="010-0000-0000"
              maxLength={13}
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 text-[14px] font-inherit border-2 border-slate-600/20 rounded-[10px] bg-slate-900/60 text-slate-100 outline-none transition-all hover:border-slate-600/30 focus:border-[#667eea] focus:bg-slate-900/80 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.15)] placeholder:text-slate-500"
            />
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
          <span className={loading ? 'opacity-80' : ''}>가입하기</span>
        </button>
      </form>

      <div className="text-center mt-5 pt-4 border-t border-slate-600/10 text-[13px] text-slate-400">
        이미 계정이 있으신가요?{' '}
        <Link
          href="/login"
          className="text-indigo-400 no-underline font-semibold transition-colors hover:text-indigo-300"
        >
          로그인
        </Link>
      </div>
    </>
  );
}
