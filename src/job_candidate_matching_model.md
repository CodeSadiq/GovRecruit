# Job–Candidate Matching Model
## How to Match a Candidate Profile to Relevant Government Job Postings

---

## 1. What We Have

### Candidate Profile (output of the Qualification Form)

```json
{
  "qualification": "M.Sc",
  "level": 5,
  "branch": "Environmental Science"
}
```

Three fields only:
- `qualification` — the canonical degree name (e.g. "M.Sc", "B.Com", "Diploma", "12th")
- `level` — integer 1–6 representing education depth
- `branch` — the subject/specialisation (e.g. "Civil", "Zoology", "Law", "any")

---

### Job Posting Schema (relevant parts for matching)

Each job post contains:

```json
{
  "totalVacancy": 115,
  "posts": [
    {
      "name": "Scientific Assistant",
      "totalVacancy": 10,
      "minQualificationLevel": 5,
      "qualification": [
        {
          "name": "Post Graduate",
          "level": 5,
          "branches": ["Zoology", "Botany", "Chemistry", "Biochemistry", "Environmental Science"],
          "extraConditions": ["minimum 2 years experience required"]
        }
      ]
    },
    {
      "name": "Monitoring Assistant",
      "totalVacancy": 35,
      "minQualificationLevel": 2,
      "qualification": [
        {
          "name": "12th",
          "level": 2,
          "branches": ["any"],
          "extraConditions": []
        }
      ]
    }
  ],
  "ageLimit": { "min": 21, "max": 40, "asOnDate": "2026-07-01" },
  "categoryEligibility": ["General", "OBC", "SC", "ST", "EWS", "PWD"],
  "importantDates": { "lastDate": "2026-04-22" }
}
```

---

## 2. The Core Matching Logic

Matching happens at two levels: **Job Level** and **Post Level** (within a job).

A candidate is shown a job if they are eligible for **at least one post** inside it.

---

### Step 1 — Level Gate (Hard Filter)

This is the most important rule. It eliminates irrelevant jobs instantly.

**Rule:** A candidate's `level` must be **greater than or equal to** the post's `minQualificationLevel`.

```
MATCH if:  candidate.level  >=  post.minQualificationLevel
```

**Why this works:** Our qualification levels are a hierarchy. A Level 5 (M.Sc) candidate automatically satisfies jobs that require Level 2 (12th), Level 3 (Diploma), Level 4 (Graduate), or Level 5 (Post Graduate). They are over-qualified — and that is allowed.

**Example:**
```
Candidate level: 5 (M.Sc)

Post A: minQualificationLevel = 5  →  5 >= 5  ✅ PASS
Post B: minQualificationLevel = 2  →  5 >= 2  ✅ PASS
Post C: minQualificationLevel = 6  →  5 >= 6  ❌ FAIL
```

---

### Step 2 — Branch Match (Second Filter)

Once a post passes the level gate, check if the candidate's branch is accepted.

For each `qualification` object inside `post.qualification[]`:

```
BRANCH MATCH if ANY of the following is true:
  (a) post qualification branches includes "any"
  (b) candidate.branch === "any"
  (c) candidate.branch is found inside post qualification's branches[]
```

**Rule (a)** — Job accepts any branch. Candidate always passes regardless of their branch.

**Rule (b)** — Candidate selected "any" (e.g. chose "Graduate – Any Degree"). They pass for all jobs at that level.

**Rule (c)** — Exact match. Candidate's specific branch appears in the job's accepted list.

**Example:**
```
Candidate branch: "Environmental Science"

Post qual branches: ["Zoology", "Botany", "Chemistry", "Environmental Science"]
→ "Environmental Science" found in list  ✅ BRANCH MATCH

Post qual branches: ["any"]
→ Rule (a) applies  ✅ BRANCH MATCH

Post qual branches: ["Civil", "Mechanical", "Electrical"]
→ No match, "any" not present  ❌ NO MATCH
```

---

### Step 3 — Qualification Name Upgrade Rule

A candidate with a **higher-level degree** satisfies a **lower-level degree requirement** even if the names don't match — as long as the levels pass and branches match.

This is automatically handled by Step 1 (level >= check). You do NOT need to compare degree names like "M.Sc" vs "Graduate" — the level number does all the work.

