export interface FreeTrial {
  id: string;
  email: string;
  user_id?: string;
  order_id?: string;
  promo_code?: string;
  trial_start_date: string;
  trial_end_date: string;
  is_active: boolean;
  reminder_sent_7_days: boolean;
  reminder_sent_3_days: boolean;
  reminder_sent_1_day: boolean;
  reminder_sent_expired: boolean;
  created_at: string;
  // Computed fields
  daysRemaining?: number;
  isExpired?: boolean;
}

export interface ReminderLog {
  id: string;
  trial_id: string;
  email: string;
  reminder_type: string;
  sent_at: string;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface FreeTrialStats {
  totalTrials: number;
  activeTrials: number;
  expiredTrials: number;
  expiringIn7Days: number;
  expiringIn3Days: number;
  expiringIn1Day: number;
  totalRemindersSent: number;
  remindersByType: {
    welcome: number;
    '7_days': number;
    '3_days': number;
    '1_day': number;
    expired: number;
  };
}

export interface ProcessRemindersResult {
  success: boolean;
  processed: number;
  reminders_7_days: number;
  reminders_3_days: number;
  reminders_1_day: number;
  reminders_expired: number;
  errors: string[];
  timestamp: string;
}
