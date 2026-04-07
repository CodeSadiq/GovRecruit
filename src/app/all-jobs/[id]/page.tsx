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
import Navbar from "@/components/Navbar";

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

// Build a compact, readable qualification label for a single qualification object
function buildQualLabel(q: any): string {
  const parts: string[] = [];

  // Degree name
  parts.push(q.name);

  // Branches (skip "any")
  if (q.branches && q.branches.length > 0 && !(q.branches.length === 1 && q.branches[0] === "any")) {
    parts.push(`(${q.branches.join(" / ")})`);
  }

  return parts.join(" ");
}

// Build all the inline condition chips for a single qualification object
function buildConditionLines(q: any): { type: "marks" | "experience" | "stream" | "subjects" | "extra"; text: string }[] {
  const lines: { type: "marks" | "experience" | "stream" | "subjects" | "extra"; text: string }[] = [];

  if (q.streamRequired) {
    lines.push({ type: "stream", text: `Stream: ${q.streamRequired}` });
  }
  if (q.compulsorySubjects && q.compulsorySubjects.length > 0) {
    lines.push({ type: "subjects", text: `Compulsory: ${q.compulsorySubjects.join(", ")}` });
  }
  if (q.minMarksPercent) {
    lines.push({ type: "marks", text: `Min. ${q.minMarksPercent}% marks required` });
  }
  if (q.minExperienceYears) {
    lines.push({ type: "experience", text: `Min. ${q.minExperienceYears} year${q.minExperienceYears > 1 ? "s" : ""} experience` });
  }
  if (q.extraConditions && q.extraConditions.length > 0) {
    // Filter out final year appearing notices if they snuck in
    q.extraConditions
      .filter((ec: string) => !ec.toLowerCase().includes("final year appearing"))
      .forEach((ec: string) => lines.push({ type: "extra", text: ec }));
  }

  return lines;
}

