import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";
import { JobPost } from "@/types/job";
import { fmtDate, fmtMoney } from "@/lib/helpers";

// ── ICONS ────────────────────────────────────────────────────────────────────
const IconInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
);
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const IconBriefcase = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const IconCreditCard = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);
const IconExternalLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
);

// ── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap');

  .jd {
    --serif:  'Libre Baskerville', Georgia, serif;
    --sans:   'Source Sans 3', system-ui, sans-serif;
    --mono:   'Roboto Mono', monospace;

    --ink:        #1c1917;
    --ink-light:  #44403c;
    --ink-muted:  #78716c;
    --paper:      #fafaf9;
    --paper-alt:  #f5f5f4;
    --border:     #d6d3d1;
    --navy:       #1e3a5f;
    --crimson:    #7f1d1d;
    --gold-bg:    #fef3c7;
    --green:      #14532d;
    --blue:       #1e40af;
    --blue-bg:    #eff6ff;
    --amber-bg:   #fffbeb;
    --amber:      #78350f;

    font-family: var(--sans);
    font-size: 15px;
    line-height: 1.6;
    color: var(--ink);
    background: var(--paper);
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }

  .jd * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── LAYOUT ── */
  .jd-wrap {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 20px 80px;
  }

  /* ── MASTHEAD ── */
  .jd-masthead {
    border-bottom: 3px double var(--border);
    padding: 28px 0 22px;
  }
  .jd-eyebrow {
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .jd-eyebrow::before, .jd-eyebrow::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .jd-title {
    font-family: var(--serif);
    font-size: clamp(24px, 4vw, 38px);
    font-weight: 700;
    line-height: 1.2;
    color: var(--navy);
    text-align: center;
    margin-bottom: 12px;
  }
  .jd-advert {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--ink-muted);
    text-align: center;
    margin-bottom: 16px;
  }
  .jd-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
  }
  .jd-tag {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 8px;
    border: 1px solid var(--border);
    color: var(--ink-muted);
    background: var(--paper-alt);
  }

  /* ── HERO STRIP ── */
  .jd-hero {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid var(--border);
    border-bottom: 2px solid var(--navy);
    margin: 24px 0;
    background: var(--border);
    gap: 1px;
  }
  .jd-hero-cell {
    background: var(--paper);
    padding: 18px 16px;
    text-align: center;
  }
  .jd-hero-cell.accent { background: var(--navy); }
  .jd-hero-label {
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 5px;
  }
  .jd-hero-cell.accent .jd-hero-label { color: rgba(255,255,255,0.55); }
  .jd-hero-value {
    font-family: var(--serif);
    font-size: 26px;
    font-weight: 700;
    color: var(--navy);
    line-height: 1;
  }
  .jd-hero-cell.accent .jd-hero-value { color: #fff; }
  .jd-hero-sub { font-size: 12px; color: var(--ink-muted); margin-top: 3px; }
  .jd-hero-cell.accent .jd-hero-sub { color: rgba(255,255,255,0.5); }

  /* ── LEDE ── */
  .jd-lede {
    font-size: 15px;
    color: var(--ink-light);
    font-style: italic;
    line-height: 1.7;
    border-left: 3px solid var(--navy);
    padding-left: 16px;
    margin: 24px 0;
  }

  /* ── SECTION HEADER ── */
  .jd-section {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 36px 0 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--navy);
  }
  .jd-section-icon { color: var(--crimson); display: flex; }
  .jd-section-title {
    font-family: var(--serif);
    font-size: 16px;
    font-weight: 700;
    color: var(--navy);
  }

  /* ── UNIVERSAL BORDERED TABLE ── */
  .jd-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    border: 1px solid var(--border);
  }
  .jd-table th {
    background: var(--navy);
    color: #fff;
    font-family: var(--sans);
    font-size: 12.5px;
    font-weight: 600;
    text-align: left;
    padding: 9px 12px;
    border: 1px solid #2d5986;
    white-space: nowrap;
  }
  .jd-table th.center { text-align: center; }
  .jd-table td {
    padding: 9px 12px;
    border: 1px solid var(--border);
    vertical-align: middle;
    color: var(--ink);
    font-size: 14px;
  }
  .jd-table tbody tr:nth-child(even) td { background: var(--paper-alt); }
  .jd-table tbody tr:hover td { background: #eeede9; }
  .jd-table td.center { text-align: center; }
  .jd-table td.label {
    font-weight: 600;
    color: var(--ink-light);
    white-space: nowrap;
    width: 200px;
  }
  .jd-table td.mono { font-family: var(--mono); font-size: 13px; }
  .jd-table td.bold { font-weight: 700; }
  .jd-table td.green { color: var(--green); font-weight: 600; }
  .jd-table td.red   { color: var(--crimson); font-weight: 600; }

  /* totals row */
  .jd-table tr.tr-total td {
    background: #dce6f0 !important;
    font-weight: 700;
    color: var(--navy);
    border-top: 2px solid var(--navy);
  }
  /* highlighted date row */
  .jd-table tr.tr-highlight td { background: var(--gold-bg) !important; }
  /* group subheader inside table */
  .jd-table tr.tr-subhead td {
    background: #e8eef5 !important;
    font-weight: 600;
    font-size: 13px;
    color: var(--navy);
    border-top: 2px solid var(--navy);
  }
  /* note row inside table */
  .jd-table tr.tr-note td {
    background: var(--amber-bg) !important;
    color: var(--amber);
    font-size: 13px;
  }

  /* ── COMMON QUAL NOTICE ── */
  .jd-qual-banner {
    background: var(--blue-bg);
    border: 1px solid #bfdbfe;
    border-left: 3px solid var(--blue);
    padding: 10px 14px;
    font-size: 14px;
    color: var(--ink);
    margin-bottom: 10px;
    line-height: 1.6;
  }
  .jd-qual-banner strong { color: var(--blue); }
  .jd-qual-note {
    font-size: 13px;
    color: var(--amber);
    background: var(--amber-bg);
    border-left: 3px solid var(--amber);
    padding: 8px 12px;
    margin-top: 6px;
    line-height: 1.55;
  }

  /* ── ELIGIBILITY BADGES ── */
  .jd-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .jd-badge {
    font-family: var(--sans);
    font-size: 13px;
    font-weight: 600;
    padding: 5px 13px;
    border: 1px solid var(--border);
    color: var(--ink-light);
    background: var(--paper-alt);
  }
  .jd-badge.on {
    background: var(--navy);
    color: #fff;
    border-color: var(--navy);
  }

  /* ── SELECTION STAGES ── */
  .jd-stages {
    display: flex;
    align-items: flex-start;
    overflow-x: auto;
    padding: 6px 0 12px;
  }
  .jd-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 130px;
    text-align: center;
  }
  .jd-stage-num {
    width: 42px; height: 42px;
    border-radius: 50%;
    background: var(--navy);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--serif);
    font-size: 17px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .jd-stage-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--navy);
    max-width: 110px;
    line-height: 1.4;
  }
  .jd-stage-arrow {
    display: flex;
    align-items: center;
    padding-bottom: 30px;
    color: var(--ink-muted);
    flex-shrink: 0;
  }

  /* ── STEPS ── */
  .jd-steps { display: flex; flex-direction: column; }
  .jd-step {
    display: flex;
    gap: 14px;
    padding: 11px 0;
    border-bottom: 1px solid var(--border);
    align-items: flex-start;
  }
  .jd-step:last-child { border-bottom: none; }
  .jd-step-num {
    min-width: 24px; height: 24px;
    border: 1px solid var(--navy);
    color: var(--navy);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .jd-step-text { font-size: 14px; line-height: 1.6; color: var(--ink-light); }

  /* ── APPLY CTA ── */
  .jd-apply {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
    margin: 36px 0 0;
    padding: 20px;
    border: 2px solid var(--navy);
    background: var(--navy);
    color: #fff;
    text-decoration: none;
    font-family: var(--serif);
    font-size: 18px;
    font-weight: 700;
    transition: background 0.15s, color 0.15s;
  }
  .jd-apply:hover { background: var(--paper); color: var(--navy); }

  .tbl-scroll { overflow-x: auto; }

  @media (max-width: 600px) {
    .jd-hero { grid-template-columns: 1fr; }
    .jd-table td.label { width: auto; }
  }
`;

// ── DATA FETCHING ─────────────────────────────────────────────────────────────

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

// ── HELPERS ───────────────────────────────────────────────────────────────────

const CAT_LABELS: Record<string, string> = {
  general: "GEN", ews: "EWS", obc: "OBC", sc: "SC", st: "ST", pwd: "PwBD",
};
const catCols = ["general", "ews", "obc", "sc", "st", "pwd"];

function hasCategoryData(catObj: any): boolean {
  if (!catObj) return false;
  return Object.values(catObj).some((v) => v !== null && v !== undefined);
}

// Compact one-line qualification string — no institution boilerplate
function qualLabel(q: any): string {
  const branch =
    q.branches?.length && !(q.branches.length === 1 && q.branches[0] === "any")
      ? ` in ${q.branches.join(" / ")}`
      : "";
  const extras: string[] = [];
  if (q.streamRequired) extras.push(`Stream: ${q.streamRequired}`);
  if (q.compulsorySubjects?.length) extras.push(`Compulsory: ${q.compulsorySubjects.join(", ")}`);
  if (q.minMarksPercent) extras.push(`Min. ${q.minMarksPercent}% marks`);
  if (q.minExperienceYears) extras.push(`${q.minExperienceYears} yr exp.`);
  q.extraConditions
    ?.filter((ec: string) => !ec.toLowerCase().includes("final year"))
    .forEach((ec: string) => extras.push(ec));
  return `${q.name}${branch}${extras.length ? " — " + extras.join("; ") : ""}`;
}

// Fingerprint a post's qualification for grouping
function qualFingerprint(p: any): string {
  const quals: any[] = p.qualification || [];
  return (
    quals.map(qualLabel).join(" | ") +
    "|note:" + (p.qualificationNote || "") +
    "|app:" + (p.appearingEligible ? p.appearingConditions || "yes" : "no")
  );
}

interface QualGroup {
  qualText: string;
  qualNote: string | null;
  appearingNote: string | null;
  posts: any[];
}

function groupPostsByQual(posts: any[]): QualGroup[] {
  const map = new Map<string, QualGroup>();
  for (const p of posts) {
    const fp = qualFingerprint(p);
    if (!map.has(fp)) {
      map.set(fp, {
        qualText: (p.qualification || []).map(qualLabel).join(" OR ") || "Not specified",
        qualNote: p.qualificationNote || null,
        appearingNote: p.appearingEligible
          ? (p.appearingConditions || "Appearing candidates are eligible")
          : null,
        posts: [],
      });
    }
    map.get(fp)!.posts.push(p);
  }
  return Array.from(map.values());
}

// ── PAGE COMPONENT ─────────────────────────────────────────────────────────────

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const al = job.ageLimit || {};
  const af = job.applicationFee || { paymentMode: [] };
  const dates = job.importantDates || {};

  // Fee grouping: amount → categories
  const feeMap: Record<string, string[]> = {};
  Object.entries(af).forEach(([cat, val]) => {
    if (cat === "paymentMode" || val === null || val === undefined) return;
    const k = String(val);
    if (!feeMap[k]) feeMap[k] = [];
    feeMap[k].push(CAT_LABELS[cat] || cat.toUpperCase());
  });

  // Age relaxation rows
  const relaxRows = al.relaxation
    ? Object.entries(al.relaxation)
      .filter(([, v]) => v !== null)
      .map(([cat, val]) => ({
        label:
          cat === "exServiceman" ? "Ex-Serviceman"
            : cat === "female" ? "Female"
              : cat.toUpperCase(),
        val: val as number,
      }))
    : [];

  // Timeline rows
  const dateRows: { label: string; key: string; highlight?: boolean }[] = [
    { label: "Notification Released", key: "notificationRelease" },
    { label: "Application Opens", key: "startDate" },
    { label: "Application Closes", key: "lastDate", highlight: true },
    { label: "Fee Payment Last Date", key: "feePaymentLastDate", highlight: true },
    { label: "Correction Window Closes", key: "correctionWindowLastDate" },
    { label: "Admit Card", key: "admitCardDate" },
    { label: "Examination Date", key: "examDate", highlight: true },
    { label: "Result Declaration", key: "resultDate" },
    { label: "Interview", key: "interviewDate" },
    { label: "Document Verification", key: "documentVerificationDate" },
  ];

  // Posts normalisation
  const rawPosts: any[] =
    (job.posts || []).length > 0
      ? job.posts
      : job.qualification?.length
        ? [{ name: "General Cadre", qualification: job.qualification, totalVacancy: job.totalVacancy }]
        : [];

  const postGroups = groupPostsByQual(rawPosts);
  const singleGroup = postGroups.length === 1; // all posts share same qual → show qual once

  const overallCatVac = job.categoryWiseVacancyTotal || {};
  const hasOverallCat = hasCategoryData(overallCatVac);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="jd">
        <div className="jd-wrap">

          {/* ── MASTHEAD ── */}
          <header className="jd-masthead">
            <div className="jd-eyebrow">Official Recruitment Notice</div>
            <h1 className="jd-title">{job.title}</h1>
            {job.advertisementNumber && (
              <div className="jd-advert">Advt. No. {job.advertisementNumber}</div>
            )}
            {job.tags?.length > 0 && (
              <div className="jd-tags">
                {job.tags.slice(0, 8).map((t: string) => (
                  <span key={t} className="jd-tag">{t}</span>
                ))}
              </div>
            )}
          </header>

          {/* ── HERO STRIP ── */}
          <div className="jd-hero">
            <div className="jd-hero-cell accent">
              <div className="jd-hero-label">Total Vacancies</div>
              <div className="jd-hero-value">{job.totalVacancy?.toLocaleString("en-IN") ?? "—"}</div>
              <div className="jd-hero-sub">Posts to be filled</div>
            </div>
            <div className="jd-hero-cell">
              <div className="jd-hero-label">Age Limit</div>
              <div className="jd-hero-value" style={{ fontSize: 22 }}>
                {al.min && al.max ? `${al.min}–${al.max}` : al.max ? `≤ ${al.max}` : "—"}
              </div>
              <div className="jd-hero-sub">
                years{al.asOnDate ? ` as on ${fmtDate(al.asOnDate)}` : ""}
              </div>
            </div>
            <div className="jd-hero-cell">
              <div className="jd-hero-label">Last Date</div>
              <div className="jd-hero-value" style={{ fontSize: 19 }}>
                {dates.lastDate ? fmtDate(dates.lastDate) : "—"}
              </div>
              <div className="jd-hero-sub">Application deadline</div>
            </div>
          </div>

          {/* ── LEDE ── */}
          {(job.description || job.shortInfo) && (
            <div className="jd-lede">{job.description || job.shortInfo}</div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              RECRUITMENT OVERVIEW
          ══════════════════════════════════════════════════════════════════ */}
          <div className="jd-section">
            <span className="jd-section-icon"><IconBriefcase /></span>
            <span className="jd-section-title">Recruitment Overview</span>
          </div>
          <table className="jd-table">
            <tbody>
              <tr><td className="label">Organisation</td><td>{job.organization || "—"}</td></tr>
              {job.department && <tr><td className="label">Department</td><td>{job.department}</td></tr>}
              <tr><td className="label">Govt. Type</td><td>{job.type || "—"}</td></tr>
              <tr><td className="label">Job Location</td><td>{job.location?.join(", ") || "All India"}</td></tr>
              {job.notificationType && (
                <tr><td className="label">Notification Type</td><td>{job.notificationType}</td></tr>
              )}
              {job.salary?.payLevel && (
                <tr><td className="label">Pay Level</td><td>Level {job.salary.payLevel}</td></tr>
              )}
              {(job.salary?.min || job.salary?.max) && (
                <tr>
                  <td className="label">Salary</td>
                  <td className="bold">
                    {job.salary?.min ? fmtMoney(job.salary.min) : ""}
                    {job.salary?.max ? ` – ${fmtMoney(job.salary.max)}` : ""}
                    {job.salary?.currency ? ` ${job.salary.currency}` : ""}
                  </td>
                </tr>
              )}
              {job.officialWebsite && (
                <tr>
                  <td className="label">Official Website</td>
                  <td>
                    <a href={job.officialWebsite} target="_blank" rel="noreferrer"
                      style={{ color: "#1e40af", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {job.officialWebsite} <IconExternalLink />
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ══════════════════════════════════════════════════════════════════
              POST-WISE VACANCY
              Strategy: if all posts share the same qual, show it ONCE above
              the table as a banner; the table then has no qual column at all,
              keeping it dense and scan-friendly.
              If posts differ, a subheader row groups each qual cluster.
          ══════════════════════════════════════════════════════════════════ */}
          <div className="jd-section">
            <span className="jd-section-icon"><IconUsers /></span>
            <span className="jd-section-title">Post-wise Vacancy</span>
          </div>

          <div className="tbl-scroll">
            <table className="jd-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 210 }}>Post / Designation</th>
                  <th className="center" style={{ width: 70 }}>Total</th>
                  {hasOverallCat && catCols.map(c => (
                    <th className="center" key={c} style={{ width: 50 }}>{CAT_LABELS[c]}</th>
                  ))}
                  <th style={{ minWidth: 240 }}>Qualification Details</th>
                </tr>
              </thead>
              <tbody>
                {postGroups.flatMap((grp, gi) => {
                  return grp.posts.map((p: any, pi: number) => {
                    const catVac = p.categoryWiseVacancy || {};
                    const hasPostCat = hasCategoryData(catVac);
                    return (
                      <tr key={`${gi}-${pi}`}>
                        <td>{p.name}</td>
                        <td className="center mono bold" style={{ fontSize: 15 }}>
                          {p.totalVacancy != null ? p.totalVacancy.toLocaleString("en-IN") : "—"}
                        </td>
                        {hasOverallCat && catCols.map(c => (
                          <td key={c} className="center mono"
                            style={{ color: hasPostCat && catVac[c] != null ? "var(--navy)" : "var(--ink-muted)" }}>
                            {hasPostCat && catVac[c] != null ? catVac[c].toLocaleString("en-IN") : "—"}
                          </td>
                        ))}
                        {pi === 0 && (
                          <td rowSpan={grp.posts.length} style={{ verticalAlign: "top", background: "#fff" }}>
                            <div style={{ fontWeight: 600, color: "var(--navy)", lineHeight: 1.4 }}>
                              {grp.qualText}
                            </div>
                            {grp.appearingNote && (
                              <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 600, marginTop: 4 }}>
                                {grp.appearingNote}
                              </div>
                            )}
                            {grp.qualNote && (
                              <div style={{ fontSize: 12, color: "var(--amber)", marginTop: 6, borderLeft: "2px solid var(--amber)", paddingLeft: 8 }}>
                                <strong>Note:</strong> {grp.qualNote}
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  });
                })}

                {/* Totals row */}
                <tr className="tr-total">
                  <td>Total (All Posts)</td>
                  <td className="center mono" style={{ fontSize: 15 }}>
                    {job.totalVacancy?.toLocaleString("en-IN") ?? "—"}
                  </td>
                  {hasOverallCat && catCols.map(c => (
                    <td key={c} className="center mono">
                      {overallCatVac[c] != null ? overallCatVac[c].toLocaleString("en-IN") : "—"}
                    </td>
                  ))}
                  <td />
                </tr>
              </tbody>
            </table>
          </div>


          {/* ══════════════════════════════════════════════════════════════════
              AGE LIMIT — fully bordered, relaxation computed
          ══════════════════════════════════════════════════════════════════ */}
          {(al.min || al.max) && (
            <>
              <div className="jd-section">
                <span className="jd-section-icon"><IconUsers /></span>
                <span className="jd-section-title">Age Limit</span>
              </div>
              <table className="jd-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="center">Min Age</th>
                    <th className="center">Max Age</th>
                    <th>As on Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>General / UR</td>
                    <td className="center mono">{al.min ? `${al.min} yrs` : "—"}</td>
                    <td className="center mono bold">{al.max ? `${al.max} yrs` : "—"}</td>
                    <td className="mono">{al.asOnDate ? fmtDate(al.asOnDate) : "—"}</td>
                  </tr>
                  {relaxRows.map(r => (
                    <tr key={r.label}>
                      <td>{r.label}</td>
                      <td className="center mono">{al.min ? `${al.min} yrs` : "—"}</td>
                      <td className="center mono green">
                        {al.max ? `${al.max + r.val} yrs (+${r.val})` : "—"}
                      </td>
                      <td className="mono">{al.asOnDate ? fmtDate(al.asOnDate) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              APPLICATION FEE
          ══════════════════════════════════════════════════════════════════ */}
          {Object.keys(feeMap).length > 0 && (
            <>
              <div className="jd-section">
                <span className="jd-section-icon"><IconCreditCard /></span>
                <span className="jd-section-title">Application Fee</span>
              </div>
              <table className="jd-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Fee Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(feeMap).map(([fee, cats]) => (
                    <tr key={fee}>
                      <td>{cats.join(", ")}</td>
                      <td className={Number(fee) === 0 ? "green bold" : "red bold"}>
                        {Number(fee) === 0 ? "Exempt — ₹0" : `₹${Number(fee).toLocaleString("en-IN")}`}
                      </td>
                    </tr>
                  ))}
                  {af.paymentMode?.length > 0 && (
                    <tr>
                      <td className="label">Payment Modes</td>
                      <td style={{ fontSize: 13 }}>{af.paymentMode.join(", ")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SELECTION PROCESS
          ══════════════════════════════════════════════════════════════════ */}
          {job.selectionProcess?.length > 0 && (
            <>
              <div className="jd-section">
                <span className="jd-section-icon"><IconBriefcase /></span>
                <span className="jd-section-title">Selection Process</span>
              </div>
              <div className="jd-stages">
                {job.selectionProcess.map((stage: string, idx: number) => (
                  <React.Fragment key={idx}>
                    <div className="jd-stage">
                      <div className="jd-stage-num">{idx + 1}</div>
                      <div className="jd-stage-label">{stage}</div>
                    </div>
                    {idx < job.selectionProcess.length - 1 && (
                      <div className="jd-stage-arrow"><IconArrow /></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              HOW TO APPLY
          ══════════════════════════════════════════════════════════════════ */}
          {job.applicationProcess?.length > 0 && (
            <>
              <div className="jd-section">
                <span className="jd-section-icon"><IconInfo /></span>
                <span className="jd-section-title">How to Apply</span>
              </div>
              <div className="jd-steps">
                {job.applicationProcess.map((step: string, idx: number) => (
                  <div key={idx} className="jd-step">
                    <div className="jd-step-num">{idx + 1}</div>
                    <p className="jd-step-text">{step}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              IMPORTANT DATES — fully bordered, highlighted deadline rows
          ══════════════════════════════════════════════════════════════════ */}
          <div className="jd-section">
            <span className="jd-section-icon"><IconCalendar /></span>
            <span className="jd-section-title">Important Dates</span>
          </div>
          <table className="jd-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {dateRows.map(row => {
                const val = (dates as any)[row.key];
                if (!val && !row.highlight) return null;
                return (
                  <tr key={row.key} className={row.highlight ? "tr-highlight" : ""}>
                    <td className="label">{row.label}</td>
                    <td className="mono bold">
                      {val
                        ? fmtDate(val)
                        : <span style={{ color: "var(--ink-muted)", fontWeight: 400, fontStyle: "italic" }}>Not announced</span>
                      }
                    </td>
                  </tr>
                );
              })}
              {job.applyLink && (
                <tr>
                  <td className="label">Apply Portal</td>
                  <td>
                    <a href={job.applyLink} target="_blank" rel="noreferrer"
                      style={{ color: "#1e40af", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                      {job.applyLink} <IconExternalLink />
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ── APPLY CTA ── */}
          {job.applyLink && (
            <a href={job.applyLink} target="_blank" rel="noreferrer" className="jd-apply">
              Apply Now at {job.officialWebsite || "Official Portal"} <IconExternalLink />
            </a>
          )}

        </div>
      </div>
    </>
  );
}