-- User Profiles RLS Migration (Option A: RLS + BEFORE UPDATE trigger)
-- No is_admin() function required - simpler approach

-- ============================================
-- Enable RLS on user_profiles
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Drop existing policies (clean slate)
-- ============================================
DROP POLICY IF EXISTS "Block direct access" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins full access" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own safe fields" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Block direct insert" ON user_profiles;
DROP POLICY IF EXISTS "User self select" ON user_profiles;
DROP POLICY IF EXISTS "User self update" ON user_profiles;
DROP POLICY IF EXISTS "Service role insert" ON user_profiles;

-- ============================================
-- RLS Policies for user_profiles
-- ============================================

-- SELECT: Users can read their own profile
CREATE POLICY "user_profiles_select_own"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- UPDATE: Users can update their own profile (trigger blocks sensitive fields)
CREATE POLICY "user_profiles_update_own"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- INSERT: Only service_role can insert (Edge Functions)
CREATE POLICY "user_profiles_insert_service"
ON user_profiles FOR INSERT
TO service_role
WITH CHECK (true);

-- DELETE: Only service_role can delete (Edge Functions)
CREATE POLICY "user_profiles_delete_service"
ON user_profiles FOR DELETE
TO service_role
USING (true);

-- service_role bypasses RLS, so admins use Edge Functions for:
-- - Reading all profiles
-- - Updating any profile
-- - Deleting profiles

-- ============================================
-- BEFORE UPDATE trigger to block sensitive columns
-- Runs as SECURITY DEFINER to ensure it always executes
-- ============================================
CREATE OR REPLACE FUNCTION prevent_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow service_role to update anything (admin operations via Edge Functions)
    IF current_setting('role', true) = 'service_role' THEN
        RETURN NEW;
    END IF;
    
    -- Block changes to sensitive columns for regular users
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'Cannot modify role field';
    END IF;
    
    IF NEW.is_approved IS DISTINCT FROM OLD.is_approved THEN
        RAISE EXCEPTION 'Cannot modify is_approved field';
    END IF;
    
    IF NEW.access_beam IS DISTINCT FROM OLD.access_beam THEN
        RAISE EXCEPTION 'Cannot modify access_beam field';
    END IF;
    
    IF NEW.access_column IS DISTINCT FROM OLD.access_column THEN
        RAISE EXCEPTION 'Cannot modify access_column field';
    END IF;
    
    IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Cannot modify id field';
    END IF;
    
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        RAISE EXCEPTION 'Cannot modify email field';
    END IF;
    
    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Cannot modify created_at field';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger
DROP TRIGGER IF EXISTS prevent_self_promotion ON user_profiles;
CREATE TRIGGER prevent_self_promotion
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_privilege_escalation();

-- ============================================
-- Clean up: Remove is_admin() if it exists
-- ============================================
DROP FUNCTION IF EXISTS is_admin();

-- ============================================
-- Fix usage_logs policies (optional cleanup)
-- ============================================
DROP POLICY IF EXISTS "Users can view own usage logs" ON usage_logs;
