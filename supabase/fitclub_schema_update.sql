-- =============================================
-- FitClub Production Schema Update
-- Complete Database Migration Script
-- =============================================
-- This script creates all required tables, indexes, RLS policies, and functions
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. ENABLE EXTENSIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 2. CREATE TABLES
-- =============================================

-- Users/Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  fitness_goals TEXT[],
  subscription_level TEXT DEFAULT 'Basic' CHECK (subscription_level IN ('Basic', 'Premium', 'Elite')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles Table (for admin access control)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2) NOT NULL,
  features TEXT[],
  gym_access_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  membership_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  billing_type TEXT DEFAULT 'monthly' CHECK (billing_type IN ('monthly', 'yearly')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  verification_code TEXT,
  gym_id UUID,
  price DECIMAL(10, 2),
  qr_code_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Transactions Table (Mock Payments Log)
CREATE TABLE IF NOT EXISTS payments_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  plan TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'Credit Card',
  transaction_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gyms Table
CREATE TABLE IF NOT EXISTS gyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Egypt',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  image_url TEXT,
  description TEXT,
  amenities TEXT[],
  operating_hours JSONB,
  contact_phone TEXT,
  contact_email TEXT,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  duration INTEGER, -- in minutes
  gym TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  exercises JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Access Logs Table
CREATE TABLE IF NOT EXISTS qr_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
  scan_time TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'granted' CHECK (status IN ('granted', 'denied')),
  denial_reason TEXT,
  verification_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gym Access Logs Table
CREATE TABLE IF NOT EXISTS gym_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  access_granted BOOLEAN DEFAULT TRUE,
  denial_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles Table (for fitness blog)
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  featured_image TEXT,
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_level ON profiles(subscription_level);

-- User Roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Subscription Plans indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);

-- User Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_membership_id ON user_subscriptions(membership_id);

