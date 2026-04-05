export interface Job {
  id: number | string;
  emoji: string;
  title: string;
  org: string;
  type: string;
  typeLabel: string;
  salary: string;
  location: string;
  lastDate: string;
  urgency: 'normal' | 'soon' | 'urgent';
  isNew: boolean;
  isRecommended: boolean;
  btnClass: string;
  qual: string;
  ageMin: number;
  ageMax: number;
  process: string;
  tags: string[];
}

export interface Notification {
  dot: string;
  text: string;
  desc: string;
  time: string;
}

export const JOBS: any[] = [];

export const NOTIFICATIONS: Notification[] = [];
