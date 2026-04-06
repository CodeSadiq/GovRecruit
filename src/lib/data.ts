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

export const NOTIFICATIONS: Notification[] = [
  { 
    time: "2 HOURS AGO", 
    text: "SSC CGL 2025: Vacancy inventory metadata has been updated with institutional branch mapping.", 
    desc: "The latest vacancy manifest for the Combined Graduate Level Examination 2025 is now fully synchronized with our matching engine. Candidates can now view individual post levels.",
    dot: "dot-green" 
  },
  { 
    time: "5 HOURS AGO", 
    text: "New recruitment notification from Indian Railways (RRB) for Technical Personnel.", 
    desc: "RRB has announced a new recruitment cycle for technical posts. The baseline eligibility registry will be updated within the next 12 hours.",
    dot: "dot-amber" 
  },
  { 
    time: "1 DAY AGO", 
    text: "IBPS PO 2025: Final interview schedule has been released for all Banking institutions.", 
    desc: "Candidates who cleared the mains can now download their interview call letters. Institutional mapping for final placement is currently in progress.",
    dot: "dot-navy" 
  },
  { 
    time: "1 DAY AGO", 
    text: "UPSC CSE 2025: Preliminary examinee manifest has been established and verified.", 
    desc: "The Civil Services (Preliminary) Examination manifest is now locked. No further modifications to candidate credentials will be accepted for this cycle.",
    dot: "dot-green" 
  },
  { 
    time: "2 DAYS AGO", 
    text: "Institutional Maintenance: Baseline registry sync was successfully completed.", 
    desc: "Our core data manifest has been synchronized with the central institutional registry. Matching scores across all profiles have been recalculated for parity.",
    dot: "dot-green" 
  }
];
