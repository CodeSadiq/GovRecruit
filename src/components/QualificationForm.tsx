import { useState, useEffect } from "react";

// ─── DATA MAP (mirrors job_extraction_prompt.txt exactly) ───────────────────

const QUAL_TREE = [
  {
    level: 1,
    name: "10th",
    label: "10th / Matriculation",
    icon: "📘",
    branches: [],
  },
  {
    level: 2,
    name: "12th",
    label: "12th / Intermediate / HSC",
    icon: "📗",
    branches: [
      { value: "any", label: "Any Stream" },
      { value: "Science (PCM)", label: "Science – PCM (Physics, Chemistry, Maths)" },
      { value: "Science (PCB)", label: "Science – PCB (Physics, Chemistry, Biology)" },
      { value: "Commerce", label: "Commerce" },
      { value: "Arts", label: "Arts / Humanities" },
      { value: "Vocational", label: "Vocational" },
    ],
  },
  {
    level: 3,
    name: "ITI",
    label: "ITI Certificate",
    icon: "🔧",
    branches: [
      { value: "Electrician", label: "Electrician" },
      { value: "Fitter", label: "Fitter" },
      { value: "Welder", label: "Welder" },
      { value: "Turner", label: "Turner" },
      { value: "Machinist", label: "Machinist" },
      { value: "Plumber", label: "Plumber" },
      { value: "Carpenter", label: "Carpenter" },
      { value: "Painter", label: "Painter" },
      { value: "Mason", label: "Mason" },
      { value: "Motor Mechanic", label: "Motor Mechanic" },
      { value: "Diesel Mechanic", label: "Diesel Mechanic" },
      { value: "Refrigeration and AC Mechanic", label: "Refrigeration & AC Mechanic" },
      { value: "Electronics Mechanic", label: "Electronics Mechanic" },
      { value: "Instrument Mechanic", label: "Instrument Mechanic" },
      { value: "COPA", label: "COPA (Computer Operator)" },
      { value: "Draughtsman Civil", label: "Draughtsman Civil" },
      { value: "Draughtsman Mechanical", label: "Draughtsman Mechanical" },
      { value: "Sheet Metal Worker", label: "Sheet Metal Worker" },
      { value: "Wireman", label: "Wireman" },
      { value: "Stenographer", label: "Stenographer" },
      { value: "Surveyor", label: "Surveyor" },
      { value: "Solar Technician", label: "Solar Technician" },
      { value: "Network Technician", label: "Network Technician" },
      { value: "Foundry Man", label: "Foundry Man" },
      { value: "Blacksmith", label: "Blacksmith" },
      { value: "Electroplater", label: "Electroplater" },
      { value: "Rubber Technician", label: "Rubber Technician" },
      { value: "Book Binder", label: "Book Binder" },
      { value: "Photographer", label: "Photographer" },
    ],
  },
  {
    level: 3,
    name: "Diploma",
    label: "Diploma / Polytechnic",
    icon: "📐",
    branches: [
      { value: "CSE", label: "Computer Science & Engineering (CSE)" },
      { value: "IT", label: "Information Technology (IT)" },
      { value: "Mechanical", label: "Mechanical Engineering" },
      { value: "Civil", label: "Civil Engineering" },
      { value: "Electrical", label: "Electrical Engineering" },
      { value: "EEE", label: "Electrical & Electronics (EEE)" },
      { value: "ECE", label: "Electronics & Communication (ECE)" },
      { value: "Chemical", label: "Chemical Engineering" },
      { value: "Automobile", label: "Automobile Engineering" },
      { value: "Production", label: "Production Engineering" },
      { value: "Instrumentation", label: "Instrumentation Engineering" },
      { value: "Mining", label: "Mining Engineering" },
      { value: "Textile", label: "Textile Engineering" },
      { value: "Architecture", label: "Architecture" },
      { value: "Pharmacy", label: "Pharmacy (D.Pharm)" },
      { value: "Medical Lab Technology", label: "Medical Lab Technology (DMLT)" },
      { value: "Hotel Management", label: "Hotel Management" },
      { value: "Fashion Design", label: "Fashion Design" },
      { value: "any", label: "Any / Relevant Branch" },
    ],
  },
  {
    level: 3,
    name: "GNM",
    label: "GNM (General Nursing & Midwifery)",
    icon: "🏥",
    branches: [],
  },
  {
    level: 3,
    name: "ANM",
    label: "ANM (Auxiliary Nurse Midwife)",
    icon: "💉",
    branches: [],
  },
  {
    level: 3,
    name: "D.Pharm",
    label: "D.Pharm (Diploma in Pharmacy)",
    icon: "💊",
    branches: [],
  },
  // ── LEVEL 4 ──
  {
    level: 4,
    name: "Graduate",
    label: "Graduate – Any Degree",
    icon: "🎓",
    branches: [{ value: "any", label: "Any Discipline" }],
  },
  {
    level: 4,
    name: "B.Tech",
    label: "B.Tech / BE (Engineering)",
    icon: "⚙️",
    branches: [
      { value: "CSE", label: "CSE" },
      { value: "IT", label: "IT" },
      { value: "Mechanical", label: "Mechanical" },
      { value: "Civil", label: "Civil" },
      { value: "Electrical", label: "Electrical" },
      { value: "EEE", label: "EEE" },
      { value: "ECE", label: "ECE" },
      { value: "Chemical", label: "Chemical" },
      { value: "Aerospace", label: "Aerospace" },
      { value: "Automobile", label: "Automobile" },
      { value: "Production", label: "Production" },
      { value: "Industrial", label: "Industrial" },
      { value: "Instrumentation", label: "Instrumentation" },
      { value: "Mining", label: "Mining" },
      { value: "Metallurgy", label: "Metallurgy" },
      { value: "Biotechnology", label: "Biotechnology" },
      { value: "Environmental Engineering", label: "Environmental Engineering" },
      { value: "Marine", label: "Marine" },
      { value: "Textile", label: "Textile" },
      { value: "AI", label: "AI / Artificial Intelligence" },
      { value: "Data Science", label: "Data Science" },
      { value: "Cyber Security", label: "Cyber Security" },
      { value: "Software Engineering", label: "Software Engineering" },
      { value: "Network Engineering", label: "Network Engineering" },
      { value: "VLSI", label: "VLSI" },
      { value: "Embedded Systems", label: "Embedded Systems" },
      { value: "Robotics", label: "Robotics" },
      { value: "Petroleum", label: "Petroleum" },
      { value: "Nuclear", label: "Nuclear" },
      { value: "Agricultural Engineering", label: "Agricultural Engineering" },
      { value: "Biomedical", label: "Biomedical" },
      { value: "Food Technology", label: "Food Technology" },
      { value: "Nanotechnology", label: "Nanotechnology" },
      { value: "any", label: "Any / Relevant Branch" },
    ],
  },
  {
    level: 4,
    name: "B.Sc",
    label: "B.Sc (Science)",
    icon: "🔬",
    branches: [
      { value: "Physics", label: "Physics" },
      { value: "Chemistry", label: "Chemistry" },
      { value: "Mathematics", label: "Mathematics" },
      { value: "Statistics", label: "Statistics" },
      { value: "Biology", label: "Biology" },
      { value: "Zoology", label: "Zoology" },
      { value: "Botany", label: "Botany" },
      { value: "Microbiology", label: "Microbiology" },
      { value: "Biochemistry", label: "Biochemistry" },
      { value: "Environmental Science", label: "Environmental Science" },
      { value: "Geology", label: "Geology" },
      { value: "Geography", label: "Geography" },
      { value: "Computer Science", label: "Computer Science (B.Sc CS)" },
      { value: "Electronics", label: "Electronics (B.Sc)" },
      { value: "Biotechnology", label: "Biotechnology" },
      { value: "Forensic Science", label: "Forensic Science" },
      { value: "Agriculture", label: "Agriculture" },
      { value: "Nursing", label: "Nursing (B.Sc Nursing)" },
      { value: "any", label: "Any Science Subject" },
    ],
  },
  {
    level: 4,
    name: "BA",
    label: "BA (Arts / Humanities)",
    icon: "🎨",
    branches: [
      { value: "Economics", label: "Economics" },
      { value: "History", label: "History" },
      { value: "Political Science", label: "Political Science" },
      { value: "Sociology", label: "Sociology" },
      { value: "Psychology", label: "Psychology" },
      { value: "Public Administration", label: "Public Administration" },
      { value: "Social Work", label: "Social Work" },
      { value: "English", label: "English" },
      { value: "Hindi", label: "Hindi" },
      { value: "Sanskrit", label: "Sanskrit" },
      { value: "Urdu", label: "Urdu" },
      { value: "Bengali", label: "Bengali" },
      { value: "Tamil", label: "Tamil" },
      { value: "Telugu", label: "Telugu" },
      { value: "Marathi", label: "Marathi" },
      { value: "Kannada", label: "Kannada" },
      { value: "Malayalam", label: "Malayalam" },
      { value: "Odia", label: "Odia" },
      { value: "Punjabi", label: "Punjabi" },
      { value: "Gujarati", label: "Gujarati" },
      { value: "Journalism", label: "Journalism / Mass Communication" },
      { value: "Philosophy", label: "Philosophy" },
      { value: "Anthropology", label: "Anthropology" },
      { value: "Geography", label: "Geography" },
      { value: "International Relations", label: "International Relations" },
      { value: "Defence Studies", label: "Defence Studies" },
      { value: "Fine Arts", label: "Fine Arts" },
      { value: "Music", label: "Music" },
      { value: "Physical Education", label: "Physical Education" },
      { value: "Library Science", label: "Library Science" },
      { value: "Education", label: "Education" },
      { value: "any", label: "Any Arts Subject" },
    ],
  },
  {
    level: 4,
    name: "B.Com",
    label: "B.Com (Commerce)",
    icon: "💼",
    branches: [
      { value: "Accounting", label: "Accounting" },
      { value: "Finance", label: "Finance" },
      { value: "Banking", label: "Banking & Insurance" },
      { value: "Taxation", label: "Taxation" },
      { value: "Marketing", label: "Marketing" },
      { value: "Human Resource", label: "Human Resource" },
      { value: "International Business", label: "International Business" },
      { value: "any", label: "Any Commerce Subject" },
    ],
  },
  {
    level: 4,
    name: "BCA",
    label: "BCA (Computer Applications)",
    icon: "💻",
    branches: [{ value: "Computer Applications", label: "Computer Applications" }],
  },
  {
    level: 4,
    name: "BBA",
    label: "BBA / BBM (Business Administration)",
    icon: "📊",
    branches: [
      { value: "Business Administration", label: "Business Administration" },
      { value: "Marketing", label: "Marketing" },
      { value: "Finance", label: "Finance" },
      { value: "Human Resource", label: "Human Resource" },
      { value: "Operations", label: "Operations" },
      { value: "Hospital Management", label: "Hospital Management" },
      { value: "Aviation Management", label: "Aviation Management" },
      { value: "Hotel Management", label: "Hotel Management" },
      { value: "any", label: "Any Specialisation" },
    ],
  },
  {
    level: 4,
    name: "B.Pharm",
    label: "B.Pharm (Pharmacy)",
    icon: "💊",
    branches: [{ value: "Pharmacy", label: "Pharmacy" }],
  },
  {
    level: 4,
    name: "MBBS",
    label: "MBBS (Medicine)",
    icon: "🩺",
    branches: [{ value: "any", label: "Medicine" }],
  },
  {
    level: 4,
    name: "BDS",
    label: "BDS (Dental Surgery)",
    icon: "🦷",
    branches: [{ value: "any", label: "Dental" }],
  },
  {
    level: 4,
    name: "BAMS",
    label: "BAMS (Ayurvedic Medicine)",
    icon: "🌿",
    branches: [{ value: "any", label: "Ayurveda" }],
  },
  {
    level: 4,
    name: "BHMS",
    label: "BHMS (Homeopathic Medicine)",
    icon: "🌿",
    branches: [{ value: "any", label: "Homeopathy" }],
  },
  {
    level: 4,
    name: "BUMS",
    label: "BUMS (Unani Medicine)",
    icon: "🌿",
    branches: [{ value: "any", label: "Unani" }],
  },
  {
    level: 4,
    name: "B.Sc Nursing",
    label: "B.Sc Nursing",
    icon: "🏥",
    branches: [{ value: "Nursing", label: "Nursing" }],
  },
  {
    level: 4,
    name: "LLB",
    label: "LLB / BA LLB (Law)",
    icon: "⚖️",
    branches: [{ value: "Law", label: "Law" }],
  },
  {
    level: 4,
    name: "B.Ed",
    label: "B.Ed (Education)",
    icon: "📚",
    branches: [{ value: "Education", label: "Education" }],
  },
  {
    level: 4,
    name: "B.Arch",
    label: "B.Arch (Architecture)",
    icon: "🏛️",
    branches: [{ value: "Architecture", label: "Architecture" }],
  },
  {
    level: 4,
    name: "CA",
    label: "CA (Chartered Accountant)",
    icon: "🧾",
    branches: [{ value: "CA", label: "Chartered Accountancy" }],
  },
  {
    level: 4,
    name: "CS",
    label: "CS (Company Secretary)",
    icon: "📋",
    branches: [{ value: "CS", label: "Company Secretaryship" }],
  },
  {
    level: 4,
    name: "CMA",
    label: "CMA / ICWA (Cost Accountant)",
    icon: "🧮",
    branches: [{ value: "CMA", label: "Cost Management Accountancy" }],
  },
  // ── LEVEL 5 ──
  {
    level: 5,
    name: "Post Graduate",
    label: "Post Graduate – Any Master's",
    icon: "🎓",
    branches: [{ value: "any", label: "Any Discipline" }],
  },
  {
    level: 5,
    name: "M.Tech",
    label: "M.Tech / ME (Engineering PG)",
    icon: "⚙️",
    branches: [
      { value: "CSE", label: "CSE" },
      { value: "IT", label: "IT" },
      { value: "Mechanical", label: "Mechanical" },
      { value: "Civil", label: "Civil" },
      { value: "Electrical", label: "Electrical" },
      { value: "ECE", label: "ECE" },
      { value: "Chemical", label: "Chemical" },
      { value: "Structural", label: "Structural Engineering" },
      { value: "AI", label: "AI / Machine Learning" },
      { value: "Data Science", label: "Data Science" },
      { value: "VLSI", label: "VLSI" },
      { value: "Embedded Systems", label: "Embedded Systems" },
      { value: "any", label: "Any Branch" },
    ],
  },
  {
    level: 5,
    name: "MBA",
    label: "MBA / PGDM (Management PG)",
    icon: "📊",
    branches: [
      { value: "Business Administration", label: "General Management" },
      { value: "Finance", label: "Finance" },
      { value: "Marketing", label: "Marketing" },
      { value: "Human Resource", label: "Human Resource" },
      { value: "Operations", label: "Operations" },
      { value: "Information Technology", label: "IT Management" },
      { value: "Hospital Management", label: "Hospital Management" },
      { value: "International Business", label: "International Business" },
      { value: "any", label: "Any Specialisation" },
    ],
  },
  {
    level: 5,
    name: "M.Sc",
    label: "M.Sc (Science PG)",
    icon: "🔬",
    branches: [
      { value: "Physics", label: "Physics" },
      { value: "Chemistry", label: "Chemistry" },
      { value: "Mathematics", label: "Mathematics" },
      { value: "Statistics", label: "Statistics" },
      { value: "Biology", label: "Biology" },
      { value: "Microbiology", label: "Microbiology" },
      { value: "Biochemistry", label: "Biochemistry" },
      { value: "Biotechnology", label: "Biotechnology" },
      { value: "Computer Science", label: "Computer Science" },
      { value: "Environmental Science", label: "Environmental Science" },
      { value: "Forensic Science", label: "Forensic Science" },
      { value: "Geology", label: "Geology" },
      { value: "Geography", label: "Geography" },
      { value: "any", label: "Any Science Subject" },
    ],
  },
  {
    level: 5,
    name: "MA",
    label: "MA (Arts / Humanities PG)",
    icon: "🎨",
    branches: [
      { value: "Economics", label: "Economics" },
      { value: "History", label: "History" },
      { value: "Political Science", label: "Political Science" },
      { value: "Sociology", label: "Sociology" },
      { value: "Psychology", label: "Psychology" },
      { value: "Public Administration", label: "Public Administration" },
      { value: "English", label: "English" },
      { value: "Hindi", label: "Hindi" },
      { value: "Journalism", label: "Journalism / Mass Communication" },
      { value: "Social Work", label: "Social Work" },
      { value: "any", label: "Any Arts Subject" },
    ],
  },
  {
    level: 5,
    name: "M.Com",
    label: "M.Com (Commerce PG)",
    icon: "💼",
    branches: [
      { value: "Accounting", label: "Accounting" },
      { value: "Finance", label: "Finance" },
      { value: "Taxation", label: "Taxation" },
      { value: "any", label: "Any Commerce Subject" },
    ],
  },
  {
    level: 5,
    name: "MCA",
    label: "MCA (Computer Applications PG)",
    icon: "💻",
    branches: [{ value: "Computer Applications", label: "Computer Applications" }],
  },
  {
    level: 5,
    name: "LLM",
    label: "LLM (Law PG)",
    icon: "⚖️",
    branches: [{ value: "Law PG", label: "Law" }],
  },
  {
    level: 5,
    name: "M.Ed",
    label: "M.Ed (Education PG)",
    icon: "📚",
    branches: [{ value: "Education", label: "Education" }],
  },
  {
    level: 5,
    name: "M.Pharm",
    label: "M.Pharm (Pharmacy PG)",
    icon: "💊",
    branches: [{ value: "M.Pharm", label: "Pharmacy" }],
  },
  {
    level: 5,
    name: "M.Arch",
    label: "M.Arch (Architecture PG)",
    icon: "🏛️",
    branches: [{ value: "Architecture", label: "Architecture" }],
  },
  // ── LEVEL 6 ──
  {
    level: 6,
    name: "PhD",
    label: "PhD / Doctorate",
    icon: "🎖️",
    branches: [{ value: "any", label: "Any Discipline" }],
  },
];

