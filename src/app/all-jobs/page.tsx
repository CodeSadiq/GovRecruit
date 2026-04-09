'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NOTIFICATIONS } from '@/lib/data';

import Navbar from '@/components/Navbar';

const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconBell = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;

export default function JobsPage() {
  const router = useRouter();
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setDbJobs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filteredJobs = dbJobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.organization || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || job.type?.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/5 selection:text-navy">

      <main className="flex-1 max-w-[1440px] mx-auto w-full p-6 md:p-12 animate-in fade-in duration-500">
        <header className="mb-14 border-b-4 border-navy pb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-2xl md:text-5xl font-serif font-bold tracking-tight text-navy leading-tight">All Jobs</h1>
            <p className="text-[10px] md:text-gray-500 font-bold uppercase tracking-widest mt-4">Broadcasting official verified government openings across the national registry.</p>
          </div>
          <div className="flex bg-white border-2 border-gray-100 rounded-2xl px-5 h-12 md:h-14 items-center gap-3 w-full md:w-[400px] shadow-sm group focus-within:border-navy transition-all">
            <span className="text-gray-300 group-focus-within:text-navy transition-colors font-black scale-75"><IconSearch /></span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs md:text-sm font-black text-navy uppercase flex-1 placeholder:text-gray-200"
              placeholder="Search index..."
            />
          </div>
        </header>


        {isLoading ? (
          <div className="py-20 text-center opacity-40 font-black uppercase tracking-widest text-[10px]">Registry Synchronizing...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, idx) => {
              const lastDateVal = job.lastDate || job.importantDates?.lastDate || job.notificationType || (job as any).displayStatus?.notificationType || "DETAILS AWAITED";
              const isFallback = !lastDateVal.includes('202');

              return (
                <Link
                  href={`/all-jobs/${job.id || job._id}`}
                  key={idx}
                  className="bg-white border-2 border-gray-100 p-8 md:p-10 flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all group h-full rounded-[2rem] shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-navy/[0.02] rounded-bl-[4rem] group-hover:bg-navy/[0.05] transition-colors pointer-events-none"></div>

                  <div className="grow mb-10">
                    <h3 className="text-[26px] font-serif font-bold text-navy leading-[1.2] tracking-tight group-hover:text-[#1a3a6e] transition-colors">
                      {job.title || "Unknown Notification"}
                    </h3>
                  </div>

                  <div className="pt-8 border-t border-gray-100 flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="text-[11px] font-serif font-bold text-gray-400">Last Date</div>
                      <div className="text-[15px] font-serif font-bold text-[#FF3B30] leading-tight max-w-[200px]">
                        {isFallback && lastDateVal === "DETAILS AWAITED" ? `EARLY NOTIFICATION — FULL DETAILS AWAITED` : lastDateVal}
                      </div>
                    </div>

                    <div className="px-6 py-3.5 bg-navy text-white text-[15px] font-serif font-bold rounded-full shadow-lg shadow-navy/20 group-hover:bg-[#1a3a6e] transition-all transform group-hover:scale-105 whitespace-nowrap">
                      View Details
                    </div>
                  </div>
                </Link>
              );
            })}
            {filteredJobs.length === 0 && (
              <div className="col-span-full py-40 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">No recruitment records match this filter</div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t-2 border-gray-100 py-10 px-6 md:px-12 mt-auto">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center overflow-hidden"><img src="/logo.png" alt="" className="w-5 h-5 object-contain" /></div>
            <strong className="text-navy text-sm font-black leading-none uppercase">Rojgar Match</strong>
          </div>
          <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">© 2026 Rojgar Match Institutional Index</p>
        </div>
      </footer>
    </div>
  );
}
