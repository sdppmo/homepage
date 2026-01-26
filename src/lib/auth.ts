/**
 * Authentication module
 * Handles session management, login/logout, and profile fetching
 */

import { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';

// Types
export interface UserProfile {
  id: string;
  email: string;
  business_name: string | null;
  business_number: string | null;
  phone: string | null;
  is_approved: boolean;
  role: 'user' | 'admin';
  access_beam: boolean;
  access_column: boolean;
  created_at: string;
}

export interface AuthResult {
  session: Session | null;
  profile: UserProfile | null;
}

// State
let sessionCache: Session | null = null;
let profileCache: UserProfile | null = null;
let initialized = false;

/**
 * Initialize auth and set up listeners
 */
async function initialize(): Promise<void> {
  if (initialized) return;
  
  const client = getSupabaseClient();
  
  // Listen for auth state changes
  client.auth.onAuthStateChange((_event, session) => {
    sessionCache = session;
    if (!session) {
      profileCache = null;
    }
  });
  
  // Load initial session
  const { data } = await client.auth.getSession();
  sessionCache = data.session;
  initialized = true;
  
  console.log('[Auth] Initialized');
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  await initialize();
  return sessionCache;
}

/**
 * Get user profile from database
 */
export async function getProfile(): Promise<UserProfile | null> {
  await initialize();
  
  if (!sessionCache?.user) return null;
  if (profileCache) return profileCache;
  
  const client = getSupabaseClient();
  const { data } = await client
    .from('user_profiles')
    .select('id,email,business_name,business_number,phone,is_approved,role,access_beam,access_column,created_at')
    .eq('id', sessionCache.user.id)
    .maybeSingle();
  
  profileCache = data as UserProfile | null;
  return profileCache;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  
  sessionCache = data.session;
  const profile = await getProfile();
  
  return { session: sessionCache, profile };
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, metadata?: Record<string, unknown>): Promise<{ user: User | null; error: Error | null }> {
  const client = getSupabaseClient();
  
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  
  return { user: data.user, error };
}

/**
 * Sign out and clear all auth data
 */
export async function signOut(): Promise<void> {
  const client = getSupabaseClient();
  
  const clearStorage = () => {
    sessionCache = null;
    profileCache = null;
    // Clear Supabase localStorage entries
    Object.keys(localStorage).forEach((key) => {
      if (key.includes('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
  };
  
  try {
    await client.auth.signOut();
    clearStorage();
    window.location.assign('/');
  } catch (err) {
    console.warn('SignOut server error, clearing local storage:', err);
    clearStorage();
    window.location.assign('/');
  }
}

/**
 * Check if current user is admin
 */
export function isAdmin(): boolean {
  return profileCache?.role === 'admin';
}

/**
 * Get display label for current user
 */
export function getUserLabel(): string | null {
  if (profileCache?.business_name) return profileCache.business_name;
  if (sessionCache?.user?.email) return sessionCache.user.email;
  return null;
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
  return sessionCache?.access_token ?? null;
}

/**
 * Clear profile cache (forces re-fetch)
 */
export function clearProfileCache(): void {
  profileCache = null;
  console.log('[Auth] Profile cache cleared');
}

/**
 * Force refresh session from Supabase
 */
export async function refreshSession(): Promise<Session | null> {
  const client = getSupabaseClient();
  profileCache = null;
  
  const { data } = await client.auth.getSession();
  sessionCache = data.session;
  console.log('[Auth] Session refreshed:', sessionCache ? 'valid' : 'none');
  
  return sessionCache;
}

/**
 * Debug: show current auth state
 */
export function debug(): { session: Session | null; profile: UserProfile | null } {
  console.group('[Auth Debug]');
  console.log('Session:', sessionCache);
  console.log('Profile:', profileCache);
  console.log('Token expires:', sessionCache ? new Date(sessionCache.expires_at! * 1000).toLocaleString() : 'N/A');
  console.log('User ID:', sessionCache?.user?.id ?? 'N/A');
  console.log('Email:', sessionCache?.user?.email ?? 'N/A');
  console.log('Is Admin:', isAdmin());
  console.groupEnd();
  
  return { session: sessionCache, profile: profileCache };
}

/**
 * Clear all auth data (nuclear option)
 */
export function clearAll(): void {
  sessionCache = null;
  profileCache = null;
  
  Object.keys(localStorage).forEach((key) => {
    if (key.includes('supabase') || key.includes('sb-')) {
      localStorage.removeItem(key);
      console.log('[Auth] Removed:', key);
    }
  });
  
  console.log('[Auth] All auth data cleared. Reload the page.');
}

// Auto-initialize
initialize().catch((err) => {
  console.warn('[Auth] Init failed:', err.message);
});

// Export auth object for global access (backwards compatibility)
export const auth = {
  getSession,
  getProfile,
  signIn,
  signUp,
  signOut,
  isAdmin,
  getUserLabel,
  getAccessToken,
  clearProfileCache,
  refreshSession,
  debug,
  clearAll,
};

// Attach to window for backwards compatibility with existing HTML
declare global {
  interface Window {
    SDP: {
      auth: typeof auth;
    };
  }
}

if (typeof window !== 'undefined') {
  window.SDP = window.SDP || { auth };
  window.SDP.auth = auth;
}
