-- Migration: Remove auto-profile trigger
-- 
-- Changes:
-- 1. Drop the handle_new_user trigger that auto-creates profiles on signup
--    (Profiles are now created on pending.html after email verification)
--
-- Note: The pg_cron job for cleanup must be set up manually via Supabase Dashboard
-- because it requires the SERVICE_ROLE_KEY which should not be in migrations.

-- ============================================
-- Remove the auto-profile creation trigger
-- ============================================

-- Drop the trigger on auth.users (if it exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Note: Keeping the handle_new_user function for potential rollback
-- To fully remove: DROP FUNCTION IF EXISTS public.handle_new_user();


-- ============================================
-- MANUAL STEP REQUIRED: Set up pg_cron job
-- ============================================
-- 
-- After applying this migration, set up the cleanup cron job manually:
--
-- 1. Go to Supabase Dashboard → Database → Extensions
--    Enable: pg_cron, pg_net
--
-- 2. Go to SQL Editor and run (replace YOUR_PROJECT_REF and YOUR_SERVICE_ROLE_KEY):
--
-- SELECT cron.schedule(
--   'cleanup-unverified-users',
--   '0 3 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-unverified-users',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--     body := '{}'::jsonb
--   );
--   $$
-- );
--
-- 3. Verify the job is scheduled:
--    SELECT * FROM cron.job;
