-- =============================================
-- FitClub Schema Fix Script
-- Run this BEFORE the main schema update if you have existing tables
-- =============================================

-- Drop all existing tables and dependencies in correct order
DROP TABLE IF EXISTS gym_access_logs CASCADE;
DROP TABLE IF EXISTS qr_access CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS payments_log CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS gyms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;

-- Drop any existing views
DROP VIEW IF EXISTS users_per_plan CASCADE;
DROP VIEW IF EXISTS payment_analytics CASCADE;
DROP VIEW IF EXISTS gym_usage_stats CASCADE;

-- Now the fitclub_schema_update.sql script will create everything fresh
RAISE NOTICE '✅ All existing tables and functions dropped successfully!';
RAISE NOTICE '📋 Now run the fitclub_schema_update.sql script';

