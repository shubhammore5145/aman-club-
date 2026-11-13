import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencySymbol: string = '₹'): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
  return `${currencySymbol}${formatted}`;
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTime(isoString: string | undefined | null): string {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

export function getDaysRemaining(endDateString: string): number {
  if (!endDateString) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(endDateString);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export interface ExpiryStatus {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysRemaining: number;
  label: string;
  variant: 'danger' | 'warning' | 'success';
}

export function getExpiryStatus(endDateString: string | undefined | null): ExpiryStatus {
  if (!endDateString) {
    return {
      isExpired: true,
      isExpiringSoon: false,
      daysRemaining: 0,
      label: 'No Expiry Set',
      variant: 'danger',
    };
  }

  const days = getDaysRemaining(endDateString);

  if (days < 0) {
    const absDays = Math.abs(days);
    return {
      isExpired: true,
      isExpiringSoon: false,
      daysRemaining: days,
      label: absDays === 1 ? 'Expired yesterday' : `Expired ${absDays} days ago`,
      variant: 'danger',
    };
  }

  if (days === 0) {
    return {
      isExpired: false,
      isExpiringSoon: true,
      daysRemaining: 0,
      label: 'Expires today',
      variant: 'warning',
    };
  }

  if (days <= 7) {
    return {
      isExpired: false,
      isExpiringSoon: true,
      daysRemaining: days,
      label: days === 1 ? 'Expires tomorrow' : `Expires in ${days} days`,
      variant: 'warning',
    };
  }

  return {
    isExpired: false,
    isExpiringSoon: false,
    daysRemaining: days,
    label: `${days} days left`,
    variant: 'success',
  };
}

export function generateInvoiceNumber(prefix: string = 'AMAN-INV'): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomNum}`;
}

export function generateMemberCode(prefix: string = 'AMAN'): string {
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${random}`;
}
