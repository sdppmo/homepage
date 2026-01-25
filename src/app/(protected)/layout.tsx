import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/db/users';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ROUTE_PERMISSIONS: Record<string, 'access_column' | 'access_beam' | null> = {
  '/k-col/auto-find-section': 'access_column',
  '/k-col/calculator': 'access_column',
  '/k-col/boq-report': 'access_column',
  '/k-col/developer-guide': 'access_column',
  '/k-col/print': 'access_column',
  '/k-col/calc-data-1': 'access_column',
  '/k-col/calc-data-2': 'access_column',
  '/admin': null,
};

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getUserProfile(user.id);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">프로필 오류</h1>
          <p className="text-gray-700">
            사용자 프로필을 찾을 수 없습니다. 관리자에게 문의하세요.
          </p>
        </div>
      </div>
    );
  }

  if (!profile.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">승인 대기 중</h1>
          <p className="text-gray-700 mb-4">
            계정이 아직 승인되지 않았습니다. 관리자의 승인을 기다려주세요.
          </p>
          <p className="text-sm text-gray-500">
            승인이 완료되면 이메일로 알림을 받으실 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
