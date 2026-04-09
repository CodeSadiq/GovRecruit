'use client';

import React from 'react';
import { Job } from '@/lib/data';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
}

export default function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-navy-dark/45 backdrop-blur-sm z-[200] flex items-center justify-center p-5 transition-opacity duration-250 animate-in fade-in">
      <div
        className="bg-white rounded-xl max-w-[600px] w-full max-h-[88vh] overflow-y-auto transform transition-transform duration-250 animate-in slide-in-from-bottom-6 shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-br from-navy to-navy-light rounded-t-xl p-[28px_28px_24px] text-white relative">
          <button
            className="absolute top-4 right-4 bg-white/15 w-8 h-8 rounded-full flex items-center justify-center text-white text-base hover:bg-white/25 transition-all"
            onClick={onClose}
          >
            ✕
          </button>
          <div className="w-15 h-15 bg-white/15 rounded-md flex items-center justify-center text-3xl mb-3.5 border border-white/20 shadow-sm">
            {job.emoji}
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight mb-1">{job.title}</h2>
          <div className="text-[13.5px] opacity-70 font-medium">{job.org}</div>
        </div>

        {/* MODAL BODY */}
        <div className="p-7 space-y-6">
          <div className="grid grid-cols-3 gap-3 mb-5.5">
            <div className="bg-surface border border-border rounded-sm p-3 text-center">
              <div className="text-[14px] font-bold text-text-h mb-0.5 leading-tight">
                {typeof job.salary === 'object' ? `₹${job.salary.min?.toLocaleString()} - ₹${job.salary.max?.toLocaleString()}` : job.salary}
              </div>
              <div className="text-[11px] text-text-s uppercase font-bold tracking-wider">Salary</div>
            </div>
            <div className="bg-surface border border-border rounded-sm p-3 text-center">
              <div className="text-base font-bold text-text-h mb-0.5">{job.location}</div>
              <div className="text-[11px] text-text-s uppercase font-bold tracking-wider">Location</div>
            </div>
            <div className="bg-surface border border-border rounded-sm p-3 text-center">
              <div className={`text-base font-bold mb-0.5 ${(job.urgency === 'urgent' || !job.lastDate) ? 'text-red' : job.urgency === 'soon' ? 'text-amber' : 'text-green'}`}>
                {job.lastDate || (job as any).importantDates?.lastDate || (job as any).notificationType || "Pending/NA"}
              </div>
              <div className="text-[11px] text-text-s uppercase font-bold tracking-wider">Last Date</div>
            </div>
          </div>

          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-text-m mb-2.5">Qualification</div>
            <div className="text-[13.5px] text-text-b leading-relaxed">
              {job.qualification && job.qualification.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1">
                  {job.qualification.map((q: any, i: number) => (
                    <li key={i}>
                      <span className="font-bold">{q.name}</span>
                      {q.extraConditions?.length > 0 && (
                        <span className="text-[12px] opacity-75 italic block">
                          (Special conditions: {q.extraConditions.join(', ')})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : job.qual}
            </div>
          </section>

          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-text-m mb-2.5">Selection Process</div>
            <div className="text-[13.5px] text-text-b leading-relaxed">
              {job.selectionProcess && job.selectionProcess.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {job.selectionProcess.map((step: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="bg-navy/10 text-navy w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              ) : job.process}
            </div>
          </section>

          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-text-m mb-2.5">Age Limit</div>
            <div className="text-[13.5px] text-text-b leading-relaxed">
              {job.ageMax > 0
                ? `${job.ageMin} – ${job.ageMax} years (age relaxation applicable for reserved categories)`
                : `Minimum ${job.ageMin} years`}
            </div>
          </section>

          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-text-m mb-2.5">Tags</div>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, idx) => (
                <span key={idx} className="bg-surface border border-border rounded-full px-3 py-1 text-[12.5px] text-text-b font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-widest text-text-m">Post-wise Vacancy & Qualification</div>
              <div className="text-[11px] bg-navy/5 text-navy-light px-2 py-0.5 rounded font-medium border border-navy/10">
                General Req: Graduate from a recognized university
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="p-3 font-bold text-text-h border-r border-border min-w-[180px]">Post / Designation</th>
                    <th className="p-3 font-bold text-text-h border-r border-border min-w-[100px]">Posts</th>
                    <th className="p-3 font-bold text-text-h">Qualification Specifics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { post: "Assistant Officer", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Assistant", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Inspector of Income Tax", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Inspector (Central Excise)", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Inspector (Preventive Officer)", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Inspector (Examiner)", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Assistant Enforcement Officer", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Sub Inspector", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Inspector Posts", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Inspector", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Section Head", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Executive Assistant", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Research Assistant", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Divisional Accountant", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Sub-Inspector (NIA)", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Sub-Inspector/Junior Intelligence Officer", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Junior Statistical Officer", count: "Appearing Eligible", qual: "Bachelor's Degree in Statistics. Note: Candidates must have at least 60% marks in Mathematics at 12th standard, OR Statistics as a main subject at degree level." },
                    { post: "Statistical Investigator Grade-II", count: "Appearing Eligible", qual: "Bachelor's Degree with Statistics studied across all years/semesters of the degree course." },
                    { post: "Office Superintendent", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Auditor", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Accountant", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Postal Assistant/Sorting Assistant", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Senior Secretariat Assistant/Upper Division Clerks", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Senior Administrative Assistant", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Tax Assistant", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." },
                    { post: "Sub-Inspector (CBN)", count: "Appearing Eligible", qual: "Must possess essential qualification as on 01-08-2025." }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface/50 transition-colors">
                      <td className="p-3 text-text-h font-medium border-r border-border">{row.post}</td>
                      <td className="p-3 text-text-m border-r border-border">{row.count}</td>
                      <td className="p-3 text-text-b leading-relaxed">{row.qual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* MODAL ACTIONS */}
        <div className="p-7 pt-0 flex gap-2.5">
          <button className="flex-1 py-3.5 bg-gradient-to-br from-navy to-accent text-white rounded-sm font-bold text-sm hover:opacity-90 transition-all">
            Apply Now →
          </button>
          <button className="px-4.5 py-3.5 border-[1.5px] border-border bg-transparent rounded-sm font-semibold text-sm text-text-m hover:border-accent hover:text-accent transition-all">
            🔖 Save
          </button>
        </div>
      </div>
    </div>
  );
}
