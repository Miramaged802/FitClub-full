-- =============================================
-- DEBUG ADMIN ROLES
-- =============================================
-- This script will help you identify admin users and debug role issues

-- =============================================
-- STEP 1: CHECK ALL USERS AND THEIR ROLES
-- =============================================
-- This will show all users and their roles
SELECT 
  u.id,
  u.email,
  u.created_at,
  ur.role,
  p.first_name,
  p.last_name
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- =============================================
-- STEP 2: CHECK SPECIFICALLY FOR ADMIN USERS
-- =============================================
-- This will show only users with admin role
SELECT 
  u.id,
  u.email,
  ur.role,
  p.first_name,
  p.last_name
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN profiles p ON u.id = p.user_id
WHERE ur.role = 'admin';

-- =============================================
-- STEP 3: CHECK USER ROLES TABLE STRUCTURE
-- =============================================
-- This will show the structure of user_roles table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
AND table_schema = 'public';

-- =============================================
-- STEP 4: TEST IS_ADMIN FUNCTION
-- =============================================
-- Test the is_admin function for each user
-- Replace 'USER_ID_HERE' with actual user IDs from step 1
SELECT 
  u.email,
  u.id,
  is_admin(u.id) as is_admin_user
FROM auth.users u;

-- =============================================
-- STEP 5: CHECK RLS POLICIES
-- =============================================
-- Check if RLS policies are set up correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_roles';

-- =============================================
-- TROUBLESHOOTING STEPS
-- =============================================
/*
1. Run Step 1 to see all users and their roles
2. Identify which user has admin role
3. Check if you're logging in with the correct email
4. If no admin users exist, create one:
   INSERT INTO user_roles (user_id, role) 
   VALUES ('USER_ID_HERE', 'admin') 
   ON CONFLICT (user_id, role) DO NOTHING;
5. Test the is_admin function for your user ID
*/

DO $$ 
BEGIN
  RAISE NOTICE '🔍 Step 1: Check all users and their roles';
  RAISE NOTICE '👑 Step 2: Check specifically for admin users';
  RAISE NOTICE '📋 Step 3: Check user_roles table structure';
  RAISE NOTICE '🧪 Step 4: Test is_admin function for each user';
  RAISE NOTICE '🔒 Step 5: Check RLS policies';
END $$;
