-- ==============================================================================
-- AMAN SPORT CLUB - COMPREHENSIVE SEED DATA
-- Default Flagship Gym: Aman Sport club
-- ==============================================================================

-- 1. PROFILES
INSERT INTO public.profiles (id, email, full_name, role, phone, avatar_url)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@gymsaas.com', 'Super Administrator', 'super_admin', '+91 99999 00001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
  ('00000000-0000-0000-0000-000000000002', 'aman@amansportclub.com', 'Aman Singh (Gym Owner)', 'gym_owner', '+91 98765 43210', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
  ('00000000-0000-0000-0000-000000000003', 'vikram@amansportclub.com', 'Vikram Sharma (Head Trainer)', 'trainer', '+91 98111 22334', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150'),
  ('00000000-0000-0000-0000-000000000004', 'rahul@amansportclub.com', 'Rahul Verma (Athlete Member)', 'member', '+91 98777 66554', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150')
ON CONFLICT (id) DO NOTHING;

-- 2. FLAGSHIP GYM: AMAN SPORT CLUB
INSERT INTO public.gyms (
  id, name, slug, owner_id, address, city, state, postal_code, phone, email, 
  currency, currency_symbol, tax_rate, opening_hours, status, subscription_tier, subscription_cycle
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Aman Sport club',
  'aman-sport-club',
  '00000000-0000-0000-0000-000000000002',
  'Plot 42, Fitness Avenue, Sector 14, Civil Lines',
  'Gurugram',
  'Haryana',
  '122001',
  '+91 98765 43210',
  'contact@amansportclub.com',
  'INR',
  '₹',
  18.00,
  'Mon - Sat: 5:30 AM - 10:30 PM | Sun: 6:00 AM - 2:00 PM',
  'active',
  'enterprise',
  'yearly'
)
ON CONFLICT (id) DO NOTHING;

-- Update gym_id on profiles
UPDATE public.profiles SET gym_id = '11111111-1111-1111-1111-111111111111'
WHERE id IN ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004');

-- 3. SECOND GYM (FOR MULTI-TENANCY DEMO): FitPulse Hub
INSERT INTO public.gyms (
  id, name, slug, address, city, state, postal_code, phone, email,
  currency, currency_symbol, tax_rate, opening_hours, status, subscription_tier, subscription_cycle
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'FitPulse Hub',
  'fitpulse-hub',
  '88 Marine Boulevard',
  'Mumbai',
  'Maharashtra',
  '400001',
  '+91 98222 33445',
  'hello@fitpulsehub.in',
  'INR',
  '₹',
  18.00,
  'Mon - Sun: 6:00 AM - 11:00 PM',
  'active',
  'pro',
  'monthly'
)
ON CONFLICT (id) DO NOTHING;

-- 4. MEMBERSHIP PLANS FOR AMAN SPORT CLUB
INSERT INTO public.membership_plans (id, gym_id, name, duration_months, duration_days, price, description, benefits, is_active)
VALUES
  (
    '33333333-3333-3333-3333-333333333001',
    '11111111-1111-1111-1111-111111111111',
    'Monthly Fitness Starter',
    1, 30, 2499.00,
    'Full access to gym floor, cardio equipment, and locker rooms.',
    '["Gym Floor Access", "Cardio Zone", "Steam Bath (1x/week)", "Mobile App Access"]'::jsonb,
    true
  ),
  (
    '33333333-3333-3333-3333-333333333002',
    '11111111-1111-1111-1111-111111111111',
    'Quarterly Muscle Builder',
    3, 90, 6499.00,
    'Ideal for focused body transformations with personal diet chart.',
    '["All Starter Benefits", "Free Diet Consultation", "1 Personal Training Session", "Locker Facility"]'::jsonb,
    true
  ),
  (
    '33333333-3333-3333-3333-333333333003',
    '11111111-1111-1111-1111-111111111111',
    'Half-Yearly Pro Athlete',
    6, 180, 11999.00,
    'Comprehensive training program with monthly body composition analysis.',
    '["All Quarterly Benefits", "Unlimited Steam & Sauna", "Quarterly Body Composition Scans", "Guest Passes (2)"]'::jsonb,
    true
  ),
  (
    '33333333-3333-3333-3333-333333333004',
    '11111111-1111-1111-1111-111111111111',
    'Annual Elite All-Access',
    12, 365, 19999.00,
    'Our flagship all-inclusive VIP tier with dedicated trainer support and nutrition.',
    '["VIP Gym Access 365 Days", "Personalized Workout & Diet Plans", "Monthly InBody Scans", "Free Gym Merchandise Kit", "Complimentary Towel Service"]'::jsonb,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 5. TRAINERS AT AMAN SPORT CLUB
INSERT INTO public.trainers (id, gym_id, profile_id, full_name, email, phone, specialization, bio, salary_type, base_salary, status, joining_date, photo_url)
VALUES
  (
    '44444444-4444-4444-4444-444444444001',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000003',
    'Vikram Sharma',
    'vikram@amansportclub.com',
    '+91 98111 22334',
    'Strength & Conditioning, Powerlifting',
    'Certified CSCS coach with 8+ years experience preparing state-level powerlifters and physique athletes.',
    'monthly', 45000.00, 'active', '2023-01-15',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200'
  ),
  (
    '44444444-4444-4444-4444-444444444002',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'Priya Patel',
    'priya@amansportclub.com',
    '+91 98222 55667',
    'Functional Fitness, Mobility & Female Health',
    'ACE-certified trainer specializing in pre/post-natal fitness, core stability, and high-intensity interval training.',
    'monthly', 38000.00, 'active', '2023-06-01',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200'
  ),
  (
    '44444444-4444-4444-4444-444444444003',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'Arjun Rawat',
    'arjun@amansportclub.com',
    '+91 98333 77889',
    'Hypertrophy, Calisthenics & Sports Rehab',
    'Former state gymnast and clinical kinesiologist focusing on joint longevity and bodybuilding aesthetics.',
    'monthly', 40000.00, 'active', '2024-02-10',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200'
  )
ON CONFLICT (id) DO NOTHING;

-- 6. MEMBERS AT AMAN SPORT CLUB
INSERT INTO public.members (
  id, gym_id, profile_id, member_code, full_name, email, phone, gender, date_of_birth, address, 
  emergency_contact_name, emergency_contact_phone, joining_date, avatar_url, membership_plan_id, 
  membership_start_date, membership_end_date, status, assigned_trainer_id, health_notes, qr_code_token
)
VALUES
  (
    '55555555-5555-5555-5555-555555555001',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000004',
    'AMAN-001',
    'Rahul Verma',
    'rahul@amansportclub.com',
    '+91 98777 66554',
    'male', '1996-05-14', 'House 14, Sector 15, Gurugram',
    'Sunita Verma (Mother)', '+91 98777 00000',
    '2024-01-01',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    '33333333-3333-3333-3333-333333333004',
    '2024-01-01', '2027-01-01',
    'active',
    '44444444-4444-4444-4444-444444444001',
    'Previous right rotator cuff strain (fully rehabilitated). Likes high volume barbell training.',
    'AMAN-QR-RAHUL-001'
  ),
  (
    '55555555-5555-5555-5555-555555555002',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'AMAN-002',
    'Ananya Sen',
    'ananya.sen@gmail.com',
    '+91 98991 23456',
    'female', '1998-11-20', 'Flat 402, DLF Phase 2, Gurugram',
    'Rohit Sen (Brother)', '+91 98991 99887',
    '2024-03-15',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    '33333333-3333-3333-3333-333333333003',
    '2026-09-01', '2027-03-01',
    'active',
    '44444444-4444-4444-4444-444444444002',
    'Goal: Core strength and marathon endurance. No known allergies.',
    'AMAN-QR-ANANYA-002'
  ),
  (
    '55555555-5555-5555-5555-555555555003',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'AMAN-003',
    'Rohit Mehta',
    'rohit.m@outlook.com',
    '+91 98102 34567',
    'male', '1992-03-08', 'Villa 9, Golf Course Road',
    'Neha Mehta (Wife)', '+91 98102 88776',
    '2024-08-01',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    '33333333-3333-3333-3333-333333333002',
    '2026-08-20', '2026-11-20',
    'active',
    '44444444-4444-4444-4444-444444444001',
    'Hypertension under medical control. Focus on moderate cardio and progressive overload.',
    'AMAN-QR-ROHIT-003'
  ),
  (
    '55555555-5555-5555-5555-555555555004',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'AMAN-004',
    'Sneha Rao',
    'sneha.rao@techcorp.in',
    '+91 99441 55667',
    'female', '2000-01-25', 'Tower 3, Cyber City Apartments',
    'K. Rao (Father)', '+91 99441 00112',
    '2024-05-10',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    '33333333-3333-3333-3333-333333333004',
    '2026-05-10', '2027-05-10',
    'active',
    '44444444-4444-4444-4444-444444444002',
    'Strict vegetarian nutrition regimen.',
    'AMAN-QR-SNEHA-004'
  ),
  (
    '55555555-5555-5555-5555-555555555005',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'AMAN-005',
    'Devendra Singh',
    'devendra@singhbrothers.com',
    '+91 97110 33445',
    'male', '1988-09-12', 'B-12 South City 1, Gurugram',
    'Gurmeet Singh', '+91 97110 99880',
    '2023-10-01',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
    '33333333-3333-3333-3333-333333333001',
    '2026-09-01', '2026-10-01',
    'expired',
    '44444444-4444-4444-4444-444444444003',
    'Needs renewal follow-up. Traveled out of town in October.',
    'AMAN-QR-DEV-005'
  )
ON CONFLICT (id) DO NOTHING;

-- 7. RECENT PAYMENTS
INSERT INTO public.payments (
  id, gym_id, member_id, membership_plan_id, invoice_number, amount, tax_amount, total_amount, payment_method, payment_date, status, transaction_id, notes
)
VALUES
  (
    '66666666-6666-6666-6666-666666666001',
    '11111111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555001',
    '33333333-3333-3333-3333-333333333004',
    'AMAN-INV-2026-001',
    16948.30, 3050.70, 19999.00,
    'upi', now() - interval '2 days', 'paid', 'UPI984729184712', 'Full Annual Elite subscription renewal'
  ),
  (
    '66666666-6666-6666-6666-666666666002',
    '11111111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555002',
    '33333333-3333-3333-3333-333333333003',
    'AMAN-INV-2026-002',
    10168.64, 1830.36, 11999.00,
    'card', now() - interval '10 days', 'paid', 'POS_HDFC_837194', '6 Months Pro package'
  ),
  (
    '66666666-6666-6666-6666-666666666003',
    '11111111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555003',
    '33333333-3333-3333-3333-333333333002',
    'AMAN-INV-2026-003',
    5507.62, 991.38, 6499.00,
    'cash', now() - interval '15 days', 'paid', 'CASH_REC_089', 'Quarterly Muscle Builder'
  ),
  (
    '66666666-6666-6666-6666-666666666004',
    '11111111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555004',
    '33333333-3333-3333-3333-333333333004',
    'AMAN-INV-2026-004',
    16948.30, 3050.70, 19999.00,
    'upi', now() - interval '25 days', 'paid', 'UPI847291039482', 'Annual Elite renewal'
  )
ON CONFLICT (id) DO NOTHING;

-- 8. EXPENSES FOR AMAN SPORT CLUB
INSERT INTO public.expenses (id, gym_id, category, title, description, amount, payment_method, expense_date, vendor_name)
VALUES
  (
    '77777777-7777-7777-7777-777777777001',
    '11111111-1111-1111-1111-111111111111',
    'rent', 'Gym Premises Rent - November',
    'Commercial lease payment for 6,500 sqft facility',
    115000.00, 'bank_transfer', CURRENT_DATE - 10, 'Avenue Commercial Properties'
  ),
  (
    '77777777-7777-7777-7777-777777777002',
    '11111111-1111-1111-1111-111111111111',
    'electricity', 'Electricity & HVAC Bill',
    'Monthly high-power commercial electrical consumption',
    28500.00, 'upi', CURRENT_DATE - 5, 'DHBVN Power Utility'
  ),
  (
    '77777777-7777-7777-7777-777777777003',
    '11111111-1111-1111-1111-111111111111',
    'staff_salary', 'Trainers & Front Desk Payroll',
    'Salaries for 3 trainers and 2 front desk receptionists',
    145000.00, 'bank_transfer', CURRENT_DATE - 8, 'Aman Sport club Payroll'
  ),
  (
    '77777777-7777-7777-7777-777777777004',
    '11111111-1111-1111-1111-111111111111',
    'maintenance', 'Bio-Grease & Cable Replacement',
    'Pulley system cable replacement for 4 lat pulldown towers',
    6400.00, 'cash', CURRENT_DATE - 3, 'Apex Gym Technicians'
  )
ON CONFLICT (id) DO NOTHING;

-- 9. EQUIPMENT INVENTORY
INSERT INTO public.equipment (id, gym_id, name, category, serial_number, purchase_date, purchase_price, status, last_maintenance_date, next_maintenance_date, maintenance_notes)
VALUES
  (
    '88888888-8888-8888-8888-888888888001',
    '11111111-1111-1111-1111-111111111111',
    'Rogue Monster Power Rack (x2)',
    'Free Weights', 'RG-MPR-2023-01', '2023-01-10', 210000.00, 'operational',
    CURRENT_DATE - 30, CURRENT_DATE + 60, 'J-cups and safety straps inspected. Optimal condition.'
  ),
  (
    '88888888-8888-8888-8888-888888888002',
    '11111111-1111-1111-1111-111111111111',
    'LifeFitness Elevation Commercial Treadmill',
    'Cardio', 'LF-ELV-9921', '2023-03-20', 345000.00, 'operational',
    CURRENT_DATE - 15, CURRENT_DATE + 45, 'Belt aligned, running deck lubricated with silicone spray.'
  ),
  (
    '88888888-8888-8888-8888-888888888003',
    '11111111-1111-1111-1111-111111111111',
    'Hammer Strength Iso-Lateral Chest Press',
    'Strength', 'HS-IL-8371', '2023-02-14', 185000.00, 'operational',
    CURRENT_DATE - 40, CURRENT_DATE + 50, 'Pivot bearings oiled and smooth.'
  ),
  (
    '88888888-8888-8888-8888-888888888004',
    '11111111-1111-1111-1111-111111111111',
    'Concept2 RowErg Model D (PM5)',
    'Cardio', 'C2-PM5-4421', '2023-05-18', 115000.00, 'under_maintenance',
    CURRENT_DATE - 2, CURRENT_DATE + 7, 'Damper chain cleaned; awaiting replacement handle grip.'
  )
ON CONFLICT (id) DO NOTHING;
