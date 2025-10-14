/*
  # Initial FitClub Database Schema

  1. New Tables
    - `profiles` - User profile information linked to auth.users
    - `subscription_plans` - Available membership plans
    - `user_subscriptions` - User subscription records
    - `gyms` - Gym locations and information
    - `gym_access_logs` - Track gym visits via QR code scans

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Public read access for gyms and subscription plans
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    address TEXT,
    preferred_gym_id UUID,
    fitness_goals JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Subscription Plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2) NOT NULL,
    gym_access_count INTEGER NOT NULL DEFAULT 100,
    gym_access_description VARCHAR(255) DEFAULT '100+ Gyms',
    features JSONB NOT NULL DEFAULT '[]',
    not_included JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    membership_id VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
    billing_type VARCHAR(20) NOT NULL CHECK (billing_type IN ('monthly', 'yearly')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    verification_code VARCHAR(20) NOT NULL,
    qr_code_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gyms table
CREATE TABLE IF NOT EXISTS public.gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    coordinates JSONB,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    monthly_price DECIMAL(10,2),
    yearly_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    hours JSONB,
    amenities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    instagram VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gym Access Logs table
CREATE TABLE IF NOT EXISTS public.gym_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.user_subscriptions(id),
    verification_method VARCHAR(20) NOT NULL DEFAULT 'qr_code',
    verification_result VARCHAR(20) NOT NULL CHECK (verification_result IN ('valid', 'expired', 'invalid', 'denied')),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_membership_id ON public.user_subscriptions(membership_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_gyms_city ON public.gyms(city);
CREATE INDEX IF NOT EXISTS idx_gyms_active ON public.gyms(is_active);
CREATE INDEX IF NOT EXISTS idx_gym_access_logs_user_id ON public.gym_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_access_logs_gym_id ON public.gym_access_logs(gym_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_access_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscription plans policies (public read)
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Gyms policies (public read)
CREATE POLICY "Anyone can view active gyms" ON public.gyms
    FOR SELECT USING (is_active = true);

-- Gym access logs policies
CREATE POLICY "Users can view own access logs" ON public.gym_access_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own access logs" ON public.gym_access_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, first_name, last_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate membership ID
CREATE OR REPLACE FUNCTION generate_membership_id()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_id VARCHAR(20);
    id_exists BOOLEAN;
BEGIN
    LOOP
        new_id := 'FM' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
        SELECT EXISTS(SELECT 1 FROM public.user_subscriptions WHERE membership_id = new_id) INTO id_exists;
        EXIT WHEN NOT id_exists;
    END LOOP;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gyms_updated_at
    BEFORE UPDATE ON public.gyms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();