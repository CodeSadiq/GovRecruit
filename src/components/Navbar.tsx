'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;
const IconUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('govrecruit_auth');
    if (auth) setIsLoggedIn(true);

    const savedProfile = localStorage.getItem('govrecruit_profile');
    if (savedProfile) {
      try { setUserProfile(JSON.parse(savedProfile)); } catch (e) { console.error(e); }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('govrecruit_auth');
    localStorage.removeItem('govrecruit_profile');
    window.location.href = '/login'; // Use window.location to force a full reload and clear state
  };

  return (
    <nav className="bg-[#0D244D] h-[60px] flex items-center px-6 md:px-12 sticky top-0 z-[100] shadow-sm">
      <Link href="/" className="flex items-center gap-3 no-underline mr-auto group">
        <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
          <IconBuilding />
        </div>
        <div className="flex flex-col">
          <strong className="text-white text-base font-black leading-none uppercase tracking-tighter">GovRecruit</strong>
        </div>
      </Link>

      <div className="hidden lg:flex items-center gap-2">
        <Link 
          href="/" 
          className={`px-5 py-2 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all no-underline ${pathname === '/' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white'}`}
        >
          Home
        </Link>
        <Link 
          href="/for-you" 
          className={`px-5 py-2 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all no-underline ${pathname === '/for-you' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white'}`}
        >
          Recruitment For You
        </Link>
        <Link 
          href="/jobs" 
          className={`px-5 py-2 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all no-underline ${pathname === '/jobs' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white'}`}
        >
          All Jobs
        </Link>
      </div>

      <div className="flex items-center gap-6 ml-10">
        {!isLoggedIn ? (
          <Link 
            href="/login" 
            className="bg-white/10 hover:bg-white text-white hover:text-navy border border-white/20 px-6 py-2.5 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest no-underline shadow-lg shadow-white/5 active:scale-95"
          >
            Candidate Login
          </Link>
        ) : (
          <>
            <Link 
              href="/notifications" 
              className={`relative text-white/60 hover:text-white transition-all no-underline ${pathname === '/notifications' ? 'text-white' : 'text-white/60'}`}
            >
              <IconBell />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#0D244D]">3</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/5 px-4 py-2.5 rounded-xl transition-all text-white min-w-[180px] justify-between group shadow-lg shadow-black/5"
              >
                <div className="flex items-center gap-3">
                  <span className="opacity-50 group-hover:opacity-100 transition-opacity"><IconUser /></span>
                  <span className="text-[11px] font-black uppercase tracking-widest truncate max-w-[100px]">
                    {userProfile ? userProfile.fullName || 'Candidate' : 'Candidate'}
                  </span>
                </div>
                <span className={`text-[10px] transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-full bg-white border-2 border-gray-100 shadow-2xl rounded-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                  <Link
                    href="/profile"
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#0D244D] hover:bg-gray-50 transition-colors no-underline"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span className="opacity-30"><IconUser /></span>
                    Profile Settings
                  </Link>
                  <div className="h-[1px] bg-gray-100 mx-4 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer font-sans"
                  >
                    <span className="opacity-30">⎆</span>
                    Logout session
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