const CHIP_STYLES: Record<string, React.CSSProperties> = {
  marks: { background: "#fff1f2", color: "#b91c1c", border: "1px solid #fecaca" },
  experience: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
  stream: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
  subjects: { background: "#fefce8", color: "#854d0e", border: "1px solid #fde68a" },
  extra: { background: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe" },
};

// ── PAGE COMPONENT ───────────────────────────────────────────────────────────

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const al = job.ageLimit || {};
  const af = job.applicationFee || { paymentMode: [] };
  const dates = job.importantDates || {};
  const noteType = job.notificationType || (job as any).displayStatus?.notificationType;

  // Fee map — group categories by amount
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

  const relaxRows = al.relaxation
    ? Object.entries(al.relaxation)
      .filter(([_, val]) => val !== null)
      .map(([cat, val]) => ({ label: cat.toUpperCase(), val: val as number }))
    : [];

  // Normalise posts — fall back to a synthetic post if none exist
  const rawPosts = job.posts || [];
  const normalizedPosts = rawPosts.length > 0
    ? rawPosts
    : (job.qualification && job.qualification.length > 0)
      ? [{ name: "General Recruitment Cadre", qualification: job.qualification, totalVacancy: job.totalVacancy }]
      : [];

  const handledPostNames = normalizedPosts
    .filter(p => !p.name.toLowerCase().includes("other") && !p.name.toLowerCase().includes("various") && !p.name.toLowerCase().includes("general"))
    .map(p => p.name);

  return (
    <main className="min-h-screen bg-[#faf8f5]">
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
          <div className="vac-cell">
            <div className="vac-label">Salary Range</div>
            <div className="vac-value" style={{ fontSize: 13, fontWeight: 800 }}>
              {job.salary?.min ? fmtMoney(job.salary.min) : "—"} 
              {job.salary?.max ? ` – ${fmtMoney(job.salary.max)}` : ""}
            </div>
            <div className="vac-sub">Institutional Pay Scale</div>
          </div>
          <div className="vac-cell">
            <div className="vac-label">Last Date</div>
            <div className="vac-value" style={{ fontSize: 16 }}>{dates.lastDate ? fmtDate(dates.lastDate) : (noteType || "OPEN")}</div>
          </div>
        </div>

        {/* PERSONNEL REFERENCE */}
        <div className="section-rule" style={{ marginTop: 60 }}><span className="section-title">Personnel Reference</span></div>
        <table className="info-pair-table">
          <tbody>
            <tr><td>Organization</td><td>{job.organization}</td></tr>
            {job.department && <tr><td>Department</td><td>{job.department}</td></tr>}
            {job.advertisementNumber && <tr><td>Advertisement number </td><td style={{ fontFamily: "var(--jp-mono)", fontSize: 13 }}>{job.advertisementNumber}</td></tr>}
            <tr><td>Type</td><td>{job.type || "—"}</td></tr>
            <tr><td>Location</td><td>{job.location?.join(", ") || "All India"}</td></tr>
          </tbody>
        </table>

        {/* FEE SCHEDULE */}
        <div className="section-rule" style={{ marginTop: 40 }}><span className="section-title">Fee Schedule</span></div>
        <table className="info-pair-table">
          <tbody>
            {Object.entries(feeMap).map(([fee, cats]) => (
              <tr key={fee}>
                <td style={{ color: 'var(--jp-ink-light)' }}>{cats.join(" / ")}</td>
                <td style={{ textAlign: 'right' }}><strong>{Number(fee) === 0 ? "Exempted" : fmtMoney(Number(fee))}</strong></td>
              </tr>
            ))}
            {af.paymentMode && af.paymentMode.length > 0 && (
              <tr>
                <td style={{ color: 'var(--jp-ink-light)' }}>Payment Mode</td>
                <td style={{ textAlign: 'right' }}>{af.paymentMode.join(", ")}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── VACANCY INVENTORY ─────────────────────────────────────────────── */}
        <div className="section-rule" style={{ marginTop: 40 }}><span className="section-title">Vacancy Inventory</span></div>
        <p className="prose">Track-wise distribution of vacancies and qualification benchmarks for each post.</p>

        <div className="tbl-scroll">
          <table className="jp-grid-table">
            <thead>
              <tr style={{ fontSize: 16 }}>
                <th style={{ minWidth: 180 }}>Designation</th>
                <th style={{ width: 100, textAlign: "center" }}>Posts</th>
                <th>Qualification &amp; Requirements</th>
              </tr>
            </thead>
            <tbody>
              {normalizedPosts.map((p: any, idx: number) => {
                const isCatchAll =
                  p.name.toLowerCase().includes("other") ||
                  p.name.toLowerCase().includes("various") ||
                  p.name.toLowerCase().includes("general");

                const quals: any[] = p.qualification || [];

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "2px solid var(--jp-paper-alt)",
                      verticalAlign: "top",
                      fontSize: 15,
                    }}
                  >
                    {/* ── Col 1: Designation ── */}
                    <td className="td-left" style={{ fontWeight: 700, color: "var(--jp-navy)", paddingTop: 16, paddingBottom: 16 }}>
                      {isCatchAll ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14 }}>
                          {job.postNames
                            .filter((pn: string) => !handledPostNames.includes(pn))
                            .map((pn: string) => <div key={pn}>• {pn}</div>)}
                        </div>
                      ) : (
                        p.name
                      )}
                    </td>

                    {/* ── Col 2: Count ── */}
                    <td style={{ textAlign: "center", fontWeight: 800, fontSize: 18, color: "var(--jp-navy)", paddingTop: 16 }}>
                      {p.totalVacancy ?? "—"}
                    </td>

                    {/* ── Col 3: Qualification & Requirements ── */}
                    <td className="td-left" style={{ paddingTop: 14, paddingBottom: 16 }}>

                      {quals.length === 0 ? (
                        <span style={{ color: "var(--jp-ink-muted)", fontStyle: "italic" }}>Not specified</span>
                      ) : quals.length === 1 ? (
                        /* ── Single qualification: flat layout ── */
                        <SingleQualBlock q={quals[0]} />
                      ) : (
                        /* ── Multiple qualifications (OR paths): numbered list ── */
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--jp-ink-muted)", marginBottom: 2 }}>
                            Any one of the following:
                          </div>
                          {quals.map((q: any, qidx: number) => (
                            <div
                              key={qidx}
                              style={{
                                display: "flex",
                                gap: 12,
                                padding: "10px 12px",
                                background: qidx % 2 === 0 ? "var(--jp-paper-alt)" : "transparent",
                                borderRadius: 8,
                                border: "1px solid var(--jp-border)",
                              }}
                            >
                              <div style={{
                                minWidth: 22, height: 22, borderRadius: "50%",
                                background: "var(--jp-navy)", color: "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1
                              }}>
                                {qidx + 1}
                              </div>
                              <SingleQualBlock q={q} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── Statutory Note (qualificationNote) — shown once per post, below all quals ── */}
                      {p.qualificationNote && (
                        <div style={{
                          marginTop: 14,
                          padding: "10px 14px",
                          background: "var(--jp-blue-bg)",
                          borderRadius: 8,
                          fontSize: 13,
                          color: "var(--jp-blue)",
                          border: "1px dashed var(--jp-blue)",
                          lineHeight: 1.6,
                        }}>
                          {p.qualificationNote.split('.').map(s => s.trim()).filter(s => s && !s.toLowerCase().includes("final year appearing")).join('. ')}
                          {p.qualificationNote.trim().endsWith('.') && '.'}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── AGE BASELINE ─────────────────────────────────────────────────── */}
        {(al.min || al.max) && (
          <>
            <div className="section-rule" style={{ marginTop: 40 }}><span className="section-title">Age Baseline</span></div>
            <table className="jp-table">
              <thead><tr><th>Criteria</th><th>Baseline</th></tr></thead>
              <tbody>
                {al.min && <tr><td className="td-label">Min Age</td><td className="td-value">{al.min} Years</td></tr>}
                {al.max && <tr><td className="td-label">Max Age</td><td className="td-value">{al.max} Years</td></tr>}
                {al.asOnDate && <tr><td className="td-label">Effective Date</td><td className="td-value">{fmtDate(al.asOnDate)}</td></tr>}
                {relaxRows.length > 0 && relaxRows.map(r => (
                  <tr key={r.label}>
                    <td className="td-label" style={{ color: "var(--jp-ink-muted)" }}>Relaxation — {r.label}</td>
                    <td className="td-value">+{r.val} Years</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ── SELECTION PROCESS / EXAM PATTERN ─────────────────────────────── */}
        {job.selectionProcess && job.selectionProcess.length > 0 && (
          <>
            <div className="section-rule" style={{ marginTop: 40 }}>
              <span className="section-title">Selection Process</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
              {job.selectionProcess.map((stage: string, idx: number) => (
                <React.Fragment key={idx}>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 130,
                  }}>
                    {/* Circle */}
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: "var(--jp-navy)", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 900, fontSize: 16, flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>
                    {/* Label */}
                    <div style={{
                      textAlign: "center", fontSize: 13, fontWeight: 700,
                      color: "var(--jp-navy)", lineHeight: 1.4, maxWidth: 110,
                    }}>
                      {stage}
                    </div>
                  </div>
                  {/* Arrow connector */}
                  {idx < job.selectionProcess.length - 1 && (
                    <div style={{
                      display: "flex", alignItems: "center",
                      paddingBottom: 28, color: "var(--jp-ink-muted)", fontSize: 22,
                      flexShrink: 0,
                    }}>
                      →
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}

        {/* ── APPLICATION FILLING PROCESS ──────────────────────────────────── */}
        {job.applicationProcess && job.applicationProcess.length > 0 && (
          <>
            <div className="section-rule" style={{ marginTop: 40 }}>
              <span className="section-title">How to Apply</span>
            </div>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 0 }}>
              {job.applicationProcess.map((step: string, idx: number) => (
                <li key={idx} style={{
                  display: "flex",
                  gap: 16,
                  padding: "14px 0",
                  borderBottom: idx < job.applicationProcess.length - 1 ? "1px solid var(--jp-border)" : "none",
                  alignItems: "flex-start",
                }}>
                  {/* Step number badge */}
                  <div style={{
                    minWidth: 28, height: 28, borderRadius: 6,
                    background: "var(--jp-navy)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: 13, flexShrink: 0, marginTop: 1,
                  }}>
                    {idx + 1}
                  </div>
                  {/* Step text */}
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--jp-ink)" }}>
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* ── TIMELINE ─────────────────────────────────────────────────────── */}
        <div className="section-rule" style={{ marginTop: 40 }}><span className="section-title">Timeline</span></div>
        <table className="jp-table">
          <tbody>
            {dateRows.map(row => {
              const val = (dates as any)[row.key];
              if (!val && !row.alwaysShow) return null;
              return (
                <tr key={row.key}>
                  <td className="td-label">{row.label}</td>
                  <td className="td-value">{val ? fmtDate(val) : "Pending"}</td>
                </tr>
              );
            })}
            {job.applyLink && (
              <tr>
                <td className="td-label">Portal</td>
                <td className="td-value">
                  <a href={job.applyLink} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: 600 }}>
                    Apply Here ↗
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </main>
  );
}

// ── SUB-COMPONENT: Single qualification block ─────────────────────────────────
// Renders one qualification object in a clean pill-chip layout.
// Used both for single-qual flat display and inside each OR-path numbered card.

function SingleQualBlock({ q }: { q: any }) {
  const conditionLines = buildConditionLines(q);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Degree name + branches */}
      <div style={{ fontWeight: 700, color: "var(--jp-navy)", fontSize: 15 }}>
        {buildQualLabel(q)}
      </div>

      {/* Condition chips */}
      {conditionLines.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
          {conditionLines.map((line, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                padding: "3px 9px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.5,
                ...CHIP_STYLES[line.type],
              }}
            >
              {line.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
