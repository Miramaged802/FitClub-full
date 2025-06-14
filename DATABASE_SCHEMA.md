# FitClub Database Schema

## Overview
This document outlines the complete database schema for the FitClub gym membership application, including user management, subscriptions, gyms, QR code verification, and staff operations.

## 🗄️ Database Tables

### 1. Users Table
Stores user account information and authentication details.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    profile_image_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 2. Subscription Plans Table
Defines available membership plans and their features.

```sql
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2) NOT NULL,
    gym_access_count INTEGER NOT NULL, -- Number of gyms accessible
    gym_access_description VARCHAR(255), -- e.g., "500+ Gyms"
    features JSONB NOT NULL, -- Array of features
    not_included JSONB, -- Array of features not included
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data structure for features/not_included:
-- {"features": ["Access to 500+ gyms", "24/7 gym access", "Advanced workout plans"]}
```

### 3. User Subscriptions Table
Tracks user's active and historical subscriptions.

```sql
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    membership_id VARCHAR(20) UNIQUE NOT NULL, -- e.g., FM12345678
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, expired, cancelled, suspended
    billing_type VARCHAR(20) NOT NULL, -- monthly, yearly
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    verification_code VARCHAR(20) NOT NULL, -- For QR security
    qr_code_data JSONB NOT NULL, -- Complete QR code data
    payment_method_id UUID REFERENCES payment_methods(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_membership_id ON user_subscriptions(membership_id);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON user_subscriptions(end_date);
```

### 4. Payment Methods Table
Stores user payment information (encrypted).

```sql
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- credit_card, debit_card, paypal, etc.
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20), -- visa, mastercard, amex
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    stripe_payment_method_id VARCHAR(255), -- For Stripe integration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
```

### 5. Payment Transactions Table
Records all payment transactions and billing history.

```sql
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(id),
    payment_method_id UUID REFERENCES payment_methods(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL, -- pending, completed, failed, refunded
    stripe_payment_intent_id VARCHAR(255),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_transactions_subscription_id ON payment_transactions(subscription_id);
CREATE INDEX idx_transactions_status ON payment_transactions(status);
```

### 6. Countries Table
Reference table for countries.

```sql
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(3) NOT NULL UNIQUE, -- ISO country code
    currency_code VARCHAR(3) NOT NULL,
    currency_symbol VARCHAR(10) NOT NULL
);

-- Sample data
INSERT INTO countries (name, code, currency_code, currency_symbol) VALUES
('Egypt', 'EGP', 'EGP', 'ج.م'),
('United States', 'USD', 'USD', '$'),
('United Kingdom', 'GBP', 'GBP', '£');
```

### 7. Cities Table
Cities within countries where gyms are located.

```sql
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    country_id INTEGER NOT NULL REFERENCES countries(id),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cities_country_id ON cities(country_id);
CREATE INDEX idx_cities_location ON cities(latitude, longitude);
```

### 8. Gyms Table
Information about gym locations and facilities.

```sql
CREATE TABLE gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city_id UUID NOT NULL REFERENCES cities(id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    website_url TEXT,
    image_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    amenities JSONB, -- Array of amenities
    operating_hours JSONB NOT NULL, -- Operating hours for each day
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gyms_city_id ON gyms(city_id);
CREATE INDEX idx_gyms_location ON gyms(latitude, longitude);
CREATE INDEX idx_gyms_rating ON gyms(rating DESC);
CREATE INDEX idx_gyms_active ON gyms(is_active);

-- Sample operating hours structure:
-- {"monday": "06:00-22:00", "tuesday": "06:00-22:00", "sunday": "08:00-20:00"}
```

### 9. Gym Staff Table
Staff members who can verify memberships.

```sql
CREATE TABLE gym_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- manager, receptionist, trainer, security
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    can_verify_memberships BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gym_staff_gym_id ON gym_staff(gym_id);
CREATE INDEX idx_gym_staff_user_id ON gym_staff(user_id);
CREATE UNIQUE INDEX idx_gym_staff_unique ON gym_staff(gym_id, user_id);
```

