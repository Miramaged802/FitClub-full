-- =============================================
-- 🚀 FitClub - ONE-CLICK COMPLETE SETUP SCRIPT
-- Run this SINGLE script in Supabase SQL Editor
-- It will clean up old tables and create everything fresh
-- =============================================

-- =============================================
-- STEP 1: CLEANUP (حذف الجداول القديمة)
-- =============================================

DO $$ 
BEGIN
  RAISE NOTICE '🧹 Cleaning up old tables...';
END $$;

-- Drop all existing tables in correct order
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
DROP TABLE IF EXISTS users CASCADE;

-- Drop old functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS generate_membership_id() CASCADE;
DROP FUNCTION IF EXISTS generate_verification_code() CASCADE;

-- Drop old views
DROP VIEW IF EXISTS users_per_plan CASCADE;
DROP VIEW IF EXISTS payment_analytics CASCADE;
DROP VIEW IF EXISTS gym_usage_stats CASCADE;

DO $$ 
BEGIN
  RAISE NOTICE '✅ Cleanup complete!';
  RAISE NOTICE '🔨 Creating new schema...';
END $$;

-- =============================================
-- STEP 2: CREATE NEW SCHEMA (إنشاء المخطط الجديد)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- User Roles Table
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name)
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE NOT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'paused')),
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Log Table (Mock Payment Records)
CREATE TABLE IF NOT EXISTS payments_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  plan TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT DEFAULT 'mock',
  transaction_reference TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gyms Table
CREATE TABLE IF NOT EXISTS gyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  image_url TEXT,
  description TEXT,
  amenities TEXT[],
  opening_hours JSONB,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  access_level TEXT DEFAULT 'Basic' CHECK (access_level IN ('Basic', 'Premium', 'Elite')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  calories_burned INTEGER,
  exercises JSONB,
  video_url TEXT,
  workout_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Access Table
CREATE TABLE IF NOT EXISTS qr_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE NOT NULL,
  scan_time TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'granted' CHECK (status IN ('granted', 'denied')),
  denial_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gym Access Logs Table
CREATE TABLE IF NOT EXISTS gym_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE NOT NULL,
  access_type TEXT CHECK (access_type IN ('qr_scan', 'manual_checkin', 'auto')),
  status TEXT CHECK (status IN ('granted', 'denied')),
  reason TEXT,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
  RAISE NOTICE '✅ Tables created successfully!';
  RAISE NOTICE '🔐 Setting up security policies...';
END $$;

-- =============================================
-- STEP 3: ENABLE RLS (تفعيل سياسات الأمان)
-- =============================================

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
-- STEP 4: CREATE HELPER FUNCTIONS (إنشاء الدوال المساعدة)
-- =============================================

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

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STEP 5: CREATE TRIGGERS (إنشاء المشغلات)
-- =============================================

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Similar triggers for other tables
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gyms_updated_at
  BEFORE UPDATE ON gyms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STEP 6: CREATE RLS POLICIES (إنشاء سياسات RLS)
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin(auth.uid()));

-- Subscription plans policies (public read)
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage subscription plans"
  ON subscription_plans FOR ALL
  USING (is_admin(auth.uid()));

-- User subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON user_subscriptions FOR SELECT
  USING (is_admin(auth.uid()));

-- Payments log policies
CREATE POLICY "Users can view their own payments"
  ON payments_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment records"
  ON payments_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON payments_log FOR SELECT
  USING (is_admin(auth.uid()));

-- Gyms policies (public read)
CREATE POLICY "Anyone can view active gyms"
  ON gyms FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage gyms"
  ON gyms FOR ALL
  USING (is_admin(auth.uid()));

-- Workouts policies
CREATE POLICY "Users can view their own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- QR Access policies
CREATE POLICY "Users can view their own QR access logs"
  ON qr_access FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create QR access records"
  ON qr_access FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all QR access"
  ON qr_access FOR SELECT
  USING (is_admin(auth.uid()));

-- Gym access logs policies
CREATE POLICY "Users can view their own gym access logs"
  ON gym_access_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create gym access logs"
  ON gym_access_logs FOR INSERT
  WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Activity log policies
CREATE POLICY "Users can view their own activity"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create activity logs"
  ON activity_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all activity"
  ON activity_log FOR SELECT
  USING (is_admin(auth.uid()));

-- Articles policies
CREATE POLICY "Anyone can view published articles"
  ON articles FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Admins can manage all articles"
  ON articles FOR ALL
  USING (is_admin(auth.uid()));

DO $$ 
BEGIN
  RAISE NOTICE '✅ Security policies created!';
  RAISE NOTICE '📊 Creating indexes...';
END $$;

