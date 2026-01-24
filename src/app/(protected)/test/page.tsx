import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function TestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Protected Test Page
        </h1>
        <div className="space-y-3 text-gray-600">
          <p className="text-sm">
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p className="text-sm">
            <span className="font-semibold">User ID:</span> {user.id}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Auth Status:</span>{' '}
            <span className="text-green-600 font-semibold">Authenticated</span>
          </p>
        </div>
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">
            ✅ Server-side authentication successful!
          </p>
        </div>
      </div>
    </div>
  );
}