-- Payments Log indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments_log(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments_log(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments_log(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments_log(created_at DESC);

-- Gyms indexes
CREATE INDEX IF NOT EXISTS idx_gyms_is_active ON gyms(is_active);
CREATE INDEX IF NOT EXISTS idx_gyms_city ON gyms(city);
CREATE INDEX IF NOT EXISTS idx_gyms_rating ON gyms(rating DESC);
CREATE INDEX IF NOT EXISTS idx_gyms_location ON gyms USING GIST(ll_to_earth(latitude, longitude));

-- Workouts indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_gym_id ON workouts(gym_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_status ON workouts(status);

-- QR Access indexes
CREATE INDEX IF NOT EXISTS idx_qr_access_user_id ON qr_access(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_access_gym_id ON qr_access(gym_id);
CREATE INDEX IF NOT EXISTS idx_qr_access_scan_time ON qr_access(scan_time DESC);

-- Gym Access Logs indexes
CREATE INDEX IF NOT EXISTS idx_gym_access_logs_user_id ON gym_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_access_logs_gym_id ON gym_access_logs(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_access_logs_scanned_at ON gym_access_logs(scanned_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Activity Log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- Articles indexes
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);

-- =============================================
-- 4. CREATE FUNCTIONS
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. CREATE TRIGGERS
-- =============================================

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for subscription_plans updated_at
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_subscriptions updated_at
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for gyms updated_at
DROP TRIGGER IF EXISTS update_gyms_updated_at ON gyms;
CREATE TRIGGER update_gyms_updated_at
  BEFORE UPDATE ON gyms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for workouts updated_at
DROP TRIGGER IF EXISTS update_workouts_updated_at ON workouts;
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for articles updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-create profile on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- =============================================
-- USER ROLES POLICIES
-- =============================================

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage all roles
CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL
  USING (is_admin(auth.uid()));

-- =============================================
-- SUBSCRIPTION PLANS POLICIES
-- =============================================

-- Anyone can view active subscription plans
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = TRUE OR is_admin(auth.uid()));

-- Only admins can modify subscription plans
CREATE POLICY "Admins can modify subscription plans"
  ON subscription_plans FOR ALL
  USING (is_admin(auth.uid()));

-- =============================================
-- USER SUBSCRIPTIONS POLICIES
-- =============================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own subscriptions
CREATE POLICY "Users can create their own subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update their own subscriptions"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON user_subscriptions FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can modify all subscriptions
CREATE POLICY "Admins can modify all subscriptions"
  ON user_subscriptions FOR ALL
  USING (is_admin(auth.uid()));

-- =============================================
-- PAYMENTS LOG POLICIES
-- =============================================

-- Users can view their own payment logs
CREATE POLICY "Users can view their own payment logs"
  ON payments_log FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own payment logs
CREATE POLICY "Users can create their own payment logs"
  ON payments_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all payment logs
CREATE POLICY "Admins can view all payment logs"
  ON payments_log FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can modify all payment logs
CREATE POLICY "Admins can modify all payment logs"
  ON payments_log FOR ALL
  USING (is_admin(auth.uid()));

-- =============================================
-- GYMS POLICIES
-- =============================================

-- Anyone can view active gyms
CREATE POLICY "Anyone can view active gyms"
  ON gyms FOR SELECT
  USING (is_active = TRUE OR is_admin(auth.uid()));

-- Only admins can modify gyms
CREATE POLICY "Admins can modify gyms"
  ON gyms FOR ALL
  USING (is_admin(auth.uid()));

-- =============================================
-- WORKOUTS POLICIES
-- =============================================

-- Users can view their own workouts
CREATE POLICY "Users can view their own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own workouts
CREATE POLICY "Users can create their own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own workouts
CREATE POLICY "Users can update their own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own workouts
CREATE POLICY "Users can delete their own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- QR ACCESS POLICIES
-- =============================================

-- Users can view their own QR access logs
CREATE POLICY "Users can view their own QR access logs"
  ON qr_access FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create QR access logs
CREATE POLICY "Users can create QR access logs"
  ON qr_access FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all QR access logs
CREATE POLICY "Admins can view all QR access logs"
  ON qr_access FOR SELECT
  USING (is_admin(auth.uid()));

-- =============================================
-- GYM ACCESS LOGS POLICIES
-- =============================================

-- Users can view their own gym access logs
CREATE POLICY "Users can view their own gym access logs"
  ON gym_access_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create gym access logs
CREATE POLICY "Users can create gym access logs"
  ON gym_access_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all gym access logs
CREATE POLICY "Admins can view all gym access logs"
  ON gym_access_logs FOR SELECT
  USING (is_admin(auth.uid()));

-- =============================================
-- NOTIFICATIONS POLICIES
-- =============================================

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can create notifications for any user
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- ACTIVITY LOG POLICIES
-- =============================================

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

-- System can create activity logs
CREATE POLICY "System can create activity logs"
  ON activity_log FOR INSERT
  WITH CHECK (TRUE);

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
  ON activity_log FOR SELECT
  USING (is_admin(auth.uid()));

-- =============================================
-- ARTICLES POLICIES
-- =============================================

-- Anyone can view published articles
CREATE POLICY "Anyone can view published articles"
  ON articles FOR SELECT
  USING (is_published = TRUE OR is_admin(auth.uid()) OR auth.uid() = author_id);

-- Authors can create articles
CREATE POLICY "Authors can create articles"
  ON articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own articles
CREATE POLICY "Authors can update their own articles"
  ON articles FOR UPDATE
  USING (auth.uid() = author_id);

-- Admins can modify all articles
CREATE POLICY "Admins can modify all articles"
  ON articles FOR ALL
  USING (is_admin(auth.uid()));

-- =============================================
-- 7. INSERT INITIAL DATA
-- =============================================

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, description, price_monthly, price_yearly, features, gym_access_description, is_active)
VALUES
  (
    uuid_generate_v4(),
    'Basic',
    'Perfect for getting started with your fitness journey',
    29.99,
    299.99,
    ARRAY['Access to 100+ gyms', 'Basic workout plans', 'Mobile app access', 'Email support'],
    '100+ Gyms',
    TRUE
  ),
  (
    uuid_generate_v4(),
    'Premium',
    'For serious fitness enthusiasts who want more',
    49.99,
    499.99,
    ARRAY['Access to 500+ gyms', 'Personalized workout plans', 'Nutrition guidance', 'Priority support', 'Group classes', 'Mobile app access'],
    '500+ Gyms',
    TRUE
  ),
  (
    uuid_generate_v4(),
    'Elite',
    'Ultimate fitness experience with all premium features',
    79.99,
    799.99,
    ARRAY['Access to ALL gyms nationwide', 'Personal trainer sessions', 'Advanced nutrition plans', 'Premium support', 'All group classes', 'Spa & wellness access', 'Mobile app access', 'Exclusive events'],
    'ALL Gyms Nationwide',
    TRUE
  )
ON CONFLICT DO NOTHING;

-- Insert sample gyms
INSERT INTO gyms (name, location, address, city, latitude, longitude, image_url, description, amenities, is_active)
VALUES
  (
    'Gold''s Gym New Cairo',
    'New Cairo, Cairo',
    'Street 90, Fifth Settlement',
    'Cairo',
    30.0330,
    31.4331,
    'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'Premium fitness facility with state-of-the-art equipment',
    ARRAY['Cardio Equipment', 'Weight Training', 'Group Classes', 'Personal Training', 'Locker Rooms', 'Sauna'],
    TRUE
  ),
  (
    'California Gym Zamalek',
    'Zamalek, Cairo',
    '26th July Street',
    'Cairo',
    30.0626,
    31.2178,
    'https://images.pexels.com/photos/13106586/pexels-photo-13106586.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'Modern gym in the heart of Zamalek',
    ARRAY['Cardio Equipment', 'Weight Training', 'Swimming Pool', 'Yoga Studio', 'Spa', 'Cafe'],
    TRUE
  ),
  (
    'FitZone Heliopolis',
    'Heliopolis, Cairo',
    'El Merghany Street',
    'Cairo',
    30.0871,
    31.3273,
    'https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    '24/7 fitness center with premium amenities',
    ARRAY['24/7 Access', 'Cardio Equipment', 'Weight Training', 'CrossFit Box', 'Personal Training'],
    TRUE
  )
ON CONFLICT DO NOTHING;

-- =============================================
-- 8. CREATE VIEWS FOR ANALYTICS
-- =============================================

-- View for admin dashboard: Users per plan
CREATE OR REPLACE VIEW users_per_plan AS
SELECT
  sp.name AS plan_name,
  COUNT(DISTINCT us.user_id) AS user_count,
  SUM(CASE WHEN us.billing_type = 'monthly' THEN sp.price_monthly ELSE sp.price_yearly END) AS total_revenue
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active'
GROUP BY sp.name, sp.id
ORDER BY user_count DESC;

-- View for payment analytics
CREATE OR REPLACE VIEW payment_analytics AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS transaction_count,
  SUM(amount) AS total_amount,
  AVG(amount) AS average_amount,
  COUNT(DISTINCT user_id) AS unique_users
FROM payments_log
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- View for gym usage statistics
CREATE OR REPLACE VIEW gym_usage_stats AS
SELECT
  g.id,
  g.name,
  g.city,
  COUNT(gal.id) AS total_visits,
  COUNT(DISTINCT gal.user_id) AS unique_visitors,
  DATE_TRUNC('month', gal.scanned_at) AS month
FROM gyms g
LEFT JOIN gym_access_logs gal ON g.id = gal.gym_id
GROUP BY g.id, g.name, g.city, DATE_TRUNC('month', gal.scanned_at)
ORDER BY total_visits DESC;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '✅ FitClub Schema Update Complete!';
  RAISE NOTICE '📊 Tables created: profiles, user_roles, subscription_plans, user_subscriptions, payments_log, gyms, workouts, qr_access, gym_access_logs, notifications, activity_log, articles';
  RAISE NOTICE '🔒 RLS policies enabled on all tables';
  RAISE NOTICE '📈 Indexes created for optimal performance';
  RAISE NOTICE '⚡ Triggers and functions configured';
  RAISE NOTICE '💾 Initial data inserted (subscription plans and sample gyms)';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next Steps:';
  RAISE NOTICE '1. Verify all tables exist: SELECT tablename FROM pg_tables WHERE schemaname = ''public'';';
  RAISE NOTICE '2. Test RLS policies with your application';
  RAISE NOTICE '3. Create your first admin user by inserting into user_roles table';
  RAISE NOTICE '4. Configure Supabase environment variables in your app';
END $$;

