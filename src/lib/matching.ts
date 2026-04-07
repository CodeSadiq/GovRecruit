import { JobPost, Post } from '@/types/job';

export interface CandidateProfile {
  qualification: string;
  level: number;
  branch: string;
}

export interface MatchedJob {
  job: JobPost;
  matchedPosts: Post[];
  matchScore: number;
  matchTier: 'exact' | 'moderate' | 'broad';
  isExpired: boolean;
}

// ─────────────────────────────────────────────
//  MATCH TIER THRESHOLDS
//  Tune these to control how loose "moderate"
//  matching is. Lower = more suggestions shown.
// ─────────────────────────────────────────────
const SCORE_EXACT = 60;   // score >= 60  → exact
const SCORE_MODERATE = 30;   // score >= 30  → moderate
// anything below SCORE_MODERATE is dropped

/**
 * Public entry point.
 * Returns ALL qualification-matched jobs — expired or not —
 * sorted by match score descending.
 */
export function getEligibleJobs(
  candidate: CandidateProfile,
  allJobs: JobPost[]
): MatchedJob[] {
  const results: MatchedJob[] = [];

  for (const job of allJobs) {
    const matchedPosts = getMatchedPostsForJob(candidate, job);
    if (matchedPosts.length === 0) continue;

    const score = calculateMatchScore(candidate, job, matchedPosts);
    if (score < SCORE_MODERATE) continue;   // drop truly irrelevant jobs

    const isExpired = isJobExpired(job);
    const matchTier: MatchedJob['matchTier'] =
      score >= SCORE_EXACT ? 'exact' :
        score >= SCORE_MODERATE ? 'moderate' : 'broad';

    results.push({ job, matchedPosts, matchScore: score, matchTier, isExpired });
  }

  // Sort: active jobs first within each tier, then by score
  return results.sort((a, b) => {
    // Primary: score descending
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    // Secondary: active before expired
    if (a.isExpired !== b.isExpired) return a.isExpired ? 1 : -1;
    return 0;
  });
}

// ─────────────────────────────────────────────
//  INTERNAL: collect all posts the candidate
//  qualifies for within one job
// ─────────────────────────────────────────────
function getMatchedPostsForJob(candidate: CandidateProfile, job: JobPost): Post[] {
  const eligiblePosts: Post[] = [];

  if (job.posts && job.posts.length > 0) {
    for (const post of job.posts) {
      const result = evaluatePost(candidate, post);
      if (result.qualifies) {
        eligiblePosts.push(post);
      }
    }
  } else if (job.qualification && job.qualification.length > 0) {
    // No sub-posts: synthesise a virtual post from root-level qualification
    const virtualPost: Post = {
      name: job.title,
      totalVacancy: job.totalVacancy,
      minQualificationLevel: Math.min(...job.qualification.map(q => q.level)),
      qualification: job.qualification,
      prerequisite: [],
      categoryWiseVacancy: job.categoryWiseVacancyTotal,
      appearingEligible: false,
      appearingConditions: null,
      qualificationNote: null,
    };
    if (evaluatePost(candidate, virtualPost).qualifies) {
      eligiblePosts.push(virtualPost);
    }
  }

  return eligiblePosts;
}

// ─────────────────────────────────────────────
//  CORE QUALIFICATION EVALUATOR
//
//  Three-tier matching per qualification object:
//
//  EXACT   — candidate level >= qual.level  AND  branch matches
//  UPWARD  — candidate is over-qualified (level higher) → still eligible
//  MODERATE— candidate level is exactly 1 below required (e.g. Diploma
//             candidate for a Graduate post) → moderate suggestion
//
//  Age, category, fee, dates are intentionally NOT checked here.
// ─────────────────────────────────────────────
interface EvalResult {
  qualifies: boolean;
  tier: 'exact' | 'moderate' | 'none';
  branchScore: number;  // 0 | 1 | 2  (0 = no match, 1 = any, 2 = specific)
}

function evaluatePost(candidate: CandidateProfile, post: Post): EvalResult {
  const minLevel = post.minQualificationLevel ?? 1;
  const candidateLevel = candidate.level ?? 0;

  // Hard floor: candidate is more than 1 level below requirement → skip
  if (candidateLevel < minLevel - 1) {
    return { qualifies: false, tier: 'none', branchScore: 0 };
  }

  const isModerateLevelOnly = candidateLevel === minLevel - 1;

  // Check branch across all qualification objects for this post
  let bestBranchScore = 0;
  let levelMatched = false;

  for (const qual of post.qualification) {
    // Skip qual objects the candidate clearly can't meet (more than 1 level below)
    if (candidateLevel < qual.level - 1) continue;

    levelMatched = true;

    const branchScore = scoreBranchMatch(candidate.branch, qual.branches ?? []);
    if (branchScore > bestBranchScore) bestBranchScore = branchScore;

    // If branch already scores 2 (specific), no need to check further
    if (bestBranchScore === 2) break;
  }

  if (!levelMatched && !isModerateLevelOnly) {
    return { qualifies: false, tier: 'none', branchScore: 0 };
  }

  // Moderate tier: 1 level below but branch matches well
  if (isModerateLevelOnly) {
    const branchScore = 0;
    // Re-check branches for the moderate level
    let moderateBranchScore = 0;
    for (const qual of post.qualification) {
      moderateBranchScore = Math.max(
        moderateBranchScore,
        scoreBranchMatch(candidate.branch, qual.branches ?? [])
      );
    }
    if (moderateBranchScore > 0) {
      return { qualifies: true, tier: 'moderate', branchScore: moderateBranchScore };
    }
    return { qualifies: false, tier: 'none', branchScore: 0 };
  }

  // Exact / upward tier
  if (bestBranchScore > 0) {
    return { qualifies: true, tier: 'exact', branchScore: bestBranchScore };
  }

  return { qualifies: false, tier: 'none', branchScore: 0 };
}

