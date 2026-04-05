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
  // 1. Try JSON First (Curated Data)
  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, `${id}.json`);

  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return data as JobPost;
    } catch (e) {
      console.error("JSON Error:", e);
    }
  }

  // 2. Try MongoDB (Dynamic Data)
  try {
    await dbConnect();
    const jobData = await Job.findOne({ id }).lean();
    if (jobData) {
      // Cast to JobPost structure as much as possible
      return jobData as unknown as JobPost;
    }
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

function QualBlock({ name, quals }: { name: string, quals: Qualification[] }) {
  return (
    <div className="qual-block">
      <div className="qual-name-row">
        <span className="qual-name">{name}</span>
        {quals[0]?.level && <span className="qual-level-tag">Level {quals[0].level}</span>}
      </div>

      <div className="qual-variants-list">
        {quals.map((q, idx) => {
          const branchText = !q.branches || q.branches.includes("any")
            ? "Any Branch / Discipline"
            : q.branches.join(", ");
          return (
            <div key={idx} className="qual-variant">
              <div className="qual-detail">
                <strong>Branches / Subjects:</strong> {branchText}
              </div>
              {q.extraConditions && q.extraConditions.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  {q.extraConditions.map((c, i) => (
                    <span key={i} className="qual-condition">⚠ {c}</span>
                  ))}
                </div>
              )}
              {quals.length > 1 && idx < quals.length - 1 && (
                <div className="qual-variant-sep">OR</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PAGE COMPONENT ───────────────────────────────────────────────────────────

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const al = job.ageLimit || {};
  const af = job.applicationFee || { paymentMode: [] };
  const dates = job.importantDates || {};

  // Fee grouping — merge categories with identical fee
  const feeMap: Record<string, string[]> = {};
  const feeLabels: Record<string, string> = {
    general: "General / UR",
    ews: "EWS",
    obc: "OBC",
    sc: "SC",
    st: "ST",
    pwd: "PWD (Divyang)",
    female: "Female",
    exServiceman: "Ex-Serviceman",
  };

  for (const [key, label] of Object.entries(feeLabels)) {
    const val = (af as any)[key];
    if (val === null || val === undefined) continue;
    const k = String(val);
    if (!feeMap[k]) feeMap[k] = [];
    feeMap[k].push(label);
  }

  // Date rows
  const dateRows: { label: string; key: string; alwaysShow?: boolean }[] = [
    { label: "Notification Released", key: "notificationRelease" },
    { label: "Application Start", key: "startDate", alwaysShow: true },
    { label: "Last Date to Apply", key: "lastDate", alwaysShow: true },
    { label: "Fee Payment Last Date", key: "feePaymentLastDate" },
    { label: "Correction Window Closes", key: "correctionWindowLastDate" },
    { label: "Admit Card Available", key: "admitCardDate" },
    { label: "Exam Date", key: "examDate" },
    { label: "Result Date", key: "resultDate" },
    { label: "Interview Date", key: "interviewDate" },
    { label: "Document Verification", key: "documentVerificationDate" },
  ];

  // Relaxation
  const relaxRows: { label: string; val: number | null }[] = [
    { label: "OBC", val: al.relaxation?.obc ?? null },
    { label: "SC / ST", val: al.relaxation?.sc ?? al.relaxation?.st ?? null },
    { label: "PWD (Divyang)", val: al.relaxation?.pwd ?? null },
    { label: "Ex-Serviceman", val: al.relaxation?.exServiceman ?? null },
    { label: "Female", val: al.relaxation?.female ?? null },
  ].filter(r => r.val !== null);

  const salaryStr = job.salary?.payLevel
    ? `Pay Level ${job.salary.payLevel} (${fmtMoney(job.salary.min)} – ${fmtMoney(job.salary.max)})`
    : (job.salary?.min || job.salary?.max)
      ? `${fmtMoney(job.salary.min)} – ${fmtMoney(job.salary.max)}`
      : null;

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* ── MASTHEAD ── */}
      {/* PROFESSIONAL NAV */}
      <nav className="bg-navy h-[60px] flex items-center px-6 md:px-12 sticky top-0 z-[100] shadow-sm">
        <Link href="/" className="flex items-center gap-3 no-underline mr-auto group">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
            <IconBuilding />
          </div>
          <div className="flex flex-col">
            <strong className="text-white text-base font-black leading-none uppercase">GovRecruit</strong>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          <Link href="/for-you" className="text-[13px] font-black uppercase tracking-widest text-white/40 hover:text-white no-underline">
            For You
          </Link>
          <Link href="/" className="text-[13px] font-black uppercase tracking-widest text-white/80 hover:text-white no-underline border-b-2 border-white pb-1">
            All Jobs
          </Link>
        </div>

        <div className="flex items-center gap-6 ml-10">
          <button className="relative text-white/60 hover:text-white transition-colors">
            <IconBell />
          </button>
          <Link href="/profile" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/5 px-4 py-2 rounded-xl transition-all text-white no-underline">
            <IconUser />
            <div className="flex flex-col -gap-0.5 hidden md:flex">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none mb-0.5">Candidate Profile</span>
              <span className="text-xs font-black tracking-tight leading-none">Sadiq Shah</span>
            </div>
          </Link>
        </div>
      </nav>

      <div className="article-wrap">


        {/* ── ARTICLE HEADER ── */}
        <header className="article-header">

          <h1 className="article-title">{job.title}</h1>


        </header>

        {/* ── LEDE ── */}
        {(job.description || job.shortInfo) && (
          <div style={{ 
            fontFamily: 'var(--jp-serif)', 
            fontSize: 22, 
            fontWeight: 400, 
            lineHeight: 1.6, 
            color: 'var(--jp-ink-light)', 
            margin: '30px 0 40px',
            fontStyle: 'italic'
          }}>
            {job.description || job.shortInfo}
          </div>
        )}

        {/* ── VACANCY HERO STRIP ── */}
        <div className="vacancy-strip">
          <div className="vac-cell highlight">
            <div className="vac-label">Capacity</div>
            <div className="vac-value">{job.totalVacancy?.toLocaleString("en-IN") ?? "—"}</div>
            <div className="vac-sub">Total Posts</div>
          </div>
          <div className="vac-cell">
            <div className="vac-label">Scale</div>
            <div className="vac-value" style={{ fontSize: 16 }}>
              {job.salary?.min ? fmtMoney(job.salary.min) : "—"}
            </div>
            <div className="vac-sub">{job.salary?.max ? `to ${fmtMoney(job.salary.max)}` : ""}</div>
          </div>
          <div className="vac-cell">
            <div className="vac-label">Deadline</div>
            <div className="vac-value" style={{ fontSize: 15 }}>
              {(dates as any).lastDate ? fmtDate((dates as any).lastDate) : "—"}
            </div>
          </div>
        </div>

        <div className="section-rule">
          <span className="section-title">Personnel Reference</span>
        </div>

        <table className="info-pair-table">
          <tbody>
            <tr>
              <td>Organization</td>
              <td>{job.organization}</td>
            </tr>
            {job.department && (
              <tr><td>Department</td><td>{job.department}</td></tr>
            )}
            {job.advertisementNumber && (
              <tr><td>Reference Code</td><td style={{ fontFamily: "var(--jp-mono)", fontSize: 13 }}>{job.advertisementNumber}</td></tr>
            )}
            <tr>
              <td>Type</td>
              <td>{job.type || "—"}</td>
            </tr>
            <tr>
              <td>Total Vacancy</td>
              <td><strong>{job.totalVacancy?.toLocaleString("en-IN") ?? "—"}</strong></td>
            </tr>
            <tr>
              <td>Location</td>
              <td>{job.location?.join(", ") || "Reserved/All India"}</td>
            </tr>
            <tr>
              <td>Ex-Serviceman Quota</td>
              <td>{job.exServicemanQuota ? "✅ Applicable" : "No"}</td>
            </tr>
          </tbody>
        </table>

        {/* SECTION 05 — FEE SCHEDULE */}
        <div className="section-rule">
          <span className="section-title">Fee Schedule</span>
        </div>

        <table className="info-pair-table" style={{ borderTop: 'none', borderBottom: 'none' }}>
          <tbody>
            {Object.entries(feeMap).length > 0 ? (
              Object.entries(feeMap).map(([fee, cats]) => (
                <tr key={fee} style={{ background: 'transparent' }}>
                  <td style={{ fontWeight: 400, color: 'var(--jp-ink-light)' }}>{cats.join(" / ")}</td>
                  <td style={{ textAlign: 'right' }}>
                    {Number(fee) === 0
                      ? <span style={{ color: "var(--jp-green)", fontWeight: 700 }}>Exempted</span>
                      : <strong style={{ color: 'var(--jp-ink)' }}>{fmtMoney(Number(fee))}</strong>
                    }
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={2} style={{ textAlign: "center", color: "var(--jp-ink-muted)" }}>Refer to Official Notice</td></tr>
            )}
            {af.paymentMode && af.paymentMode.length > 0 && (
              <tr style={{ background: 'transparent' }}>
                <td colSpan={2} style={{ padding: '20px 12px 10px', borderTop: '1px dotted var(--jp-rule-light)' }}>
                  <div style={{ fontSize: 13, color: 'var(--jp-ink-muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
                     <strong style={{ color: 'var(--jp-navy)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accepted Payment Nodes:</strong>
                     <span>{af.paymentMode.join(", ")}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* SECTION 02 — VACANCY DETAILS */}
        <div className="section-rule">
          <span className="section-title">Vacancy Inventory</span>
        </div>

        <p className="prose">
          Candidates must fulfill the statutory educational requirements as outlined in the following post-wise inventory.
          The recruitment board recognizes the following academic baselines for institutional entry:
        </p>

        <div className="tbl-scroll">
          <table className="jp-grid-table">
            <thead>
              <tr>
                <th>Post Name</th>
                <th style={{ width: 120 }}>Total Post</th>
                <th>Educational Qualification</th>
              </tr>
            </thead>
            <tbody>
              {(job.posts && job.posts.length > 0) ? (
                job.posts.map((p, idx) => (
                  <tr key={idx}>
                    <td className="td-left" style={{ fontWeight: 400 }}>
                      {p.name.includes("Various Posts") ? (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: '4px',
                          fontWeight: 400,
                          color: 'var(--jp-ink)',
                          padding: '4px'
                        }}>
                          {(job.postNames || []).map((pn, pidx) => (
                            <div key={pidx}>• {pn}</div>
                          ))}
                        </div>
                      ) : (
                        p.name
                      )}
                    </td>
                    <td style={{ fontWeight: 400 }}>{p.totalVacancy?.toLocaleString("en-IN") || "—"}</td>
                    <td className="td-left" style={{ fontWeight: 400 }}>
                      {p.qualification && p.qualification.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {p.qualification.map((q, qidx) => (
                            <li key={qidx}>
                              {q.name}
                              {q.branches && !q.branches.includes('any') && (<span> in {q.branches.join(", ")}</span>)}
                              {q.extraConditions && q.extraConditions.length > 0 && (
                                <div style={{ marginTop: 4, color: 'var(--jp-ink-muted)' }}>
                                  {q.extraConditions.map(c => <span key={c}>• {c} </span>)}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span>Refer to Educational Baseline</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                (job.postNames || []).map((name, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{name}</td>
                    <td>—</td>
                    <td className="td-left">
                      {job.qualification && job.qualification.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {job.qualification.map((q, qidx) => (
                            <li key={qidx}>
                              <strong>{q.name}</strong>
                              {q.branches && !q.branches.includes('any') && (<span> in {q.branches.join(", ")}</span>)}
                            </li>
                          ))}
                        </ul>
                      ) : "Refer to Notification"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Category eligibility */}
        {job.categoryEligibility && (
          <p className="prose" style={{ marginTop: 12 }}>
            <strong>Eligible Personnel Categories:</strong>{" "}
            {job.categoryEligibility.join(", ")}.
            {job.pwdEligible && " PWD Accessible."}
            {job.exServicemanQuota && " Ex-Serviceman Reservation Included."}
          </p>
        )}






        {/* SECTION 04 — AGE BASELINE */}
        <div className="section-rule" style={{ marginTop: 24 }}>
          <span className="section-title">Age Baseline</span>
        </div>

        <div className="tbl-scroll">
          <table className="jp-table">
            <thead>
              <tr><th>Criteria</th><th>Baseline</th></tr>
            </thead>
            <tbody>
              <tr>
                <td className="td-label">Personnel Min Age</td>
                <td className="td-value">{dash(al.min)} Years</td>
              </tr>
              <tr>
                <td className="td-label">Personnel Max Age</td>
                <td className="td-value">{dash(al.max)} Years</td>
              </tr>
              {al.asOnDate && (
                <tr>
                  <td className="td-label">Effective Date</td>
                  <td className="td-value">{fmtDate(al.asOnDate)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {relaxRows.length > 0 && (
          <>
            <p className="prose" style={{ marginTop: 16 }}>
              Category relaxation applied as per institutional regulations:
            </p>
            <div className="tbl-scroll">
              <table className="jp-table">
                <thead>
                  <tr><th>Category Group</th><th>Relaxation</th></tr>
                </thead>
                <tbody>
                  {relaxRows.map(r => (
                    <tr key={r.label}>
                      <td className="td-label">{r.label}</td>
                      <td className="td-value">{r.val} Years</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* SECTION 01 — IMPORTANT DATES */}
        <div className="section-rule">
          <span className="section-title">Schedule & Timeline</span>
        </div>

        <div className="tbl-scroll">
          <table className="jp-table">
            <thead>
              <tr>
                <th>Personnel Event</th>
                <th>Calendar Date</th>
              </tr>
            </thead>
            <tbody>
              {dateRows.map(row => {
                const val = (dates as any)[row.key];
                if (!val && !row.alwaysShow) return null;
                const days = daysFromNow(val);
                let cls = "";
                let badge = null;
                if (row.key === "lastDate" && val) {
                  if (days !== null && days < 0) { cls = "date-closed"; badge = <span className="badge badge-red">CLOSED</span>; }
                  else if (days !== null && days <= 7) { cls = "date-soon"; badge = <span className="badge badge-amber">⚠ CLOSING</span>; }
                  else { cls = "date-ok"; }
                }
                return (
                  <tr key={row.key}>
                    <td className="td-label">{row.label}</td>
                    <td className={`td-value ${cls}`}>
                      {val ? fmtDate(val) : "Pending/NA"}{badge}
                    </td>
                  </tr>
                );
              })}
              {job.applyLink && (
                <tr>
                  <td className="td-label">Registration Portal</td>
                  <td className="td-value">
                    <a href={job.applyLink} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                      link ↗
                    </a>
                  </td>
                </tr>
              )}
              {job.notificationPdfLink && (
                <tr>
                  <td className="td-label">Official Documentation</td>
                  <td className="td-value">
                    <a href={job.notificationPdfLink} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                      link ↗
                    </a>
                  </td>
                </tr>
              )}
              {job.officialWebsite && (
                <tr>
                  <td className="td-label">Institutional Registry</td>
                  <td className="td-value">
                    <a href={job.officialWebsite} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                      link ↗
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SECTION 06 — SELECTION STAGES */}
        {job.selectionProcess && job.selectionProcess.length > 0 && (
          <>
            <div className="section-rule">
              <span className="section-title">Selection Stages</span>
            </div>

            <div className="selection-steps">
              {job.selectionProcess.map((step, i) => (
                <div key={i} className="sel-item">
                  <div className="sel-num">{i + 1}</div>
                  <div className="sel-label">{step}</div>
                  {i < job.selectionProcess.length - 1 && (
                    <span className="sel-arrow">›</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* SECTION 07 — PROCESS */}
        {job.applicationProcess && job.applicationProcess.length > 0 && (
          <>
            <div className="section-rule">
              <span className="section-title">Submission Workflow</span>
            </div>

            <div className="apply-steps">
              {job.applicationProcess.map((step, i) => (
                <div key={i} className="apply-step">
                  <div className="apply-step-n">{String(i + 1).padStart(2, "0")}</div>
                  <div className="apply-step-text">{step}</div>
                </div>
              ))}
            </div>
          </>
        )}



      </div>
    </main>
  );
}
