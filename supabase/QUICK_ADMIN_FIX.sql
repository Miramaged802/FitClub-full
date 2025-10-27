-- =============================================
-- QUICK ADMIN USER FIX
-- =============================================
-- This script will help you quickly set up an admin user
-- Run this in Supabase SQL Editor

-- =============================================
-- STEP 1: CHECK IF USERS EXIST
-- =============================================
-- First, let's see all users in your system
SELECT 
  id,
  email,
  created_at
FROM auth.users 
ORDER BY created_at DESC;

-- If no users are returned, you need to create a user first!
-- Go to: Supabase Dashboard → Authentication → Users → Add User
-- OR register through your app at: http://localhost:5173/register

-- =============================================
-- STEP 2: ASSIGN ADMIN ROLE
-- =============================================
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from the query above
-- You can copy the ID from the results above

-- Example: If your user ID is '12345678-1234-1234-1234-123456789abc'
-- Uncomment and modify the line below:

-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('12345678-1234-1234-1234-123456789abc', 'admin') 
-- ON CONFLICT (user_id, role) DO NOTHING;

-- =============================================
-- STEP 3: VERIFY ADMIN ROLE
-- =============================================
-- After running the INSERT above, verify the admin role was assigned
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
-- STEP 4: TEST ADMIN FUNCTION
-- =============================================
-- Test if the is_admin function works (replace with your user ID)
-- SELECT is_admin('YOUR_USER_ID_HERE') as is_admin_user;

-- =============================================
-- QUICK SETUP INSTRUCTIONS
-- =============================================
/*
IF NO USERS EXIST:
1. Go to Supabase Dashboard → Authentication → Users → Add User
2. Enter email: admin@fitclub.com
3. Enter password: admin123456
4. Click "Add User"
5. Copy the generated user ID
6. Use that ID in the INSERT statement below

IF USERS EXIST:
1. Run the first query to see all users
2. Copy the user ID of the user you want to make admin
3. Uncomment and modify the INSERT statement with your user ID
4. Run the INSERT statement
5. Run the verification query to confirm
6. Test admin login at: http://localhost:5173/admin/login
*/

DO $$ 
BEGIN
  RAISE NOTICE '🔍 Step 1: Run the first query to see all users';
  RAISE NOTICE '📝 Step 2: Copy your user ID from the results';
  RAISE NOTICE '✏️ Step 3: Uncomment and modify the INSERT statement';
  RAISE NOTICE '▶️ Step 4: Run the INSERT statement';
  RAISE NOTICE '✅ Step 5: Test admin login';
END $$;
