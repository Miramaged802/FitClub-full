-- GYM ACCESS LOGS SETUP
-- This script sets up Row Level Security (RLS) policies for the gym_access_logs table
-- Run this in Supabase SQL Editor after creating the gym_access_logs table

-- Enable RLS on gym_access_logs table (if not already enabled)
ALTER TABLE public.gym_access_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow select own access logs" ON public.gym_access_logs;
DROP POLICY IF EXISTS "Allow insert access logs for gym staff" ON public.gym_access_logs;
DROP POLICY IF EXISTS "Allow select access logs for gym staff" ON public.gym_access_logs;
DROP POLICY IF EXISTS "Allow select access logs for gym managers" ON public.gym_access_logs;
DROP POLICY IF EXISTS "Allow insert access logs for gym managers" ON public.gym_access_logs;

-- Policy 1: Users can view their own access logs
CREATE POLICY "Allow select own access logs" ON public.gym_access_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can insert access logs
-- This allows any authenticated user to log access attempts (for demo purposes)
CREATE POLICY "Allow insert access logs for authenticated users" ON public.gym_access_logs
  FOR INSERT WITH CHECK (
    -- Any authenticated user can log access (for demo/testing)
    auth.role() = 'authenticated'
    OR
    -- Admin users can log access anywhere
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Policy 3: Users can view access logs for gyms they have access to
CREATE POLICY "Allow select access logs for gym access" ON public.gym_access_logs
  FOR SELECT USING (
    -- Users can view their own access logs
    auth.uid() = user_id
    OR
    -- Admin users can view all access logs
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Note: Gym manager policies removed as gym_staff table doesn't exist
-- These can be added later when gym staff management is implemented

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gym_access_logs_scanned_at ON public.gym_access_logs USING btree (scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_gym_access_logs_status ON public.gym_access_logs USING btree (status);
CREATE INDEX IF NOT EXISTS idx_gym_access_logs_access_type ON public.gym_access_logs USING btree (access_type);

-- Create a function to automatically log access attempts
CREATE OR REPLACE FUNCTION public.log_gym_access(
  p_user_id UUID,
  p_gym_id UUID,
  p_access_type TEXT DEFAULT 'qr_scan',
  p_status TEXT DEFAULT 'granted',
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  access_log_id UUID;
BEGIN
  -- Insert the access log
  INSERT INTO public.gym_access_logs (
    user_id,
    gym_id,
    access_type,
    status,
    reason,
    scanned_at
  ) VALUES (
    p_user_id,
    p_gym_id,
    p_access_type,
    p_status,
    p_reason,
    NOW()
  ) RETURNING id INTO access_log_id;
  
  RETURN access_log_id;
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.log_gym_access TO authenticated;

-- Create a view for gym access statistics
CREATE OR REPLACE VIEW public.gym_access_stats AS
SELECT 
  g.id as gym_id,
  g.name as gym_name,
  g.location as gym_location,
  DATE(scanned_at) as access_date,
  COUNT(*) as total_scans,
  COUNT(*) FILTER (WHERE status = 'granted') as granted_access,
  COUNT(*) FILTER (WHERE status = 'denied') as denied_access,
  COUNT(DISTINCT user_id) as unique_users
FROM public.gym_access_logs gal
JOIN public.gyms g ON gal.gym_id = g.id
GROUP BY g.id, g.name, g.location, DATE(scanned_at)
ORDER BY access_date DESC, total_scans DESC;

-- Grant select permission on the view to authenticated users
GRANT SELECT ON public.gym_access_stats TO authenticated;

-- Create a view for user access history
CREATE OR REPLACE VIEW public.user_access_history AS
SELECT 
  gal.id,
  gal.user_id,
  gal.gym_id,
  g.name as gym_name,
  g.location as gym_location,
  gal.access_type,
  gal.status,
  gal.reason,
  gal.scanned_at,
  gal.created_at
FROM public.gym_access_logs gal
JOIN public.gyms g ON gal.gym_id = g.id
ORDER BY gal.scanned_at DESC;

-- Grant select permission on the view to authenticated users
GRANT SELECT ON public.user_access_history TO authenticated;

-- Add RLS to the views
ALTER VIEW public.gym_access_stats SET (security_invoker = true);
ALTER VIEW public.user_access_history SET (security_invoker = true);

-- Insert some sample data for testing (optional)
-- Uncomment the following lines if you want to add sample access logs
/*
INSERT INTO public.gym_access_logs (user_id, gym_id, access_type, status, reason) VALUES
  ('33177cfe-2d54-4964-b81c-9179cb490837', (SELECT id FROM public.gyms LIMIT 1), 'qr_scan', 'granted', NULL),
  ('33177cfe-2d54-4964-b81c-9179cb490837', (SELECT id FROM public.gyms LIMIT 1), 'manual_checkin', 'granted', NULL);
*/

-- Success message
SELECT 'Gym access logs setup completed successfully!' as status;
