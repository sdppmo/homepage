import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[linear-gradient(135deg,#1a1a2e_0%,#16213e_50%,#1a1a2e_100%)] text-slate-200 relative overflow-hidden">
      <div className="fixed w-[400px] h-[400px] bg-[#667eea] rounded-full blur-[80px] opacity-30 -top-[100px] -right-[100px] pointer-events-none"></div>
      <div className="fixed w-[300px] h-[300px] bg-[#764ba2] rounded-full blur-[80px] opacity-30 -bottom-[50px] -left-[50px] pointer-events-none"></div>

      <Link
        href="/"
        className="fixed top-4 left-4 flex items-center gap-1.5 text-[13px] font-medium text-slate-400 hover:text-slate-100 px-3 py-2 bg-slate-800/80 backdrop-blur-md border border-slate-600/10 rounded-lg transition-all hover:bg-slate-800/80 hover:border-slate-600/20 z-10"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[18px] h-[18px]"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        홈으로 돌아가기
      </Link>

      <div className="w-full max-w-[380px] bg-slate-800/85 backdrop-blur-xl border border-slate-600/10 rounded-2xl p-8 shadow-2xl relative z-0">
        {children}
      </div>
    </div>
  );
}
