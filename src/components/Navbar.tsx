'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ── Icons ──────────────────────────────────────────
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;
const IconUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

export default function Navbar() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sync auth state
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('govrecruit_auth');
      setIsLoggedIn(!!auth);
      const savedProfile = localStorage.getItem('govrecruit_profile');
      if (savedProfile) {
        try { setUserProfile(JSON.parse(savedProfile)); } catch (e) { console.error('Profile sync error:', e); }
      } else {
        setUserProfile(null);
      }
    };
    
    checkAuth();
    // Re-check on storage and custom events
    window.addEventListener('storage', checkAuth);
    window.addEventListener('govrecruit_auth_change', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('govrecruit_auth_change', checkAuth);
    };
  }, [pathname]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('govrecruit_auth');
    localStorage.removeItem('govrecruit_profile');
    setIsLoggedIn(false);
    setUserProfile(null);
    window.location.href = '/login';
  }, []);

  // Standard Nav Link Wrapper
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href} 
        className={`px-5 py-2 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all no-underline ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-[#0D244D] h-[60px] flex items-center px-6 md:px-12 sticky top-0 z-[100] shadow-sm transform-gpu transition-none">
      {/* 🏛 Institutional Brand */}
      <Link href="/" className="flex items-center gap-3 no-underline mr-auto group transition-none">
        <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
          <IconBuilding />
        </div>
        <strong className="text-white text-base font-black leading-none uppercase tracking-tighter">GovRecruit</strong>
      </Link>

      {/* 🗺 Navigation Manifest */}
      <div className="hidden lg:flex items-center gap-2">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/for-you">For You</NavLink>
        <NavLink href="/all-jobs">All Jobs</NavLink>
      </div>

      {/* 👤 Personnel Access */}
      <div className="flex items-center gap-4 ml-10">
        {!isLoggedIn ? (
          <Link 
            href="/login" 
            className="bg-white/10 hover:bg-white text-white hover:text-[#0D244D] border border-white/20 px-6 py-2.5 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest no-underline active:scale-95"
          >
            Candidate Login
          </Link>
        ) : (
          <>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/5 px-4 py-2.5 rounded-xl transition-all text-white min-w-[180px] justify-between group shadow-lg shadow-black/5 focus:outline-none ${showUserMenu ? 'bg-white/20 ring-2 ring-white/10' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="opacity-50 group-hover:opacity-100 transition-opacity"><IconUser /></span>
                  <span className="text-[11px] font-black uppercase tracking-widest truncate max-w-[100px]">
                    {userProfile?.fullName || 'Candidate'}
                  </span>
                </div>
                <span className={`text-[10px] transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-full bg-white border-2 border-gray-100 shadow-2xl rounded-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                  <Link
                    href="/profile"
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#0D244D] hover:bg-gray-50 transition-colors no-underline block"
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
