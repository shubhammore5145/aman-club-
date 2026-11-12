// ==============================================================================
// AMAN SPORT CLUB SAAS - TYPES & DATA DEFINITIONS
// ==============================================================================

export type UserRole = 'super_admin' | 'gym_owner' | 'trainer' | 'member';

export type GymStatus = 'active' | 'suspended' | 'pending';

export type MemberStatus = 'active' | 'expired' | 'pending' | 'frozen';

export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'refunded';

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'online';

export type EquipmentStatus = 'operational' | 'under_maintenance' | 'damaged' | 'retired';

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

export type BillingCycle = 'monthly' | 'yearly';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  gym_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Gym {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone: string;
  email: string;
  logo_url?: string;
  currency: string;
  currency_symbol: string;
  tax_rate: number;
  opening_hours: string;
  status: GymStatus;
  subscription_tier: SubscriptionTier;
  subscription_cycle: BillingCycle;
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GymSubscription {
  id: string;
  gym_id: string;
  plan_tier: SubscriptionTier;
  cycle: BillingCycle;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'active' | 'expired' | 'trial';
  start_date: string;
  end_date: string;
  invoice_number?: string;
  created_at: string;
}

export interface MembershipPlan {
  id: string;
  gym_id: string;
  name: string;
  duration_months: number;
  duration_days: number;
  price: number;
  description?: string;
  benefits: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trainer {
  id: string;
  gym_id: string;
  profile_id?: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  bio?: string;
  salary_type: 'monthly' | 'per_session';
  base_salary: number;
  status: 'active' | 'inactive';
  joining_date: string;
  photo_url?: string;
  schedule?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  gym_id: string;
  profile_id?: string;
  member_code: string;
  full_name: string;
  email?: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  date_of_birth?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  joining_date: string;
  avatar_url?: string;
  membership_plan_id?: string;
  membership_start_date: string;
  membership_end_date: string;
  status: MemberStatus;
  assigned_trainer_id?: string;
  health_notes?: string;
  qr_code_token: string;
  created_at: string;
  updated_at: string;

  // Joined fields for UI convenience
  membership_plan?: MembershipPlan;
  assigned_trainer?: Trainer;
}

export interface AttendanceRecord {
  id: string;
  gym_id: string;
  member_id: string;
  trainer_id?: string;
  date: string; // YYYY-MM-DD
  check_in_time: string; // ISO
  check_out_time?: string; // ISO
  method: 'qr_code' | 'manual';
  session_type?: string;
  notes?: string;
  created_at: string;

  // Joined
  member?: Member;
}

export interface PaymentRecord {
  id: string;
  gym_id: string;
  member_id: string;
  membership_plan_id?: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  status: PaymentStatus;
  transaction_id?: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;

  // Joined
  member?: Member;
  membership_plan?: MembershipPlan;
}

export interface WorkoutExercise {
  id: string;
  workout_plan_id: string;
  day_of_week: string; // 'Monday', 'Tuesday', etc.
  exercise_name: string;
  target_muscle: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  order_index: number;
  notes?: string;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  gym_id: string;
  member_id?: string;
  trainer_id?: string;
  name: string;
  goal: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  is_template: boolean;
  description?: string;
  exercises?: WorkoutExercise[];
  created_at: string;
  updated_at: string;
}

export interface DietMeal {
  id: string;
  diet_plan_id: string;
  meal_type: string; // 'Breakfast', 'Lunch', etc.
  meal_name: string;
  items: string[];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  time_recommendation?: string;
  order_index: number;
  created_at: string;
}

export interface DietPlan {
  id: string;
  gym_id: string;
  member_id?: string;
  name: string;
  goal: string;
  target_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_intake_liters: number;
  is_template: boolean;
  notes?: string;
  meals?: DietMeal[];
  created_at: string;
  updated_at: string;
}

export interface ExpenseRecord {
  id: string;
  gym_id: string;
  category: 'electricity' | 'rent' | 'equipment' | 'staff_salary' | 'maintenance' | 'marketing' | 'other';
  title: string;
  description?: string;
  amount: number;
  payment_method: PaymentMethod;
  expense_date: string;
  vendor_name?: string;
  receipt_url?: string;
  created_at: string;
}

export interface EquipmentItem {
  id: string;
  gym_id: string;
  name: string;
  category: string;
  serial_number?: string;
  purchase_date: string;
  purchase_price: number;
  warranty_expiry?: string;
  status: EquipmentStatus;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  maintenance_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GymNotification {
  id: string;
  gym_id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'expiry' | 'payment' | 'announcement' | 'attendance' | 'system';
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface GymAnnouncement {
  id: string;
  gym_id: string;
  title: string;
  content: string;
  target_audience: 'all' | 'members' | 'trainers';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  gym_id?: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  created_at: string;
}