### 10. Membership Verifications Table
Logs all QR code scans and membership verifications.

```sql
CREATE TABLE membership_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(id),
    gym_id UUID NOT NULL REFERENCES gyms(id),
    staff_id UUID REFERENCES gym_staff(id),
    verification_method VARCHAR(20) NOT NULL, -- qr_code, manual, card
    verification_result VARCHAR(20) NOT NULL, -- valid, expired, invalid, denied
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    member_name VARCHAR(255),
    membership_id VARCHAR(20),
    expiry_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_verifications_subscription_id ON membership_verifications(subscription_id);
CREATE INDEX idx_verifications_gym_id ON membership_verifications(gym_id);
CREATE INDEX idx_verifications_staff_id ON membership_verifications(staff_id);
CREATE INDEX idx_verifications_scanned_at ON membership_verifications(scanned_at);
CREATE INDEX idx_verifications_result ON membership_verifications(verification_result);
```

### 11. Gym Reviews Table
User reviews and ratings for gyms.

```sql
CREATE TABLE gym_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT FALSE, -- Verified if user has active subscription
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_gym_id ON gym_reviews(gym_id);
CREATE INDEX idx_reviews_user_id ON gym_reviews(user_id);
CREATE INDEX idx_reviews_rating ON gym_reviews(rating);
CREATE UNIQUE INDEX idx_reviews_unique ON gym_reviews(gym_id, user_id);
```

### 12. User Favorites Table
Tracks user's favorite gyms.

```sql
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_favorites_gym_id ON user_favorites(gym_id);
CREATE UNIQUE INDEX idx_favorites_unique ON user_favorites(user_id, gym_id);
```

### 13. Workout Sessions Table
Track user workout sessions at gyms.

```sql
CREATE TABLE workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES gyms(id),
    session_name VARCHAR(255),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    calories_burned INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_sessions_gym_id ON workout_sessions(gym_id);
CREATE INDEX idx_sessions_start_time ON workout_sessions(start_time);
```

### 14. User Settings Table
User preferences and notification settings.

```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_notifications JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    preferred_gym_id UUID REFERENCES gyms(id),
    fitness_goals JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_settings_user_id ON user_settings(user_id);

-- Sample notification settings structure:
-- {
--   "workout_reminders": true,
--   "subscription_updates": true,
--   "new_features": false,
--   "gym_updates": true,
--   "promotional": false
-- }
```

## 🔗 Key Relationships

### Primary Relationships:
- **Users** → **User Subscriptions** (1:N) - One user can have multiple subscription periods
- **Subscription Plans** → **User Subscriptions** (1:N) - One plan can have many subscribers
- **Users** → **Payment Methods** (1:N) - Users can have multiple payment methods
- **Countries** → **Cities** (1:N) - Countries contain multiple cities
- **Cities** → **Gyms** (1:N) - Cities contain multiple gyms
- **Gyms** → **Gym Staff** (1:N) - Gyms have multiple staff members
- **Users** → **Gym Reviews** (1:N) - Users can review multiple gyms
- **Gyms** → **Gym Reviews** (1:N) - Gyms can have multiple reviews

### Verification Tracking:
- **User Subscriptions** → **Membership Verifications** (1:N) - Track all scans for a subscription
- **Gyms** → **Membership Verifications** (1:N) - Track all verifications at a gym
- **Gym Staff** → **Membership Verifications** (1:N) - Track which staff member performed verification

## 🔧 Database Functions & Triggers

### 1. Auto-update timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add similar triggers for other tables...
```

### 2. Generate Membership ID
```sql
CREATE OR REPLACE FUNCTION generate_membership_id()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_id VARCHAR(20);
    id_exists BOOLEAN;