**Example:**
```
Candidate: { qualification: "M.Sc", level: 5, branch: "Chemistry" }
Post requires: { name: "Graduate", level: 4, branches: ["any"] }

Level check:  5 >= 4  ✅
Branch check: job branches = ["any"]  ✅

→ ELIGIBLE. An M.Sc candidate satisfies a Graduate-level requirement.
```

---

### Step 4 — Application Deadline Filter (Optional but Important)

Exclude jobs where the last date has already passed.

```
INCLUDE if:  importantDates.lastDate  >=  today's date
             OR importantDates.lastDate is null (not yet announced)
```

---

## 3. Full Matching Algorithm (Pseudocode)

```
function getEligibleJobs(candidate, allJobs):

  eligibleJobs = []

  for each job in allJobs:

    // Skip expired jobs
    if job.importantDates.lastDate is not null:
      if job.importantDates.lastDate < today:
        continue

    eligiblePosts = []

    for each post in job.posts:

      // STEP 1 — Level Gate
      if candidate.level < post.minQualificationLevel:
        continue  // skip this post

      // STEP 2 — Branch Match
      branchMatched = false

      for each qual in post.qualification[]:

        // Level must still match this specific qual object
        if candidate.level < qual.level:
          continue

        // Branch check
        if "any" in qual.branches:
          branchMatched = true
          break

        if candidate.branch == "any":
          branchMatched = true
          break

        if candidate.branch in qual.branches:
          branchMatched = true
          break

      if branchMatched:
        eligiblePosts.append(post)

    // Candidate is eligible for the whole job if 1+ posts match
    if eligiblePosts is not empty:
      eligibleJobs.append({
        job: job,
        matchedPosts: eligiblePosts
      })

  return eligibleJobs
```

---

## 4. Worked Examples

### Example A — M.Sc Environmental Science candidate vs UPCB Job

```
Candidate: { qualification: "M.Sc", level: 5, branch: "Environmental Science" }

Post 1: Scientific Assistant
  minQualificationLevel: 5
  branches: ["Zoology", "Botany", "Chemistry", "Biochemistry", "Environmental Science"]
  
  Level: 5 >= 5 ✅
  Branch: "Environmental Science" found in list ✅
  → ELIGIBLE ✅

Post 2: Monitoring Assistant
  minQualificationLevel: 2
  branches: ["any"]
  
  Level: 5 >= 2 ✅
  Branch: job accepts "any" ✅
  → ELIGIBLE ✅

Post 3: Junior Engineer
  minQualificationLevel: 3
  branches: ["Civil", "Chemical", "Environmental Engineering", "Public Health Engineering"]
  
  Level: 5 >= 3 ✅
  Branch: "Environmental Science" NOT in ["Civil", "Chemical", "Environmental Engineering", ...]
  "any" also NOT in branches[]
  → NOT ELIGIBLE ❌

Result: Candidate is shown the UPCB job with 2 eligible posts highlighted.
```

---

### Example B — Diploma Civil Engineering candidate

```
Candidate: { qualification: "Diploma", level: 3, branch: "Civil" }

Post 1: Scientific Assistant
  minQualificationLevel: 5
  Level: 3 >= 5 → FALSE ❌ — ELIMINATED immediately

Post 2: Monitoring Assistant
  minQualificationLevel: 2, branches: ["any"]
  Level: 3 >= 2 ✅
  Branch: job accepts "any" ✅
  → ELIGIBLE ✅

Post 3: Junior Engineer
  minQualificationLevel: 3
  branches: ["Civil", "Chemical", "Environmental Engineering", "Public Health Engineering"]
  Level: 3 >= 3 ✅
  Branch: "Civil" found in list ✅
  → ELIGIBLE ✅

Result: Candidate is shown the job with Junior Engineer and Monitoring Assistant posts.
```

---

### Example C — 12th Science candidate