const LEVEL_GROUPS = [
  { label: "School Level", levels: [1, 2] },
  { label: "Diploma / Certificate Level (Level 3)", levels: [3] },
  { label: "Graduation Level (Level 4)", levels: [4] },
  { label: "Post Graduation Level (Level 5)", levels: [5] },
  { label: "Doctorate Level (Level 6)", levels: [6] },
];

// ─── STYLES ─────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0b0f1a;
    --surface: #111827;
    --surface2: #1a2235;
    --border: #1e2d45;
    --border-active: #3b82f6;
    --accent: #3b82f6;
    --accent2: #06b6d4;
    --accent-glow: rgba(59,130,246,0.15);
    --text: #e2e8f0;
    --muted: #64748b;
    --success: #10b981;
    --tag-bg: rgba(59,130,246,0.12);
    --tag-border: rgba(59,130,246,0.3);
    --radius: 12px;
    --radius-sm: 8px;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Sora', sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 40px 16px 80px;
  }

  .container {
    width: 100%;
    max-width: 720px;
  }

  .header {
    margin-bottom: 36px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
  }

  .header-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--tag-bg);
    border: 1px solid var(--tag-border);
    color: var(--accent);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 99px;
    margin-bottom: 14px;
    font-family: 'JetBrains Mono', monospace;
  }

  .header h1 {
    font-size: clamp(22px, 4vw, 32px);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: #fff;
    margin-bottom: 8px;
  }

  .header p {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.6;
  }

  /* Progress bar */
  .progress-wrap {
    margin-bottom: 32px;
  }

  .progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 8px;
    font-family: 'JetBrains Mono', monospace;
  }

  .progress-track {
    height: 4px;
    background: var(--surface2);
    border-radius: 99px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    border-radius: 99px;
    transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
  }

  /* Step */
  .step {
    margin-bottom: 28px;
    animation: fadeUp 0.3s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .step-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent2);
    margin-bottom: 10px;
    font-family: 'JetBrains Mono', monospace;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .step-label::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 1px;
    background: var(--accent2);
  }

  .step-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 16px;
  }

  /* Level group selector */
  .level-group {
    margin-bottom: 10px;
  }

  .level-group-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
    padding-left: 2px;
  }

  .qual-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
  }

  .qual-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.18s ease;
    user-select: none;
  }

  .qual-card:hover {
    border-color: var(--accent);
    background: var(--surface2);
  }

  .qual-card.selected {
    border-color: var(--accent);
    background: var(--accent-glow);
    box-shadow: 0 0 0 1px var(--accent);
  }

  .qual-icon {
    font-size: 18px;
    flex-shrink: 0;
    line-height: 1;
  }

  .qual-text {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    line-height: 1.3;
  }

  .qual-lvl {
    font-size: 10px;
    color: var(--muted);
    font-family: 'JetBrains Mono', monospace;
    margin-top: 1px;
  }

  /* Branch selector */
  .branch-search {
    width: 100%;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    color: var(--text);
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    margin-bottom: 12px;
    outline: none;
    transition: border-color 0.18s;
  }

  .branch-search:focus {
    border-color: var(--accent);
  }

  .branch-search::placeholder {
    color: var(--muted);
  }

  .branch-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 7px;
    max-height: 280px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .branch-grid::-webkit-scrollbar { width: 4px; }
  .branch-grid::-webkit-scrollbar-track { background: transparent; }
  .branch-grid::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

  .branch-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-family: 'Sora', sans-serif;
    font-size: 12.5px;
    color: var(--text);
    transition: all 0.15s ease;
    text-align: left;
    line-height: 1.3;
  }

  .branch-btn:hover { border-color: var(--accent); background: var(--surface2); }
  .branch-btn.selected { border-color: var(--accent); background: var(--accent-glow); }

  .check-circle {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1.5px solid var(--muted);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    font-size: 9px;
  }

  .branch-btn.selected .check-circle {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }

  /* Result card */
  .result-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-top: 8px;
  }

  .result-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 14px;
    font-family: 'JetBrains Mono', monospace;
  }

  .result-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    gap: 12px;
  }

  .result-row:last-child { border-bottom: none; }

  .result-key {
    font-size: 12px;
    color: var(--muted);
    font-family: 'JetBrains Mono', monospace;
    flex-shrink: 0;
    padding-top: 1px;
  }

  .result-val {
    font-size: 13px;
    color: var(--text);
    font-weight: 500;
    text-align: right;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    background: var(--tag-bg);
    border: 1px solid var(--tag-border);
    color: var(--accent);
    font-size: 11px;
    font-weight: 500;
    padding: 3px 9px;
    border-radius: 99px;
    margin: 2px;
    font-family: 'JetBrains Mono', monospace;
  }

  .json-block {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--accent2);
    white-space: pre;
    overflow-x: auto;
    margin-top: 16px;
    line-height: 1.7;
  }

  /* Button */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: var(--radius-sm);
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.18s ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #fff;
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(59,130,246,0.3);
  }

  .btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .btn-ghost {
    background: var(--surface);
    border: 1.5px solid var(--border);
    color: var(--muted);
  }

  .btn-ghost:hover {
    border-color: var(--accent);
    color: var(--text);
  }

  .actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 28px;
  }

  .info-box {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    background: rgba(6,182,212,0.06);
    border: 1px solid rgba(6,182,212,0.2);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    margin-top: 12px;
  }

  .info-box-icon { font-size: 16px; flex-shrink: 0; }

  .info-box p {
    font-size: 12.5px;
    color: #94a3b8;
    line-height: 1.6;
  }

  .copy-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .copy-btn:hover { border-color: var(--accent); color: var(--accent); }

  .level-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.25);
    color: var(--success);
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 99px;
    font-family: 'JetBrains Mono', monospace;
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 24px 0;
  }

  .no-branch-note {
    font-size: 13px;
    color: var(--muted);
    padding: 12px 0;
    font-style: italic;
  }
