-- =============================================
-- Fix user_subscriptions table
-- Add missing columns if they don't exist
-- =============================================

-- First, let's check if the table exists and create it if it doesn't
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
    -- Add billing_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'billing_type') THEN
        ALTER TABLE user_subscriptions ADD COLUMN billing_type TEXT DEFAULT 'monthly' CHECK (billing_type IN ('monthly', 'yearly'));
    END IF;

    -- Add gym_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'gym_id') THEN
        ALTER TABLE user_subscriptions ADD COLUMN gym_id UUID;
    END IF;

    -- Add price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'price') THEN
        ALTER TABLE user_subscriptions ADD COLUMN price DECIMAL(10, 2);
    END IF;

    -- Add qr_code_data column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'qr_code_data') THEN
        ALTER TABLE user_subscriptions ADD COLUMN qr_code_data JSONB;
    END IF;

    -- Add verification_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'verification_code') THEN
        ALTER TABLE user_subscriptions ADD COLUMN verification_code TEXT;
    END IF;

    -- Add end_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'end_date') THEN
        ALTER TABLE user_subscriptions ADD COLUMN end_date TIMESTAMPTZ;
    END IF;

    -- Add start_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'start_date') THEN
        ALTER TABLE user_subscriptions ADD COLUMN start_date TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'status') THEN
        ALTER TABLE user_subscriptions ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused'));
    END IF;

    -- Add membership_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'membership_id') THEN
        ALTER TABLE user_subscriptions ADD COLUMN membership_id TEXT UNIQUE NOT NULL;
    END IF;

    -- Add plan_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'plan_id') THEN
        ALTER TABLE user_subscriptions ADD COLUMN plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL;
    END IF;

    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'user_id') THEN
        ALTER TABLE user_subscriptions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
    END IF;

    -- Add id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'id') THEN
        ALTER TABLE user_subscriptions ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'created_at') THEN
        ALTER TABLE user_subscriptions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE user_subscriptions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Admin policies
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_membership_id ON user_subscriptions(membership_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_billing_type ON user_subscriptions(billing_type);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ user_subscriptions table fixed successfully!';
    RAISE NOTICE '📊 All required columns added: billing_type, gym_id, price, qr_code_data, etc.';
    RAISE NOTICE '🔐 RLS policies created for user and admin access';
    RAISE NOTICE '📈 Indexes created for performance';
END $$;
