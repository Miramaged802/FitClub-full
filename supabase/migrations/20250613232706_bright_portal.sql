/*
  # Seed Data for FitClub

  1. Subscription Plans
    - Basic, Premium, and Elite plans with monthly/yearly pricing
  
  2. Sample Gyms
    - Egyptian gyms with EGP pricing and complete information
*/

-- Insert subscription plans
INSERT INTO public.subscription_plans (
    name, 
    description, 
    price_monthly, 
    price_yearly, 
    gym_access_count, 
    gym_access_description, 
    features, 
    not_included
) VALUES 
(
    'Basic',
    'Perfect for beginners starting their fitness journey',
    29.00,
    290.00,
    100,
    '100+ Gyms',
    '["Access to 100+ gyms", "24/7 gym access", "Basic workout plans", "Standard equipment access", "Mobile app access"]',
    '["Personal training sessions", "Premium classes", "Spa access", "Guest passes"]'
),
(
    'Premium',
    'Most popular choice for serious fitness enthusiasts',
    49.00,
    490.00,
    500,
    '500+ Gyms',
    '["Access to 500+ gyms", "24/7 gym access", "Advanced workout plans", "All equipment access", "Mobile app access", "2 guest passes per month", "Group fitness classes", "Basic personal training"]',
    '["Unlimited personal training", "Premium spa access"]'
),
(
    'Elite',
    'Ultimate fitness experience with premium benefits',
    79.00,
    790.00,
    1000,
    '1000+ Gyms',
    '["Access to 1000+ gyms", "24/7 gym access", "Elite workout plans", "All equipment access", "Mobile app access", "Unlimited guest passes", "All fitness classes", "Weekly personal training", "Spa access", "Priority booking"]',
    '[]'
);

-- Insert sample Egyptian gyms
INSERT INTO public.gyms (
    name,
    description,
    address,
    city,
    coordinates,
    rating,
    review_count,
    monthly_price,
    yearly_price,
    currency,
    hours,
    amenities,
    images,
    phone,
    email,
    website,
    instagram
) VALUES 
(
    'Gold''s Gym New Cairo',
    'State-of-the-art fitness facility in New Cairo offering premium equipment, expert personal training, and luxury amenities including spa services and swimming pool.',
    '90th Street, New Cairo, Cairo Governorate',
    'Cairo',
    '{"lat": 30.0131, "lng": 31.4978}',
    4.8,
    128,
    1200.00,
    12000.00,
    'EGP',
    '{"monday": "6:00 AM - 11:00 PM", "tuesday": "6:00 AM - 11:00 PM", "wednesday": "6:00 AM - 11:00 PM", "thursday": "6:00 AM - 11:00 PM", "friday": "6:00 AM - 11:00 PM", "saturday": "6:00 AM - 11:00 PM", "sunday": "8:00 AM - 10:00 PM"}',
    '["Pool", "Sauna", "Weight Room", "Personal Training", "Spa", "Cardio Theater", "Free Parking", "Towel Service", "Locker Rooms", "Juice Bar"]',
    '["https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", "https://images.pexels.com/photos/260447/pexels-photo-260447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"]',
    '+20 2 2758 0000',
    'newcairo@goldsgym.com.eg',
    'www.goldsgym.com.eg',
    '@goldsgymegypt'
),
(
    'Fitness First Maadi',
    'Premium fitness club in Maadi offering world-class equipment, group fitness classes, and expert personal training in a modern, comfortable environment.',
    'Road 9, Maadi, Cairo Governorate',
    'Cairo',
    '{"lat": 29.9602, "lng": 31.2569}',
    4.6,
    94,
    950.00,
    9500.00,
    'EGP',
    '{"monday": "6:00 AM - 10:00 PM", "tuesday": "6:00 AM - 10:00 PM", "wednesday": "6:00 AM - 10:00 PM", "thursday": "6:00 AM - 10:00 PM", "friday": "6:00 AM - 10:00 PM", "saturday": "7:00 AM - 9:00 PM", "sunday": "8:00 AM - 8:00 PM"}',
    '["Weight Room", "Classes", "Personal Training", "Cardio", "Locker Rooms", "Free Parking", "Air Conditioning", "Sound System"]',
    '["https://images.pexels.com/photos/260447/pexels-photo-260447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"]',
    '+20 2 2378 5000',
    'maadi@fitnessfirst.com.eg',
    'www.fitnessfirst.com.eg',
    '@fitnessfirstegypt'
),
(
    'California Gym Zamalek',
    'Luxury 24/7 fitness center in the heart of Zamalek, featuring top-tier equipment, spa services, and a rooftop pool with Nile views.',
    '26th July Street, Zamalek, Cairo Governorate',
    'Cairo',
    '{"lat": 30.0616, "lng": 31.2175}',
    4.9,
    210,
    1500.00,
    15000.00,
    'EGP',
    '"Open 24/7"',
    '["Pool", "Sauna", "Spa", "Weight Room", "Classes", "Yoga Studio", "Massage", "Valet Parking", "Towel Service", "Rooftop Pool"]',
    '["https://images.pexels.com/photos/13106586/pexels-photo-13106586.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", "https://images.pexels.com/photos/260447/pexels-photo-260447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"]',
    '+20 2 2735 2000',
    'zamalek@californiagym.com.eg',
    'www.californiagym.com.eg',
    '@californiagymegypt'
),
(
    'Smart Gym Alexandria',
    'Modern fitness facility in Alexandria''s Smouha district, offering comprehensive fitness programs and state-of-the-art equipment.',
    'Smouha, Alexandria Governorate',
    'Alexandria',
    '{"lat": 31.2001, "lng": 29.9187}',
    4.5,
    87,
    800.00,
    8000.00,
    'EGP',
    '{"monday": "6:00 AM - 11:00 PM", "tuesday": "6:00 AM - 11:00 PM", "wednesday": "6:00 AM - 11:00 PM", "thursday": "6:00 AM - 11:00 PM", "friday": "6:00 AM - 11:00 PM", "saturday": "7:00 AM - 10:00 PM", "sunday": "8:00 AM - 9:00 PM"}',
    '["Classes", "Yoga Studio", "Weight Room", "Cardio", "Personal Training", "Locker Rooms", "Free Parking"]',
    '["https://images.pexels.com/photos/3836861/pexels-photo-3836861.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"]',
    '+20 3 4291 0000',
    'info@smartgymalex.com',
    'www.smartgymalex.com',
    '@smartgymalex'
),
(
    'Body Masters Giza',
    'High-performance gym in Mohandessin specializing in strength training, CrossFit, and personal coaching with certified trainers.',
    'Arab League Street, Mohandessin, Giza Governorate',
    'Giza',
    '{"lat": 30.0626, "lng": 31.2003}',
    4.7,
    152,
    1100.00,
    11000.00,
    'EGP',
    '{"monday": "5:00 AM - 12:00 AM", "tuesday": "5:00 AM - 12:00 AM", "wednesday": "5:00 AM - 12:00 AM", "thursday": "5:00 AM - 12:00 AM", "friday": "5:00 AM - 12:00 AM", "saturday": "6:00 AM - 11:00 PM", "sunday": "7:00 AM - 10:00 PM"}',
    '["Weight Room", "CrossFit", "Personal Training", "Sauna", "Nutrition Counseling", "Sports Massage", "Free Parking"]',
    '["https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", "https://images.pexels.com/photos/260447/pexels-photo-260447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"]',
    '+20 2 3760 0000',
    'info@bodymastersgiza.com',
    'www.bodymastersgiza.com',
    '@bodymastersgiza'
);