BEGIN
    LOOP
        new_id := 'FM' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
        SELECT EXISTS(SELECT 1 FROM user_subscriptions WHERE membership_id = new_id) INTO id_exists;
        EXIT WHEN NOT id_exists;
    END LOOP;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;
```

### 3. Update Gym Rating
```sql
CREATE OR REPLACE FUNCTION update_gym_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE gyms 
    SET 
        rating = (SELECT AVG(rating) FROM gym_reviews WHERE gym_id = NEW.gym_id),
        total_reviews = (SELECT COUNT(*) FROM gym_reviews WHERE gym_id = NEW.gym_id)
    WHERE id = NEW.gym_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gym_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON gym_reviews
    FOR EACH ROW EXECUTE FUNCTION update_gym_rating();
```

## 📊 Common Queries

### 1. Get Active Subscription for User
```sql
SELECT s.*, p.name as plan_name, p.gym_access_description
FROM user_subscriptions s
JOIN subscription_plans p ON s.plan_id = p.id
WHERE s.user_id = $1 
  AND s.status = 'active' 
  AND s.end_date > NOW()
ORDER BY s.created_at DESC
LIMIT 1;
```

### 2. Verify QR Code Data
```sql
SELECT 
    s.*,
    u.first_name,
    u.last_name,
    p.name as plan_name,
    p.gym_access_description,
    CASE 
        WHEN s.end_date > NOW() AND s.status = 'active' THEN 'valid'
        ELSE 'expired'
    END as verification_status
FROM user_subscriptions s
JOIN users u ON s.user_id = u.id
JOIN subscription_plans p ON s.plan_id = p.id
WHERE s.membership_id = $1 
  AND s.verification_code = $2;
```

### 3. Get Gym Statistics for Staff Dashboard
```sql
SELECT 
    COUNT(*) FILTER (WHERE DATE(scanned_at) = CURRENT_DATE) as todays_scans,
    COUNT(*) FILTER (WHERE DATE(scanned_at) = CURRENT_DATE AND verification_result = 'valid') as valid_entries,
    COUNT(*) FILTER (WHERE DATE(scanned_at) = CURRENT_DATE AND verification_result = 'expired') as expired_attempts,
    COUNT(DISTINCT subscription_id) FILTER (WHERE DATE(scanned_at) = CURRENT_DATE) as unique_members
FROM membership_verifications
WHERE gym_id = $1;
```

### 4. Search Gyms with Filters
```sql
SELECT 
    g.*,
    c.name as city_name,
    ct.name as country_name,
    ct.currency_symbol
FROM gyms g
JOIN cities c ON g.city_id = c.id
JOIN countries ct ON c.country_id = ct.id
WHERE 
    g.is_active = true
    AND ($1 IS NULL OR c.name ILIKE '%' || $1 || '%')  -- City filter
    AND ($2 IS NULL OR g.rating >= $2)                 -- Rating filter
    AND ($3 IS NULL OR g.price_monthly <= $3)          -- Price filter
ORDER BY g.rating DESC, g.name;
```

## 🔐 Security Considerations

### 1. Data Encryption
- Store sensitive payment data encrypted
- Hash all passwords with bcrypt
- Encrypt QR code verification codes

### 2. Access Control
- Implement row-level security (RLS) for user data
- Separate read/write permissions for staff vs. members
- Audit trail for all membership verifications

### 3. API Rate Limiting
- Limit QR code verification requests per minute
- Prevent brute force attacks on membership IDs
- Monitor suspicious verification patterns

## 🚀 Performance Optimizations

### 1. Indexing Strategy
- Composite indexes for common query patterns
- Partial indexes for active records only
- GIN indexes for JSONB columns

### 2. Caching
- Cache frequently accessed gym data
- Cache user subscription status
- Cache gym ratings and reviews

### 3. Partitioning
- Partition verification logs by date
- Partition transaction history by year
- Archive old subscription data

This schema provides a robust foundation for the FitClub application with proper normalization, indexing, and scalability considerations. 