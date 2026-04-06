'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ─── FULL DATA TREE ───────────────────
const QUAL_TREE = [
  { level: 1, name: "10th", label: "10th / Matriculation", branches: [] },
  { level: 2, name: "12th", label: "12th / Intermediate / HSC", branches: [
    { value: "any", label: "Any Stream" },
    { value: "Science (PCM)", label: "Science – PCM (Physics, Chemistry, Maths)" },
    { value: "Science (PCB)", label: "Science – PCB (Physics, Chemistry, Biology)" },
    { value: "Commerce", label: "Commerce" },
    { value: "Arts", label: "Arts / Humanities" },
    { value: "Vocational", label: "Vocational" },
  ]},
  { level: 3, name: "ITI", label: "ITI Certificate", branches: [
    { value: "Electrician", label: "Electrician" }, { value: "Fitter", label: "Fitter" }, { value: "Welder", label: "Welder" },
    { value: "Turner", label: "Turner" }, { value: "Machinist", label: "Machinist" }, { value: "Plumber", label: "Plumber" },
  ]},
  { level: 3, name: "Diploma", label: "Diploma / Polytechnic", branches: [
    { value: "CSE", label: "Computer Science & Engineering (CSE)" },
    { value: "IT", label: "Information Technology (IT)" },
    { value: "Mechanical", label: "Mechanical Engineering" },
    { value: "Civil", label: "Civil Engineering" },
    { value: "any", label: "Any / Relevant Branch" },
  ]},
  { level: 4, name: "Graduate", label: "Graduate – Any Degree", branches: [{ value: "any", label: "Any Discipline" }] },
  { level: 4, name: "B.Tech", label: "B.Tech / BE (Engineering)", branches: [
    { value: "CSE", label: "CSE" }, { value: "IT", label: "IT" }, { value: "Mechanical", label: "Mechanical" },
    { value: "Civil", label: "Civil" }, { value: "Electrical", label: "Electrical" }, { value: "EEE", label: "EEE" },
    { value: "ECE", label: "ECE" }, { value: "Chemical", label: "Chemical" }, { value: "any", label: "Any / Relevant Branch" },
  ]},
  { level: 4, name: "B.Sc", label: "B.Sc (Science)", branches: [
    { value: "Physics", label: "Physics" }, { value: "Chemistry", label: "Chemistry" }, { value: "Mathematics", label: "Mathematics" },
    { value: "Statistics", label: "Statistics" }, { value: "Biology", label: "Biology" }, { value: "Agriculture", label: "Agriculture" },
    { value: "Nursing", label: "Nursing" }, { value: "any", label: "Any Science" },
  ]},
  { level: 4, name: "BA", label: "BA (Arts / Humanities)", branches: [
    { value: "Economics", label: "Economics" }, { value: "History", label: "History" }, { value: "Political Science", label: "Political Science" },
    { value: "Sanskrit", label: "Sanskrit" }, { value: "English", label: "English" }, { value: "Hindi", label: "Hindi" },
    { value: "any", label: "Any Subject" },
  ]},
  { level: 4, name: "B.Com", label: "B.Com (Commerce)", branches: [
    { value: "Accounting", label: "Accounting" }, { value: "Finance", label: "Finance" }, { value: "any", label: "Any" },
  ]},
  { level: 4, name: "BCA", label: "BCA (Computer Applications)", branches: [{ value: "Computer Applications", label: "Computer Applications" }] },
  { level: 4, name: "BBA", label: "BBA / BBM (Business Administration)", branches: [
    { value: "Marketing", label: "Marketing" }, { value: "Finance", label: "Finance" }, { value: "HR", label: "Human Resources" },
    { value: "any", label: "Any" },
  ]},
  { level: 4, name: "B.Pharm", label: "B.Pharm (Pharmacy)", branches: [{ value: "Pharmacy", label: "Pharmacy" }] },
  { level: 4, name: "MBBS", label: "MBBS (Medicine)", branches: [{ value: "any", label: "Medicine" }] },
  { level: 5, name: "M.Tech", label: "M.Tech / ME (Engineering PG)", branches: [
    { value: "CSE", label: "CSE" }, { value: "Mechanical", label: "Mechanical" }, { value: "any", label: "Any" },
  ]},
  { level: 5, name: "MBA", label: "MBA / PGDM (Management PG)", branches: [
    { value: "any", label: "Any Specialisation" },
  ]},
];

const LEVEL_GROUPS = [
  { label: "School Level", levels: [1, 2] },
  { label: "Diploma / Certificate Level", levels: [3] },
  { label: "Graduation Level", levels: [4] },
  { label: "Post Graduation Level", levels: [5] },
];

