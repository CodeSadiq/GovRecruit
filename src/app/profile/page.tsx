'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ─── FULL DATA MAP ───────────────────

const QUAL_TREE = [
  {
    level: 1,
    name: "10th",
    label: "10th / Matriculation",
    branches: [],
  },
  {
    level: 2,
    name: "12th",
    label: "12th / Intermediate / HSC",
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
    branches: [],
  },
  {
    level: 3,
    name: "ANM",
    label: "ANM (Auxiliary Nurse Midwife)",
    branches: [],
  },
  {
    level: 3,
    name: "D.Pharm",
    label: "D.Pharm (Diploma in Pharmacy)",
    branches: [],
  },
  {
    level: 4,
    name: "Graduate",
    label: "Graduate – Any Degree",
    branches: [{ value: "any", label: "Any Discipline" }],
  },
  {
    level: 4,
    name: "B.Tech",
    label: "B.Tech / BE (Engineering)",
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
    branches: [{ value: "Computer Applications", label: "Computer Applications" }],
  },
  {
    level: 4,
    name: "BBA",
    label: "BBA / BBM (Business Administration)",
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
    branches: [{ value: "Pharmacy", label: "Pharmacy" }],
  },
  {
    level: 4,
    name: "MBBS",
    label: "MBBS (Medicine)",
    branches: [{ value: "any", label: "Medicine" }],
  },
  {
    level: 4,
    name: "BDS",
    label: "BDS (Dental Surgery)",
    branches: [{ value: "any", label: "Dental" }],
  },
  {
    level: 4,
    name: "BAMS",
    label: "BAMS (Ayurvedic Medicine)",
    branches: [{ value: "any", label: "Ayurveda" }],
  },
  {
    level: 4,
    name: "BHMS",
    label: "BHMS (Homeopathic Medicine)",
    branches: [{ value: "any", label: "Homeopathy" }],
  },
  {
    level: 4,
    name: "BUMS",
    label: "BUMS (Unani Medicine)",
    branches: [{ value: "any", label: "Unani" }],
  },
  {
    level: 4,
    name: "B.Sc Nursing",
    label: "B.Sc Nursing",
    branches: [{ value: "Nursing", label: "Nursing" }],
  },
  {
    level: 4,
    name: "LLB",
    label: "LLB / BA LLB (Law)",
    branches: [{ value: "Law", label: "Law" }],
  },
  {
    level: 4,
    name: "B.Ed",
    label: "B.Ed (Education)",
    branches: [{ value: "Education", label: "Education" }],
  },
  {
    level: 4,
    name: "B.Arch",
    label: "B.Arch (Architecture)",
    branches: [{ value: "Architecture", label: "Architecture" }],
  },
  {
    level: 4,
    name: "CA",
    label: "CA (Chartered Accountant)",
    branches: [{ value: "CA", label: "Chartered Accountancy" }],
  },
  {
    level: 4,
    name: "CS",
    label: "CS (Company Secretary)",
    branches: [{ value: "CS", label: "Company Secretaryship" }],
  },
  {
    level: 4,
    name: "CMA",
    label: "CMA / ICWA (Cost Accountant)",
    branches: [{ value: "CMA", label: "Cost Management Accountancy" }],
  },
  {
    level: 5,
    name: "Post Graduate",
    label: "Post Graduate – Any Master's",
    branches: [{ value: "any", label: "Any Discipline" }],
  },
  {
    level: 5,
    name: "M.Tech",
    label: "M.Tech / ME (Engineering PG)",
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
    branches: [{ value: "Computer Applications", label: "Computer Applications" }],
  },
  {
    level: 5,
    name: "LLM",
    label: "LLM (Law PG)",
    branches: [{ value: "Law PG", label: "Law" }],
  },
  {
    level: 5,
    name: "M.Ed",
    label: "M.Ed (Education PG)",
    branches: [{ value: "Education", label: "Education" }],
  },
  {
    level: 5,
    name: "M.Pharm",
    label: "M.Pharm (Pharmacy PG)",
    branches: [{ value: "M.Pharm", label: "Pharmacy" }],
  },
  {
    level: 5,
    name: "M.Arch",
    label: "M.Arch (Architecture PG)",
    branches: [{ value: "Architecture", label: "Architecture" }],
  },
  {
    level: 6,
    name: "PhD",
    label: "PhD / Doctorate",
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

export default function ProfilePage() {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [selectedQual, setSelectedQual] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [isLoginView, setIsLoginView] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleQualChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const qual = QUAL_TREE.find(q => q.name === e.target.value);
    setSelectedQual(qual || null);
    setSelectedBranch(null);
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branch = selectedQual?.branches.find((b: any) => b.value === e.target.value);
    setSelectedBranch(branch || null);
  };

  const handleComplete = () => {
    localStorage.setItem('userProfile', JSON.stringify({
      fullName,
      dob,
      qualification: selectedQual.name,
      branch: selectedBranch?.label || 'General'
    }));
    setCompleted(true);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1a1a1a] flex items-start justify-center p-4 md:p-10 font-sans selection:bg-navy/10 overflow-y-auto">
      <div className="w-full max-w-[850px] space-y-6">

        {/* OFFICIAL PORTAL NAV */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 px-4">
          <Link href="/" className="text-gray-400 hover:text-navy transition-colors order-2 md:order-1">
            <span className="text-sm font-bold border-b border-gray-300">← Back to Dashboard</span>
          </Link>
          <div className="flex-1 text-center md:text-right order-1 md:order-2 flex items-center justify-end gap-6">
            <button onClick={() => setIsLoginView(!isLoginView)} className="text-[12px] font-black uppercase tracking-widest text-navy bg-navy/5 px-4 py-2 border border-navy/10 hover:bg-navy/10 transition-all">
              {isLoginView ? 'Switch to Registration' : 'Official Login (Staff/User)'}
            </button>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hidden md:block">Verification Protocol active</span>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-300 shadow-sm relative overflow-hidden">

          {/* BUREAUCRATIC HEADER */}
          <div className="border-b-4 border-navy p-6 md:p-10 bg-gray-50 flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
                {isLoginView ? 'Secure Portal Authentication' : 'Personnel Baseline Registry Form'}
              </h1>
              <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-navy/60">
                <span>Form ID: GR-2026-REG</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>Portal: Verified User Dashboard</span>
              </div>
            </div>
          </div>

          {!completed ? (
            <div className="p-6 md:p-12 space-y-12">

              {isLoginView ? (
                /* LOGIN MINI FORM */
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-navy">User ID / Registry ID</label>
                      </div>
                      <div className="md:col-span-8">
                        <input type="text" placeholder="Enter Registration ID" className="w-full h-[58px] px-5 bg-white border-2 border-gray-300 text-sm font-bold focus:border-navy focus:bg-gray-50 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-navy">Secret Access Key</label>
                      </div>
                      <div className="md:col-span-8">
                        <input type="password" placeholder="••••••••" className="w-full h-[58px] px-5 bg-white border-2 border-gray-300 text-sm font-bold focus:border-navy focus:bg-gray-50 outline-none" />
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-5 bg-navy text-white font-black text-xs uppercase tracking-widest border-b-4 border-navy-dark hover:bg-gray-800 transition-all">Authenticate & Enter Portal</button>
                </div>
              ) : (
                /* REGISTRATION / BASELINE FORM */
                <div className="space-y-16 animate-in fade-in duration-500">

                  {/* SECTION 01: PERSONAL DETAILS */}
                  <section className="space-y-10">
                    <div className="space-y-1">
                      <h2 className="text-[17px] font-black uppercase tracking-wide">01. Participant Personal Details</h2>
                      <p className="text-[12px] text-gray-500 font-medium">As per Matriculation certificate / Aadhaar.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-navy">Full Name (In Block Letters)</label>
                      </div>
                      <div className="md:col-span-8">
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value.toUpperCase())}
                          type="text"
                          placeholder="SADIQ IMAM"
                          className="w-full h-[58px] px-5 bg-white border-2 border-gray-300 text-[15px] font-bold text-gray-900 transition-all focus:border-navy focus:bg-gray-50 outline-none focus:shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-navy">Date of Birth (DD-MM-YYYY)</label>
                      </div>
                      <div className="md:col-span-8">
                        <input
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          type="date"
                          className="w-full h-[58px] px-5 bg-white border-2 border-gray-300 text-[15px] font-bold text-gray-900 transition-all focus:border-navy focus:bg-gray-50 outline-none"
                        />
                      </div>
                    </div>
                  </section>

                  {/* SECTION 02: ACADEMIC DETAILS */}
                  <section className="space-y-10 pt-10 border-t-2 border-gray-100">
                    <div className="space-y-1">
                      <h2 className="text-[17px] font-black uppercase tracking-wide">02. Educational Credentials</h2>
                      <p className="text-[12px] text-gray-500 font-medium">Input your highest verified academic baseline.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-navy">Academic Degree / Level</label>
                      </div>
                      <div className="md:col-span-8 relative">
                        <select
                          value={selectedQual?.name || ''}
                          onChange={handleQualChange}
                          className="w-full h-[58px] pl-5 pr-10 bg-white border-2 border-gray-300 text-[15px] font-bold text-gray-900 outline-none focus:border-navy appearance-none"
                        >
                          <option value="" disabled>--- Select Level ---</option>
                          {LEVEL_GROUPS.map((group, idx) => (
                    <optgroup key={idx} label={group.label.toUpperCase()}>
                      {QUAL_TREE.filter(q => group.levels.includes(q.level)).map((qual, qIdx) => (
                        <option key={qIdx} value={qual.name}>{qual.label}</option>
                      ))}
                    </optgroup>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-xl font-black">↓</div>
                      </div>
                    </div>

                    {selectedQual && selectedQual.branches.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="md:col-span-4">
                          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-navy">Discipline / Branch focus</label>
                        </div>
                        <div className="md:col-span-8 relative">
                          <select
                            value={selectedBranch?.value || ''}
                            onChange={handleBranchChange}
                            className="w-full h-[58px] pl-5 pr-10 bg-white border-2 border-gray-300 text-[15px] font-bold text-gray-900 outline-none focus:border-navy appearance-none"
                          >
                            <option value="" disabled>--- Select Specialization ---</option>
                            {selectedQual.branches.map((br: any, bIdx: number) => (
                              <option key={bIdx} value={br.value}>{br.label}</option>
                            ))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-xl font-black">↓</div>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* SUBMIT */}
                  <div className="pt-10 border-t-2 border-gray-100 flex flex-col md:flex-row items-center gap-6">
                    <button
                      onClick={handleComplete}
                      disabled={!fullName || !dob || !selectedQual || (selectedQual.branches.length > 0 && !selectedBranch)}
                      className="w-full md:w-auto px-12 py-5 bg-navy text-white font-black text-xs uppercase tracking-[0.2em] border-b-4 border-navy-dark hover:bg-gray-800 disabled:opacity-20 transition-all"
                    >
                      Establish Baseline & Sync ➜
                    </button>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 flex-1">
                      Official Digital Sync Protocol Active
                    </span>
                  </div>

                </div>
              )}
            </div>
          ) : (
            <div className="p-10 md:p-20 text-center space-y-10 animate-in zoom-in-95 duration-700">
              <div className="inline-block p-8 border-4 border-navy/10 rounded-full">
                <div className="text-6xl">📝</div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black tracking-tighter uppercase">Personnel Baseline Verified</h2>
                <div className="text-gray-500 font-bold max-w-sm mx-auto uppercase text-[11px] tracking-widest space-y-2 leading-relaxed">
                  <p>Full Name: <span className="text-navy">{fullName}</span></p>
                  <p>Baseline: <span className="text-navy">{selectedQual?.name}</span></p>
                  <p className="mt-4 pt-4 border-t border-gray-100 opacity-60">Credentials have been established as the primary recruitment metadata.</p>
                </div>
              </div>
              <Link href="/" className="inline-block px-14 py-5 bg-navy text-white font-black text-xs uppercase tracking-[0.3em] border-b-4 border-navy-dark hover:bg-gray-800 transition-all">
                Go to Feed
              </Link>
            </div>
          )}

          {/* FOOTER */}
          <div className="bg-gray-100 border-t-2 border-gray-300 p-6 flex flex-wrap items-center justify-between opacity-40">
            <span className="text-[9px] font-black uppercase tracking-widest">GovRecruit Official Verification Protocols V4.2</span>
            <div className="flex gap-4">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 py-6">
          Secure Data Transfer Registry © 2026 Verification Systems
        </p>
      </div>
    </div>
  );
}
