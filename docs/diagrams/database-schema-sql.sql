-- FitClub Database Schema SQL
-- Supabase PostgreSQL Database

-- Note: Supabase Auth schema is managed by Supabase itself
-- This script contains the public schema tables that need to be created

-- Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- Subscription Plans Table
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
    payment_id VARCHAR(100),
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX idx_subscriptions_profile_id ON public.subscriptions(profile_id);
CREATE INDEX idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Gyms Table
CREATE TABLE public.gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    amenities JSONB,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for city for faster filtering
CREATE INDEX idx_gyms_city ON public.gyms(city);

-- Classes Table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    instructor VARCHAR(100),
    schedule JSONB NOT NULL,
    capacity INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for gym_id for faster lookups
CREATE INDEX idx_classes_gym_id ON public.classes(gym_id);

-- Trainers Table
CREATE TABLE public.trainers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    specialties JSONB,
    years_experience INTEGER,
    avatar_url TEXT,
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Class Bookings Table
CREATE TABLE public.class_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no-show')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX idx_class_bookings_profile_id ON public.class_bookings(profile_id);
CREATE INDEX idx_class_bookings_class_id ON public.class_bookings(class_id);

-- Gym Access Logs Table
CREATE TABLE public.gym_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out TIMESTAMP WITH TIME ZONE,
    qr_code_used BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups and reporting
CREATE INDEX idx_gym_access_logs_profile_id ON public.gym_access_logs(profile_id);
CREATE INDEX idx_gym_access_logs_gym_id ON public.gym_access_logs(gym_id);
CREATE INDEX idx_gym_access_logs_check_in ON public.gym_access_logs(check_in);

-- Row Level Security Policies
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_access_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
CREATE POLICY profiles_select_policy ON public.profiles 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY profiles_update_policy ON public.profiles 
    FOR UPDATE USING (auth.uid() = user_id);

-- Subscription Plans: Anyone can view plans
CREATE POLICY subscription_plans_select_policy ON public.subscription_plans 
    FOR SELECT USING (true);

-- Subscriptions: Users can only view their own subscriptions
CREATE POLICY subscriptions_select_policy ON public.subscriptions 
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id = profile_id
    ));

-- Gyms: Anyone can view gyms
CREATE POLICY gyms_select_policy ON public.gyms 
    FOR SELECT USING (true);

-- Classes: Anyone can view classes
CREATE POLICY classes_select_policy ON public.classes 
    FOR SELECT USING (true);

-- Trainers: Anyone can view trainers
CREATE POLICY trainers_select_policy ON public.trainers 
    FOR SELECT USING (true);

-- Class Bookings: Users can only view their own bookings
CREATE POLICY class_bookings_select_policy ON public.class_bookings 
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id = profile_id
    ));

CREATE POLICY class_bookings_insert_policy ON public.class_bookings 
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id = profile_id
    ));

-- Gym Access Logs: Users can only view their own access logs
CREATE POLICY gym_access_logs_select_policy ON public.gym_access_logs 
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id = profile_id
    ));

-- Functions and Triggers
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to create a profile after a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, user_id, first_name, last_name)
    VALUES (uuid_generate_v4(), NEW.id, '', '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger after a user signs up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
