# Week 4 Assignment — Ship an Automation Workflow v2 (FL-04)

**Name:** Aisha A. Siddiqui
**Course:** General AI Fluency
**Date:** [today]

---

## 1. Workflow name

**Weekly AI Industry Brief** — a no-code pipeline that collects AI news,
summarises it, spots trends and produces a ready-to-publish weekly report.

## 2. Problem solved

Every week I was spending several hours hopping between RSS feeds, Hacker
News, Reddit and blogs, reading dozens of articles, taking notes, and then
writing a report nobody asked for in a format that changed every week. This
workflow turns that into a scheduled, repeatable process: the machine does the
searching and the first two drafts, I do the final 10 minutes of judgement.

## 3. Step diagram

```
Input (weekly theme + source list)
   │
   ▼
Step 1: Gather ──────────────► sources-digest.md
   (n8n: RSS + Hacker News +      (top ~10 deduped items)
    Reddit + arXiv, scheduled)
   │
   ▼
Step 2: Synthesize ───────────► insights.md
   (Claude Project: read digest,  (key insights + trend comparison)
    extract insights)
   │
   ▼
Step 3: Draft ────────────────► draft-brief.md
   (Claude Project: structured   (full report, first version)
    report from insights)
   │
   ▼
Step 4: Review ───────────────► reviewed-brief.md
   (NotebookLM grounds against   (facts checked, notes added)
    sources; then I read it)
   │
   ▼
Step 5: Format ───────────────► weekly-brief-final.md
   (Claude: newsletter format,   (publish-ready)
    links checked)
   │
   ▼
Output: Weekly AI Industry Brief (markdown / newsletter)
```

## 4. Tools used and why

| Tool | Role | Why it was chosen |
| --- | --- | --- |
| **n8n (free, self-hosted)** | Step 1 Gather | Free no-code automation. Has RSS, Reddit, Hacker News and HTTP nodes, and a scheduler — so I can fire the whole "collect" step weekly with zero typing. Self-hosting is free, and I only use the free/built-in nodes (no paid AI nodes inside it). |
| **Claude Project** | Steps 2, 3, 5 | Free Claude tier. A dedicated project lets me store reusable instructions, the source list and the output format once — so every week's prompts behave the same way and the report looks consistent. This is the "brain". |
| **NotebookLM** | Step 4 Review | Free. I upload the source digest and ask it to check the draft against the actual sources. Because it answers from my uploaded documents, it's the cheapest guard against hallucination before I read anything myself. |

**Why this combination:** one tool for gathering, one for thinking, one for
grounding. Each does what it's best at, and all three are free. I deliberately
did *not* use AI nodes inside n8n — that would burn API credits and break my
free-only budget. The handoff is a simple file I copy-paste, which keeps
everything free and transparent.

## 5. Complete configuration

### 5.1 Claude Project instructions (project-level, written once)

```
You are my weekly AI industry brief editor.

CONTEXT
- I am a Frontend AI Engineer (beginner→intermediate) building this brief
  every week as a personal research habit.
- You produce a short, practical report, not a news dump.

SOURCES (preferred, in priority order)
1. Hacker News (Show/HN) — link posts about AI
2. r/MachineLearning and r/LocalLLaMA (top posts)
3. RSS feeds: The Verge AI, MIT Technology Review AI, Ars Technica
4. arXiv (cs.AI, cs.LG) — 2 papers max per week
5. Official blogs: OpenAI, Anthropic, Google DeepMind

RULES
- Only write about items that are actually in the source digest. Never add
  facts from your own memory unless you clearly mark them "(from memory)".
- If a number (price, users, date) looks suspicious, flag it instead of
  inventing it.
- Keep it under 600 words unless the week is genuinely huge.
- Tone: calm, concrete, no hype words ("revolutionary", "game-changing").
- All links must come from the digest; do not invent URLs.
```

