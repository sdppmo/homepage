/**
 * Application configuration
 * These values are safe to expose in the frontend
 */

export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iwudkwhafyrhgzuntdgm.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  protectedPaths: [
    '/pages/k-col web software/',
    '/pages/K-product/2H_steel_product.html',
    '/pages/admin.html',
  ],
} as const;

export type Config = typeof config;
