-- =============================================
-- Fix subscription_plans table
-- Ensure it exists with all required columns
-- =============================================

-- Create subscription_plans table if it doesn't exist
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
    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' 
                   AND column_name = 'name') THEN
        ALTER TABLE subscription_plans ADD COLUMN name TEXT NOT NULL;
    END IF;

    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' 
                   AND column_name = 'description') THEN
        ALTER TABLE subscription_plans ADD COLUMN description TEXT;
    END IF;

    -- Add price_monthly column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' 
                   AND column_name = 'price_monthly') THEN
        ALTER TABLE subscription_plans ADD COLUMN price_monthly DECIMAL(10, 2) NOT NULL;
    END IF;

    -- Add price_yearly column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' 
                   AND column_name = 'price_yearly') THEN
        ALTER TABLE subscription_plans ADD COLUMN price_yearly DECIMAL(10, 2) NOT NULL;
    END IF;

    -- Add features column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' 
                   AND column_name = 'features') THEN
        ALTER TABLE subscription_plans ADD COLUMN features TEXT[];
    END IF;

    -- Add gym_access_description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' 
                   AND column_name = 'gym_access_description') THEN
        ALTER TABLE subscription_plans ADD COLUMN gym_access_description TEXT;
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' 
                   AND column_name = 'created_at') THEN
        ALTER TABLE subscription_plans ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE subscription_plans ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (subscription plans are public)
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view subscription plans" 
  ON subscription_plans FOR SELECT
  USING (true);

-- Admin policies
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_price_monthly ON subscription_plans(price_monthly);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_price_yearly ON subscription_plans(price_yearly);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ subscription_plans table fixed successfully!';
    RAISE NOTICE '📊 All required columns added: name, description, price_monthly, price_yearly, features, etc.';
    RAISE NOTICE '🔐 RLS policies created for public access and admin management';
    RAISE NOTICE '📈 Indexes created for performance';
END $$;
