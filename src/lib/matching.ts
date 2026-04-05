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
}

/**
 * Core Matching Algorithm
 * Implementation of the Job-Candidate Matching Model
 */
export function getEligibleJobs(candidate: CandidateProfile, allJobs: JobPost[]): MatchedJob[] {
  const eligibleJobs: MatchedJob[] = [];
  const today = new Date();

  for (const job of allJobs) {
    // 1. Deadline Check
    if (job.importantDates?.lastDate) {
      const lastDate = new Date(job.importantDates.lastDate);
      if (lastDate < today && lastDate.setHours(0,0,0,0) !== today.setHours(0,0,0,0)) {
        // Technically closed, but for matching logic we might show recently closed.
        // Let's filter out only clearly past dates.
        if (lastDate < today) continue;
      }
    }

    const eligiblePosts: Post[] = [];

    // Check individual posts
    if (job.posts && job.posts.length > 0) {
      for (const post of job.posts) {
        if (isPostEligible(candidate, post)) {
          eligiblePosts.push(post);
        }
      }
    } else if (job.qualification && job.qualification.length > 0) {
      // Fallback: If no sub-posts, check root qualification
      // Treat the job as a single virtual post
      const virtualPost: Post = {
        name: job.title,
        totalVacancy: job.totalVacancy,
        minQualificationLevel: Math.min(...job.qualification.map(q => q.level)),
        qualification: job.qualification,
        prerequisite: [],
        categoryWiseVacancy: job.categoryWiseVacancyTotal
      };
      if (isPostEligible(candidate, virtualPost)) {
        eligiblePosts.push(virtualPost);
      }
    }

    if (eligiblePosts.length > 0) {
      eligibleJobs.push({
        job,
        matchedPosts: eligiblePosts,
        matchScore: calculateJobMatchScore(candidate, job, eligiblePosts)
      });
    }
  }

  // Sort by score descending
  return eligibleJobs.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Step 1 & 2 — Level Gate and Branch Match
 */
function isPostEligible(candidate: CandidateProfile, post: Post): boolean {
  // Step 1: Level Gate
  const minLevel = post.minQualificationLevel ?? 1;
  if (candidate.level < minLevel) return false;

  // Step 2: Branch Match
  // A candidate needs to match AT LEAST ONE qualification object for this post
  let branchMatched = false;

  for (const qual of post.qualification) {
    // Basic level check for this specific qual object
    if (candidate.level < qual.level) continue;

    const branches = qual.branches.map(b => b.toLowerCase());
    const candidateBranch = candidate.branch.toLowerCase();

    if (branches.includes('any')) {
      branchMatched = true;
      break;
    }

    if (candidateBranch === 'any') {
      branchMatched = true;
      break;
    }

    if (branches.includes(candidateBranch)) {
      branchMatched = true;
      break;
    }
  }

  return branchMatched;
}

/**
 * Step 6 — Scoring / Ranking
 */
function calculateJobMatchScore(candidate: CandidateProfile, job: JobPost, matchedPosts: Post[]): number {
  let score = 0;

  // Most relevant post
  const primaryPost = matchedPosts[0];

  // 1. Level Proximity (Reward exact level match)
  if (candidate.level === primaryPost.minQualificationLevel) {
    score += 40;
  } else if (candidate.level > (primaryPost.minQualificationLevel ?? 0)) {
    score += 20; // Over-qualified
  }

  // 2. Branch Relevance (Reward specific branch)
  if (candidate.branch.toLowerCase() !== 'any') {
    const hasSpecificMatch = primaryPost.qualification.some(q => 
      q.branches.map(b => b.toLowerCase()).includes(candidate.branch.toLowerCase())
    );
    if (hasSpecificMatch) score += 35;
  }

  // 3. Urgency Signal (Deadline proximity)
  if (job.importantDates?.lastDate) {
    const lastDate = new Date(job.importantDates.lastDate);
    const diffDays = Math.ceil((lastDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7 && diffDays >= 0) score += 15;
    else if (diffDays <= 30 && diffDays >= 0) score += 10;
  }

  // 4. Volume (Number of matched posts)
  score += Math.min(matchedPosts.length * 5, 20);

  return score;
}