export default function ProfilePage() {
  const router = useRouter();
  const [dob, setDob] = useState('');
  const [selectedQual, setSelectedQual] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>({ fullName: '', email: '' });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('govrecruit_auth');
    if (!isAuth) {
      router.push('/login');
      return;
    }
    
    // Load AUTH data first (always present if logged in)
    const authData = JSON.parse(isAuth);
    setUserProfile({ fullName: authData.fullName, email: authData.email });

    // Overlay PROFILE data if it exists
    const saved = localStorage.getItem('govrecruit_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserProfile((prev: any) => ({ ...prev, ...parsed }));
      if (parsed.qualification) {
        const qual = QUAL_TREE.find(q => q.name === parsed.qualification);
        if (qual) {
          setSelectedQual(qual);
          const branch = qual.branches.find(b => b.value === parsed.branch);
          if (branch) setSelectedBranch(branch);
        }
      }
      if (parsed.dob) {
        setDob(parsed.dob);
        setCompleted(true);
      }
    }
    setIsLoaded(true);
  }, [router]);

  const handleQualChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const qual = QUAL_TREE.find(q => q.name === e.target.value);
    setSelectedQual(qual || null);
    setSelectedBranch(null);
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branch = selectedQual?.branches.find((b: any) => b.value === e.target.value);
    setSelectedBranch(branch || null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const profileData = {
        dob,
        qualification: selectedQual.name,
        level: selectedQual.level,
        branch: selectedBranch?.value || 'any'
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userProfile.email, profile: profileData }),
      });

      if (!res.ok) throw new Error('Failed to save profile');

      const fullProfile = { ...userProfile, ...profileData };
      localStorage.setItem('govrecruit_profile', JSON.stringify(fullProfile));
      setCompleted(true);
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin"></div>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('govrecruit_auth');
    localStorage.removeItem('govrecruit_profile');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/10 overflow-hidden">
      
      {/* MINIMAL NAVBAR */}
      <nav className="bg-white/50 backdrop-blur-md h-[60px] flex items-center px-6 md:px-12 sticky top-0 z-[100] border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3 no-underline mr-auto">
          <strong className="text-navy text-lg font-bold tracking-tight">GovRecruit</strong>
        </Link>
        <div className="flex items-center gap-6">
            <Link href="/" className="text-xs font-semibold text-navy/60 hover:text-navy transition-all">Back to Dashboard</Link>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10">
        <div className="max-w-[1000px] mx-auto space-y-12 animate-in fade-in duration-700">

          {/* IDENTITY SECTION - CLEAN & READABLE */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-gray-100">
             <div>
                <h1 className="text-3xl md:text-4xl font-bold text-navy tracking-tight mb-2">
                  {userProfile.fullName || 'Complete Your Profile'}
                </h1>
                <div className="flex items-center gap-4">
                   <p className="text-sm font-medium text-gray-500">
                      {userProfile.email}
                   </p>
                   {completed && (
                     <div className="flex items-center gap-2 px-3 py-1 bg-green/10 text-green-600 rounded-full text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Qualification Verified
                     </div>
                   )}
                </div>
             </div>

             <button 
                onClick={handleLogout}
                className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-all whitespace-nowrap mb-4 md:mb-0"
             >
                Log out
             </button>
             
          </div>

          {/* SIMPLIFIED FORM SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 max-w-[600px]">
            
            <section className="space-y-10 pb-20">
              
              {/* ACADEMICS */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-navy">Education Details</h2>
                  <p className="text-xs text-gray-400 font-medium">Specify your highest level of accredited academic qualification.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Education Level</label>
                    <div className="relative">
                      <select
                        value={selectedQual?.name || ''}
                        onChange={handleQualChange}
                        className="w-full h-14 bg-white border border-gray-200 px-5 text-sm font-semibold text-navy appearance-none outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all rounded-xl shadow-sm"
                      >
                        <option value="" disabled>Select Level</option>
                        {LEVEL_GROUPS.map((group, idx) => (
                          <optgroup key={idx} label={group.label}>
                            {QUAL_TREE.filter(q => group.levels.includes(q.level)).map((qual, qIdx) => (
                              <option key={qIdx} value={qual.name}>{qual.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-xs">▼</div>
                    </div>
                  </div>

                  {selectedQual && selectedQual.branches.length > 0 && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-400">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Specialization Branch</label>
                      <div className="relative">
                        <select
                          value={selectedBranch?.value || ''}
                          onChange={handleBranchChange}
                          className="w-full h-14 bg-white border border-gray-200 px-5 text-sm font-semibold text-navy appearance-none outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all rounded-xl shadow-sm"
                        >
                          <option value="" disabled>Select Branch</option>
                          {selectedQual.branches.map((br: any, bIdx: number) => (
                            <option key={bIdx} value={br.value}>{br.label}</option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-xs">▼</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PERSONAL */}
              <div className="space-y-6 pt-6 border-t border-gray-100">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-navy">Identity Verification</h2>
                  <p className="text-xs text-gray-400 font-medium">Enter your date of birth as recorded in your official documents.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full h-14 bg-white border border-gray-200 px-5 text-sm font-semibold text-navy outline-none focus:border-navy transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-navy/5"
                  />
                </div>
              </div>

              {/* SAVE & RESET */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !dob || !selectedQual || (selectedQual.branches.length > 0 && !selectedBranch)}
                  className="w-full h-14 bg-navy text-white font-bold text-sm tracking-wide shadow-lg shadow-navy/10 hover:bg-[#06142E] disabled:opacity-20 transition-all rounded-xl flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {isSaving ? (
                     <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Establish Profile Baseline</>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Clear all education and identity details? This will reset your profile baseline.')) {
                      setDob('');
                      setSelectedQual(null);
                      setSelectedBranch(null);
                      setCompleted(false);
                      localStorage.removeItem('govrecruit_profile');
                      alert('Baseline Cleared.');
                    }
                  }}
                  className="w-full h-14 bg-white border border-red-200 text-red-500 font-bold text-sm tracking-wide hover:bg-red-50 transition-all rounded-xl flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  Clear Selection
                </button>
              </div>

            </section>
          </div>

          <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-10">
            GovRecruit Verification System — Baseline Protocol
          </p>
        </div>
      </main>
    </div>
  );
}
