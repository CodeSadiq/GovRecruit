'use client';

import React, { useState, useEffect } from 'react';
import { JOBS as STATIC_JOBS, NOTIFICATIONS } from '@/lib/data';
import JobDetailModal from '@/components/JobDetailModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getEligibleJobs, CandidateProfile } from '@/lib/matching';

// ─── SVG ICONS (PROFESSIONAL SYSTEM) ──────────────────────────────────

const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;
const IconStar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const IconFolder = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const IconCalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconLocation = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconArrowRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'for-you' | 'all' | 'notifications'>('for-you');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Auth Check
    const isAuth = localStorage.getItem('govrecruit_auth');
    // We allow anonymous browsing of the portal index.
    // Redirect only happens if an explicit action requires it.

    // Lead user profile
    const savedProfile = localStorage.getItem('govrecruit_profile');
    if (savedProfile) {
      try { setUserProfile(JSON.parse(savedProfile)); } catch(e) { console.error(e); }
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

  const handleLogout = () => {
    localStorage.removeItem('govrecruit_auth');
    localStorage.removeItem('govrecruit_profile');
    router.push('/login');
  };

  const filteredJobs = dbJobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.org || job.organization || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || job.type === filterType;
    return matchesSearch && matchesType;
  });

  // ── RECRUITMENT MATCHING LOGIC ──
  const recommendedJobs = React.useMemo(() => {
    if (!userProfile || !userProfile.level) {
      return []; // No more 'Trending' fallback. Clean slate.
    }
    const matched = getEligibleJobs(userProfile, dbJobs);
    return matched.map(m => ({ ...m.job, matchedPosts: m.matchedPosts, matchScore: m.matchScore }));
  }, [userProfile, dbJobs]);

  const renderSalary = (s: any) => {
    if (typeof s === 'string') return s;
    if (typeof s === 'object' && s !== null) {
      if (s.min && s.max) return `${s.min.toLocaleString()} - ${s.max.toLocaleString()}`;
      if (s.min) return `${s.min.toLocaleString()}+`;
    }
    return 'Not Disclosed';
  };

  const renderFee = (fee: any) => {
    if (!fee) return '₹ 0/-';
    if (typeof fee === 'number') return `₹ ${fee}/-`;
    if (typeof fee === 'object') {
      const g = fee.general ?? fee.gen ?? 0;
      return `₹ ${g}/-`;
    }
    return '₹ 0/-';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/5 selection:text-navy">

      {/* PROFESSIONAL NAV */}
      <nav className="bg-navy h-[60px] flex items-center px-6 md:px-12 sticky top-0 z-[100] shadow-sm">
        <Link href="/" className="flex items-center gap-3 no-underline mr-auto group">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
            <IconBuilding />
          </div>
          <div className="flex flex-col">
            <strong className="text-white text-base font-black leading-none uppercase">GovRecruit</strong>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-2">
          {['for-you', 'all', 'notifications'].map((tab: any) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white'}`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 ml-6">
          <button className="relative text-white/60 hover:text-white transition-colors">
            <IconBell />
            <span className="absolute -top-1 -right-1 bg-red text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-navy text-[8px]">3</span>
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/5 px-4 py-2.5 rounded-xl transition-all text-white min-w-[160px] justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="opacity-50 group-hover:opacity-100 transition-opacity"><IconUser /></span>
                <span className="text-[11px] font-black uppercase tracking-widest truncate max-w-[100px]">
                  {userProfile ? (userProfile as any).fullName || 'Profile' : 'Profile'}
                </span>
              </div>
              <span className={`text-[10px] transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-full bg-white border-2 border-gray-100 shadow-2xl rounded-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                <Link 
                  href="/profile" 
                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-navy hover:bg-gray-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <span className="opacity-30"><IconUser /></span>
                  Profile Details
                </Link>
                <div className="h-[1px] bg-gray-100 mx-4 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red hover:bg-red/5 transition-colors"
                >
                   <span className="opacity-30">⎆</span>
                   Logout Session
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 pb-12 animate-in fade-in duration-700">
        

        {/* VIEW: FOR YOU */}
        {activeTab === 'for-you' && (
          <>
            {/* HERO CLEAN */}
            <div className="w-full bg-[#0D244D] relative min-h-[240px] flex items-center overflow-hidden bg-cover bg-center md:bg-right border-b-4 border-navy-dark"
              style={{ backgroundImage: 'url(/herobg.png)' }}
            >
              <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 py-16">
                <div className="max-w-[800px] text-center md:text-left space-y-6">
                  <h1 className="text-2xl md:text-5xl font-black text-[#0D244D] uppercase leading-[0.9]">
                    Recruitment for You.
                  </h1>
                  <div className="max-w-[500px]">
                    <p className="text-[12px] md:text-[14px] text-[#344163]/80 font-bold uppercase leading-relaxed">
                      Verified government openings matched to your qualification.
                    </p>
                  </div>
                  <div className="flex items-center bg-white rounded-full px-6 py-3 gap-3 shadow-2xl border border-gray-100 group max-w-[450px]">
                    <span className="text-gray-300 group-focus-within:text-navy transition-colors scale-90 shadow-none"><IconSearch /></span>
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-none outline-none text-[15px] text-navy flex-1 bg-transparent placeholder:text-gray-300 font-bold uppercase"
                      placeholder="Search jobs..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT GRID */}
            <div className="max-w-[1440px] mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">

              <section className="space-y-12">

                {/* RECRUITMENT SECTION CONTAINER */}
                <div className="bg-white border-2 border-gray-100 p-8 md:p-10 shadow-sm relative overflow-hidden">
                  <header className="flex items-center justify-between border-b-2 border-gray-100 pb-8 mb-10">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl font-black text-navy uppercase">
                        {userProfile && userProfile.level ? "Your Matches" : "Complete Profile"}
                      </h2>
                    </div>
                    <Link href="/for-you" className="text-[10px] font-black uppercase tracking-[0.2em] text-navy hover:underline opacity-50">View All ›</Link>
                  </header>

                  <div className="space-y-6">
                    {recommendedJobs.length === 0 ? (
                      <div className="py-16 px-6 bg-white border-2 border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mb-8 scale-110">
                           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <h3 className="text-xl font-black text-navy uppercase mb-3 tracking-widest">No Matches Found</h3>
                        <p className="text-[11px] font-bold text-gray-400 max-w-[300px] uppercase tracking-tighter leading-relaxed">
                          {!userProfile?.level 
                            ? "Complete your educational baseline to see eligible government recruitments."
                            : "No active recruitments currently match your specific qualification level and branch."
                          }
                        </p>
                        <Link href="/profile" className="mt-8 px-8 py-3 bg-navy text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-lg rounded-xl">
                           Setup Profile →
                        </Link>
                      </div>
                    ) : (
                      recommendedJobs.map((job: any, idx) => (
                        <Link
                          href={`/jobs/${job.id || job._id}`}
                          key={idx}
                          className="group bg-gray-50/30 border-2 border-gray-100 p-8 flex flex-col md:flex-row md:items-center gap-8 transition-all hover:border-navy hover:bg-white hover:shadow-xl"
                        >
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-[#0D244D] leading-tight group-hover:text-navy transition-colors">{job.title}</h3>
                            {job.matchedPosts ? (
                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest bg-navy text-white px-3 py-1 rounded-full shadow-lg shadow-navy/20">Matched for {job.matchedPosts.length} {job.matchedPosts.length === 1 ? 'post' : 'posts'}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-navy/40 mt-1">including {job.matchedPosts[0].name}</span>
                              </div>
                            ) : (
                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-400 px-3 py-1 rounded-full border border-gray-200">High Volume Opening</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300 mt-1">{job.totalVacancy || 0}+ Vacancies</span>
                              </div>
                            )}
                          </div>
                          <div className="md:text-right md:border-l border-gray-100 md:pl-10 flex-shrink-0">
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Last Date</div>
                            <div className="text-xl font-black text-red uppercase leading-none">{job.lastDate || job.importantDates?.lastDate}</div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </section>

              <aside className="space-y-12">
                <div className="bg-white border-2 border-gray-100 p-8 shadow-sm">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-3">
                    <IconBell /> Latest Notifications
                  </h3>
                  <div className="space-y-8">
                    {NOTIFICATIONS.slice(0, 4).map((n, i) => (
                      <div key={i} className="group cursor-pointer">
                        <div className="text-[13px] font-bold text-gray-700 leading-tight group-hover:text-navy transition-colors duration-200">{n.text}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 mt-2">🕓 {n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profile cards removed from home sidebar */}
              </aside>
            </div>
          </>
        )}

        {/* VIEW: ALL RECRUITMENTS */}
        {activeTab === 'all' && (
          <div className="max-w-[1440px] mx-auto p-6 md:p-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b border-gray-100 pb-12">
              <div>
                <h2 className="text-4xl font-black text-navy uppercase">All Jobs</h2>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60">Browse all openings</p>
              </div>
              <div className="flex bg-white border border-gray-200 rounded-2xl px-6 h-14 items-center gap-4 w-full md:w-[400px] shadow-sm">
                <span className="text-gray-300"><IconSearch /></span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-black text-navy uppercase flex-1"
                  placeholder="Search index..."
                />
              </div>
            </header>

            {/* FILTER BAR SLIDER */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-8 mb-8 border-b border-gray-50">
              {['all', 'central', 'state', 'banking', 'psu', 'defence', 'railway'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] border-2 transition-all whitespace-nowrap ${filterType === type ? 'bg-navy text-white border-navy shadow-lg shadow-navy/10' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, idx) => (
                <Link
                  href={`/jobs/${job.id || job._id}`}
                  key={idx}
                  className="bg-white border-2 border-gray-100 p-8 flex flex-col hover:border-navy hover:shadow-2xl transition-all group h-full"
                >
                  <h3 className="text-xl font-black text-[#0D244D] leading-tight mb-8 grow group-hover:text-navy transition-colors">{job.title}</h3>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Date</div>
                    <div className="text-[11px] font-black text-red uppercase tracking-widest">{job.lastDate || job.importantDates?.lastDate}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: NOTIFICATIONS PAGE */}
        {activeTab === 'notifications' && (
          <div className="max-w-[850px] mx-auto p-6 md:p-20">
            <div className="mb-14 border-b-4 border-navy pb-10">
              <h2 className="text-4xl font-black text-navy uppercase">Portal Updates.</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest mt-2">Real-time recruitment metadata updates</p>
            </div>
            <div className="space-y-6">
              {NOTIFICATIONS.map((n, i) => (
                <div key={i} className="bg-white border-2 border-gray-100 p-8 hover:border-navy transition-all animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-3 h-3 rounded-full ${n.dot === 'dot-green' ? 'bg-green' : n.dot === 'dot-amber' ? 'bg-amber' : 'bg-navy'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{n.time}</span>
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-4">{n.text}</h4>
                  <p className="text-[14px] text-gray-500 font-medium leading-relaxed mb-6">{n.desc}</p>
                  <div className="text-[10px] font-black uppercase tracking-widest text-navy border-b-2 border-navy/10 pb-0.5 inline-block">Institutional Alert Protocol Active</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* SIMPLE FOOTER */}
      <footer className="bg-white border-t-2 border-gray-100 py-10 px-6 md:px-12 mt-auto">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-navy text-white rounded-lg flex items-center justify-center shadow-lg shadow-navy/20"><IconBuilding /></div>
            <strong className="text-navy text-sm font-black leading-none uppercase">GovRecruit</strong>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <Link href="#" className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-navy transition-colors">Privacy</Link>
            <Link href="#" className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-navy transition-colors">Terms</Link>
            <Link href="#" className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-navy transition-colors">Support</Link>
            <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest ml-0 md:ml-10">© 2026 GovRecruit</p>
          </div>
        </div>
      </footer>

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
