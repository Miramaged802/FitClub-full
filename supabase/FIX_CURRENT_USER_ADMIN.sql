-- =============================================
-- FIX CURRENT USER ADMIN ROLE
-- =============================================
-- This script assigns admin role to the current user
-- Based on debug info: admin@fitclub.com (ID: 4a68df33-1901-4c2a-aa0f-024f611c13b7)

-- =============================================
-- STEP 1: ASSIGN ADMIN ROLE TO CURRENT USER
-- =============================================
-- Assign admin role to the user you're logging in with
INSERT INTO user_roles (user_id, role) 
VALUES ('4a68df33-1901-4c2a-aa0f-024f611c13b7', 'admin') 
ON CONFLICT (user_id, role) DO NOTHING;

-- =============================================
-- STEP 2: VERIFY ADMIN ROLE ASSIGNMENT
-- =============================================
-- Check if the admin role was assigned successfully
SELECT 
  u.email,
  ur.role,
  p.first_name,
  p.last_name
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.id = '4a68df33-1901-4c2a-aa0f-024f611c13b7';

-- =============================================
-- STEP 3: TEST IS_ADMIN FUNCTION
-- =============================================
-- Test if the is_admin function now returns true for this user
SELECT is_admin('4a68df33-1901-4c2a-aa0f-024f611c13b7') as is_admin_user;

-- =============================================
-- STEP 4: CHECK ALL ADMIN USERS
-- =============================================
-- See all users with admin role
SELECT 
  u.email,
  ur.role,
  p.first_name,
  p.last_name
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN profiles p ON u.id = p.user_id
WHERE ur.role = 'admin';

-- =============================================
-- QUICK SETUP INSTRUCTIONS
-- =============================================
/*
1. Run the INSERT statement to assign admin role
2. Run the verification query to confirm
3. Test the is_admin function
4. Try admin login again at: http://localhost:5173/admin/login
*/

DO $$ 
BEGIN
  RAISE NOTICE '✅ Assigning admin role to user: admin@fitclub.com';
  RAISE NOTICE '🔍 User ID: 4a68df33-1901-4c2a-aa0f-024f611c13b7';
  RAISE NOTICE '🎯 After running this script, try admin login again';
END $$;
