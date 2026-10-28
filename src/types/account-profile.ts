export interface LoginActivityItem {
  id: string;
  status: 'SUCCESS' | 'FAILED';
  title: string;
  device: string;
  date: string;
  time: string;
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
}

export interface UserAccountProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl: string | null;
  outletCount: number;
  joinedDate: string;
  lastLogin: {
    datetime: string;
    location: string;
  };
  notifications: {
    orders: NotificationSettings;
    transactions: NotificationSettings;
    reservations: NotificationSettings;
    dailySummary: NotificationSettings;
  };
  preferences: {
    language: string;
    dateFormat: string;
    timezone: string;
  };
  loginActivities: LoginActivityItem[];
}
