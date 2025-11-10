export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: number;
  version: number;
}

export interface CookieState {
  preferences: CookiePreferences | null;
  showBanner: boolean;
  showModal: boolean;
}
