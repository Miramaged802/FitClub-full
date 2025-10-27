-- =============================================
-- Quick Payment System Fix
-- Only fixes missing columns, doesn't insert data
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. CREATE/FIX SUBSCRIPTION_PLANS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2) NOT NULL,
  features TEXT[],
  gym_access_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'name') THEN
        ALTER TABLE subscription_plans ADD COLUMN name TEXT NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'description') THEN
        ALTER TABLE subscription_plans ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'price_monthly') THEN
        ALTER TABLE subscription_plans ADD COLUMN price_monthly DECIMAL(10, 2) NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'price_yearly') THEN
        ALTER TABLE subscription_plans ADD COLUMN price_yearly DECIMAL(10, 2) NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'features') THEN
        ALTER TABLE subscription_plans ADD COLUMN features TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'gym_access_description') THEN
        ALTER TABLE subscription_plans ADD COLUMN gym_access_description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'created_at') THEN
        ALTER TABLE subscription_plans ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'updated_at') THEN
        ALTER TABLE subscription_plans ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- =============================================
-- 2. CREATE/FIX USER_SUBSCRIPTIONS TABLE
-- =============================================

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

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'billing_type') THEN
        ALTER TABLE user_subscriptions ADD COLUMN billing_type TEXT DEFAULT 'monthly' CHECK (billing_type IN ('monthly', 'yearly'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'gym_id') THEN
        ALTER TABLE user_subscriptions ADD COLUMN gym_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'price') THEN
        ALTER TABLE user_subscriptions ADD COLUMN price DECIMAL(10, 2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'qr_code_data') THEN
        ALTER TABLE user_subscriptions ADD COLUMN qr_code_data JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'verification_code') THEN
        ALTER TABLE user_subscriptions ADD COLUMN verification_code TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'end_date') THEN
        ALTER TABLE user_subscriptions ADD COLUMN end_date TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'start_date') THEN
        ALTER TABLE user_subscriptions ADD COLUMN start_date TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'status') THEN
        ALTER TABLE user_subscriptions ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'membership_id') THEN
        ALTER TABLE user_subscriptions ADD COLUMN membership_id TEXT UNIQUE NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'plan_id') THEN
        ALTER TABLE user_subscriptions ADD COLUMN plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'user_id') THEN
        ALTER TABLE user_subscriptions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'id') THEN
        ALTER TABLE user_subscriptions ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'created_at') THEN
        ALTER TABLE user_subscriptions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'updated_at') THEN
        ALTER TABLE user_subscriptions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- =============================================
-- 3. CREATE/FIX PAYMENTS_LOG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS payments_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  plan TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'mock_payment',
  transaction_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments_log' AND column_name = 'payment_method') THEN
        ALTER TABLE payments_log ADD COLUMN payment_method TEXT DEFAULT 'mock_payment';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments_log' AND column_name = 'transaction_reference') THEN
        ALTER TABLE payments_log ADD COLUMN transaction_reference TEXT;
    END IF;
END $$;

-- =============================================
-- 4. CREATE UPDATED_AT FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- 5. ENABLE RLS AND CREATE POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_log ENABLE ROW LEVEL SECURITY;

-- Subscription Plans Policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view subscription plans" 
  ON subscription_plans FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage subscription plans" ON subscription_plans;
CREATE POLICY "Admins can manage subscription plans" 
  ON subscription_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- User Subscriptions Policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can view their own subscriptions" 
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can create their own subscriptions" 
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can update their own subscriptions" 
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can view all subscriptions" 
  ON user_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can manage all subscriptions" 
  ON user_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Payments Log Policies
DROP POLICY IF EXISTS "Users can view their own payments" ON payments_log;
CREATE POLICY "Users can view their own payments" 
  ON payments_log FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own payments" ON payments_log;
CREATE POLICY "Users can create their own payments" 
  ON payments_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all payments" ON payments_log;
CREATE POLICY "Admins can view all payments" 
  ON payments_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- =============================================
-- 6. CREATE INDEXES
-- =============================================

-- Subscription Plans Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_price_monthly ON subscription_plans(price_monthly);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_price_yearly ON subscription_plans(price_yearly);

-- User Subscriptions Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_membership_id ON user_subscriptions(membership_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_billing_type ON user_subscriptions(billing_type);

-- Payments Log Indexes
CREATE INDEX IF NOT EXISTS idx_payments_log_user_id ON payments_log(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_log_subscription_id ON payments_log(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_log_status ON payments_log(status);
CREATE INDEX IF NOT EXISTS idx_payments_log_created_at ON payments_log(created_at);

-- =============================================
-- 7. CREATE TRIGGERS
-- =============================================

-- Subscription Plans Trigger
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User Subscriptions Trigger
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Payments Log Trigger
DROP TRIGGER IF EXISTS update_payments_log_updated_at ON payments_log;
CREATE TRIGGER update_payments_log_updated_at
  BEFORE UPDATE ON payments_log
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Quick Payment System Fix Complete!';
    RAISE NOTICE '✅ subscription_plans table: Fixed with all required columns';
    RAISE NOTICE '✅ user_subscriptions table: Fixed with billing_type and all columns';
    RAISE NOTICE '✅ payments_log table: Fixed with all required columns';
    RAISE NOTICE '🔐 RLS policies: Created for all tables';
    RAISE NOTICE '📈 Indexes: Created for performance';
    RAISE NOTICE '🔄 Triggers: Created for updated_at timestamps';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Payment system is now ready to use!';
    RAISE NOTICE '💡 Note: No subscription plans were inserted to avoid duplicates';
END $$;