```
Candidate: { qualification: "12th", level: 2, branch: "Science (PCM)" }

Post 1: Scientific Assistant → minQualificationLevel: 5 → 2 >= 5 ❌
Post 2: Accountant          → minQualificationLevel: 4 → 2 >= 4 ❌
Post 3: Law Assistant       → minQualificationLevel: 4 → 2 >= 4 ❌
Post 4: Laboratory Assistant → minQualificationLevel: 2, branches: ["any"]
  → 2 >= 2 ✅, branches = ["any"] ✅ → ELIGIBLE ✅
Post 5: Monitoring Assistant → minQualificationLevel: 2, branches: ["any"]
  → 2 >= 2 ✅, branches = ["any"] ✅ → ELIGIBLE ✅

Result: Candidate sees UPCB job with only Laboratory Assistant and Monitoring Assistant.
```

---

## 5. Edge Cases to Handle

| Situation | How to Handle |
|---|---|
| Candidate branch is "any" | They pass all branch checks — show all jobs at their level and below |
| Job qualification branches is ["any"] | Any candidate branch passes for that post |
| Multiple qualification objects in one post (OR condition) | Candidate needs to match ANY ONE of them — loop through all, stop at first match |
| Post has no `minQualificationLevel` (null) | Fall back: use the lowest `level` found among that post's `qualification[]` objects |
| `extraConditions` (e.g. "minimum 1 years experience required") | Do NOT hard-filter on these — show the job but surface the condition as a **soft warning** to the candidate |
| Job has no `posts[]` (only root qualification) | Treat the root `qualification[]` + `totalVacancy` as a single unnamed post |
| Candidate is PhD (level 6) | Eligible for all level 1–6 jobs — but only show level 5–6 jobs by default to avoid irrelevant listings; show lower levels only on request |

---

## 6. Scoring / Ranking (Optional — for sorted results)

After filtering, rank eligible jobs by relevance so the best matches appear first.

```
matchScore = 0

// Reward exact level match (not over/under-qualified)
if candidate.level == post.minQualificationLevel:
  matchScore += 40
else if candidate.level > post.minQualificationLevel:
  matchScore += 20  // over-qualified, slight penalty

// Reward exact branch match (not "any")
if candidate.branch != "any" AND candidate.branch found in post.branches:
  matchScore += 35

// Reward if branch is "any" on job side — broad opportunity
if "any" in post.branches:
  matchScore += 10

// Reward proximity of application deadline (urgency signal)
daysLeft = (lastDate - today).days
if daysLeft <= 7:   matchScore += 15  // urgent
if daysLeft <= 30:  matchScore += 10

// Reward number of matched posts within the job
matchScore += (matchedPosts.count * 5)
```

Sort results by `matchScore` descending.

---

## 7. Summary Table

| Check | Field Compared | Pass Condition |
|---|---|---|
| Level Gate | `candidate.level` vs `post.minQualificationLevel` | `candidate.level >= post.minQualificationLevel` |
| Branch Match | `candidate.branch` vs `qual.branches[]` | branch found OR either side is "any" |
| Deadline | `today` vs `importantDates.lastDate` | `lastDate >= today` OR `lastDate == null` |
| extraConditions | — | Soft warning only, never hard filter |

---

## 8. What to Tell the AI (Prompt Template)

When teaching another AI to perform matching, give it this instruction:

```
You are a job matching engine for Indian government recruitment.

A candidate has this profile:
  qualification: "<degree name>"
  level: <1–6>
  branch: "<branch name or 'any'>"

A job posting has this structure (simplified):
  posts[]: list of posts, each with:
    minQualificationLevel: <integer>
    qualification[]: list of { name, level, branches[], extraConditions[] }

MATCHING RULES:
1. For each post, check: candidate.level >= post.minQualificationLevel
   If false → skip this post entirely.

2. If level passes, loop through post.qualification[]:
   For each qual object:
     - If "any" is in qual.branches → MATCH
     - If candidate.branch == "any" → MATCH
     - If candidate.branch is in qual.branches → MATCH
   If any qual object matches → post is eligible.

3. If at least one post is eligible → include the job in results.
   Show ONLY the eligible posts, not all posts.

4. For extraConditions (experience, percentage, registration):
   Do NOT reject the candidate. Show a ⚠️ warning beside the post.

5. Filter out jobs where importantDates.lastDate < today.

Return: list of eligible jobs, each with the list of matched posts and any warnings.
```

---

*This document covers the complete matching logic between the candidate qualification form output and the job extraction schema. Both schemas use the same canonical level (1–6) and branch vocabulary, which makes matching precise and unambiguous.*
