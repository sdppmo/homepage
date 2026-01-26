/**
 * Supabase client for client-side usage (browser)
 * Uses @supabase/ssr for proper cookie handling
 */

import { createBrowserClient } from '@supabase/ssr';
import { config } from '../config';

export function createClient() {
  return createBrowserClient(
    config.supabase.url,
    config.supabase.anonKey
  );
}
