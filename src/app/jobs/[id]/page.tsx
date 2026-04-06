import React from "react";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";
import { JobPost, Qualification } from "@/types/job";
import { fmtDate, fmtDateTime, fmtMoney, daysFromNow, LEVEL_LABEL } from "@/lib/helpers";

// ── Icons ──
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;

// ── DATA FETCHING ────────────────────────────────────────────────────────────

async function getJob(id: string): Promise<JobPost | null> {
  try {
    await dbConnect();
    const jobData = await Job.findOne({ id }).lean();
    if (jobData) return jobData as unknown as JobPost;
  } catch (e) {
    console.error("Mongo Error:", e);
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return { title: "Recruitment Not Found" };
  return {
    title: `${job.title} | GovRecruit`,
    description: job.shortInfo || job.description,
  };
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

function dash(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

// ── PAGE COMPONENT ───────────────────────────────────────────────────────────

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const al = job.ageLimit || {};
  const af = job.applicationFee || { paymentMode: [] };
  const dates = job.importantDates || {};
  const noteType = job.notificationType || (job as any).displayStatus?.notificationType;

  // Truly Dynamic Rendering — No hardcoding of categories
  const feeMap: Record<string, string[]> = {};
  if (af) {
    Object.entries(af).forEach(([cat, val]) => {
      if (cat === "paymentMode" || val === null || val === undefined) return;
      const k = String(val);
      if (!feeMap[k]) feeMap[k] = [];
      feeMap[k].push(cat.toUpperCase());
    });
  }

  const dateRows: { label: string; key: string; alwaysShow?: boolean }[] = [
    { label: "Release Date", key: "notificationRelease" },
    { label: "Opening Date", key: "startDate", alwaysShow: true },
    { label: "Closing Date", key: "lastDate", alwaysShow: true },
    { label: "Fee Date", key: "feePaymentLastDate" },
    { label: "Correction End", key: "correctionWindowLastDate" },
    { label: "Examination", key: "examDate" },
    { label: "Verification", key: "documentVerificationDate" },
  ];

  const relaxRows = al.relaxation ? Object.entries(al.relaxation)
    .filter(([_, val]) => val !== null)
    .map(([cat, val]) => ({ label: cat.toUpperCase(), val: val as number }))
    : [];

  // ADOPTABLE RECRUITMENT RESOLVER — Intelligent fallback for simple vs complex schemas
  const rawPosts = job.posts || [];
  const normalizedPosts = rawPosts.length > 0 
    ? rawPosts 
    : (job.qualification && job.qualification.length > 0)
      ? [{ name: "General Recruitment Cadre", qualification: job.qualification, totalVacancy: job.totalVacancy }]
      : [];

  const handledPostNames = normalizedPosts.filter(p => !p.name.toLowerCase().includes("other") && !p.name.toLowerCase().includes("various") && !p.name.toLowerCase().includes("general")).map(p => p.name) || [];
  const allHandledNames = [...handledPostNames];

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <nav className="bg-navy h-[60px] flex items-center px-6 md:px-12 sticky top-0 z-[100] shadow-sm">
        <Link href="/" className="flex items-center gap-3 no-underline mr-auto group">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-white group-hover:bg-white/20 transition-all font-black">🏛</div>
          <div className="flex flex-col"><strong className="text-white text-base font-black leading-none uppercase">GovRecruit</strong></div>
        </Link>
        <div className="hidden lg:flex items-center gap-6">
          <Link href="/for-you" className="text-[13px] font-black uppercase tracking-widest text-white/40 hover:text-white no-underline">For You</Link>
          <Link href="/" className="text-[13px] font-black uppercase tracking-widest text-white/100 no-underline border-b-2 border-white pb-1">All Jobs</Link>
        </div>
        <div className="flex items-center gap-6 ml-10">
          <button className="relative text-white/60 hover:text-white transition-colors"><IconBell /></button>
          <Link href="/profile" className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl transition-all text-white no-underline">
            <IconUser /><div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none mb-0.5">Profile</span><span className="text-xs font-black">Sadiq Shah</span></div>
          </Link>
        </div>
      </nav>

      <div className="article-wrap">
        <header className="article-header"><h1 className="article-title">{job.title}</h1></header>

        {/* LEDE */}
        {(job.description || job.shortInfo) && (
          <div style={{ fontFamily: 'var(--jp-serif)', fontSize: 22, color: 'var(--jp-ink-light)', margin: '30px 0 40px', fontStyle: 'italic', lineHeight: 1.6 }}>
            {job.description || job.shortInfo}
          </div>
        )}

        {/* HERO STRIP */}
        <div className="vacancy-strip">
          <div className="vac-cell highlight"><div className="vac-label">Capacity</div><div className="vac-value">{job.totalVacancy?.toLocaleString("en-IN") ?? "—"}</div><div className="vac-sub">Total Posts</div></div>
          <div className="vac-cell"><div className="vac-label">Starting Pay</div><div className="vac-value" style={{fontSize: 15, fontWeight: 800}}>{job.salary?.min ? fmtMoney(job.salary.min) : "—"}</div><div className="vac-sub">Per Month</div></div>
          <div className="vac-cell">
            <div className="vac-label">Last Date</div>
            <div className="vac-value" style={{ fontSize: 16 }}>{dates.lastDate ? fmtDate(dates.lastDate) : (noteType || "OPEN")}</div>
          </div>
        </div>

        <div className="section-rule" style={{ marginTop: 60 }}><span className="section-title">Personnel Reference</span></div>
        <table className="info-pair-table">
          <tbody>
            <tr><td>Organization</td><td>{job.organization}</td></tr>
            {job.department && <tr><td>Department</td><td>{job.department}</td></tr>}
            {job.advertisementNumber && <tr><td>Reference Code</td><td style={{ fontFamily: "var(--jp-mono)", fontSize: 13 }}>{job.advertisementNumber}</td></tr>}
            <tr><td>Type</td><td>{job.type || "—"}</td></tr>
            <tr><td>Location</td><td>{job.location?.join(", ") || "All India"}</td></tr>
          </tbody>
        </table>

        {/* FEE SCHEDULE */}
        <div className="section-rule" style={{ marginTop: 40 }}><span className="section-title">Fee Schedule</span></div>
        <table className="info-pair-table">
          <tbody>
            {Object.entries(feeMap).map(([fee, cats]) => (
              <tr key={fee}><td style={{ color: 'var(--jp-ink-light)' }}>{cats.join(" / ")}</td><td style={{ textAlign: 'right' }}><strong>{Number(fee) === 0 ? "Exempted" : fmtMoney(Number(fee))}</strong></td></tr>
            ))}
          </tbody>
        </table>

        {/* VACANCY INVENTORY — EFFICIENT & ADOPTABLE PARSER */}
        <div className="section-rule" style={{ marginTop: 40 }}><span className="section-title">Vacancy Inventory</span></div>
        <p className="prose">Below is the track-wise distribution of vacancies and academic benchmarks for institutional enrollment.</p>

        <div className="tbl-scroll">
          <table className="jp-grid-table">
            <thead>
              <tr style={{ fontSize: 16 }}><th>Designation</th><th style={{ width: 140 }}>Post Count</th><th>Requirement Benchmarks</th></tr>
            </thead>
            <tbody>
              {normalizedPosts.map((p: any, idx: number) => {
                const isCatchAll = p.name.toLowerCase().includes("other") || p.name.toLowerCase().includes("various") || p.name.toLowerCase().includes("general");
                const quals = p.qualification || [];
                
                return (
                  <React.Fragment key={idx}>
                    {quals.map((q: any, qidx: number) => (
                      <tr key={`${idx}-${qidx}`} style={{ borderBottom: qidx === quals.length - 1 ? '2px solid var(--jp-paper-alt)' : '1px solid #eee', fontSize: 16 }}>
                        {/* Column 1: Designation */}
                        <td className="td-left" style={{ fontWeight: 600, color: 'var(--jp-navy)' }}>
                          {qidx === 0 ? (
                            isCatchAll ? (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '4px', fontSize: 14 }}>
                                {job.postNames.filter(pn => !allHandledNames.includes(pn)).map((pn: string) => <div key={pn}>• {pn}</div>)}
                              </div>
                            ) : p.name
                          ) : ""}
                        </td>

                        {/* Column 2: Count */}
                        <td>{qidx === 0 ? (p.totalVacancy || "—") : ""}</td>

                        {/* Column 3: Requirements */}
                        <td className="td-left">
                          <div style={{ fontWeight: 700, color: 'var(--jp-navy)' }}>{q.name}</div>
                          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {q.minMarksPercent && (
                              <div style={{ color: 'var(--jp-red)', fontWeight: 800 }}>
                                • MINIMUM {q.minMarksPercent}% REQUIRED IN {q.name.toUpperCase()}
                              </div>
                            )}
                            {q.minExperienceYears && (
                              <div style={{ color: 'var(--jp-navy)', fontWeight: 700 }}>
                                • {q.minExperienceYears}+ YEARS PROFESSIONAL EXPERIENCE
                              </div>
                            )}
                          </div>
                          {p.qualificationNote && qidx === 0 && (
                            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--jp-blue-bg)', borderRadius: 8, fontSize: 14, color: 'var(--jp-blue)', border: '1px dashed var(--jp-blue)', lineHeight: 1.5 }}>
                              <strong style={{ textTransform: 'uppercase', fontSize: 11 }}>Statutory Note:</strong> {p.qualificationNote}
                            </div>
                          )}
                          {q.extraConditions?.map((c: string) => <div key={c} style={{ color: 'var(--jp-ink-muted)', fontSize: 14, marginTop: 4 }}>• {c}</div>)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* AGE BASELINE */}
        {(al.min || al.max) && (
          <>
            <div className="section-rule" style={{ marginTop: 40 }}><span className="section-title">Age Baseline</span></div>
            <table className="jp-table">
              <thead><tr><th>Criteria</th><th>Baseline</th></tr></thead>
              <tbody>
                {al.min && <tr><td className="td-label">Min Age</td><td className="td-value">{al.min} Years</td></tr>}
                {al.max && <tr><td className="td-label">Max Age</td><td className="td-value">{al.max} Years</td></tr>}
                {al.asOnDate && <tr><td className="td-label">Effective Date</td><td className="td-value">{fmtDate(al.asOnDate)}</td></tr>}
              </tbody>
            </table>
          </>
        )}

        {/* TIMELINE */}
        <div className="section-rule" style={{ marginTop: 40 }}><span className="section-title">Timeline</span></div>
        <table className="jp-table">
          <tbody>
            {dateRows.map(row => {
              const val = (dates as any)[row.key];
              if (!val && !row.alwaysShow) return null;
              return (<tr key={row.key}><td className="td-label">{row.label}</td><td className="td-value">{val ? fmtDate(val) : "Pending"}</td></tr>);
            })}
            {job.applyLink && <tr><td className="td-label">Portal</td><td className="td-value"><a href={job.applyLink} target="_blank" rel="noreferrer" style={{color: '#2563eb', fontWeight: 600}}>link ↗</a></td></tr>}
          </tbody>
        </table>

      </div>
    </main>
  );
}
