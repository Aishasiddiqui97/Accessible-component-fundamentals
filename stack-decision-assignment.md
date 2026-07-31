# Week 4 Assignment — Three Roads: Choose Your Stack with AI

**Name:** Aisha A. Siddiqui
**Role:** Frontend AI Engineer (beginner → intermediate)
**Date:** [today]

---

## Part 1 — The three stack options

### Option 1 — Simplest: Hand-coded static site (HTML + CSS + JS)

| Question | Answer |
| --- | --- |
| **Stack name** | Plain HTML5, CSS, vanilla JavaScript — no framework, no build step. |
| **How I would build it** | Write `index.html`, `styles.css` and `script.js` by hand (or from a clean template). One page per section, or a single-page scroll site. Add images and links directly in HTML. Push to git and done. |
| **Free hosting** | GitHub Pages (free, unlimited public sites), Cloudflare Pages free, Netlify free. All of them just serve static files. |
| **Backend needed?** | No. Nothing. It's files on a server. |
| **Maintenance** | Near zero. Edit a file, redeploy. No dependencies to break, nothing to upgrade. |
| **Advantages** | Truly free and permanent; instant to set up; loads extremely fast; I already know all the tools; zero tooling. |
| **Limitations** | Every page is hand-written and repeated (nav, footer, cards copy-pasted). Image galleries, case studies and project cards are all manual HTML. No component reuse, no type safety. "Dynamic projects" = more copy-paste. |
| **Real trade-offs** | Simple now, but it's a dead end: the moment I want a blog, a CMS, an AI chatbot or a dynamic projects section, I rebuild the whole site in a framework. I'd save ~2 days now and spend ~2 weeks later. |

---

### Option 2 — Balanced: Next.js portfolio (RECOMMENDED)

| Question | Answer |
| --- | --- |
| **Stack name** | Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4, deployed on Vercel. |
| **How I would build it** | Reuse my existing `coming-soon` repo (already on exactly this stack). Build pages: Home, About, Projects, Case Studies (markdown), Contact. Use React components for repeated pieces (cards, nav, gallery). Pages are static, so it's fast and free. Live demos embed via `<iframe>`. Later, the AI chatbot becomes an API route in the same project. |
| **Free hosting** | Vercel Hobby (free, native Next.js), also works on Netlify free and Cloudflare Pages free. |
| **Backend needed?** | No. The portfolio itself is static/SSG — no database, no server. Vercel Functions exist for later (AI chat, contact form) without changing hosting. |
| **Maintenance** | Moderate but easy: one `npm run build` to verify, and `git push` = auto-redeploy. Occasional dependency upgrades (Next/React). No server to babysit. |
| **Advantages** | This is the stack I already know and have shipped with (streaming AI chat + this site). Components kill the repetition problem. Case studies = markdown files, which are clean and long-form friendly. Galleries/screenshots via Next Image. Growth path is wide open: blog, CMS, chatbot, API routes all fit in the same project and host. Already live on Vercel. |
| **Limitations** | Has a build step and package management (npm). Vercel free tier caps bandwidth (~100 GB/mo) and serverless function duration — fine for a portfolio, relevant if the site goes viral. I must keep dependencies working. |
| **Real trade-offs** | A bit more moving parts than Option 1, but far more professional results per hour of work, and it grows instead of dying. The main cost is learning modern React patterns — which I already want. |

---

### Option 3 — Most powerful: Full-stack app (Next.js + database + auth + CMS)

| Question | Answer |
| --- | --- |
| **Stack name** | Next.js + React + TypeScript + Tailwind, with PostgreSQL (Supabase or Neon), an ORM (Prisma/Drizzle), authentication (Clerk or Auth.js) and a CMS (Sanity). |
| **How I would build it** | Same Next.js base, then add a database schema (users, projects, posts), auth flow, a CMS for writing blog posts, storage for uploads, and API routes. Content becomes dynamic (loaded from the DB), with an admin panel to manage it. |
| **Free hosting** | Vercel free (app), Supabase free (500 MB DB, but pauses after 1 week of inactivity), Neon free (0.5 GB), Sanity free, Clerk free tier. Each free tier has its own limits. |
| **Backend needed?** | Yes — this is the point. Database, ORM, auth, storage, API. |
| **Maintenance** | High. I'd maintain: DB schema + migrations, 2–3 dashboards (Supabase/Neon, Sanity, Clerk), auth config, storage buckets, environment variables, and staying under each service's free limits. |
| **Advantages** | Maximum capability: logins, admin panel, dynamic content, comments, blog, AI chat with memory, anything. Looks the most "real product" on a resume. |
| **Limitations** | Huge scope for a beginner. Multiple services to learn and babysit. Free tiers are restrictive (Supabase pauses inactive DBs; some services rate-limit). Every feature touches the database, so every bug is a stack bug. |
| **Real trade-offs** | It's the most impressive and the most fragile. The honest math: a lot of my 2-week budget would go into infrastructure plumbing, not into showing my work. Building a database I don't need yet is unpaid maintenance. |

