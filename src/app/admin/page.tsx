'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [publishedJobs, setPublishedJobs] = useState<any[]>([]);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  const fetchPublishedJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setPublishedJobs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch jobs:', e);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchPublishedJobs();
  }, []);

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recruitment record permanently?')) return;
    try {
      const res = await fetch(`/api/jobs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPublishedJobs();
      } else {
        const d = await res.json();
        alert('Deletion failed: ' + (d.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Network error during deletion');
    }
  };

  const filteredJobs = publishedJobs.filter(job =>
    (job.title || '').toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
    (job.organization || '').toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
    (job.id || '').toLowerCase().includes(adminSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 lg:p-14 font-sans selection:bg-navy selection:text-white">
      <div className="max-w-[1240px] mx-auto space-y-12 animate-in fade-in duration-700">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 pb-12 border-b-2 border-gray-100">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-navy animate-pulse"></div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-navy/30">Admin Registry</h2>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-navy uppercase leading-none tracking-tighter">
              Recruitment Manager
            </h1>
          </div>

          <Link
            href="/admin/editor"
            className="px-8 py-4 bg-navy text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-navy/20 hover:bg-[#06142E] transition-all flex items-center gap-4 group no-underline"
          >
            Add New Job <span className="text-xl group-hover:rotate-90 transition-transform">+</span>
          </Link>
        </div>

        {/* MANAGEMENT SECTION */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border-2 border-gray-200 p-4 rounded-xl shadow-sm">
            <div className="flex-1 w-full relative border-none">
              <input
                type="text"
                placeholder="SEARCH RECRUITMENT REGISTRY (ID, TITLE, ORG)..."
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[11px] font-bold text-navy placeholder:text-navy/20 uppercase tracking-widest pl-10 h-10 ring-0 focus:ring-0"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/20" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-[9px] font-black text-navy/30 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                Total Records: {publishedJobs.length}
              </span>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">ID / UUID</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">Recruitment Title</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-50">
                {isLoadingJobs ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-[10px] font-black text-navy/10 uppercase tracking-widest animate-pulse">
                      Accessing National Registry...
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-[10px] font-black text-navy/10 uppercase tracking-widest">
                      No matching recruitment records found
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-all group">
                      <td className="px-6 py-6">
                        <code className="text-[10px] font-black text-navy/30 select-all">{job.id}</code>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-[13px] font-serif font-bold text-navy leading-tight">{job.title}</div>
                        <div className="text-[9px] font-black text-navy/20 uppercase tracking-widest mt-1">{job.organization || job.org || 'No Organization'}</div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-green-100">
                          PUBLISHED
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right space-x-2">
                        <Link
                          href={`/admin/editor?id=${job.id}`}
                          className="px-4 py-2 bg-navy/5 text-navy text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-navy hover:text-white transition-all border border-navy/5 no-underline inline-block"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="px-4 py-2 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
