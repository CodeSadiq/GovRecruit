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
  matchTier: 'exact' | 'none';
  isExpired: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
export function getEligibleJobs(
  candidate: CandidateProfile,
  allJobs: JobPost[]
): MatchedJob[] {
  const results: MatchedJob[] = [];

  for (const job of allJobs) {
    const matchedPosts = getMatchedPostsForJob(candidate, job);
    if (matchedPosts.length === 0) continue;

    const isExpired = isJobExpired(job);
    results.push({
      job,
      matchedPosts,
      matchScore: 100,
      matchTier: 'exact',
      isExpired
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
//  COLLECT ELIGIBLE POSTS FOR ONE JOB
// ─────────────────────────────────────────────────────────────────────────────
function getMatchedPostsForJob(candidate: CandidateProfile, job: JobPost): Post[] {
  const eligiblePosts: Post[] = [];

  if (job.posts && job.posts.length > 0) {
    for (const post of job.posts) {
      if (evaluatePost(candidate, post)) {
        eligiblePosts.push(post);
      }
    }
  } else if (job.qualification) {
    // synthesise a virtual post from root-level data.
    const virtualPost: Post = {
      name: job.title,
      totalVacancy: job.totalVacancy,
      minQualificationLevel: null,
      qualification: job.qualification,
      educationRequirementForMatch: [],
      prerequisite: [],
      categoryWiseVacancy: job.categoryWiseVacancyTotal,
      appearingEligible: false,
      appearingConditions: null,
      qualificationNote: null,
    };

    if (evaluatePost(candidate, virtualPost)) {
      eligiblePosts.push(virtualPost);
    }
  }

  return eligiblePosts;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CORE EVALUATOR — SIMPLE INTERSECTION MODE
// ─────────────────────────────────────────────────────────────────────────────
function evaluatePost(candidate: CandidateProfile, post: Post): boolean {
  const cCourse = (candidate.qualification || '').trim().toLowerCase();
  const cBranch = (candidate.branch || '').trim().toLowerCase();

  // 1. PRIMARY MATCH: check educationRequirementForMatch array if it exists
  if (post.educationRequirementForMatch && post.educationRequirementForMatch.length > 0) {
    return post.educationRequirementForMatch.some((req: any) => {
      const matchCourse = (req.qualification || '').trim().toLowerCase() === cCourse;
      const matchBranch = !req.branches || 
                          req.branches.length === 0 || 
                          req.branches.some((b: string) => b.toLowerCase() === cBranch || b.toLowerCase() === 'any');
      return matchCourse && matchBranch;
    });
  }

  // 2. FALLBACK MATCH: check simple qualification format
  const qual = post.qualification as any;
  if (!qual || !qual.course) return false;

  const jobCourses = (Array.isArray(qual.course) ? qual.course : [qual.course]).map((c: string) => c.toLowerCase());
  const jobBranches = (Array.isArray(qual.branch) ? qual.branch : []).map((b: string) => b.toLowerCase());

  const isCourseMatch = jobCourses.includes(cCourse);
  const isBranchMatch = jobBranches.length === 0 || jobBranches.includes("any") || jobBranches.includes(cBranch);

  return isCourseMatch && isBranchMatch;
}

function isJobExpired(job: JobPost): boolean {
  if (!job.importantDates?.lastDate) return false;
  const lastDate = new Date(job.importantDates.lastDate);
  lastDate.setHours(23, 59, 59, 999);
  return lastDate < new Date();
}