---

## Part 2 — Pressure test on the recommended stack (Option 2)

**1. What breaks if I choose the simplest option?**
The portfolio's display needs — galleries, long-form case studies, live/embedded demos, a dynamic projects section — all become manual HTML copy-paste, and there's no component system to reuse. Worse, the future items (AI chatbot, blog, CMS) would force a full rebuild in a framework. I'd be throwing away Option 1 the day I outgrow it. My time is better spent learning the framework now than rebuilding later.

**2. What extra things do I maintain with the most powerful option?**
A database schema and migrations, 2–3 service dashboards, auth flows (login/redirects/tokens), a CMS content model, storage buckets, and environment variables — plus staying inside each free tier's limits (e.g. Supabase pausing an idle DB). That's roughly 4–6 separate things to monitor, versus Option 2's single git-push pipeline.

**3. Can I realistically finish in two weeks?**
Yes — with Option 2, because it's the stack I already shipped twice (chat app + coming-soon site), and the Vercel pipeline already exists. Most portfolio pages are static, so progress is fast. Option 3 in two weeks at my level would mean a polished login screen and a half-empty site — bad trade.

**4. Does the chosen stack display my work properly?**
Yes. Next Image handles screenshots and galleries; responsive Tailwind layouts look good on phone and desktop; case studies are markdown pages (great for long-form reading); live demos embed via iframe; GitHub links are plain anchors. Later, serverless functions let me embed a working AI chat demo on the same free host.

**5. Can I maintain this stack myself?**
Yes. It's one dependency set I already manage, one build command to verify, one git push to ship. No server, no database, no uptime worries. When I add features, they fit the existing pattern rather than fighting it.

---

## Part 3 — My rationale (assignment submission)

I had to choose the stack for my portfolio, and this time I didn't want AI to just pick for me. I wanted to actually understand the roads, compare them, and decide myself.

I compared three options.

Option 1 was the simplest: plain HTML, CSS and JavaScript on GitHub Pages. Nothing to install, free forever, and I know it cold. But when I listed what my portfolio really needs — screenshots, image galleries, live demos, embedded demos, long-form case studies — I realised all of it would be manual copy-paste. Every new project means more repeated HTML. And the future features I want (an AI chatbot, a blog, a CMS, a dynamic projects section) would basically mean rebuilding the whole site. It's simple today, but it doesn't grow.

Option 3 was the most powerful: Next.js with a real database, an ORM, authentication and a CMS. It can do everything — logins, an admin panel, dynamic content, a chat with memory. But that means maintaining a database schema and migrations, watching two or three service dashboards, keeping auth working, and staying inside the free limits of several services. Supabase even pauses your database after a week of inactivity on the free plan. For my level, in two weeks, that's a lot of infrastructure to babysit — and most of it is for features I don't need yet.

I chose Option 2: Next.js with React, TypeScript and Tailwind, hosted on Vercel's free tier.

The reason is honest: I already know this stack. I built my streaming AI chat on it, and the "coming soon" site I'm shipping this week is on it too, already live on Vercel. So I'm not starting from zero — I have a head start and a working deploy pipeline. The portfolio pages are mostly static, so there's no database and no server to manage. It still shows my work the way I want: galleries, responsive layouts, markdown case studies, embedded live demos, and links to my GitHub repos. And when I'm ready for the AI chatbot or a blog, I can add them in the same project without switching hosts.

Do I need a backend? Honestly, not yet. My portfolio is about presenting my work, and nothing on it stores user data right now. Adding a database today would mean maintaining infrastructure I'm not using — that's just extra work. I'll add it when I actually build the chat or blog features that need it.

Can I finish this in two weeks? Yes, because the stack is the one I've already shipped with. Can I maintain it? Yes — one git push and Vercel rebuilds, done.

So my choice is the middle road: not the easiest, not the biggest, but the one I understand, the one that shows my work properly, and the one I can actually keep running.
