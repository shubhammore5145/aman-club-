// ==============================================================================
// AMAN SPORT CLUB SAAS - LOCAL PERSISTENCE & DATA MANAGEMENT ENGINE
// Provides full CRUD operations, multi-tenant gym isolation, reactive updates
// ==============================================================================

import {
  Gym,
  Profile,
  MembershipPlan,
  Trainer,
  Member,
  PaymentRecord,
  PaymentMethod,
  AttendanceRecord,
  WorkoutPlan,
  DietPlan,
  ExpenseRecord,
  EquipmentItem,
  GymNotification,
  GymSubscription,
  UserRole
} from '../types/database';

import {
  INITIAL_GYMS,
  INITIAL_PROFILES,
  INITIAL_MEMBERSHIP_PLANS,
  INITIAL_TRAINERS,
  INITIAL_MEMBERS,
  INITIAL_PAYMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_WORKOUT_PLANS,
  INITIAL_DIET_PLANS,
  INITIAL_EXPENSES,
  INITIAL_EQUIPMENT,
  INITIAL_NOTIFICATIONS,
  INITIAL_SUBSCRIPTIONS,
  FLAGSHIP_GYM_ID
} from './mockData';

const STORAGE_KEYS = {
  GYMS: 'aman_gym_clean_gyms_v2',
  PROFILES: 'aman_gym_clean_profiles_v2',
  MEMBERSHIP_PLANS: 'aman_gym_clean_plans_v2',
  TRAINERS: 'aman_gym_clean_trainers_v2',
  MEMBERS: 'aman_gym_clean_members_v2',
  PAYMENTS: 'aman_gym_clean_payments_v2',
  ATTENDANCE: 'aman_gym_clean_attendance_v2',
  WORKOUT_PLANS: 'aman_gym_clean_workouts_v2',
  DIET_PLANS: 'aman_gym_clean_diets_v2',
  EXPENSES: 'aman_gym_clean_expenses_v2',
  EQUIPMENT: 'aman_gym_clean_equipment_v2',
  NOTIFICATIONS: 'aman_gym_clean_notifications_v2',
  SUBSCRIPTIONS: 'aman_gym_clean_subscriptions_v2',
  CURRENT_USER_ID: 'aman_gym_clean_current_user_id_v2',
  CURRENT_GYM_ID: 'aman_gym_clean_current_gym_id_v2',
};

// Event for reactive listeners
export const DATA_CHANGE_EVENT = 'aman_gym_data_changed';

function notifyDataChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
  }
}

function load<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyDataChange();
  } catch (err) {
    console.error(`Failed to save to localStorage for key ${key}:`, err);
  }
}

// In-Memory / LocalStorage State Initializer
export class AppStorage {
  // --- CURRENT SESSION & AUTH ---
  static getCurrentUserId(): string {
    return load<string>(STORAGE_KEYS.CURRENT_USER_ID, '00000000-0000-0000-0000-000000000002'); // Default to Aman (Owner)
  }

