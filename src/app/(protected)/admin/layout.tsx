import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/db/users';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getUserProfile(user.id);

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans">
        <div className="text-center max-w-md p-10">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f87171"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <h1 className="text-slate-50 text-2xl font-bold mb-3">접근 불가</h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            관리자 권한이 필요합니다.
            <br />이 페이지는 관리자만 접근할 수 있습니다.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg font-semibold transition-opacity hover:opacity-90"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
