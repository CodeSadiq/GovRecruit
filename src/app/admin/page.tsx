'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import RecruitmentPreview from '@/components/RecruitmentPreview';

export default function AdminPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [jobData, setJobData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (path: string, value: any) => {
    setJobData((prev: any) => {
      if (!prev) return prev;

      const parts = path.split('.');
      const updateDeep = (obj: any, keys: string[], val: any): any => {
        const [head, ...tail] = keys;
        if (!obj) obj = {};

        if (tail.length === 0) {
          // Handle numeric keys for arrays
          if (Array.isArray(obj)) {
            const newArr = [...obj];
            newArr[parseInt(head)] = val;
            return newArr;
          }
          return { ...obj, [head]: val };
        }

        if (Array.isArray(obj)) {
          const newArr = [...obj];
          const idx = parseInt(head);
          newArr[idx] = updateDeep(newArr[idx], tail, val);
          return newArr;
        }

        return {
          ...obj,
          [head]: updateDeep(obj[head], tail, val)
        };
      };

      return updateDeep(prev, parts, value);
    });
  };

  const handleRenameKey = (parentPath: string, oldKey: string, newKey: string) => {
    if (!newKey || oldKey === newKey) return;
    setJobData((prev: any) => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const parts = parentPath.split('.');
      let current = newData;
      for (const p of parts) {
        if (!current[p]) return prev;
        current = current[p];
      }
      if (current[oldKey] !== undefined) {
        current[newKey] = current[oldKey];
        delete current[oldKey];
      }
      return newData;
    });
  };

  const handleDeleteKey = (parentPath: string, key: string) => {
    setJobData((prev: any) => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const parts = parentPath.split('.');
      let current = newData;
      for (const p of parts) {
        if (!current[p]) return prev;
        current = current[p];
      }
      delete current[key];
      return newData;
    });
  };

  // Sync JSON input when jobData changes in Edit Mode
  React.useEffect(() => {
    if (isEditing && jobData) {
      setJsonInput(JSON.stringify(jobData, null, 2));
    }
  }, [jobData, isEditing]);

  const handleParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJobData(parsed);
      setError(null);
      setSuccess(false);
    } catch (e: any) {
      setError(e.message);
      setJobData(null);
    }
  };

  const handlePublish = async () => {
    if (!jobData) return;
    setIsPublishing(true);

    // NORMALIZE DATA BEFORE INJECTION
    const normalizedData = { ...jobData };
    if (!normalizedData.organization && normalizedData.org) {
      normalizedData.organization = normalizedData.org;
    }
    if (!normalizedData.id) {
      normalizedData.id = normalizedData.title ? normalizedData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') : Math.random().toString(36).substr(2, 9);
    }

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedData),
      });
      if (res.ok) {
        setSuccess(true);
        setJsonInput('');
        setJobData(null);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Protocol Error: Data rejected by repository nodes.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-navy-dark font-sans selection:bg-navy/10 selection:text-navy">
      {/* ADMIN HEADER */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-navy transition-colors text-sm font-bold flex items-center gap-2">
              ← Back to Site
            </Link>
            <div className="h-4 w-[1px] bg-gray-200"></div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-navy">Admin / Recruitment Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green/5 border border-green/10 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-green rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-black text-green uppercase tracking-widest">Active Server</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1500px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT: JSON EDITOR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[24px] lg:rounded-[32px] border-2 border-gray-100 p-4 lg:p-8 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none group-hover:rotate-12 transition-transform duration-700">📄</div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-navy rounded-full"></span> Paste Job JSON
              </h2>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-[300px] lg:h-[500px] bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 lg:p-6 font-mono text-[13px] text-navy focus:border-navy focus:bg-white outline-none transition-all resize-none mb-6 custom-scrollbar placeholder:text-gray-300"
                placeholder='{ "title": "SSC CGL 2026", "org": "Staff Selection Commission", "salary": "₹44,900", "location": "All India", "lastDate": "25 May 2025", "qual": "...", "process": "...", "tags": ["SSC", "Graduate"] }'
              />
              <button
                onClick={handleParse}
                className="w-full py-5 bg-navy text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-navy-dark active:scale-95 transition-all shadow-xl shadow-navy/20"
              >
                Parse & Preview JSON
              </button>
              {error && (
                <div className="mt-4 p-4 bg-red/5 border border-red/10 rounded-xl text-red text-xs font-bold animate-in fade-in slide-in-from-top-2">
                  Error: {error}
                </div>
              )}
            </div>

            <div className="bg-navy/5 border border-navy/10 rounded-2xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 leading-relaxed">
                Authorized personnel only — All data injection attempts are logged via automated verification protocols. Verify JSON schema before parsing.
              </p>
            </div>
          </div>

          {/* RIGHT: REAL-TIME PREVIEW */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[24px] lg:rounded-[40px] border-2 border-gray-100 shadow-xl overflow-hidden flex flex-col min-h-[500px] lg:min-h-[850px] text-navy-dark">
              <header className="p-4 lg:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Comprehensive Data Profile</h2>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time object profiling</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isEditing ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isEditing ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
                    {isEditing ? 'Editing Mode' : 'View Mode'}
                  </button>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${jobData ? 'bg-green text-white shadow-lg shadow-green/20' : 'bg-gray-100 text-gray-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${jobData ? 'bg-white animate-pulse' : 'bg-gray-300'}`}></span>
                    {jobData ? 'Ready' : 'Idle'}
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                {!jobData ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-40 grayscale">
                    <div className="text-8xl mb-6">📑</div>
                    <h3 className="text-2xl font-black uppercase tracking-[0.2em] mb-2">IDLE STATE</h3>
                    <p className="text-xs font-bold max-w-[300px] uppercase tracking-widest">Awaiting valid JSON injection to initialize visual protocol</p>
                  </div>
                ) : (
                  <div className="relative">
                    <RecruitmentPreview
                      job={jobData}
                      editable={isEditing}
                      onUpdate={handleUpdate}
                      onRenameKey={handleRenameKey}
                      onDeleteKey={handleDeleteKey}
                    />

                    {/* Floating Apply Action */}
                    <div className="sticky bottom-0 left-0 w-full p-4 lg:p-8 bg-gradient-to-t from-white via-white/90 to-transparent pt-12 lg:pt-20">
                      <button
                        onClick={handlePublish}
                        disabled={isPublishing || success}
                        className={`w-full py-5 lg:py-8 rounded-[16px] lg:rounded-[24px] font-black text-[12px] lg:text-[16px] uppercase tracking-[0.2em] lg:tracking-[0.4em] transition-all shadow-2xl ${success ? 'bg-green text-white translate-y-0' : 'bg-navy text-white hover:bg-navy-dark hover:-translate-y-2'}`}
                      >
                        {isPublishing ? 'SYNCHRONIZING...' : success ? '✓ INJECTION COMPLETED' : 'AUTHORIZE & BROADCAST ➜'}
                      </button>
                      {success && (
                        <p className="text-center text-[11px] font-black text-green uppercase tracking-[0.3em] mt-8 animate-pulse">PROTOCOL BROADCAST SUCCESSFUL: Data has been successfully mirrored to the national Candidate Registry.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="py-24 text-center opacity-20">
        <div className="text-[11px] font-black uppercase tracking-[0.5em] text-navy">ADMIN VERIFICATION LAYER — 2026 OFFICIAL PORTAL</div>
      </footer>
    </div>
  );
}
