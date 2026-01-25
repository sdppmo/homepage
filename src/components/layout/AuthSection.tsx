'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  role: string;
  business_name: string;
}

const AuthSection = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 1500)
        );
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as Awaited<ReturnType<typeof supabase.auth.getSession>>;
        
        if (!isMounted) return;
        
        if (session?.user) {
          setUser(session.user);
          supabase
            .from('user_profiles')
            .select('role, business_name')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              if (isMounted) setProfile(profile);
            });
        }
      } catch {
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        
        if (session?.user) {
          setUser(session.user);
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, business_name')
            .eq('id', session.user.id)
            .single();
          if (isMounted) setProfile(profile);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="mt-3 p-4 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl shadow-lg">
      {!user ? (
        <div className="flex gap-2.5">
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ease-in-out bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.6)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            로그인
          </Link>
          <Link
            href="/signup"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-white/20 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ease-in-out bg-white/10 text-white hover:bg-white/20 hover:-translate-y-0.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            회원가입
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-bold text-lg">
              {profile?.business_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-white font-semibold truncate">
                {profile?.business_name || 'User'}
              </span>
              <span className="text-gray-400 text-xs truncate">
                {user.email}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-[#667eea]/50 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ease-in-out bg-[#667eea]/20 text-[#667eea] hover:bg-[#667eea]/30"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                관리자
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-red-500/50 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ease-in-out bg-red-500/20 text-red-500 hover:bg-red-500/30"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthSection;
