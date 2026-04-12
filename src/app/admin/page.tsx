'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RecruitmentPreview from '@/components/RecruitmentPreview';

export default function AdminPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [jobData, setJobData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullToolOpen, setIsFullToolOpen] = useState(false);

  // New states for Job Management
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

  const handleUpdate = (path: string, value: any) => {
    setJobData((prev: any) => {
      if (!prev) return prev;
      const parts = path.split('.');
      const updateDeep = (obj: any, keys: string[], val: any): any => {
        const [head, ...tail] = keys;
        if (!obj) obj = {};
        if (tail.length === 0) {
          if (Array.isArray(obj)) {
            const newArr = [...obj];
            newArr[parseInt(head)] = val;
            return newArr;
          }
          return { ...obj, [head]: val };
        }
        if (Array.isArray(obj)) {
          const newArr = [...obj];
          const idx = parseInt(head);
          newArr[idx] = updateDeep(newArr[idx], tail, val);
          return newArr;
        }
        return { ...obj, [head]: updateDeep(obj[head], tail, val) };
      };
      return updateDeep(prev, parts, value);
    });
  };

  useEffect(() => {
    if (isEditing && jobData) {
      setJsonInput(JSON.stringify(jobData, null, 2));
    }
  }, [jobData, isEditing]);

  useEffect(() => {
    if (!jsonInput.trim()) {
      setJobData(null);
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      setJobData(parsed);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [jsonInput]);

  const handlePublish = async () => {
    if (!jobData) return;
    setIsPublishing(true);
    const normalizedData = { ...jobData };
    if (!normalizedData.organization && normalizedData.org) normalizedData.organization = normalizedData.org;
    
    // Ensure ID is generated/sanitized
    if (!normalizedData.id) {
      normalizedData.id = normalizedData.title ? normalizedData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') : Math.random().toString(36).substr(2, 9);
    }

    // Convert string to array if needed
    const arrayify = (val: any) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split(/\n|,|;/).map(s => s.trim()).filter(Boolean);
      return [];
    };

    if (normalizedData.selectionProcess) normalizedData.selectionProcess = arrayify(normalizedData.selectionProcess);
    if (normalizedData.applicationProcess) normalizedData.applicationProcess = arrayify(normalizedData.applicationProcess);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedData),
      });
      if (res.ok) {
        setSuccess(true);
        fetchPublishedJobs(); // Refresh the list
        setTimeout(() => {
          setSuccess(false);
          setIsFullToolOpen(false);
          setJsonInput('');
          setJobData(null);
        }, 2000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Publishing failed.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsPublishing(false);
    }
  };

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

  const handleEditJob = (job: any) => {
    setJobData(job);
    setJsonInput(JSON.stringify(job, null, 2));
    setIsFullToolOpen(true);
    setIsEditing(true);
  };

  const handleReset = () => {
    if (window.confirm('Clear all recruitment data and start fresh?')) {
      setJsonInput('');
      setJobData(null);
      setError(null);
      setSuccess(false);
    }
  };

  const filteredJobs = publishedJobs.filter(job =>
    (job.title || '').toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
    (job.organization || '').toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
    (job.id || '').toLowerCase().includes(adminSearchQuery.toLowerCase())
  );

  if (!isFullToolOpen) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] p-6 lg:p-14 font-sans selection:bg-navy selection:text-white">
        <nav className="mb-14 flex items-center justify-between">
          <Link href="/" className="text-navy/30 hover:text-navy transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 no-underline group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Dashboard
          </Link>
        </nav>

        <div className="max-w-[1240px] mx-auto space-y-12 animate-in fade-in duration-700">
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 pb-12 border-b-2 border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-navy animate-pulse"></div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-navy/30">Admin</h2>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-navy uppercase leading-none tracking-tighter">
                Recruitment Manager
              </h1>
            </div>

            <button
              onClick={() => {
                setJobData(null);
                setJsonInput('');
                setIsFullToolOpen(true);
              }}
              className="px-8 py-4 bg-navy text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-navy/20 hover:bg-[#06142E] transition-all flex items-center gap-4 group"
            >
              Add New Job <span className="text-xl group-hover:rotate-90 transition-transform">+</span>
            </button>
          </div>

          {/* MANAGEMENT SECTION */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border-2 border-gray-200 p-4 rounded-xl shadow-sm">
              <div className="flex-1 w-full relative">
                <input
                  type="text"
                  placeholder="SEARCH RECRUITMENT REGISTRY (ID, TITLE, ORG)..."
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[11px] font-bold text-navy placeholder:text-navy/20 uppercase tracking-widest pl-10 h-10"
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
                          <button
                            onClick={() => handleEditJob(job)}
                            className="px-4 py-2 bg-navy/5 text-navy text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-navy hover:text-white transition-all border border-navy/5"
                          >
                            Edit
                          </button>
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

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[2000] flex flex-col font-sans animate-in fade-in duration-300">
      <header className="h-[60px] md:h-[70px] bg-white border-b-2 border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setIsFullToolOpen(false)} className="text-navy/40 hover:text-navy text-lg md:text-xl p-2 font-black transition-colors">✕</button>
          <div className="h-6 w-[1px] bg-gray-100 hidden md:block"></div>
          <h2 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-navy truncate max-w-[80px] md:max-w-none">Recruitment Editor</h2>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={handleReset}
            className="px-3 md:px-5 py-2 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-500 hover:bg-red-100 transition-all border border-red-100"
          >
            Reset
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {isEditing ? 'Live Edit ON' : 'Edit Mode'}
          </button>
          <button
            onClick={handlePublish}
            disabled={!jobData || isPublishing || success}
            className={`px-4 md:px-8 py-2 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${success ? 'bg-green text-white' : 'bg-navy text-white hover:bg-[#06142E] active:scale-95 disabled:opacity-30 disabled:grayscale'}`}
          >
            {isPublishing ? '...' : success ? '✓ Published' : 'Publish ➜'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[35%_1fr]">
        <div className="relative border-b lg:border-r-2 border-gray-100 bg-gray-50 flex flex-col h-[40vh] lg:h-auto">
          <div className="absolute top-2 left-4 text-[8px] font-black text-navy/20 uppercase tracking-widest z-10 pointer-events-none">JSON Source</div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="flex-1 w-full p-6 md:p-12 pt-10 md:pt-16 font-mono text-[11px] md:text-[13px] text-navy leading-relaxed bg-transparent focus:outline-none resize-none custom-scrollbar"
            placeholder='Paste Job JSON Meta-Data Here...'
          />
          {error && (
            <div className="absolute bottom-4 left-4 right-4 p-2.5 bg-red-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-2">
              Schema Error: {error}
            </div>
          )}
        </div>
        <div className="bg-white overflow-y-auto custom-scrollbar p-0 md:p-8">
          <div className="max-w-[1000px] mx-auto scale-[0.85] md:scale-100 origin-top">
            {!jobData ? (
              <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center opacity-10">
                <div className="text-4xl md:text-6xl mb-4">📑</div>
                <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Awaiting Valid Schema</div>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <RecruitmentPreview
                  job={jobData}
                  editable={isEditing}
                  onUpdate={handleUpdate}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
