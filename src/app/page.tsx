'use client';

import React, { useState, useEffect } from 'react';
import { JOBS as STATIC_JOBS, NOTIFICATIONS, CATEGORY_DATA } from '@/lib/data';
import JobDetailModal from '@/components/JobDetailModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getEligibleJobs, CandidateProfile } from '@/lib/matching';

const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconBell = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'for-you' | 'all' | 'notifications'>('for-you');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const categories = Object.keys(CATEGORY_DATA);
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate logic
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentCatIndex((prev) => (prev + 1) % categories.length);
    }, 5000); // 5 second rotation
    return () => clearInterval(interval);
  }, [isAutoPlaying, categories.length]);

  const activeCategory = categories[currentCatIndex];
  const activeItems = CATEGORY_DATA[activeCategory];

  useEffect(() => {
    // Lead user profile
    const savedProfile = localStorage.getItem('govrecruit_profile');
    if (savedProfile) {
      try { setUserProfile(JSON.parse(savedProfile)); } catch (e) { console.error(e); }
    }

    async function fetchJobs() {
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setDbJobs(data);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    }
    fetchJobs();
  }, []);

  const filteredJobs = dbJobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.org || job.organization || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || job.type === filterType;
    return matchesSearch && matchesType;
  });

  // ── RECRUITMENT MATCHING LOGIC ──
  const recommendedJobs = React.useMemo(() => {
    if (!userProfile || !userProfile.level) {
      return [];
    }
    const matched = getEligibleJobs(userProfile, dbJobs);
    return matched.map(m => ({ ...m.job, matchedPosts: m.matchedPosts, matchScore: m.matchScore }));
  }, [userProfile, dbJobs]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/5 selection:text-navy">

      <main className="flex-1 pb-32 md:pb-48 animate-in fade-in duration-700">


        {/* VIEW: FOR YOU */}
        {activeTab === 'for-you' && (
          <>
            {/* HERO: UPPER TEXT ALIGNMENT (SKY-TEXT / BASE-BUILDING) */}
            <div className="w-full bg-[#FAFAFA] relative h-[210px] md:h-[300px] flex items-center overflow-hidden border-b-2 border-gray-100">
              {/* Background Layer (Anchored at Bottom for upper-text space) */}
              <div
                className="absolute inset-0 bg-cover bg-bottom lg:bg-[right_-150px_center] bg-[url('/mobilehero.png')] lg:bg-[url('/herobg1.png')] z-0 transition-opacity duration-1000"
              />

              {/* Soft Top-Down sky gradient */}
              <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-white/95 via-white/40 to-transparent z-1 block md:hidden"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/5 to-transparent z-1 hidden md:block"></div>

              {/* Pin top-right search (Tight corner) */}
              <div className="absolute top-2 right-2 md:top-6 md:right-8 z-30">
                <div className="flex items-center bg-white border-2 border-gray-100 rounded-xl px-2 h-9 md:h-12 gap-1.5 w-[140px] md:w-[280px] transition-all focus-within:border-navy group shadow-sm">
                  <span className="text-gray-300 group-focus-within:text-navy transition-colors scale-[0.6] md:scale-90"><IconSearch /></span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-none outline-none text-[10px] md:text-sm text-navy flex-1 bg-transparent placeholder:text-gray-200 font-bold uppercase tracking-tight"
                    placeholder="Search All Jobs"
                  />
                </div>
              </div>

              {/* Mobile Absolute Header Block (Moved Upper Part) */}
              <div className="md:hidden absolute top-12 left-5 z-20 space-y-1">
                <h1 className="text-[19px] font-serif font-bold text-navy leading-tight drop-shadow-sm">
                  Recruitment for You
                </h1>
                <p className="text-[9px] text-navy/60 font-bold uppercase tracking-[0.2em] leading-relaxed">
                  Verified openings matched to your profile.
                </p>
              </div>

              {/* Desktop Centered Header Block */}
              <div className="hidden md:block relative z-10 w-full max-w-[1440px] mx-auto px-12 py-8">
                <div className="max-w-[800px] text-left space-y-4">
                  <h1 className="text-5xl font-serif font-bold text-navy leading-tight drop-shadow-sm">
                    Recruitment for You
                  </h1>
                  <div className="max-w-[500px]">
                    <p className="text-[14px] text-navy/60 font-bold uppercase tracking-[0.2em] leading-relaxed">
                      Official portal for verified government openings matched to your profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT GRID */}
            <div className="max-w-[1440px] mx-auto p-4 md:p-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 md:gap-12">

              <section className="space-y-12 h-full">

                {/* RECRUITMENT SECTION CONTAINER */}
                <div className="bg-white border-2 border-gray-100 p-4 md:p-10 shadow-sm relative overflow-hidden h-full flex flex-col rounded-3xl">
                  <header className="flex items-center justify-between border-b-2 border-gray-100 pb-4 md:pb-8 mb-6 md:mb-10">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl md:text-2xl font-serif font-bold text-navy">
                        Recruitment For You
                      </h2>
                    </div>
                    <Link href="/for-you" className="text-[14px] font-serif font-bold text-[#2563EB] hover:text-[#1d4ed8] transition-colors no-underline">View All ›</Link>
                  </header>

                  <div className="space-y-6 flex-1 flex flex-col">
                    {recommendedJobs.length === 0 ? (
                      <div className="flex-1 py-16 px-6 bg-white border-2 border-gray-100 flex flex-col items-center justify-center text-center shadow-sm rounded-2xl">
                        <p className="text-[15px] font-medium text-gray-500 leading-relaxed max-w-[400px] text-center">
                          No recruitments currently match your specific qualification level and branch.
                        </p>
                        {!userProfile?.level && (
                          <Link
                            href="/profile"
                            className="mt-8 px-10 py-3 bg-navy text-white text-[14px] font-serif font-bold hover:bg-[#06142E] transition-all shadow-xl rounded-xl no-underline"
                          >
                            Setup Profile →
                          </Link>
                        )}
                      </div>
                    ) : (
                      recommendedJobs.map((job: any, idx) => (
                        <Link
                          href={`/all-jobs/${job.id || job._id}`}
                          key={idx}
                          className="group bg-white border-2 border-gray-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-8 transition-all hover:border-navy hover:shadow-2xl hover:-translate-y-1 rounded-2xl shadow-sm"
                        >
                          <div className="flex-1">
                            <h3 className="text-2xl font-serif font-bold text-[#0D244D] leading-tight group-hover:text-navy transition-colors">{job.title}</h3>
                            {job.matchedPosts ? (
                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-[10px] font-serif font-bold bg-navy text-white px-3 py-1 rounded-full shadow-lg shadow-navy/20">Matched for {job.matchedPosts.length} {job.matchedPosts.length === 1 ? 'post' : 'posts'}</span>
                                <span className="text-[10px] font-serif font-bold text-navy/40 mt-1">including {job.matchedPosts[0].name}</span>
                              </div>
                            ) : (
                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-[10px] font-serif font-bold bg-gray-100 text-gray-400 px-3 py-1 rounded-full border border-gray-200">High Volume Opening</span>
                                <span className="text-[10px] font-serif font-bold text-gray-300 mt-1">{job.totalVacancy || 0}+ Vacancies</span>
                              </div>
                            )}
                          </div>
                          <div className="md:text-right md:border-l border-gray-100 md:pl-10 flex-shrink-0">
                            <div className="text-[10px] font-serif font-bold text-gray-400 mb-1">Last Date</div>
                            <div className="text-xl font-serif font-bold text-red leading-none">{job.lastDate || job.importantDates?.lastDate || job.notificationType || "Pending/NA"}</div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </section>

              <aside className="space-y-8 min-w-0 md:min-w-[320px] h-full">
                <div className="bg-white border-2 border-gray-100 p-0 shadow-sm overflow-hidden flex flex-col h-full rounded-3xl">
                  {/* CATEGORY TABS - PREMIUM CHIPS */}
                  <div className="flex overflow-x-auto no-scrollbar bg-gray-50/50 border-b border-gray-100 p-2 gap-2">
                    {categories.map((cat, idx) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCurrentCatIndex(idx);
                          setIsAutoPlaying(false);
                        }}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-serif font-bold tracking-tight transition-all ${idx === currentCatIndex
                          ? 'bg-navy text-white shadow-lg shadow-navy-light/40 ring-1 ring-white/20'
                          : 'text-gray-400 hover:text-navy hover:bg-white'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-navy/5 text-navy rounded-lg animate-pulse">
                          <IconBell />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-[12px] font-black uppercase tracking-widest text-[#0D244D]">
                            {activeCategory}
                          </h3>
                          <div className="text-[8px] font-bold text-navy/30 uppercase tracking-[0.2em] mt-0.5">Live Updates</div>
                        </div>
                      </div>
                      <Link href={`/${activeCategory.toLowerCase().replace(/\s+/g, '-')}`} className="text-[14px] font-serif font-bold text-navy/40 hover:text-navy transition-colors no-underline">
                        View All ›
                      </Link>
                    </div>

                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      {activeItems.map((n, i) => (
                        <Link
                          href="#"
                          key={i}
                          className="group block border-l-2 border-transparent hover:border-navy hover:pl-4 transition-all"
                        >
                          <div className="text-[15px] font-serif font-bold text-[#344163] leading-snug group-hover:text-navy transition-colors mb-1">
                            {n.text}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full group-hover:animate-ping"></span>
                            <div className="text-[9px] font-black uppercase tracking-widest text-navy/20">{n.time}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )
        }

      </main >

      {/* SIMPLE FOOTER */}
      < footer className="bg-white border-t-2 border-gray-100 py-10 px-6 md:px-12 mt-auto" >
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm"><img src="/logo.png" alt="" className="w-5 h-5 object-contain" /></div>
            <strong className="text-navy text-sm font-black leading-none uppercase">Rojgar Match</strong>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <Link href="#" className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-navy transition-colors">Privacy</Link>
            <Link href="#" className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-navy transition-colors">Terms</Link>
            <Link href="#" className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-navy transition-colors">Support</Link>
            <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest ml-0 md:ml-10">© 2026 Rojgar Match</p>
          </div>
        </div>
      </footer >

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div >
  );
}
