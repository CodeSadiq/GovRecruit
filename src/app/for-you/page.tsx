'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ─── SVG ICONS ───────────────────────────────────
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconStar = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;

export default function ForYouPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const filtered = data.filter((j: any) => j.isRecommended || j.totalVacancy > 5000);
          setJobs(filtered);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <nav className="bg-[#1a3a8f] h-[60px] flex items-center px-6 md:px-12 sticky top-0 z-[100] shadow-sm">
        <Link href="/" className="flex items-center gap-3 no-underline mr-auto group">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
            <IconBuilding />
          </div>
          <div className="flex flex-col">
            <strong className="text-white text-base font-black leading-none uppercase">GovRecruit</strong>
          </div>
        </Link>
        <Link href="/" className="text-white/60 hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors">
          <IconArrowLeft /> Back to Dashboard
        </Link>
      </nav>

      <main className="flex-1 max-w-[1440px] mx-auto p-6 md:p-12 w-full animate-in fade-in duration-700">
        <header className="mb-14 border-b-4 border-[#1a3a8f] pb-10">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-10 h-10 bg-[#1a3a8f]/5 text-[#1a3a8f] rounded-xl flex items-center justify-center shadow-inner"><IconStar /></div>
             <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Institutional Priority List</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-[#1a3a8f] uppercase leading-none">Recruitment for You.</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest mt-4">Showing all verified government openings matched to your profile.</p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-100 rounded-2xl h-[240px]"></div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job, idx) => (
              <Link
                href={`/jobs/${job.id || job._id}`}
                key={idx}
                className="bg-white border-2 border-gray-100 p-8 flex flex-col hover:border-[#1a3a8f] hover:shadow-2xl transition-all group h-full relative"
              >
                <div className="absolute top-8 right-8 text-[#1a3a8f]/10 group-hover:text-[#1a3a8f]/20 transition-colors">
                    <IconStar />
                </div>
                <h3 className="text-2xl font-black text-[#0D244D] leading-tight mb-auto group-hover:text-[#1a3a8f] transition-colors pr-6">
                  {job.title}
                </h3>
                <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Date</span>
                    <span className="text-base font-black text-red-500 uppercase">{job.lastDate || job.importantDates?.lastDate}</span>
                  </div>
                  <div className="bg-[#1a3a8f] text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest group-hover:bg-[#122870] transition-colors">
                    View Details
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-100 p-20 text-center rounded-3xl">
            <p className="text-xl font-black text-gray-400 uppercase tracking-widest">No matching jobs found in Baseline.</p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t-2 border-gray-100 py-10 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1a3a8f] text-white rounded-lg flex items-center justify-center shadow-lg"><IconBuilding /></div>
            <strong className="text-[#1a3a8f] text-sm font-black leading-none uppercase">GovRecruit</strong>
          </div>
          <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">© 2026 GOVRECRUIT SYSTEM — OFFICIAL INDEX</p>
        </div>
      </footer>
    </div>
  );
}