/**
 * Branch scoring:
 *  2 → specific branch name match
 *  1 → 'any' in job branches OR candidate branch is 'any'
 *  0 → no match
 */
function scoreBranchMatch(candidateBranch: string, jobBranches: string[]): number {
  if (!jobBranches || jobBranches.length === 0) return 1; // no branch restriction → open

  const cb = (candidateBranch || 'any').toLowerCase().trim();
  const jb = jobBranches.map(b => b.toLowerCase().trim());

  if (jb.includes('any')) return 1;
  if (cb === 'any') return 1;
  if (jb.includes(cb)) return 2;

  // Partial / synonym matching — handles common abbreviation mismatches
  // e.g. "cse" matches "computer science & engineering"
  if (partialBranchMatch(cb, jb)) return 1;

  return 0;
}

/**
 * Loose synonym map for common branch name variations
 * between candidate's profile and job notification text.
 */
const BRANCH_SYNONYMS: Record<string, string[]> = {
  'cse': ['computer science', 'computer science & engineering', 'computer science and engineering', 'cs'],
  'it': ['information technology'],
  'ece': ['electronics & communication', 'electronics and communication', 'electronics'],
  'eee': ['electrical & electronics', 'electrical and electronics'],
  'mechanical': ['mechanical engineering'],
  'civil': ['civil engineering'],
  'electrical': ['electrical engineering'],
  'chemical': ['chemical engineering'],
  'computer applications': ['bca', 'mca'],
  'nursing': ['b.sc nursing', 'gnm', 'anm'],
  'law': ['llb', 'ba llb'],
  'education': ['b.ed', 'm.ed'],
  'pharmacy': ['b.pharm', 'm.pharm', 'd.pharm'],
  'architecture': ['b.arch', 'm.arch'],
  'agriculture': ['agricultural engineering'],
  'data science': ['data science and engineering'],
  'ai': ['artificial intelligence', 'ai / artificial intelligence', 'ai/ml', 'machine learning'],
};

function partialBranchMatch(candidateBranch: string, jobBranches: string[]): boolean {
  const synonyms = BRANCH_SYNONYMS[candidateBranch] ?? [];
  for (const syn of synonyms) {
    if (jobBranches.some(jb => jb.includes(syn) || syn.includes(jb))) return true;
  }
  // Also check reverse: see if job branch has a synonym pointing to candidate
  for (const [key, syns] of Object.entries(BRANCH_SYNONYMS)) {
    if (syns.includes(candidateBranch)) {
      if (jobBranches.includes(key) || jobBranches.some(jb => jb.includes(key))) return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────
//  SCORING
//  Pure qualification-based. No age/category.
// ─────────────────────────────────────────────
function calculateMatchScore(
  candidate: CandidateProfile,
  job: JobPost,
  matchedPosts: Post[]
): number {
  let score = 0;
  const primaryPost = matchedPosts[0];
  const minLevel = primaryPost.minQualificationLevel ?? 1;

  // ── 1. Level alignment (max 40 pts) ──
  if (candidate.level === minLevel) {
    score += 40;                            // exact level
  } else if (candidate.level > minLevel) {
    score += 25;                            // over-qualified (still eligible)
  } else if (candidate.level === minLevel - 1) {
    score += 15;                            // moderate / 1-level-below
  }

  // ── 2. Branch relevance (max 35 pts) ──
  let bestBranch = 0;
  for (const qual of primaryPost.qualification) {
    const bs = scoreBranchMatch(candidate.branch, qual.branches ?? []);
    if (bs > bestBranch) bestBranch = bs;
  }
  if (bestBranch === 2) score += 35;       // specific branch match
  else if (bestBranch === 1) score += 15;  // 'any' / open match

  // ── 3. Number of matched posts breadth (max 15 pts) ──
  score += Math.min(matchedPosts.length * 5, 15);

  // ── 4. streamRequired alignment (max 10 pts) ──
  //  If job requires a specific stream (e.g. "Science") and
  //  candidate branch implies that stream, give bonus.
  const stream = primaryPost.qualification[0]?.streamRequired?.toLowerCase();
  if (stream) {
    const cb = (candidate.branch || '').toLowerCase();
    if (
      (stream === 'science' && ['science (pcm)', 'science (pcb)', 'physics', 'chemistry', 'mathematics', 'biology', 'cse', 'it', 'ece', 'eee', 'mechanical', 'civil', 'electrical', 'chemical'].includes(cb)) ||
      (stream === 'commerce' && ['commerce', 'accounting', 'finance', 'b.com', 'taxation'].includes(cb)) ||
      (stream === 'arts' && ['arts', 'hindi', 'english', 'history', 'political science', 'sociology'].includes(cb)) ||
      (stream === 'mathematics' && ['mathematics', 'statistics', 'cse', 'it'].includes(cb))
    ) {
      score += 10;
    }
  }

  return score;
}

// ─────────────────────────────────────────────
//  UTILITY: expired check (for UI badge only,
//  NOT used to filter jobs out)
// ─────────────────────────────────────────────
function isJobExpired(job: JobPost): boolean {
  if (!job.importantDates?.lastDate) return false;
  const lastDate = new Date(job.importantDates.lastDate);
  lastDate.setHours(23, 59, 59, 999);
  return lastDate < new Date();
}