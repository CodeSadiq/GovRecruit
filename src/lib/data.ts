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
  }
];

export const CATEGORY_DATA: Record<string, any[]> = {
  "All Jobs": [
    { text: "Ministry of Defense: Entry for 400+ Civilian Personnel now open.", time: "1 HOUR AGO" },
    { text: "ISRO Technical Assistant: Recruitment notification officially mapped.", time: "5 HOURS AGO" },
    { text: "State Bank of India: Specialist Officer recruitment manifest released.", time: "1 DAY AGO" },
    { text: "NPCIL Scientific Officer: Graduate training program registry entry.", time: "2 DAYS AGO" }
  ],
  "Important": [
    { text: "NCTE New Guidelines: Mandatory qualification parity for teaching posts.", time: "1 HOUR AGO" },
    { text: "National Recruitment Agency: CET implementation manifest for 2026.", time: "4 HOURS AGO" },
    { text: "Aadhaar Mandatory Policy: Secure registry sync required for all applications.", time: "1 DAY AGO" },
    { text: "Institutional Warning: Phishing alert for fraudulent appointment letters.", time: "2 DAYS AGO" }
  ],
  "Admit Card": [
    { text: "UPSC CSE Mains 2025: E-Admit cards now accessible via portal.", time: "2 HOURS AGO" },
    { text: "SSC CGL Tier II: Hall tickets established for Southern Region.", time: "5 HOURS AGO" },
    { text: "RRB Group D: Phase 3 examinee manifest admit cards released.", time: "1 DAY AGO" },
    { text: "SBI PO Prelims: Official call letters established for distribution.", time: "1 DAY AGO" }
  ],
  "Result": [
    { text: "SSC Multi Tasking Staff (MTS) 2024: Final merit manifest established.", time: "1 HOUR AGO" },
    { text: "RRB NTPC: Stage-II computerized test results officially released.", time: "4 HOURS AGO" },
    { text: "UPSC Combined Geologist: Selection registry now public.", time: "1 DAY AGO" },
    { text: "BPSS SC 2024: Provisional interview checklist finalized.", time: "2 DAYS AGO" }
  ],
  "Admission": [
    { text: "IIT Bombay M.Tech 2025: Admission portal remains open for Round 2 entries.", time: "4 HOURS AGO" },
    { text: "Delhi University PG Admissions: Revised seat allocation manifest released.", time: "1 DAY AGO" },
    { text: "NLU CLAT 2025: Preliminary seat matrix has been established.", time: "2 DAYS AGO" },
    { text: "JNU PhD Admissions: Viva-voce registry now finalized.", time: "3 DAYS AGO" }
  ],
  "Syllabus": [
    { text: "UPPSC Combined Services: Revised preliminary syllabus manifest published.", time: "2 HOURS AGO" },
    { text: "SSC Multi Tasking Staff: New departmental curriculum mapping update.", time: "6 HOURS AGO" },
    { text: "Railway Recruitment Board: Technical examination syllabus established.", time: "1 DAY AGO" },
    { text: "UPSC Optional Subjects: Updated literature syllabus for 2026 cycle.", time: "3 DAYS AGO" }
  ]
};
