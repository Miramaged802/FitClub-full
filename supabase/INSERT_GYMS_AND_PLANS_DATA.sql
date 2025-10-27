-- =============================================
-- 🏋️ FitClub - Insert Gyms & Subscription Plans Data
-- Run this script in Supabase SQL Editor AFTER running COMPLETE_SETUP.sql
-- =============================================

-- =============================================
-- STEP 1: Clear existing data (optional)
-- =============================================

-- Uncomment these lines if you want to start fresh
-- DELETE FROM gyms WHERE TRUE;
-- DELETE FROM subscription_plans WHERE TRUE;

DO $$ 
BEGIN
  RAISE NOTICE '🏋️ Inserting FitClub Data...';
END $$;

-- =============================================
-- STEP 2: Insert Subscription Plans
-- =============================================

INSERT INTO subscription_plans (
  name, 
  description, 
  price_monthly, 
  price_yearly, 
  features, 
  gym_access_description, 
  is_active
) VALUES
  (
    'Basic',
    'Perfect for beginners starting their fitness journey',
    29.99,
    299.99,
    ARRAY[
      'Access to 100+ gyms',
      '24/7 gym access',
      'Basic workout plans',
      'Standard equipment access',
      'Mobile app access'
    ],
    'Access to select partner gyms in your city',
    TRUE
  ),
  (
    'Premium',
    'Most popular choice for serious fitness enthusiasts',
    49.99,
    499.99,
    ARRAY[
      'Access to 500+ gyms',
      '24/7 gym access',
      'Advanced workout plans',
      'All equipment access',
      'Mobile app access',
      '2 guest passes per month',
      'Group fitness classes',
      'Basic personal training'
    ],
    'Access to premium partner gyms nationwide',
    TRUE
  ),
  (
    'Elite',
    'Ultimate fitness package for dedicated athletes',
    79.99,
    799.99,
    ARRAY[
      'Access to 1000+ gyms',
      '24/7 gym access',
      'Elite workout plans',
      'All equipment access',
      'Mobile app access',
      'Unlimited guest passes',
      'All fitness classes',
      'Weekly personal training',
      'Spa access',
      'Priority booking'
    ],
    'Unlimited access to all partner gyms + exclusive locations',
    TRUE
  )
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  gym_access_description = EXCLUDED.gym_access_description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

DO $$ 
BEGIN
  RAISE NOTICE '✅ Subscription plans inserted!';
  RAISE NOTICE '📍 Inserting gyms data...';
END $$;

-- =============================================
-- STEP 3: Insert Gyms Data
-- =============================================

