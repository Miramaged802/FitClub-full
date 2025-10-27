-- =============================================
-- FitClub Admin User Setup Script
-- =============================================
-- This script helps you create admin users for the FitClub platform
-- Run this in Supabase SQL Editor after setting up your database

-- =============================================
-- STEP 1: CREATE ADMIN USER (Manual Process)
-- =============================================
-- First, you need to create a user through Supabase Auth
-- Go to: Supabase Dashboard → Authentication → Users → Add User
-- Or register through your app and get the user ID

-- =============================================
-- STEP 2: ASSIGN ADMIN ROLE
-- =============================================
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from Supabase Auth
-- You can find user IDs in: Supabase Dashboard → Authentication → Users

-- Example: Make a user an admin
INSERT INTO user_roles (user_id, role) 
VALUES ('YOUR_USER_ID_HERE', 'admin') 
ON CONFLICT (user_id, role) DO NOTHING;

-- =============================================
-- STEP 3: VERIFY ADMIN ROLE
-- =============================================
-- Check if the user has admin role
SELECT 
  u.email,
  ur.role,
  p.first_name,
  p.last_name
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN profiles p ON u.id = p.user_id
WHERE ur.role = 'admin';

-- =============================================
-- STEP 4: CREATE MULTIPLE ADMIN USERS (Optional)
-- =============================================
-- If you have multiple user IDs, you can add them all as admins

-- Example for multiple admins:
-- INSERT INTO user_roles (user_id, role) VALUES 
--   ('user-id-1', 'admin'),
--   ('user-id-2', 'admin'),
--   ('user-id-3', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- =============================================
-- STEP 5: CREATE STAFF USERS (Optional)
-- =============================================
-- You can also create staff users who can access gym scanner but not admin dashboard

-- Example: Make a user a staff member
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('STAFF_USER_ID_HERE', 'staff') 
-- ON CONFLICT (user_id, role) DO NOTHING;

-- =============================================
-- STEP 6: ADMIN FUNCTIONS VERIFICATION
-- =============================================
-- Test the admin functions
SELECT is_admin('YOUR_USER_ID_HERE') as is_admin_user;

-- =============================================
-- STEP 7: SECURITY CHECK
-- =============================================
-- Verify that RLS policies are working correctly
-- This should only return users with admin role
SELECT 
  u.id,
  u.email,
  ur.role,
  p.first_name,
  p.last_name
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN profiles p ON u.id = p.user_id
WHERE ur.role IN ('admin', 'staff')
ORDER BY ur.role, p.first_name;

-- =============================================
-- TROUBLESHOOTING
-- =============================================

-- If you get "user not found" error:
-- 1. Make sure the user exists in auth.users
-- 2. Check the user ID is correct (copy from Supabase Dashboard)
-- 3. Ensure the user has a profile in the profiles table

-- If admin login doesn't work:
-- 1. Verify the user has 'admin' role in user_roles table
-- 2. Check that the is_admin() function works
-- 3. Ensure RLS policies are set up correctly

-- To remove admin access:
-- DELETE FROM user_roles WHERE user_id = 'USER_ID_HERE' AND role = 'admin';

-- To check all user roles:
-- SELECT u.email, ur.role FROM auth.users u 
-- JOIN user_roles ur ON u.id = ur.user_id 
-- ORDER BY ur.role, u.email;

-- =============================================
-- QUICK SETUP INSTRUCTIONS
-- =============================================
/*
1. Register a user in your FitClub app or create one in Supabase Dashboard
2. Copy the user ID from Supabase Dashboard → Authentication → Users
3. Replace 'YOUR_USER_ID_HERE' in the INSERT statement above
4. Run the INSERT statement in Supabase SQL Editor
5. Test admin login at: http://localhost:5173/admin/login
6. Access admin dashboard at: http://localhost:5173/admin
*/
-- 123456@mira

DO $$ 
BEGIN
  RAISE NOTICE '✅ Admin user setup script ready!';
  RAISE NOTICE '📝 Remember to replace YOUR_USER_ID_HERE with actual user ID';
  RAISE NOTICE '🔐 Admin login: http://localhost:5173/admin/login';
  RAISE NOTICE '📊 Admin dashboard: http://localhost:5173/admin';
END $$;
