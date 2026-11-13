import {
  Gym,
  Profile,
  MembershipPlan,
  Trainer,
  Member,
  PaymentRecord,
  AttendanceRecord,
  WorkoutPlan,
  DietPlan,
  ExpenseRecord,
  EquipmentItem,
  GymNotification,
  GymSubscription
} from '../types/database';

export const FLAGSHIP_GYM_ID = '11111111-1111-1111-1111-111111111111';

export const INITIAL_GYMS: Gym[] = [
  {
    id: FLAGSHIP_GYM_ID,
    name: 'Aman Sport club',
    slug: 'aman-sport-club',
    owner_id: '00000000-0000-0000-0000-000000000002',
    address: 'Plot 42, Fitness Avenue, Sector 14, Civil Lines',
    city: 'Gurugram',
    state: 'Haryana',
    postal_code: '122001',
    phone: '+91 98765 43210',
    email: 'contact@amansportclub.com',
    currency: 'INR',
    currency_symbol: '₹',
    tax_rate: 18.0,
    opening_hours: 'Mon - Sat: 5:30 AM - 10:30 PM | Sun: 6:00 AM - 2:00 PM',
    status: 'active',
    subscription_tier: 'enterprise',
    subscription_cycle: 'yearly',
    subscription_expires_at: '2027-12-31T23:59:59Z',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'aman@amansportclub.com',
    full_name: 'Aman Singh',
    role: 'gym_owner',
    phone: '+91 98765 43210',
    gym_id: FLAGSHIP_GYM_ID,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: '33333333-3333-3333-3333-333333333001',
    gym_id: FLAGSHIP_GYM_ID,
    name: 'Monthly Fitness',
    duration_months: 1,
    duration_days: 30,
    price: 2499,
    description: 'Full access to gym floor, cardio equipment, and locker rooms.',
    benefits: ['Gym Floor Access', 'Cardio Zone', 'Steam Bath (1x/week)', 'Locker Facility'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333002',
    gym_id: FLAGSHIP_GYM_ID,
    name: '3 Months Transformation',
    duration_months: 3,
    duration_days: 90,
    price: 6499,
    description: 'Quarterly membership with diet consultation and locker facility.',
    benefits: ['All Monthly Benefits', 'Free Diet Consultation', '1 Personal Training Session', 'Locker Facility'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333003',
    gym_id: FLAGSHIP_GYM_ID,
    name: '6 Months Pro Athlete',
    duration_months: 6,
    duration_days: 180,
    price: 11999,
    description: 'Half-yearly plan with sauna access and body composition analysis.',
    benefits: ['All 3-Month Benefits', 'Unlimited Steam & Sauna', 'Quarterly Body Scans', '2 Guest Passes'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333004',
    gym_id: FLAGSHIP_GYM_ID,
    name: 'Annual All-Access VIP',
    duration_months: 12,
    duration_days: 365,
    price: 19999,
    description: 'Complete 365-day VIP access with personal workout and diet charts.',
    benefits: ['VIP Gym Access 365 Days', 'Personalized Workout & Diet Plans', 'Monthly InBody Scans', 'Towel & Locker Service'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Clean empty arrays - No fake data
export const INITIAL_TRAINERS: Trainer[] = [];
export const INITIAL_MEMBERS: Member[] = [];
export const INITIAL_PAYMENTS: PaymentRecord[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_WORKOUT_PLANS: WorkoutPlan[] = [];
export const INITIAL_DIET_PLANS: DietPlan[] = [];
export const INITIAL_EXPENSES: ExpenseRecord[] = [];
export const INITIAL_EQUIPMENT: EquipmentItem[] = [];
export const INITIAL_NOTIFICATIONS: GymNotification[] = [];
export const INITIAL_SUBSCRIPTIONS: GymSubscription[] = [];