-- =============================================
-- STEP 7: CREATE INDEXES (إنشاء الفهارس)
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_level ON profiles(subscription_level);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments_log(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments_log(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments_log(created_at);
CREATE INDEX IF NOT EXISTS idx_gyms_city ON gyms(city);
CREATE INDEX IF NOT EXISTS idx_gyms_is_active ON gyms(is_active);
CREATE INDEX IF NOT EXISTS idx_gyms_access_level ON gyms(access_level);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_gym_id ON workouts(gym_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(workout_date);
CREATE INDEX IF NOT EXISTS idx_qr_access_user_id ON qr_access(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_access_gym_id ON qr_access(gym_id);
CREATE INDEX IF NOT EXISTS idx_qr_access_scan_time ON qr_access(scan_time);
CREATE INDEX IF NOT EXISTS idx_gym_access_logs_user_id ON gym_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_access_logs_gym_id ON gym_access_logs(gym_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

DO $$ 
BEGIN
  RAISE NOTICE '✅ Indexes created!';
  RAISE NOTICE '🌱 Inserting seed data...';
END $$;

-- =============================================
-- STEP 8: INSERT SEED DATA (إدخال البيانات الأولية)
-- =============================================

-- Insert subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, gym_access_description, is_active)
VALUES
  ('Basic', 'Essential fitness access', 29.99, 299.99, 
   ARRAY['Access to 1 gym', '24/7 gym access', 'Locker room access', 'Basic equipment'],
   'Access to select partner gyms', TRUE),
  ('Premium', 'Enhanced fitness experience', 49.99, 499.99,
   ARRAY['Access to 3 gyms', '24/7 gym access', 'Locker room + shower', 'All equipment', 'Group classes', '1 personal training session/month'],
   'Access to premium partner gyms', TRUE),
  ('Elite', 'Ultimate fitness package', 79.99, 799.99,
   ARRAY['Unlimited gym access', '24/7 access to all gyms', 'Premium locker room', 'All equipment + spa', 'Unlimited group classes', '4 personal training sessions/month', 'Nutrition consultation', 'Guest passes'],
   'Access to all partner gyms + exclusive locations', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert sample gyms
INSERT INTO gyms (name, location, address, city, phone, email, image_url, description, amenities, access_level, is_active, rating, total_reviews)
VALUES
  ('Gold''s Gym New Cairo', 'New Cairo', '123 Fifth Settlement, New Cairo', 'Cairo', '+20-2-12345678', 'newcairo@goldsgym.com.eg',
   'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
   'Premier fitness facility in New Cairo with state-of-the-art equipment',
   ARRAY['Cardio equipment', 'Free weights', 'Group classes', 'Personal training', 'Sauna', 'Parking'],
   'Basic', TRUE, 4.5, 324),
  
  ('California Gym Zamalek', 'Zamalek', '45 26th of July Street, Zamalek', 'Cairo', '+20-2-23456789', 'zamalek@californiagym.com.eg',
   'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
   'Luxury fitness center in the heart of Zamalek',
   ARRAY['Modern equipment', 'Swimming pool', 'Spa', 'Yoga studio', 'Cafe', 'Parking'],
   'Premium', TRUE, 4.8, 512),
  
  ('FitZone Heliopolis', 'Heliopolis', '78 Merghany Street, Heliopolis', 'Cairo', '+20-2-34567890', 'heliopolis@fitzone.com.eg',
   'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
   'Complete fitness solution with cutting-edge facilities',
   ARRAY['CrossFit area', 'Boxing ring', 'Olympic pool', 'Steam room', 'Juice bar', 'Kids area'],
   'Elite', TRUE, 4.9, 687)
ON CONFLICT DO NOTHING;

DO $$ 
BEGIN
  RAISE NOTICE '✅ Seed data inserted!';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ════════════════════════════════════════════════';
  RAISE NOTICE '🎉  FitClub Schema Setup Complete!';
  RAISE NOTICE '🎉 ════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables created:';
  RAISE NOTICE '   ✅ profiles';
  RAISE NOTICE '   ✅ user_roles';
  RAISE NOTICE '   ✅ subscription_plans (3 plans inserted)';
  RAISE NOTICE '   ✅ user_subscriptions';
  RAISE NOTICE '   ✅ payments_log';
  RAISE NOTICE '   ✅ gyms (3 sample gyms inserted)';
  RAISE NOTICE '   ✅ workouts';
  RAISE NOTICE '   ✅ qr_access';
  RAISE NOTICE '   ✅ gym_access_logs';
  RAISE NOTICE '   ✅ notifications';
  RAISE NOTICE '   ✅ activity_log';
  RAISE NOTICE '   ✅ articles';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Security:';
  RAISE NOTICE '   ✅ RLS enabled on all tables';
  RAISE NOTICE '   ✅ Policies created for data access';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Performance:';
  RAISE NOTICE '   ✅ Indexes created on key columns';
  RAISE NOTICE '   ✅ Triggers set up for auto-updates';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next Steps:';
  RAISE NOTICE '   1. Update your .env file with Supabase credentials';
  RAISE NOTICE '   2. Restart your dev server: npm run dev';
  RAISE NOTICE '   3. Test user registration';
  RAISE NOTICE '   4. Verify subscription_level column exists';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Ready to build amazing fitness experiences!';
  RAISE NOTICE '';
END $$;

