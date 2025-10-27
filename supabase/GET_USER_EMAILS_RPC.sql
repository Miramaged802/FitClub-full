-- Create a function to get user emails for admins
-- This function allows admins to fetch emails from auth.users table

-- Drop existing function first if it exists
DROP FUNCTION IF EXISTS get_user_emails_for_admin() CASCADE;

-- Create the function with correct return type
CREATE OR REPLACE FUNCTION get_user_emails_for_admin()
RETURNS TABLE (
  user_id uuid,
  email character varying(255),
  email_confirmed_at timestamp with time zone,
  created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can access user emails';
  END IF;

  -- Return emails from auth.users
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  WHERE u.deleted_at IS NULL;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_emails_for_admin() TO authenticated;