INSERT INTO gyms (
  name, 
  location, 
  address, 
  city, 
  phone, 
  email, 
  website, 
  image_url, 
  description, 
  amenities, 
  opening_hours, 
  latitude, 
  longitude, 
  rating, 
  total_reviews, 
  is_active, 
  access_level
) VALUES
  (
    'Gold''s Gym New Cairo',
    'New Cairo, Cairo',
    '90th Street, New Cairo, Cairo Governorate',
    'Cairo',
    '+20 2 2758 0000',
    'newcairo@goldsgym.com.eg',
    'www.goldsgym.com.eg',
    'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg',
    'State-of-the-art fitness facility in New Cairo offering premium equipment, expert personal training, and luxury amenities including spa services and swimming pool.',
    ARRAY['Pool', 'Sauna', 'Weight Room', 'Personal Training', 'Spa', 'Cardio Theater', 'Free Parking', 'Towel Service', 'Locker Rooms', 'Juice Bar'],
    '{"monday": "6:00 AM - 11:00 PM", "tuesday": "6:00 AM - 11:00 PM", "wednesday": "6:00 AM - 11:00 PM", "thursday": "6:00 AM - 11:00 PM", "friday": "6:00 AM - 11:00 PM", "saturday": "6:00 AM - 11:00 PM", "sunday": "8:00 AM - 10:00 PM"}'::JSONB,
    30.0131,
    31.4978,
    4.8,
    128,
    TRUE,
    'Basic'
  ),
  (
    'Fitness First Maadi',
    'Maadi, Cairo',
    'Road 9, Maadi, Cairo Governorate',
    'Cairo',
    '+20 2 2378 5000',
    'maadi@fitnessfirst.com.eg',
    'www.fitnessfirst.com.eg',
    'https://images.pexels.com/photos/260447/pexels-photo-260447.jpeg',
    'Premium fitness club in Maadi offering world-class equipment, group fitness classes, and expert personal training in a modern, comfortable environment.',
    ARRAY['Weight Room', 'Classes', 'Personal Training', 'Cardio', 'Locker Rooms', 'Free Parking', 'Air Conditioning', 'Sound System'],
    '{"monday": "6:00 AM - 10:00 PM", "tuesday": "6:00 AM - 10:00 PM", "wednesday": "6:00 AM - 10:00 PM", "thursday": "6:00 AM - 10:00 PM", "friday": "6:00 AM - 10:00 PM", "saturday": "7:00 AM - 9:00 PM", "sunday": "8:00 AM - 8:00 PM"}'::JSONB,
    29.9602,
    31.2569,
    4.6,
    94,
    TRUE,
    'Basic'
  ),
  (
    'California Gym Zamalek',
    'Zamalek, Cairo',
    '26th July Street, Zamalek, Cairo Governorate',
    'Cairo',
    '+20 2 2735 2000',
    'zamalek@californiagym.com.eg',
    'www.californiagym.com.eg',
    'https://images.pexels.com/photos/13106586/pexels-photo-13106586.jpeg',
    'Luxury 24/7 fitness center in the heart of Zamalek, featuring top-tier equipment, spa services, and a rooftop pool with Nile views.',
    ARRAY['Pool', 'Sauna', 'Spa', 'Weight Room', 'Classes', 'Yoga Studio', 'Massage', 'Valet Parking', 'Towel Service', 'Rooftop Pool'],
    '{"always_open": true}'::JSONB,
    30.0616,
    31.2175,
    4.9,
    210,
    TRUE,
    'Premium'
  ),
  (
    'Smart Gym Alexandria',
    'Smouha, Alexandria',
    'Smouha, Alexandria Governorate',
    'Alexandria',
    '+20 3 4291 0000',
    'info@smartgymalex.com',
    'www.smartgymalex.com',
    'https://images.pexels.com/photos/3836861/pexels-photo-3836861.jpeg',
    'Modern fitness facility in Alexandria''s Smouha district, offering comprehensive fitness programs and state-of-the-art equipment.',
    ARRAY['Classes', 'Yoga Studio', 'Weight Room', 'Cardio', 'Personal Training', 'Locker Rooms', 'Free Parking'],
    '{"monday": "6:00 AM - 11:00 PM", "tuesday": "6:00 AM - 11:00 PM", "wednesday": "6:00 AM - 11:00 PM", "thursday": "6:00 AM - 11:00 PM", "friday": "6:00 AM - 11:00 PM", "saturday": "7:00 AM - 10:00 PM", "sunday": "8:00 AM - 9:00 PM"}'::JSONB,
    31.2001,
    29.9187,
    4.5,
    87,
    TRUE,
    'Basic'
  ),
  (
    'Body Masters Giza',
    'Mohandessin, Giza',
    'Arab League Street, Mohandessin, Giza Governorate',
    'Giza',
    '+20 2 3760 0000',
    'info@bodymastersgiza.com',
    'www.bodymastersgiza.com',
    'https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg',
    'High-performance gym in Mohandessin specializing in strength training, CrossFit, and personal coaching with certified trainers.',
    ARRAY['Weight Room', 'CrossFit', 'Personal Training', 'Sauna', 'Nutrition Counseling', 'Sports Massage', 'Free Parking'],
    '{"monday": "5:00 AM - 12:00 AM", "tuesday": "5:00 AM - 12:00 AM", "wednesday": "5:00 AM - 12:00 AM", "thursday": "5:00 AM - 12:00 AM", "friday": "5:00 AM - 12:00 AM", "saturday": "6:00 AM - 11:00 PM", "sunday": "7:00 AM - 10:00 PM"}'::JSONB,
    30.0626,
    31.2003,
    4.7,
    152,
    TRUE,
    'Premium'
  ),
  (
    'Oxygen Gym Heliopolis',
    'Heliopolis, Cairo',
    'Korba, Heliopolis, Cairo Governorate',
    'Cairo',
    '+20 2 2635 0000',
    'info@oxygengym.com.eg',
    'www.oxygengym.com.eg',
    'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg',
    'Specialized aqua fitness center in Heliopolis featuring water-based workouts, swimming classes, and traditional gym equipment.',
    ARRAY['Pool', 'Water Classes', 'Cardio', 'Weight Room', 'Locker Rooms', 'Swimming Lessons', 'Aqua Aerobics'],
    '{"monday": "6:00 AM - 10:00 PM", "tuesday": "6:00 AM - 10:00 PM", "wednesday": "6:00 AM - 10:00 PM", "thursday": "6:00 AM - 10:00 PM", "friday": "6:00 AM - 10:00 PM", "saturday": "7:00 AM - 9:00 PM", "sunday": "8:00 AM - 8:00 PM"}'::JSONB,
    30.1019,
    31.3376,
    4.4,
    76,
    TRUE,
    'Basic'
  ),
  (
    'Platinum Gym New Capital',
    'New Administrative Capital',
    'R3 District, New Administrative Capital',
    'New Capital',
    '+20 2 1500 0000',
    'info@platinumgym.com.eg',
    'www.platinumgym.com.eg',
    'https://images.pexels.com/photos/13106586/pexels-photo-13106586.jpeg',
    'Ultra-modern fitness facility in Egypt''s New Administrative Capital, featuring cutting-edge equipment and luxury amenities.',
    ARRAY['Pool', 'Sauna', 'Spa', 'Weight Room', 'Classes', 'Personal Training', 'Basketball Court', 'Valet Parking', 'Nutrition Bar'],
    '{"always_open": true}'::JSONB,
    30.029,
    31.736,
    4.9,
    45,
    TRUE,
    'Elite'
  ),
  (
    'Flex Gym Hurghada',
    'El Dahar, Hurghada',
    'Sheraton Road, El Dahar, Hurghada, Red Sea Governorate',
    'Hurghada',
    '+20 65 3540 000',
    'info@flexgymhurghada.com',
    'www.flexgymhurghada.com',
    'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg',
    'Beachside fitness center in Hurghada offering outdoor workouts, water sports training, and traditional gym facilities.',
    ARRAY['Outdoor Training', 'Beach Access', 'Weight Room', 'Cardio', 'Water Sports', 'Yoga Studio', 'Free Parking'],
    '{"monday": "6:00 AM - 11:00 PM", "tuesday": "6:00 AM - 11:00 PM", "wednesday": "6:00 AM - 11:00 PM", "thursday": "6:00 AM - 11:00 PM", "friday": "6:00 AM - 11:00 PM", "saturday": "6:00 AM - 11:00 PM", "sunday": "7:00 AM - 10:00 PM"}'::JSONB,
    27.2579,
    33.8116,
    4.3,
    62,
    TRUE,
    'Basic'
  ),
  (
    'Power Zone Mansoura',
    'Downtown, Mansoura',
    'El Gomhouria Street, Mansoura, Dakahlia Governorate',
    'Mansoura',
    '+20 50 2345 000',
    'info@powerzonemansoura.com',
    'www.powerzonemansoura.com',
    'https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg',
    'Community-focused gym in Mansoura offering affordable fitness solutions with quality equipment and friendly staff.',
    ARRAY['Weight Room', 'Cardio', 'Classes', 'Personal Training', 'Locker Rooms', 'Student Discounts'],
    '{"monday": "7:00 AM - 11:00 PM", "tuesday": "7:00 AM - 11:00 PM", "wednesday": "7:00 AM - 11:00 PM", "thursday": "7:00 AM - 11:00 PM", "friday": "7:00 AM - 11:00 PM", "saturday": "8:00 AM - 10:00 PM", "sunday": "9:00 AM - 9:00 PM"}'::JSONB,
    31.0364,
    31.3807,
    4.2,
    38,
    TRUE,
    'Basic'
  ),
  (
    'Elite Fitness Sharm El Sheikh',
    'Naama Bay, Sharm El Sheikh',
    'Naama Bay, Sharm El Sheikh, South Sinai Governorate',
    'Sharm El Sheikh',
    '+20 69 3600 000',
    'info@elitefitnessharm.com',
    'www.elitefitnessharm.com',
    'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg',
    'Resort-style fitness center in Sharm El Sheikh combining luxury amenities with desert and sea views.',
    ARRAY['Pool', 'Spa', 'Weight Room', 'Yoga Studio', 'Desert View', 'Resort Access', 'Towel Service', 'Juice Bar'],
    '{"monday": "6:00 AM - 10:00 PM", "tuesday": "6:00 AM - 10:00 PM", "wednesday": "6:00 AM - 10:00 PM", "thursday": "6:00 AM - 10:00 PM", "friday": "6:00 AM - 10:00 PM", "saturday": "6:00 AM - 10:00 PM", "sunday": "7:00 AM - 9:00 PM"}'::JSONB,
    27.9158,
    34.33,
    4.6,
    54,
    TRUE,
    'Premium'
  );

DO $$ 
BEGIN
  RAISE NOTICE '✅ Gyms data inserted!';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ════════════════════════════════════════════════';
  RAISE NOTICE '🎉  FitClub Data Import Complete!';
  RAISE NOTICE '🎉 ════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   ✅ 3 Subscription Plans inserted';
  RAISE NOTICE '   ✅ 10 Gyms inserted';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Verify data:';
  RAISE NOTICE '   SELECT * FROM subscription_plans;';
  RAISE NOTICE '   SELECT name, city, rating FROM gyms;';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready to use in your app!';
END $$;

-- =============================================
-- STEP 4: Verify Data
-- =============================================

-- Show subscription plans
SELECT 
  name, 
  price_monthly, 
  price_yearly, 
  array_length(features, 1) as feature_count,
  is_active
FROM subscription_plans
ORDER BY price_monthly;

-- Show gyms
SELECT 
  name, 
  city, 
  rating, 
  total_reviews,
  access_level,
  array_length(amenities, 1) as amenity_count
FROM gyms
ORDER BY city, name;