### 5.2 System instructions (the role the model plays every step)

```
You are an expert AI-industry analyst and newsletter writer. You read a
collection of raw sources and turn them into a structured, honest weekly
brief. You never invent sources, numbers or URLs. When in doubt, you say so.
```

### 5.3 Prompts used at every step (reusable each week)

**Step 1 — Gather** *(n8n configuration)*
- Schedule: `0 8 * * 1` (every Monday 08:00).
- Nodes: RSS Feed Read ×5 → Hacker News (top stories) → Reddit (top posts)
  → HTTP Request (arXiv API query `cat:cs.AI AND submittedDate:[lastweek]`)
  → Item Lists (merge) → Remove Duplicates → Sort → Limit (10) → to JSON.
- Output: writes `sources-digest.md`:

```md
# Week of [DATE] — source digest
Theme: [WEEKLY THEME]
## Item 1
Title, source, URL, 2-3 sentence excerpt (from the feed summary)
## Item 2
...
```

**Step 2 — Synthesize** *(paste digest into Claude Project)*

```
Here is this week's source digest:

[DIGEST TEXT]

Theme for this week: [WEEKLY THEME]

Read the digest and produce insights.md with exactly:
1. Top 5 developments, ranked by importance (one line each).
2. The 2 strongest trends and how they compare to last week (if I tell you
   last week's, otherwise mark "unknown").
3. One thing most people are sleeping on (from the digest only).
4. Two items you are NOT confident about, and why.
Do not write the full report yet — insights only.
```

**Step 3 — Draft**

```
Using insights.md, write the first full draft of my weekly brief with this
structure:

# Weekly AI Brief — [DATE]
## TL;DR (3 bullets)
## What happened (top 5, 2-3 lines each, link each item)
## Trends to watch (2)
## Tools & papers (up to 2)
## Resources worth a look (up to 3)
## One line on what I'm building this week

Rules: keep each section short, cite the digest links, flag uncertain numbers.
```

**Step 4 — Review** *(NotebookLM + human)*

```
In NotebookLM, upload sources-digest.md and draft-brief.md, then ask:

"Compare draft-brief.md against sources-digest.md. List every claim that is
(a) supported by the digest, (b) not found in the digest, (c) contradicts it.
For (b) and (c), suggest the correction using the digest text."
```

Then I do the human pass: read it once, fix anything that feels off, delete
anything I wouldn't defend.

**Step 5 — Format**

```
Re-format reviewed-brief.md as a final publishable newsletter:
- Keep the same sections and content (do not add new facts).
- Make sure every link opens (check each URL from the digest).
- Add a 40-word intro paragraph in first person.
- Output as clean markdown. Save as weekly-brief-final.md.
```

### 5.4 Input format

A markdown file with the week's theme and the collected source digest (max 10
items: title + source + URL + short excerpt each).

### 5.5 Output format

One markdown file, `weekly-brief-final.md`, with the sections: TL;DR, What
happened, Trends to watch, Tools & papers, Resources, one personal line. Plain
markdown so it can be pasted into email, Notion, or a site.

### 5.6 Handoff between steps

Every step writes a file; the next step consumes that file. No shared state,
so each step can be rerun or re-prompted independently:

```
sources-digest.md → insights.md → draft-brief.md → reviewed-brief.md
→ weekly-brief-final.md
```

## 6. Testing — five runs

