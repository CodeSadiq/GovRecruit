'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { NOTIFICATIONS } from '@/lib/data';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/5">
      <main className="flex-1 max-w-[1440px] mx-auto w-full p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="mb-16 border-b border-gray-200 pb-10">
          <h1 className="text-3xl font-black text-navy uppercase tracking-tight">Job Notifications.</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest mt-3 text-[11px]">Real-time government job updates and latest recruitment alerts</p>
        </header>

        <div className="space-y-12">
          {NOTIFICATIONS.map((n, i) => (
            <div key={i} className="border-b border-gray-100 pb-12 last:border-0 last:pb-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4">{n.time}</span>
              <h4 className="text-[18px] font-bold text-navy mb-3 leading-snug">{n.text}</h4>
              <p className="text-[14px] text-gray-600 font-medium leading-relaxed mb-6">{n.desc}</p>
            </div>
          ))}
        </div>
        
        <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-24">
          GovRecruit Verification Protocol — Baseline Manifest Version 2.0.4
        </p>
      </main>

      {/* SIMPLE FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-10 px-6 md:px-12 mt-auto text-center">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">© 2026 GovRecruit Institutional Manifest</p>
      </footer>
    </div>
  );
}