`;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function QualificationForm() {
  const [step, setStep] = useState(1); // 1 = pick qual, 2 = pick branch, 3 = confirm
  const [selectedQual, setSelectedQual] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchQuery, setBranchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // inject styles
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = styles;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const currentBranches = selectedQual?.branches ?? [];
  const needsBranch = currentBranches.length > 0;

  const filteredBranches = currentBranches.filter((b) =>
    b.label.toLowerCase().includes(branchQuery.toLowerCase())
  );

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  const outputProfile = selectedQual
    ? {
      qualification: selectedQual.name,
      level: selectedQual.level,
      branch:
        !needsBranch
          ? "any"
          : selectedBranch ?? "any",
    }
    : null;

  const jsonOutput = outputProfile
    ? JSON.stringify(outputProfile, null, 2)
    : "";

  function selectQual(q) {
    setSelectedQual(q);
    setSelectedBranch(null);
    setBranchQuery("");
    if (!q.branches || q.branches.length === 0) {
      setStep(3); // no branch needed
    } else if (q.branches.length === 1) {
      setSelectedBranch(q.branches[0].value);
      setStep(3); // auto-select single branch
    } else {
      setStep(2);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(jsonOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function reset() {
    setStep(1);
    setSelectedQual(null);
    setSelectedBranch(null);
    setBranchQuery("");
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="header-badge">🇮🇳 Govt Jobs Portal</div>
        <h1>Qualification Profile</h1>
        <p>
          Select your highest qualification. This is matched against recruitment
          notifications to show you eligible jobs.
        </p>
      </div>

      {/* Progress */}
      <div className="progress-wrap">
        <div className="progress-label">
          <span>
            Step {step} of 3 —{" "}
            {step === 1
              ? "Select Qualification"
              : step === 2
                ? "Select Branch / Stream"
                : "Confirm Profile"}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ── STEP 1: Pick Qualification ── */}
      {step === 1 && (
        <div className="step" key="step1">
          <div className="step-label">Step 01</div>
          <div className="step-title">
            What is your highest qualification?
          </div>

          {LEVEL_GROUPS.map((group) => {
            const qualsInGroup = QUAL_TREE.filter((q) =>
              group.levels.includes(q.level)
            );
            if (!qualsInGroup.length) return null;
            return (
              <div className="level-group" key={group.label}>
                <div className="level-group-title">{group.label}</div>
                <div className="qual-grid">
                  {qualsInGroup.map((q) => (
                    <div
                      key={q.name}
                      className={`qual-card ${selectedQual?.name === q.name ? "selected" : ""}`}
                      onClick={() => selectQual(q)}
                    >
                      <span className="qual-icon">{q.icon}</span>
                      <div>
                        <div className="qual-text">{q.label}</div>
                        <div className="qual-lvl">Level {q.level}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 20 }} />
              </div>
            );
          })}
        </div>
      )}

      {/* ── STEP 2: Pick Branch ── */}
      {step === 2 && selectedQual && (
        <div className="step" key="step2">
          <div className="step-label">Step 02</div>
          <div className="step-title">
            {selectedQual.icon} {selectedQual.label} — Select your branch /
            specialisation
          </div>

          <input
            className="branch-search"
            placeholder="Search branch…"
            value={branchQuery}
            onChange={(e) => setBranchQuery(e.target.value)}
            autoFocus
          />

          {filteredBranches.length === 0 && (
            <div className="no-branch-note">No matching branch found.</div>
          )}

          <div className="branch-grid">
            {filteredBranches.map((b) => (
              <button
                key={b.value}
                className={`branch-btn ${selectedBranch === b.value ? "selected" : ""}`}
                onClick={() => setSelectedBranch(b.value)}
              >
                <div className="check-circle">
                  {selectedBranch === b.value && "✓"}
                </div>
                {b.label}
              </button>
            ))}
          </div>

          <div className="actions">
            <button
              className="btn btn-ghost"
              onClick={() => { setStep(1); setSelectedBranch(null); }}
            >
              ← Back
            </button>
            <button
              className="btn btn-primary"
              disabled={!selectedBranch}
              onClick={() => setStep(3)}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Confirm ── */}
      {step === 3 && outputProfile && (
        <div className="step" key="step3">
          <div className="step-label">Step 03</div>
          <div className="step-title">Your Qualification Profile</div>

          <div className="result-card">
            <div className="result-title">// profile summary</div>

            <div className="result-row">
              <div className="result-key">qualification</div>
              <div className="result-val">{outputProfile.qualification}</div>
            </div>

            <div className="result-row">
              <div className="result-key">level</div>
              <div className="result-val">
                <span className="level-badge">⬆ Level {outputProfile.level}</span>
              </div>
            </div>

            <div className="result-row">
              <div className="result-key">branch</div>
              <div className="result-val">
                <span className="tag">{outputProfile.branch}</span>
              </div>
            </div>
          </div>

          <div className="info-box" style={{ marginTop: 16 }}>
            <div className="info-box-icon">ℹ️</div>
            <p>
              Jobs requiring Level {outputProfile.level} or below with a
              matching branch will be shown to you. You'll also see jobs that
              accept{" "}
              <strong style={{ color: "#e2e8f0" }}>any branch</strong>.
            </p>
          </div>

          <div className="divider" />

          <div className="result-title" style={{ marginBottom: 4 }}>
            // output json (stored in your profile)
          </div>
          <div className="json-block">{jsonOutput}</div>

          <button className="copy-btn" onClick={handleCopy}>
            {copied ? "✓ Copied!" : "⎘ Copy JSON"}
          </button>

          <div className="actions">
            <button
              className="btn btn-ghost"
              onClick={() => {
                if (needsBranch && currentBranches.length > 1) setStep(2);
                else setStep(1);
              }}
            >
              ← Edit
            </button>
            <button className="btn btn-ghost" onClick={reset}>
              ↺ Start Over
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                localStorage.setItem('govrecruit_profile', JSON.stringify(outputProfile));
                alert("Profile saved! ✅\n\nYour dashboard will now be personalized.");
                window.location.href = '/';
              }}
            >
              Save Profile ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
