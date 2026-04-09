'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CATEGORY_DATA } from '@/lib/data';

const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Map slug back to category name
  const categoryMap: Record<string, string> = {
    'admission': 'Admission',
    'syllabus': 'Syllabus',
    'result': 'Result',
    'admit-card': 'Admit Card',
    'important': 'Important',
    'all-jobs': 'All Jobs'
  };

  const categoryName = categoryMap[slug] || 'Notifications';
  const data = CATEGORY_DATA[categoryName] || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <main className="flex-1 max-w-[1440px] mx-auto p-6 md:p-12 w-full animate-in fade-in duration-700">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-navy transition-colors mb-12 no-underline"
        >
          <IconArrowLeft /> Back to Dashboard
        </Link>

        <header className="mb-14 border-b-4 border-navy pb-10">
          <div className="mb-4">
            <h1 className="text-5xl font-black tracking-tight text-navy uppercase leading-tight">{categoryName}.</h1>
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-widest">
            Institutional Registry for {categoryName} announcements.
          </p>
        </header>

        {data.length > 0 ? (
          <div className="bg-white border-2 border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y-2 divide-gray-50">
              {data.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 hover:bg-gray-50/80 transition-all group gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-1.5 h-1.5 bg-navy/20 rounded-full group-hover:bg-navy transition-colors"></span>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">{item.time}</div>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-navy leading-tight">
                      {item.text}
                    </h3>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-[9px] font-black uppercase tracking-widest text-[#2563EB] bg-blue-50 px-3 py-1 rounded">Official Notice</div>
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-navy hover:text-white bg-white border-2 border-navy/5 hover:bg-navy px-6 py-3 transition-all rounded-lg whitespace-nowrap shadow-sm shadow-navy/5">
                      Verify & Read
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-100 p-20 text-center rounded-3xl flex flex-col items-center justify-center">
            <p className="text-[15px] font-medium text-gray-500 leading-relaxed max-w-[400px] text-center">
              The {categoryName} registry is currently being synchronized. Please check back later.
            </p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t-2 border-gray-100 py-10 px-6 md:px-12 mt-20">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm"><img src="/logo.png" alt="" className="w-5 h-5 object-contain" /></div>
            <strong className="text-navy text-sm font-black leading-none uppercase">Rojgar Match</strong>
          </div>
          <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">© 2026 ROJGAR MATCH SYSTEM — OFFICIAL ARCHIVE</p>
        </div>
      </footer>
    </div>
  );
}