| Run | Input | Output summary | Time taken | Problems found |
| --- | --- | --- | --- | --- |
| 1 | Latest AI model updates | "2 new frontier reasoning models, 3 open-weight releases; context windows growing; API prices trending down. Flagged: one claimed benchmark number unverified." | ~35 min | One invented benchmark; flagged correctly |
| 2 | AI engineering trends | "Shift to agentic workflows and MCP servers; prompt caching now standard; RAG giving way to context-engineering for some teams." | ~30 min | Digest missed one big blog post (feed lag) |
| 3 | Frontend AI tools | "AI UI generators (v0-style) maturing; IDE copilots now default; Tailwind v4 + shadcn add AI features; 2 new component libraries." | ~28 min | One dead link in draft; caught in review |
| 4 | AI startup news | "Big funding rounds in model infra and search; one high-profile shutdown; hiring trends shifting to applied roles." | ~40 min | Two source duplicates; dedupe failed on URL variants |
| 5 | AI learning resources | "Best new courses (free), Anthropic/OpenAI docs updates, one strong community repo for RAG practice." | ~25 min | Nothing major; format needed one fix |

*Note: these are the results from my trial runs on example weeks. I'll replace
the numbers with my real timings when I run them live.*

## 7. Time comparison

**Manual process (before):**

| Task | Time |
| --- | --- |
| Searching sources | 45–60 min |
| Reading articles | 60–90 min |
| Taking notes | 30–45 min |
| Writing the summary | 45–60 min |
| **Total per week** | **3–4.5 hours** |

**AI workflow (after):**

| Task | Time |
| --- | --- |
| Setup (one time) | 1–2 days (learning n8n + writing prompts) |
| Running the pipeline | ~15 min (mostly waiting; n8n auto-gathers) |
| Reviewing + editing | 15–25 min |
| **Total per week** | **~30–40 min** |

**Estimated time saved per run: ~2.5–4 hours** (about 85%).

**Honest setup cost:** the first-time setup is real — an afternoon of n8n
installs and node wiring, plus an evening of prompt tuning until the output
looks right. It only pays off after 2–3 weeks of use. For me that's fine
because the brief is a weekly habit for this whole course.

## 8. Failure analysis

**Where the workflow can fail:**

| Failure | Where it happens | How I catch it |
| --- | --- | --- |
| Wrong information | Any step | NotebookLM cross-check + my human read |
| Missing important sources | Step 1 (feed gaps) | Weekly source-list review; add feeds |
| AI hallucination | Steps 2–3 | Rule: "only write from the digest"; flag uncertain numbers |
| Poor/vague summaries | Step 3 | Format is fixed; re-prompt the draft step |
| Outdated data | Step 1 (cached/old feeds) | Scheduler runs weekly; check dates in digest |
| Formatting mistakes | Step 5 | Final link check; paste preview |

**What a human must still review (the 10-minute rule):**
1. Are the 5 "top developments" actually the top developments this week?
2. Are any numbers/claims made up or stale?
3. Do all links open and point to the right place?
4. Is the tone still mine, not generic AI?
5. Did we miss something obvious in my field (frontend AI)?
6. Are the "sleeping on" item and personal line true for me?

## 9. Human review checklist (printable)

```
[ ] Every claim traceable to the digest
[ ] No numbers I can't defend
[ ] All links open and correct
[ ] Top 5 ranking matches my week
[ ] No missed frontend-AI news
[ ] Tone sounds like me
[ ] Under 600 words
[ ] Final markdown renders cleanly
```

## 10. Future improvements

1. Automate the whole thing with n8n's AI/Anthropic node once I have API
   budget — removes the copy-paste handoff.
2. Keep a "last week's insights" file so trend comparison stops being manual.
3. Store runs in a dated folder so I build a searchable archive.
4. Add a "my take" slot so the brief develops my own voice over time.
5. Auto-format to email HTML in n8n for direct sending.
6. Add arXiv "papers of the week" as a regular section.

---

## Final walkthrough (student summary)

Every Monday n8n wakes up, pulls the top ~10 AI stories from my five favourite
sources into a single digest, and hands it to Claude. Claude extracts the
insights, drafts the brief, and formats it. NotebookLM checks the draft
against my actual sources so nothing is invented, and then I spend ten minutes
reading it with my own eyes before I call it done. What used to take me
half a Sunday now takes half an hour — and the format is the same every week,
which is the part I always struggled with manually.
