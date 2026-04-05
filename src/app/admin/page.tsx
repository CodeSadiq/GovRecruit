'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { fmtDate, fmtMoney, daysFromNow, LEVEL_LABEL } from "@/lib/helpers";

export default function AdminPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [jobData, setJobData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [success, setSuccess] = useState(false);

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
           
           {/* LEFT: JSON EDITOR (LIGHT THEME) */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[32px] border-2 border-gray-100 p-8 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none group-hover:rotate-12 transition-transform duration-700">📄</div>
                 <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-navy rounded-full"></span> Paste Job JSON
                 </h2>
                 <textarea 
                   value={jsonInput}
                   onChange={(e) => setJsonInput(e.target.value)}
                   className="w-full h-[500px] bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 font-mono text-[13px] text-navy focus:border-navy focus:bg-white outline-none transition-all resize-none mb-6 custom-scrollbar placeholder:text-gray-300"
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

           {/* RIGHT: REAL-TIME PREVIEW (LIGHT THEME HIGHLIGHT) */}
            <div className="lg:col-span-8">
               <div className="bg-white rounded-[40px] border-2 border-gray-100 shadow-xl overflow-hidden flex flex-col min-h-[850px] text-navy-dark">
                  <header className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                     <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">Comprehensive Data Profile</h2>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time object profiling</div>
                     </div>
                     <div className="flex items-center gap-3">
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
                      <div className="p-8 md:p-16 animate-in fade-in zoom-in-95 duration-500 max-w-[1000px] mx-auto">
                        {/* ── ARTICLE HEADER ── */}
                        <header className="article-header mb-12">
                          <h1 className="text-4xl font-black text-navy border-b-2 border-navy/5 pb-6">
                            {jobData.title}
                          </h1>
                        </header>

                        {/* ── LEDE ── */}
                        <div className="lede-box mb-10 bg-gray-50 p-8 rounded-3xl text-sm font-bold text-gray-500 uppercase tracking-tight leading-relaxed">
                          {jobData.shortInfo || jobData.description}
                        </div>

                        {/* ── VACANCY HERO STRIP ── */}
                        <div className="flex bg-navy rounded-3xl overflow-hidden text-white mb-10 border-4 border-white shadow-xl">
                          <div className="flex-1 p-8 border-r border-white/10 text-center">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Capacity</div>
                            <div className="text-2xl font-black">{jobData.totalVacancy?.toLocaleString("en-IN") || "—"}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1">Total Posts</div>
                          </div>
                          <div className="flex-1 p-8 border-r border-white/10 text-center">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Scale</div>
                            <div className="text-xl font-black">
                              {jobData.salary?.min ? fmtMoney(jobData.salary.min) : "—"}
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1">
                              {jobData.salary?.max ? `to ${fmtMoney(jobData.salary.max)}` : "Refer to Notice"}
                            </div>
                          </div>
                          <div className="flex-1 p-8 text-center bg-white/5">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Deadline</div>
                            <div className="text-xl font-black text-red-100 italic">
                               {fmtDate(jobData.lastDate || jobData.importantDates?.lastDate)}
                            </div>
                          </div>
                        </div>

                        {/* SECTION 08 — PERSONNEL REFERENCE */}
                        <div className="flex items-center gap-4 mb-6 border-b-2 border-gray-100 pb-2">
                          <span className="text-xs font-black bg-navy text-white px-2 py-0.5 rounded">08</span>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Personnel Reference</span>
                        </div>
                        <table className="w-full mb-12 border-collapse border border-gray-100">
                          <tbody className="text-[12px]">
                            <tr className="border-b border-gray-50">
                              <td className="p-4 bg-gray-50/50 font-black text-navy/40 uppercase tracking-widest w-1/3">Organization</td>
                              <td className="p-4 font-bold text-navy">{jobData.organization || jobData.org}</td>
                            </tr>
                            <tr className="border-b border-gray-50">
                              <td className="p-4 bg-gray-50/50 font-black text-navy/40 uppercase tracking-widest">Reference Code</td>
                              <td className="p-4 font-mono font-bold text-navy">{jobData.advertisementNumber || "—"}</td>
                            </tr>
                            <tr className="border-b border-gray-50">
                              <td className="p-4 bg-gray-50/50 font-black text-navy/40 uppercase tracking-widest">Type</td>
                              <td className="p-4 font-bold text-navy">{jobData.type || "Public Notice"}</td>
                            </tr>
                            <tr className="border-b border-gray-50">
                              <td className="p-4 bg-gray-50/50 font-black text-navy/40 uppercase tracking-widest">Location</td>
                              <td className="p-4 font-bold text-navy">{Array.isArray(jobData.location) ? jobData.location.join(", ") : jobData.location || "All India"}</td>
                            </tr>
                            <tr>
                              <td className="p-4 bg-gray-50/50 font-black text-navy/40 uppercase tracking-widest">ESM Quota</td>
                              <td className="p-4 font-bold text-navy">{jobData.exServicemanQuota ? "✅ Applicable" : "No"}</td>
                            </tr>
                          </tbody>
                        </table>

                        {/* SECTION 05 — FEE SCHEDULE */}
                        <div className="flex items-center gap-4 mb-6 border-b-2 border-gray-100 pb-2">
                          <span className="text-xs font-black bg-navy text-white px-2 py-0.5 rounded">05</span>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Fee Schedule</span>
                        </div>
                        <table className="w-full mb-12 border border-gray-100 overflow-hidden rounded-xl">
                          <thead>
                             <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-navy">Category Group</th>
                                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-navy">Payable Fee</th>
                             </tr>
                          </thead>
                          <tbody className="text-[12px]">
                            {jobData.applicationFee && Object.entries(jobData.applicationFee).filter(([k]) => k !== 'paymentMode').map(([k, v]: any) => (
                              <tr key={k} className="border-b border-gray-50">
                                <td className="p-4 font-bold text-navy uppercase tracking-tight">{k}</td>
                                <td className="p-4 font-black text-navy">
                                   {v === 0 ? <span className="text-green">Exempted</span> : fmtMoney(v)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* SECTION 02 — VACANCY INVENTORY */}
                        <div className="flex items-center gap-4 mb-6 border-b-2 border-gray-100 pb-2">
                          <span className="text-xs font-black bg-navy text-white px-2 py-0.5 rounded">02</span>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Vacancy Inventory</span>
                        </div>
                        <table className="w-full mb-12 border border-gray-100 text-[12px]">
                           <thead>
                              <tr className="bg-navy text-white">
                                 <th className="p-4 text-left font-black uppercase tracking-widest">Designation</th>
                                 <th className="p-4 text-left font-black uppercase tracking-widest">Posts</th>
                                 <th className="p-4 text-left font-black uppercase tracking-widest">Min Qualification</th>
                              </tr>
                           </thead>
                           <tbody>
                              {(jobData.posts || []).map((p: any, i: number) => (
                                <tr key={i} className="border-b border-gray-100">
                                   <td className="p-4 font-black text-navy">{p.name}</td>
                                   <td className="p-4 font-bold text-gray-500">{p.totalVacancy || "—"}</td>
                                   <td className="p-4">
                                      {p.qualification?.map((q: any) => (
                                        <div key={q.name} className="flex flex-col mb-2 last:mb-0">
                                           <span className="font-black text-navy uppercase tracking-tight">{q.name}</span>
                                           <span className="text-[10px] text-gray-400 font-bold uppercase">{q.branches?.join(", ") || "Any Branch"}</span>
                                        </div>
                                      )) || "—"}
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>

                        {/* SECTION 04 — AGE BASELINE */}
                        <div className="flex items-center gap-4 mb-6 border-b-2 border-gray-100 pb-2">
                          <span className="text-xs font-black bg-navy text-white px-2 py-0.5 rounded">04</span>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Age & Selection</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                           <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100">
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-navy/30 mb-4">Baseline Registry</h3>
                              <div className="space-y-3">
                                 <div className="flex justify-between">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase">Min Age</span>
                                    <span className="text-sm font-black text-navy">{jobData.ageLimit?.min || "18"} Years</span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase">Max Age</span>
                                    <span className="text-sm font-black text-navy">{jobData.ageLimit?.max || "40"} Years</span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase">Ref Date</span>
                                    <span className="text-sm font-black text-navy">{fmtDate(jobData.ageLimit?.asOnDate) || "—"}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100">
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-navy/30 mb-4">Selection Stages</h3>
                              <div className="flex flex-wrap gap-2">
                                 {jobData.selectionProcess?.map((step: string, i: number) => (
                                   <div key={i} className="flex items-center gap-2">
                                      <span className="text-[12px] font-black text-navy uppercase bg-white border border-gray-200 px-3 py-1 rounded shadow-sm">{step}</span>
                                      {i < jobData.selectionProcess.length - 1 && <span className="opacity-20 text-navy">→</span>}
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        {/* SECTION 01 — TIMELINE */}
                        <div className="flex items-center gap-4 mb-6 border-b-2 border-gray-100 pb-2">
                          <span className="text-xs font-black bg-navy text-white px-2 py-0.5 rounded">01</span>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Schedule & Action</span>
                        </div>
                        <table className="w-full mb-12 border border-gray-100 text-[12px]">
                           <tbody>
                              {Object.entries(jobData.importantDates || {}).filter(([k,v]) => v).map(([k, v]) => (
                                <tr key={k} className="border-b border-gray-50">
                                   <td className="p-4 font-bold text-gray-500 uppercase tracking-widest w-1/2">{k.replace(/([A-Z])/g, ' $1')}</td>
                                   <td className="p-4 font-black text-navy">{fmtDate(v)}</td>
                                </tr>
                              ))}
                              <tr>
                                 <td className="p-4 font-bold text-gray-500 uppercase tracking-widest">Portal Check</td>
                                 <td className="p-4 font-black text-blue-600 tracking-tight">link ↗</td>
                              </tr>
                           </tbody>
                        </table>

                        {/* FINAL AUTHORIZATION */}
                        <div className="mt-20 pt-12 border-t border-gray-100">
                           <button 
                             onClick={handlePublish}
                             disabled={isPublishing || success}
                             className={`w-full py-8 rounded-[24px] font-black text-[16px] uppercase tracking-[0.4em] transition-all shadow-2xl ${success ? 'bg-green text-white translate-y-0' : 'bg-navy text-white hover:bg-navy-dark hover:-translate-y-2'}`}
                           >
                              {isPublishing ? 'SYNCHRONIZING SYSTEM DATA...' : success ? '✓ INJECTION COMPLETED' : 'AUTHORIZE & BROADCAST RECRUITMENT ➜'}
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
