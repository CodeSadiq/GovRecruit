'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

import { QUAL_TREE, LEVEL_GROUPS, QualNode } from '@/lib/constants';

export default function ProfilePage() {
  const router = useRouter();
  const [dob, setDob] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<Record<number, { qual: string, branch: string }>>({});
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

    const authData = JSON.parse(isAuth);
    setUserProfile({ fullName: authData.fullName, email: authData.email });

    const saved = localStorage.getItem('govrecruit_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserProfile((prev: any) => ({ ...prev, ...parsed }));
      if (parsed.dob) setDob(parsed.dob);
      
      if (parsed.qualifications && Array.isArray(parsed.qualifications)) {
        const initialState: Record<number, { qual: string, branch: string }> = {};
        parsed.qualifications.forEach((q: any) => {
          initialState[q.level] = { qual: q.name, branch: q.branch };
        });
        setSelectedLevels(initialState);
      }
      setCompleted(true);
    }
    setIsLoaded(true);
  }, [router]);

  const handleLevelQualChange = (levelId: number, qualName: string) => {
    setSelectedLevels(prev => ({
      ...prev,
      [levelId]: { qual: qualName, branch: '' }
    }));
  };

  const handleLevelBranchChange = (levelId: number, branchValue: string) => {
    setSelectedLevels(prev => ({
      ...prev,
      [levelId]: { ...prev[levelId], branch: branchValue }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Collect all selected levels into the qualifications array
      const qualifications = Object.entries(selectedLevels)
        .filter(([_, data]) => data.qual !== "")
        .map(([levelId, data]) => {
          const qualNode = QUAL_TREE.find(q => q.name === data.qual);
          return {
            name: data.qual,
            level: parseInt(levelId),
            label: qualNode?.label || data.qual,
            branch: data.branch
          };
        });

      const profileData = {
        dob,
        qualifications
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userProfile.email, profile: profileData }),
      });

      if (!res.ok) throw new Error('Failed to save profile');

      const fullProfile = { ...userProfile, ...profileData };
      localStorage.setItem('govrecruit_profile', JSON.stringify(fullProfile));
      window.dispatchEvent(new Event('govrecruit_auth_change'));
      setCompleted(true);
      alert('Full Multi-Level Profile Saved Successfully! ✅');
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('govrecruit_auth');
    localStorage.removeItem('govrecruit_profile');
    router.push('/login');
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/10 overflow-hidden">

      <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10">
        <div className="max-w-[1100px] mx-auto space-y-12 animate-in fade-in duration-700">

          <div className="bg-white border border-gray-200 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-8 shadow-sm text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-5">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold text-navy tracking-tight">{userProfile.fullName || 'Citizen Profile'}</h1>
                <p className="text-gray-400 text-sm md:text-base font-medium">{userProfile.email}</p>
              </div>

              {completed ? (
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-green-600 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                  Qualification Recorded
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
                  Qualification Not Recorded
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="px-8 py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full text-[11px] font-black uppercase tracking-[0.2em] border border-red-100"
            >
              Logout ⎆
            </button>
          </div>

          <div className="max-w-[1100px]">
            <section className="bg-white border border-gray-200 rounded-xl p-6 md:p-10 shadow-sm space-y-8">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-navy">Set Qualification</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Update your qualifications to see eligible jobs.</p>
              </div>

              <div className="space-y-8">
                {LEVEL_GROUPS.map((group) => {
                  const levelState = selectedLevels[group.id] || { qual: '', branch: '' };
                  const qualsForLevel = QUAL_TREE.filter(q => group.levels.includes(q.level));
                  const currentQual = QUAL_TREE.find(q => q.name === levelState.qual);

                  return (
                    <div key={group.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.label}</label>
                        <select
                          value={levelState.qual}
                          onChange={(e) => handleLevelQualChange(group.id, e.target.value)}
                          className={`w-full h-12 border px-4 text-sm font-bold outline-none transition-all rounded-lg ${
                            levelState.qual 
                              ? "bg-blue-50 border-blue-200 text-blue-700" 
                              : "bg-gray-50 border-gray-200 text-navy focus:border-navy"
                          }`}
                        >
                          <option value="">-- No Record --</option>
                          {qualsForLevel.map(q => (
                            <option key={q.name} value={q.name}>{q.label}</option>
                          ))}
                        </select>
                      </div>

                      {currentQual && currentQual.branches.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {group.id <= 2 ? "Academic Stream" : 
                             group.id === 3 ? "Trade Branch" : 
                             "Professional Branch"}
                          </label>
                          <select
                            value={levelState.branch}
                            onChange={(e) => handleLevelBranchChange(group.id, e.target.value)}
                            className={`w-full h-12 border px-4 text-sm font-bold outline-none transition-all rounded-lg ${
                              levelState.branch 
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : "bg-gray-50 border-gray-200 text-navy focus:border-navy"
                            }`}
                          >
                            <option value="">-- No Record --</option>
                            {currentQual.branches.map(b => (
                              <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-6 border-t border-gray-100">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of Birth</label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className={`w-full h-12 border px-4 text-sm font-bold outline-none transition-all rounded-lg ${
                            dob 
                              ? "bg-blue-50 border-blue-200 text-blue-700" 
                              : "bg-gray-50 border-gray-200 text-navy focus:border-navy"
                          }`}
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleSave}
                          disabled={isSaving || !dob}
                          className="flex-1 h-12 bg-navy text-white font-bold text-[11px] uppercase tracking-widest rounded-lg shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-30"
                        >
                          {isSaving ? 'Saving...' : 'Save Qualification'}
                        </button>
                        
                        <button
                          onClick={() => {
                             if(confirm('Clear all settings?')) {
                               setSelectedLevels({});
                               setDob('');
                               localStorage.removeItem('govrecruit_profile');
                               window.location.reload();
                             }
                          }}
                          className="px-6 h-12 bg-transparent text-red-400 font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                        >
                          Reset
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}