  static setCurrentUserId(id: string): void {
    save(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  static getCurrentGymId(): string {
    return load<string>(STORAGE_KEYS.CURRENT_GYM_ID, FLAGSHIP_GYM_ID);
  }

  static setCurrentGymId(id: string): void {
    save(STORAGE_KEYS.CURRENT_GYM_ID, id);
  }

  // --- PROFILES ---
  static getProfiles(): Profile[] {
    return load<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  }

  static getProfileById(id: string): Profile | undefined {
    return this.getProfiles().find(p => p.id === id);
  }

  static getCurrentProfile(): Profile {
    const currentId = this.getCurrentUserId();
    const profile = this.getProfileById(currentId);
    if (profile) return profile;
    return this.getProfiles()[1]; // fallback to Aman
  }

  static switchRole(role: UserRole): Profile {
    const profiles = this.getProfiles();
    const target = profiles.find(p => p.role === role);
    if (target) {
      this.setCurrentUserId(target.id);
      if (target.gym_id) {
        this.setCurrentGymId(target.gym_id);
      }
      return target;
    }
    return this.getCurrentProfile();
  }

  static createProfile(profile: Profile): void {
    const profiles = this.getProfiles();
    profiles.push(profile);
    save(STORAGE_KEYS.PROFILES, profiles);
  }

  // --- GYMS ---
  static getGyms(): Gym[] {
    return load<Gym[]>(STORAGE_KEYS.GYMS, INITIAL_GYMS);
  }

  static getGymById(gymId: string): Gym | undefined {
    return this.getGyms().find(g => g.id === gymId);
  }

  static getCurrentGym(): Gym {
    const gymId = this.getCurrentGymId();
    const gym = this.getGymById(gymId);
    if (gym) return gym;
    return this.getGyms()[0]; // Default Aman Sport club
  }

  static updateGym(updatedGym: Gym): void {
    const gyms = this.getGyms().map(g => g.id === updatedGym.id ? { ...updatedGym, updated_at: new Date().toISOString() } : g);
    save(STORAGE_KEYS.GYMS, gyms);
  }

  static updateGymStatus(gymId: string, status: Gym['status']): void {
    const gyms = this.getGyms().map(g => g.id === gymId ? { ...g, status, updated_at: new Date().toISOString() } : g);
    save(STORAGE_KEYS.GYMS, gyms);
  }

  // --- MEMBERSHIP PLANS ---
  static getMembershipPlans(gymId: string = this.getCurrentGymId()): MembershipPlan[] {
    const all = load<MembershipPlan[]>(STORAGE_KEYS.MEMBERSHIP_PLANS, INITIAL_MEMBERSHIP_PLANS);
    return all.filter(p => p.gym_id === gymId);
  }

  static getPlanById(planId: string): MembershipPlan | undefined {
    const all = load<MembershipPlan[]>(STORAGE_KEYS.MEMBERSHIP_PLANS, INITIAL_MEMBERSHIP_PLANS);
    return all.find(p => p.id === planId);
  }

  static addMembershipPlan(plan: Omit<MembershipPlan, 'id' | 'created_at' | 'updated_at'>): MembershipPlan {
    const all = load<MembershipPlan[]>(STORAGE_KEYS.MEMBERSHIP_PLANS, INITIAL_MEMBERSHIP_PLANS);
    const newPlan: MembershipPlan = {
      ...plan,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.push(newPlan);
    save(STORAGE_KEYS.MEMBERSHIP_PLANS, all);
    return newPlan;
  }

  static updateMembershipPlan(plan: MembershipPlan): void {
    const all = load<MembershipPlan[]>(STORAGE_KEYS.MEMBERSHIP_PLANS, INITIAL_MEMBERSHIP_PLANS);
    const updated = all.map(p => p.id === plan.id ? { ...plan, updated_at: new Date().toISOString() } : p);
    save(STORAGE_KEYS.MEMBERSHIP_PLANS, updated);
  }

  static deleteMembershipPlan(planId: string): void {
    const all = load<MembershipPlan[]>(STORAGE_KEYS.MEMBERSHIP_PLANS, INITIAL_MEMBERSHIP_PLANS);
    const filtered = all.filter(p => p.id !== planId);
    save(STORAGE_KEYS.MEMBERSHIP_PLANS, filtered);
  }

  // --- TRAINERS ---
  static getTrainers(gymId: string = this.getCurrentGymId()): Trainer[] {
    const all = load<Trainer[]>(STORAGE_KEYS.TRAINERS, INITIAL_TRAINERS);
    return all.filter(t => t.gym_id === gymId);
  }

  static getTrainerById(trainerId: string): Trainer | undefined {
    const all = load<Trainer[]>(STORAGE_KEYS.TRAINERS, INITIAL_TRAINERS);
    return all.find(t => t.id === trainerId);
  }

  static addTrainer(trainer: Omit<Trainer, 'id' | 'created_at' | 'updated_at'>): Trainer {
    const all = load<Trainer[]>(STORAGE_KEYS.TRAINERS, INITIAL_TRAINERS);
    const newTrainer: Trainer = {
      ...trainer,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.push(newTrainer);
    save(STORAGE_KEYS.TRAINERS, all);
    return newTrainer;
  }

  static updateTrainer(trainer: Trainer): void {
    const all = load<Trainer[]>(STORAGE_KEYS.TRAINERS, INITIAL_TRAINERS);
    const updated = all.map(t => t.id === trainer.id ? { ...trainer, updated_at: new Date().toISOString() } : t);
    save(STORAGE_KEYS.TRAINERS, updated);
  }

  static deleteTrainer(trainerId: string): void {
    const all = load<Trainer[]>(STORAGE_KEYS.TRAINERS, INITIAL_TRAINERS);
    const filtered = all.filter(t => t.id !== trainerId);
    save(STORAGE_KEYS.TRAINERS, filtered);
  }

  // --- MEMBERS ---
  static getMembers(gymId: string = this.getCurrentGymId()): Member[] {
    const all = load<Member[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    const plans = load<MembershipPlan[]>(STORAGE_KEYS.MEMBERSHIP_PLANS, INITIAL_MEMBERSHIP_PLANS);
    const trainers = load<Trainer[]>(STORAGE_KEYS.TRAINERS, INITIAL_TRAINERS);
    const today = new Date().toISOString().split('T')[0];

    return all
      .filter(m => m.gym_id === gymId)
      .map(m => {
        const isPast = m.membership_end_date < today;
        const currentStatus = isPast && m.status === 'active' ? 'expired' : m.status;
        return {
          ...m,
          status: currentStatus,
          membership_plan: plans.find(p => p.id === m.membership_plan_id),
          assigned_trainer: trainers.find(t => t.id === m.assigned_trainer_id),
        };
      });
  }

  static getMemberById(memberId: string): Member | undefined {
    return this.getMembers().find(m => m.id === memberId);
  }

  static getMemberByQRCode(qrToken: string, gymId: string = this.getCurrentGymId()): Member | undefined {
    return this.getMembers(gymId).find(m => m.qr_code_token === qrToken || m.member_code === qrToken);
  }

  static addMember(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>): Member {
    const all = load<Member[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    const newMember: Member = {
      ...member,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.unshift(newMember);
    save(STORAGE_KEYS.MEMBERS, all);

    // Also trigger in-app notification
    this.addNotification({
      gym_id: newMember.gym_id,
      title: 'New Member Registered',
      message: `${newMember.full_name} (${newMember.member_code}) has joined the club.`,
      type: 'system',
      is_read: false,
    });

    return newMember;
  }

  static updateMember(member: Member): void {
    const all = load<Member[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    const updated = all.map(m => m.id === member.id ? { ...member, updated_at: new Date().toISOString() } : m);
    save(STORAGE_KEYS.MEMBERS, updated);
  }

  static renewMembership(params: {
    memberId: string;
    newPlanId: string;
    paymentAmount: number;
    paymentMethod: PaymentMethod;
    transactionId?: string;
    notes?: string;
  }): { success: boolean; message: string; updatedMember?: Member } {
    const all = load<Member[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    const member = all.find(m => m.id === params.memberId);
    if (!member) return { success: false, message: 'Member not found' };

    const plan = this.getPlanById(params.newPlanId);
    if (!plan) return { success: false, message: 'Selected plan not found' };

    // Calculate dates:
    // If member is currently still active and end date is in the future, extend from their current end date!
    // If member is already expired, start from today!
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentEnd = new Date(member.membership_end_date);
    currentEnd.setHours(0, 0, 0, 0);

    const startDate = (currentEnd > today && member.status === 'active')
      ? currentEnd
      : today;

    const newEndDate = new Date(startDate);
    newEndDate.setDate(startDate.getDate() + (plan.duration_days || 30));

    const startDateStr = startDate.toISOString().split('T')[0];
    const newEndDateStr = newEndDate.toISOString().split('T')[0];

    const updatedMember: Member = {
      ...member,
      membership_plan_id: plan.id,
      membership_start_date: startDateStr,
      membership_end_date: newEndDateStr,
      status: 'active',
      updated_at: new Date().toISOString(),
    };

    const updatedAll = all.map(m => m.id === member.id ? updatedMember : m);
    save(STORAGE_KEYS.MEMBERS, updatedAll);

    // Record renewal invoice / payment
    const baseAmount = Number((params.paymentAmount / 1.18).toFixed(2));
    const taxAmount = Number((params.paymentAmount - baseAmount).toFixed(2));

    this.recordPayment({
      gym_id: member.gym_id,
      member_id: member.id,
      membership_plan_id: plan.id,
      invoice_number: `AMAN-REN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: baseAmount,
      tax_amount: taxAmount,
      discount_amount: 0,
      total_amount: params.paymentAmount,
      payment_method: params.paymentMethod,
      payment_date: new Date().toISOString(),
      status: 'paid',
      transaction_id: params.transactionId || `REN-${Date.now().toString(36).toUpperCase()}`,
      notes: params.notes || `Membership renewed with ${plan.name} (${plan.duration_months} mo)`,
    });

    // Add in-app notification
    this.addNotification({
      gym_id: member.gym_id,
      title: 'Membership Renewed',
      message: `${member.full_name} (${member.member_code}) renewed with ${plan.name} until ${newEndDateStr}.`,
      type: 'expiry',
      is_read: false,
    });

    return {
      success: true,
      message: `${member.full_name}'s membership successfully renewed with ${plan.name}! Valid until ${newEndDateStr}.`,
      updatedMember,
    };
  }

  static deleteMember(memberId: string): void {
    const all = load<Member[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    const filtered = all.filter(m => m.id !== memberId);
    save(STORAGE_KEYS.MEMBERS, filtered);
  }

  // --- ATTENDANCE ---
  static getAttendance(gymId: string = this.getCurrentGymId()): AttendanceRecord[] {
    const all = load<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    const members = this.getMembers(gymId);
    return all
      .filter(a => a.gym_id === gymId)
      .map(a => ({
        ...a,
        member: members.find(m => m.id === a.member_id),
      }))
      .sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime());
  }

  static checkInMember(params: {
    gymId?: string;
    memberId: string;
    method?: 'qr_code' | 'manual';
    sessionType?: string;
  }): { success: boolean; message: string; record?: AttendanceRecord } {
    const gymId = params.gymId || this.getCurrentGymId();
    const today = new Date().toISOString().split('T')[0];
    const all = load<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);

    // Check duplicate check-in for the same day
    const alreadyCheckedIn = all.find(
      a => a.gym_id === gymId && a.member_id === params.memberId && a.date === today
    );

    if (alreadyCheckedIn) {
      return {
        success: false,
        message: 'Member has already checked in for today!',
        record: alreadyCheckedIn,
      };
    }

    const member = this.getMemberById(params.memberId);
    if (!member) {
      return { success: false, message: 'Member not found' };
    }

    if (member.status === 'expired') {
      return {
        success: false,
        message: 'Member subscription has expired! Please renew first.',
      };
    }

    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      gym_id: gymId,
      member_id: params.memberId,
      trainer_id: member.assigned_trainer_id,
      date: today,
      check_in_time: new Date().toISOString(),
      method: params.method || 'qr_code',
      session_type: params.sessionType || 'Workout Session',
      created_at: new Date().toISOString(),
      member,
    };

    all.unshift(newRecord);
    save(STORAGE_KEYS.ATTENDANCE, all);

    return {
      success: true,
      message: `Welcome, ${member.full_name}! Check-in recorded at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      record: newRecord,
    };
  }

  static checkOutMember(attendanceId: string): void {
    const all = load<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    const updated = all.map(a => a.id === attendanceId ? { ...a, check_out_time: new Date().toISOString() } : a);
    save(STORAGE_KEYS.ATTENDANCE, updated);
  }

  // --- PAYMENTS ---
  static getPayments(gymId: string = this.getCurrentGymId()): PaymentRecord[] {
    const all = load<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    const members = this.getMembers(gymId);
    const plans = this.getMembershipPlans(gymId);

    return all
      .filter(p => p.gym_id === gymId)
      .map(p => ({
        ...p,
        member: members.find(m => m.id === p.member_id),
        membership_plan: plans.find(pl => pl.id === p.membership_plan_id),
      }))
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  }

  static recordPayment(payment: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>): PaymentRecord {
    const all = load<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    const newPayment: PaymentRecord = {
      ...payment,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.unshift(newPayment);
    save(STORAGE_KEYS.PAYMENTS, all);

    // If payment is for membership plan, update member's expiry date
    if (payment.membership_plan_id) {
      const plan = this.getPlanById(payment.membership_plan_id);
      const member = this.getMemberById(payment.member_id);
      if (plan && member) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + (plan.duration_days || 30));

        this.updateMember({
          ...member,
          membership_plan_id: plan.id,
          membership_start_date: startDate.toISOString().split('T')[0],
          membership_end_date: endDate.toISOString().split('T')[0],
          status: 'active',
        });
      }
    }

    // Add in-app notification
    this.addNotification({
      gym_id: newPayment.gym_id,
      title: 'Payment Received',
      message: `Payment of ₹${newPayment.total_amount.toLocaleString()} received via ${newPayment.payment_method.toUpperCase()}.`,
      type: 'payment',
      is_read: false,
    });

    return newPayment;
  }

  // --- WORKOUT PLANS ---
  static getWorkoutPlans(gymId: string = this.getCurrentGymId()): WorkoutPlan[] {
    const all = load<WorkoutPlan[]>(STORAGE_KEYS.WORKOUT_PLANS, INITIAL_WORKOUT_PLANS);
    return all.filter(wp => wp.gym_id === gymId);
  }

  static addWorkoutPlan(plan: Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at'>): WorkoutPlan {
    const all = load<WorkoutPlan[]>(STORAGE_KEYS.WORKOUT_PLANS, INITIAL_WORKOUT_PLANS);
    const newPlan: WorkoutPlan = {
      ...plan,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.push(newPlan);
    save(STORAGE_KEYS.WORKOUT_PLANS, all);
    return newPlan;
  }

  // --- DIET PLANS ---
  static getDietPlans(gymId: string = this.getCurrentGymId()): DietPlan[] {
    const all = load<DietPlan[]>(STORAGE_KEYS.DIET_PLANS, INITIAL_DIET_PLANS);
    return all.filter(dp => dp.gym_id === gymId);
  }

  static addDietPlan(plan: Omit<DietPlan, 'id' | 'created_at' | 'updated_at'>): DietPlan {
    const all = load<DietPlan[]>(STORAGE_KEYS.DIET_PLANS, INITIAL_DIET_PLANS);
    const newPlan: DietPlan = {
      ...plan,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.push(newPlan);
    save(STORAGE_KEYS.DIET_PLANS, all);
    return newPlan;
  }

  // --- EXPENSES ---
  static getExpenses(gymId: string = this.getCurrentGymId()): ExpenseRecord[] {
    const all = load<ExpenseRecord[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    return all
      .filter(e => e.gym_id === gymId)
      .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
  }

  static addExpense(expense: Omit<ExpenseRecord, 'id' | 'created_at'>): ExpenseRecord {
    const all = load<ExpenseRecord[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const newExpense: ExpenseRecord = {
      ...expense,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    all.unshift(newExpense);
    save(STORAGE_KEYS.EXPENSES, all);
    return newExpense;
  }

  // --- EQUIPMENT ---
  static getEquipment(gymId: string = this.getCurrentGymId()): EquipmentItem[] {
    const all = load<EquipmentItem[]>(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
    return all.filter(eq => eq.gym_id === gymId);
  }

  static addEquipment(equipment: Omit<EquipmentItem, 'id' | 'created_at' | 'updated_at'>): EquipmentItem {
    const all = load<EquipmentItem[]>(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
    const newEquipment: EquipmentItem = {
      ...equipment,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.push(newEquipment);
    save(STORAGE_KEYS.EQUIPMENT, all);
    return newEquipment;
  }

  static updateEquipment(equipment: EquipmentItem): void {
    const all = load<EquipmentItem[]>(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
    const updated = all.map(eq => eq.id === equipment.id ? { ...equipment, updated_at: new Date().toISOString() } : eq);
    save(STORAGE_KEYS.EQUIPMENT, updated);
  }

  // --- NOTIFICATIONS ---
  static getNotifications(gymId: string = this.getCurrentGymId()): GymNotification[] {
    const all = load<GymNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return all.filter(n => n.gym_id === gymId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static addNotification(notification: Omit<GymNotification, 'id' | 'created_at'>): GymNotification {
    const all = load<GymNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: GymNotification = {
      ...notification,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    all.unshift(newNotif);
    save(STORAGE_KEYS.NOTIFICATIONS, all);
    return newNotif;
  }

  static markNotificationAsRead(id: string): void {
    const all = load<GymNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = all.map(n => n.id === id ? { ...n, is_read: true } : n);
    save(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // --- SAAS SUBSCRIPTIONS (Super Admin) ---
  static getSubscriptions(): GymSubscription[] {
    return load<GymSubscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
  }
}

