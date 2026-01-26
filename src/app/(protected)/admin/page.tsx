'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/db/types';
import {
  listUsers,
  updateUser,
  createUser,
  deleteUser,
  getUsageStats,
} from './actions';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  useEffect(() => {
    async function getAdminProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setAdminProfile({
          id: user.id,
          email: user.email!,
          role: 'admin',
          is_approved: true,
          access_column: true,
          access_beam: true,
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at,
        });
      }
    }
    getAdminProfile();
  }, [supabase.auth]);

  useEffect(() => {
    if (activeTab === 'users') {
      startTransition(async () => {
        const data = await listUsers();
        setUsers(data);
      });
    } else if (activeTab === 'analytics') {
      startTransition(async () => {
        const data = await getUsageStats('7d');
        setUsageStats(data);
      });
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.business_name &&
        user.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUpdateUser = async (
    userId: string,
    updates: Partial<UserProfile>
  ) => {
    startTransition(async () => {
      await updateUser(userId, updates);
      const data = await listUsers();
      setUsers(data);
    });
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    startTransition(async () => {
      await deleteUser(userId);
      const data = await listUsers();
      setUsers(data);
    });
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.currentTarget);
    const updates: Partial<UserProfile> = {
      email: formData.get('email') as string,
      business_name: formData.get('business_name') as string,
      phone: formData.get('phone') as string,
    };

    startTransition(async () => {
      await updateUser(editingUser.id, updates);
      const data = await listUsers();
      setUsers(data);
      setEditingUser(null);
    });
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      business_name: formData.get('business_name') as string,
      phone: formData.get('phone') as string,
      is_approved: formData.get('is_approved') === 'on',
      is_admin: formData.get('is_admin') === 'on',
      access_column: formData.get('access_column') === 'on',
      access_beam: formData.get('access_beam') === 'on',
    };

    startTransition(async () => {
      try {
        await createUser(data);
        e.currentTarget.reset();
        setActiveTab('users');
      } catch (error: any) {
        alert(error.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans">
      {/* ... header and tabs ... */}

      <main className="p-6 max-w-7xl mx-auto">
        {activeTab === 'users' && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 mb-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-semibold">사용자 관리</span>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-md max-w-xs">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 text-slate-400"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent border-none text-slate-50 text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
            {isPending ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">
                        사용자
                      </th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">
                        가입일
                      </th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">
                        상태
                      </th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">
                        권한
                      </th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-700/30 hover:bg-slate-800/30"
                      >
                        <td className="p-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-slate-50">
                              {user.business_name || '사용자'}
                            </span>
                            <span className="text-xs text-slate-400">
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-slate-300">
                          {new Date(user.created_at).toLocaleDateString(
                            'ko-KR',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                user.is_approved
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-red-500/10 text-red-400'
                              }`}
                            >
                              {user.is_approved ? '승인됨' : '대기중'}
                            </span>
                            {user.role === 'admin' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-400">
                                관리자
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <label className="flex items-center gap-2">
                              <div className="relative w-8 h-4.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={user.is_approved}
                                  onChange={(e) =>
                                    handleUpdateUser(user.id, {
                                      is_approved: e.target.checked,
                                    })
                                  }
                                />
                                <div className="absolute inset-0 bg-slate-700/30 rounded-full transition-all peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:to-purple-600"></div>
                                <div className="absolute w-3.5 h-3.5 left-0.5 bottom-0.5 bg-slate-50 rounded-full transition-all peer-checked:translate-x-3.5"></div>
                              </div>
                              <span className="text-xs text-slate-400">
                                승인
                              </span>
                            </label>
                            <label className="flex items-center gap-2">
                              <div className="relative w-8 h-4.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={user.role === 'admin'}
                                  onChange={(e) =>
                                    handleUpdateUser(user.id, {
                                      role: e.target.checked
                                        ? 'admin'
                                        : 'user',
                                    })
                                  }
                                />
                                <div className="absolute inset-0 bg-slate-700/30 rounded-full transition-all peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:to-purple-600"></div>
                                <div className="absolute w-3.5 h-3.5 left-0.5 bottom-0.5 bg-slate-50 rounded-full transition-all peer-checked:translate-x-3.5"></div>
                              </div>
                              <span className="text-xs text-slate-400">
                                관리자
                              </span>
                            </label>
                            <label className="flex items-center gap-2">
                              <div className="relative w-8 h-4.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={user.access_column}
                                  onChange={(e) =>
                                    handleUpdateUser(user.id, {
                                      access_column: e.target.checked,
                                    })
                                  }
                                />
                                <div className="absolute inset-0 bg-slate-700/30 rounded-full transition-all peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:to-purple-600"></div>
                                <div className="absolute w-3.5 h-3.5 left-0.5 bottom-0.5 bg-slate-50 rounded-full transition-all peer-checked:translate-x-3.5"></div>
                              </div>
                              <span className="text-xs text-slate-400">
                                Column
                              </span>
                            </label>
                            <label className="flex items-center gap-2">
                              <div className="relative w-8 h-4.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={user.access_beam}
                                  onChange={(e) =>
                                    handleUpdateUser(user.id, {
                                      access_beam: e.target.checked,
                                    })
                                  }
                                />
                                <div className="absolute inset-0 bg-slate-700/30 rounded-full transition-all peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:to-purple-600"></div>
                                <div className="absolute w-3.5 h-3.5 left-0.5 bottom-0.5 bg-slate-50 rounded-full transition-all peer-checked:translate-x-3.5"></div>
                              </div>
                              <span className="text-xs text-slate-400">
                                Beam
                              </span>
                            </label>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="px-2 py-1 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded transition-all hover:bg-indigo-500/20"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="px-2 py-1 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded transition-all hover:bg-red-500/20"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 mb-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-semibold">새 사용자 생성</span>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                <input
                  type="email"
                  name="email"
                  placeholder="이메일"
                  required
                  className="px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-md text-slate-50 text-sm outline-none focus:border-indigo-500 placeholder:text-slate-400"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="비밀번호"
                  required
                  className="px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-md text-slate-50 text-sm outline-none focus:border-indigo-500 placeholder:text-slate-400"
                />
                <input
                  type="text"
                  name="business_name"
                  placeholder="회사명"
                  className="px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-md text-slate-50 text-sm outline-none focus:border-indigo-500 placeholder:text-slate-400"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="전화번호"
                  maxLength={13}
                  className="px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-md text-slate-50 text-sm outline-none focus:border-indigo-500 placeholder:text-slate-400"
                />
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2">
                  <div className="relative w-10 h-5.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_approved"
                      className="sr-only peer"
                    />
                    <div className="absolute inset-0 bg-slate-700/30 rounded-full transition-all peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:to-purple-600"></div>
                    <div className="absolute w-4.5 h-4.5 left-0.5 bottom-0.5 bg-slate-50 rounded-full transition-all peer-checked:translate-x-4.5"></div>
                  </div>
                  <span className="text-xs text-slate-400">승인됨</span>
                </label>
                <label className="flex items-center gap-2">
                  <div className="relative w-10 h-5.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_admin"
                      className="sr-only peer"
                    />
                    <div className="absolute inset-0 bg-slate-700/30 rounded-full transition-all peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:to-purple-600"></div>
                    <div className="absolute w-4.5 h-4.5 left-0.5 bottom-0.5 bg-slate-50 rounded-full transition-all peer-checked:translate-x-4.5"></div>
                  </div>
                  <span className="text-xs text-slate-400">관리자</span>
                </label>
                <label className="flex items-center gap-2">
                  <div className="relative w-10 h-5.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="access_column"
                      className="sr-only peer"
                    />
                    <div className="absolute inset-0 bg-slate-700/30 rounded-full transition-all peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:to-purple-600"></div>
                    <div className="absolute w-4.5 h-4.5 left-0.5 bottom-0.5 bg-slate-50 rounded-full transition-all peer-checked:translate-x-4.5"></div>
                  </div>
                  <span className="text-xs text-slate-400">Column</span>
                </label>
                <label className="flex items-center gap-2">
                  <div className="relative w-10 h-5.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="access_beam"
                      className="sr-only peer"
                    />
                    <div className="absolute inset-0 bg-slate-700/30 rounded-full transition-all peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:to-purple-600"></div>
                    <div className="absolute w-4.5 h-4.5 left-0.5 bottom-0.5 bg-slate-50 rounded-full transition-all peer-checked:translate-x-4.5"></div>
                  </div>
                  <span className="text-xs text-slate-400">Beam</span>
                </label>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? '생성 중...' : '사용자 생성'}
                </button>
              </div>
            </form>
          </div>
        )}


        {activeTab === 'analytics' && (
          <div>
            <div className="flex gap-2 mb-5">
              <button className="px-4 py-2 text-sm font-medium text-slate-400 bg-slate-800/60 border border-slate-700/50 rounded-md transition-all hover:text-slate-300 hover:border-slate-700/80">
                3일
              </button>
              <button className="px-4 py-2 text-sm font-medium text-slate-50 bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent rounded-md transition-all">
                7일
              </button>
              <button className="px-4 py-2 text-sm font-medium text-slate-400 bg-slate-800/60 border border-slate-700/50 rounded-md transition-all hover:text-slate-300 hover:border-slate-700/80">
                30일
              </button>
            </div>

            {isPending || !usageStats ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
                    <div className="text-sm text-slate-400 mb-2">
                      전체 사용자
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                      {usageStats.summary.total_users}
                    </div>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
                    <div className="text-sm text-slate-400 mb-2">
                      오늘 활성 사용자
                    </div>
                    <div className="text-3xl font-bold text-slate-50">
                      {usageStats.summary.active_today}
                    </div>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
                    <div className="text-sm text-slate-400 mb-2">
                      총 접근 수
                    </div>
                    <div className="text-3xl font-bold text-slate-50">
                      {usageStats.summary.total_accesses}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
                    <div className="text-sm font-semibold text-slate-50 mb-4">
                      기능별 사용량
                    </div>
                    <div className="relative h-64 flex items-center justify-center text-slate-400">
                      차트 준비 중...
                    </div>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
                    <div className="text-sm font-semibold text-slate-50 mb-4">
                      일별 사용량
                    </div>
                    <div className="relative h-64 flex items-center justify-center text-slate-400">
                      차트 준비 중...
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base font-semibold">
                      사용자별 활동
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">
                            사용자
                          </th>
                          <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">
                            회사명
                          </th>
                          <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">
                            접근 횟수
                          </th>
                          <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">
                            활동
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageStats.user_activity.map((user: any) => (
                          <tr
                            key={user.email}
                            className="border-b border-slate-700/30 hover:bg-slate-800/30"
                          >
                            <td className="p-3 text-sm text-slate-300">
                              {user.email}
                            </td>
                            <td className="p-3 text-sm text-slate-300">
                              {user.business_name}
                            </td>
                            <td className="p-3 text-sm text-slate-300">
                              {user.access_count}
                            </td>
                            <td className="p-3">
                              <div className="h-2 bg-slate-700/30 rounded-full overflow-hidden min-w-[100px]">
                                <div
                                  className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full"
                                  style={{
                                    width: `${
                                      (user.access_count /
                                        Math.max(
                                          ...usageStats.user_activity.map(
                                            (u: any) => u.access_count
                                          )
                                        )) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700/50 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-50">
                사용자 정보 수정
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-300"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6"
                >
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  이메일
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingUser.email}
                  className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-md text-slate-50 text-sm outline-none focus:border-indigo-500 placeholder:text-slate-400"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  회사명
                </label>
                <input
                  type="text"
                  name="business_name"
                  defaultValue={editingUser.business_name || ''}
                  className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-md text-slate-50 text-sm outline-none focus:border-indigo-500 placeholder:text-slate-400"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  전화번호
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingUser.phone || ''}
                  maxLength={13}
                  className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-md text-slate-50 text-sm outline-none focus:border-indigo-500 placeholder:text-slate-400"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-400 bg-slate-700/30 rounded-md transition-all hover:bg-slate-700/50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md transition-opacity hover:opacity-90"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

