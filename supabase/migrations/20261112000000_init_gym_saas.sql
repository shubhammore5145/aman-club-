-- ==============================================================================
-- AMAN SPORT CLUB & MULTI-TENANT GYM MANAGEMENT SAAS
-- COMPLETE SUPABASE POSTGRESQL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES & ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'gym_owner', 'trainer', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE gym_status AS ENUM ('active', 'suspended', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE member_status AS ENUM ('active', 'expired', 'pending', 'frozen');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('paid', 'partial', 'pending', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'card', 'bank_transfer', 'online');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE equipment_status AS ENUM ('operational', 'under_maintenance', 'damaged', 'retired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'pro', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. TABLES DEFINITIONS

-- 3.1 PROFILES (Linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  phone TEXT,
  avatar_url TEXT,
  gym_id UUID, -- References gyms table (populated once gym created/assigned)
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.2 GYMS (Tenants)
CREATE TABLE IF NOT EXISTS public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  logo_url TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  currency_symbol TEXT NOT NULL DEFAULT '₹',
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  opening_hours TEXT DEFAULT 'Mon - Sat: 5:30 AM - 10:30 PM | Sun: 6:00 AM - 2:00 PM',
  status gym_status NOT NULL DEFAULT 'active',
  subscription_tier subscription_tier NOT NULL DEFAULT 'pro',
  subscription_cycle billing_cycle NOT NULL DEFAULT 'yearly',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Foreign key link back from profiles to gyms
DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT fk_profiles_gym
    FOREIGN KEY (gym_id) REFERENCES public.gyms(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.3 GYM SUBSCRIPTIONS (Platform level subscriptions for Gyms)
CREATE TABLE IF NOT EXISTS public.gym_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  plan_tier subscription_tier NOT NULL DEFAULT 'pro',
  cycle billing_cycle NOT NULL DEFAULT 'yearly',
  amount NUMERIC(10,2) NOT NULL DEFAULT 24999.00,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 4499.82,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 29498.82,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
  invoice_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.4 MEMBERSHIP PLANS (Created by Gym Owners for their Gym)
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 1,
  duration_days INTEGER NOT NULL DEFAULT 30,
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.5 TRAINERS
CREATE TABLE IF NOT EXISTS public.trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  specialization TEXT NOT NULL DEFAULT 'General Fitness & Strength',
  bio TEXT,
  salary_type TEXT NOT NULL DEFAULT 'monthly', -- 'monthly' or 'per_session'
  base_salary NUMERIC(10,2) NOT NULL DEFAULT 25000.00,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' or 'inactive'
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url TEXT,
  schedule JSONB DEFAULT '{"monday":"06:00-14:00","tuesday":"06:00-14:00","wednesday":"06:00-14:00","thursday":"06:00-14:00","friday":"06:00-14:00","saturday":"06:00-14:00"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.6 MEMBERS
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  member_code TEXT NOT NULL, -- e.g. AMAN-001
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'male',
  date_of_birth DATE,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  avatar_url TEXT,
  membership_plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  membership_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  membership_end_date DATE NOT NULL,
  status member_status NOT NULL DEFAULT 'active',
  assigned_trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  health_notes TEXT,
  qr_code_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_member_code_per_gym UNIQUE (gym_id, member_code)
);

-- 3.7 ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  check_out_time TIMESTAMPTZ,
  method TEXT NOT NULL DEFAULT 'qr_code', -- 'qr_code', 'manual'
  session_type TEXT DEFAULT 'General Workout',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_member_session_per_day UNIQUE (gym_id, member_id, date)
);

-- 3.8 PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  membership_plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'upi',
  payment_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  status payment_status NOT NULL DEFAULT 'paid',
  transaction_id TEXT,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_invoice_per_gym UNIQUE (gym_id, invoice_number)
);

-- 3.9 WORKOUT PLANS
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  goal TEXT NOT NULL DEFAULT 'Muscle Hypertrophy & Fat Loss',
  difficulty TEXT NOT NULL DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  duration_weeks INTEGER NOT NULL DEFAULT 8,
  is_template BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.10 WORKOUT EXERCISES
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL, -- 'Monday', 'Tuesday', etc.
  exercise_name TEXT NOT NULL,
  target_muscle TEXT NOT NULL,
  sets INTEGER NOT NULL DEFAULT 4,
  reps TEXT NOT NULL DEFAULT '10-12',
  rest_seconds INTEGER NOT NULL DEFAULT 60,
  order_index INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.11 DIET PLANS
CREATE TABLE IF NOT EXISTS public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT NOT NULL DEFAULT 'Lean Bulk & High Protein',
  target_calories INTEGER NOT NULL DEFAULT 2400,
  protein_g INTEGER NOT NULL DEFAULT 160,
  carbs_g INTEGER NOT NULL DEFAULT 250,
  fat_g INTEGER NOT NULL DEFAULT 65,
  is_template BOOLEAN NOT NULL DEFAULT false,
  water_intake_liters NUMERIC(3,1) DEFAULT 4.0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.12 DIET MEALS
CREATE TABLE IF NOT EXISTS public.diet_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_plan_id UUID NOT NULL REFERENCES public.diet_plans(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL, -- 'Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'
  meal_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  calories INTEGER NOT NULL DEFAULT 500,
  protein_g INTEGER NOT NULL DEFAULT 35,
  carbs_g INTEGER NOT NULL DEFAULT 50,
  fat_g INTEGER NOT NULL DEFAULT 12,
  time_recommendation TEXT,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.13 EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'electricity', 'rent', 'equipment', 'staff_salary', 'maintenance', 'marketing', 'other'
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'bank_transfer',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor_name TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.14 EQUIPMENT
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Strength', -- 'Strength', 'Cardio', 'Free Weights', 'Functional'
  serial_number TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purchase_price NUMERIC(10,2) NOT NULL,
  warranty_expiry DATE,
  status equipment_status NOT NULL DEFAULT 'operational',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.15 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system', -- 'expiry', 'payment', 'announcement', 'attendance', 'system'
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.16 GYM ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.gym_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'members', 'trainers'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.17 ACTIVITY LOGS (Audit trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_gym_id ON public.profiles(gym_id);
CREATE INDEX IF NOT EXISTS idx_members_gym_id ON public.members(gym_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_members_expiry ON public.members(membership_end_date);
CREATE INDEX IF NOT EXISTS idx_attendance_gym_date ON public.attendance(gym_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON public.attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_gym_id ON public.payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_gym_date ON public.expenses(gym_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_equipment_gym_status ON public.equipment(gym_id, status);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.get_current_profile()
RETURNS public.profiles AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_gym_id()
RETURNS UUID AS $$
  SELECT gym_id FROM public.profiles
  WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 5.1 PROFILES POLICIES
CREATE POLICY "Users can view their own profile or Super Admin views all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_super_admin());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Super Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_super_admin());

-- 5.2 GYMS POLICIES
CREATE POLICY "Super Admins have full access to all gyms"
  ON public.gyms FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Gym owners can view and manage their gym"
  ON public.gyms FOR ALL
  USING (owner_id = auth.uid() OR id = public.get_user_gym_id());

CREATE POLICY "Gym staff and members can view their gym info"
  ON public.gyms FOR SELECT
  USING (id = public.get_user_gym_id());

-- 5.3 MEMBERS POLICIES (Gym isolated)
CREATE POLICY "Gym owners & trainers can manage members in their gym"
  ON public.members FOR ALL
  USING (gym_id = public.get_user_gym_id() OR public.is_super_admin());

CREATE POLICY "Members can view only their own member profile"
  ON public.members FOR SELECT
  USING (profile_id = auth.uid());

-- 5.4 ATTENDANCE POLICIES
CREATE POLICY "Gym staff can manage attendance in their gym"
  ON public.attendance FOR ALL
  USING (gym_id = public.get_user_gym_id() OR public.is_super_admin());

CREATE POLICY "Members can view their own attendance"
  ON public.attendance FOR SELECT
  USING (member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid()));

-- 5.5 PAYMENTS POLICIES
CREATE POLICY "Gym owners can manage payments in their gym"
  ON public.payments FOR ALL
  USING (gym_id = public.get_user_gym_id() OR public.is_super_admin());

CREATE POLICY "Members can view their own payments"
  ON public.payments FOR SELECT
  USING (member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid()));

-- 5.6 EXPENSES & EQUIPMENT POLICIES
CREATE POLICY "Gym owners can manage expenses in their gym"
  ON public.expenses FOR ALL
  USING (gym_id = public.get_user_gym_id() OR public.is_super_admin());

CREATE POLICY "Gym staff can view/manage equipment in their gym"
  ON public.equipment FOR ALL
  USING (gym_id = public.get_user_gym_id() OR public.is_super_admin());

-- 5.7 WORKOUTS & DIETS POLICIES
CREATE POLICY "Gym staff can manage workout plans"
  ON public.workout_plans FOR ALL
  USING (gym_id = public.get_user_gym_id() OR public.is_super_admin());

CREATE POLICY "Gym staff can manage workout exercises"
  ON public.workout_exercises FOR ALL
  USING (
    workout_plan_id IN (SELECT id FROM public.workout_plans WHERE gym_id = public.get_user_gym_id())
    OR public.is_super_admin()
  );

CREATE POLICY "Gym staff can manage diet plans"
  ON public.diet_plans FOR ALL
  USING (gym_id = public.get_user_gym_id() OR public.is_super_admin());

CREATE POLICY "Gym staff can manage diet meals"
  ON public.diet_meals FOR ALL
  USING (
    diet_plan_id IN (SELECT id FROM public.diet_plans WHERE gym_id = public.get_user_gym_id())
    OR public.is_super_admin()
  );

CREATE POLICY "Members can view their assigned workout plan"
  ON public.workout_plans FOR SELECT
  USING (member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid()));

CREATE POLICY "Members can view their assigned diet plan"
  ON public.diet_plans FOR SELECT
  USING (member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid()));
