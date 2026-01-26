'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PendingPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();
  const supabase = createClient();

  const handleVerificationComplete = useCallback(() => {
    sessionStorage.removeItem('pending_email');
    router.replace('/login?verified=true');
  }, [router]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('pending_email');
    if (!storedEmail) {
      router.replace('/signup');
      return;
    }
    setEmail(storedEmail);
    setLoading(false);

    const interval = setInterval(async () => {
      const response = await fetch('/api/auth/verify-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: storedEmail }),
      });
      const data = await response.json();

      if (data.verified) {
        clearInterval(interval);
        setVerified(true);
        handleVerificationComplete();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router, handleVerificationComplete]);

  const handleResendEmail = async () => {
    if (!email) return;
    setResendLoading(true);
    setResendMessage(null);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/pending`,
      },
    });

    if (error) {
      setResendMessage({ type: 'error', text: error.message });
    } else {
      setResendMessage({
        type: 'success',
        text: '인증 메일을 재발송했습니다. 메일함을 확인해주세요.',
      });
      setCountdown(60);
    }
    setResendLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-blue-500/10">
          <span className="block w-8 h-8 border-3 border-blue-500/20 border-t-[#667eea] rounded-full animate-spin"></span>
        </div>
        <h1 className="text-[22px] font-bold mb-3 text-slate-50 tracking-tighter">
          확인 중...
        </h1>
        <p className="text-[14px] text-slate-400 leading-relaxed">
          계정 상태를 확인하고 있습니다.
        </p>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-500/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4ade80"
            strokeWidth="2"
            className="w-10 h-10"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1 className="text-[22px] font-bold mb-3 text-slate-50 tracking-tighter">
          이메일 인증 완료!
        </h1>
        <p className="text-[14px] text-slate-400 leading-relaxed">
          로그인 페이지로 이동합니다...
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-orange-500/10">
        <div className="relative w-20 h-20">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fb923c"
            strokeWidth="2"
            className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[mailPulse_2s_ease-in-out_infinite]"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 flex gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#fb923c] rounded-full animate-[dotBounce_1.4s_ease-in-out_infinite]"></span>
            <span className="w-1.5 h-1.5 bg-[#fb923c] rounded-full animate-[dotBounce_1.4s_ease-in-out_infinite_0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-[#fb923c] rounded-full animate-[dotBounce_1.4s_ease-in-out_infinite_0.4s]"></span>
          </div>
        </div>
      </div>
      <h1 className="text-[22px] font-bold mb-3 text-slate-50 tracking-tighter">
        이메일 인증 대기 중
      </h1>
      <p className="text-[14px] text-slate-400 leading-relaxed mb-2">
        아래 이메일로 인증 링크를 발송했습니다.
      </p>
      <div className="font-medium text-[#60a5fa] bg-blue-500/10 px-4 py-2 rounded-md inline-block my-3">
        {email}
      </div>
      <p className="text-[14px] text-slate-400 leading-relaxed mb-2">
        메일함에서 인증 링크를 클릭해주세요.
      </p>
      <p className="text-[12px] text-slate-500">스팸함도 확인해주세요.</p>

      <div className="mt-5 p-4 bg-slate-600/10 rounded-lg">
        <div className="text-[13px] text-slate-500 mb-2">
          인증 메일을 받지 못하셨나요?
        </div>
        <div
          className={`text-[28px] font-bold tabular-nums ${
            countdown === 0 ? 'text-green-400' : 'text-slate-400'
          }`}
        >
          {countdown}
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3">
        {countdown === 0 && (
          <button
            onClick={handleResendEmail}
            disabled={resendLoading}
            className="w-full px-6 py-3 text-[14px] font-medium font-inherit text-white bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] border-none rounded-lg cursor-pointer transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? '발송 중...' : '인증 메일 재발송'}
          </button>
        )}
        <button
          onClick={() => {
            sessionStorage.removeItem('pending_email');
            router.replace('/signup');
          }}
          className="w-full px-6 py-3 text-[14px] font-medium font-inherit text-slate-400 bg-slate-600/20 border border-slate-600/20 rounded-lg cursor-pointer transition-all hover:bg-slate-600/30"
        >
          다른 이메일로 가입
        </button>
      </div>

      {resendMessage && (
        <div
          className={`mt-4 p-3 rounded-lg text-[13px] ${
            resendMessage.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {resendMessage.text}
        </div>
      )}
    </div>
  );
}
