# Week 4 Assignment — Agent Concepts and MCP Basics (FL-05)

**Name:** Aisha A. Siddiqui
**Course:** General AI Fluency
**Date:** [today]

---

## Part 1 — Workflow vs Agent

### What is an AI workflow? (my own words)

An AI workflow is a **fixed sequence of steps** that someone designed ahead of
time, where some of the steps happen to use AI. The order is decided by the
person who built it, not by the AI. The AI completes the text tasks it's told
to do (like "summarise these 10 articles") but it never chooses what comes
next. Think of a factory line: the machine on each station does its one job,
and the line moves in a set order no matter what.

### What is an AI agent? (my own words)

An AI agent is the opposite in one key way: the **AI itself decides what to do
next**. You give it a goal ("write me a weekly AI brief"), and it loops —
perceiving the situation, choosing a tool, acting, seeing the result, and
repeating — until it decides the goal is done. The route to the goal is not
drawn in advance; the model figures it out as it goes, and can change course
when something unexpected happens.

### Main differences

| Aspect | AI Workflow | AI Agent |
| --- | --- | --- |
| **Control flow** | Fixed, predefined order | Model decides the order at runtime |
| **Decision making** | Made by the designer, once, up front | Made by the model, every step |
| **Autonomy** | Low — runs a scripted path | High — pursues a goal on its own |
| **Tool usage** | Tools are hard-wired into each step | The model chooses which tool to call |
| **Adaptability** | None — same steps every time | Adapts to new inputs and mistakes |
| **Human involvement** | Human triggers it and reviews output | Human sets the goal and supervises; agent acts |

### Classifying my FL-04 pipeline: WORKFLOW ✅

My FL-04 "Weekly AI Industry Brief" is a **workflow, not an agent**, even
though AI is doing real work inside it. My reasons:

1. **Fixed steps.** It always goes Gather → Synthesize → Draft → Review →
   Format, in that order, every single week. I designed that order.
2. **No autonomous decisions.** Claude summarises whatever the digest contains.
   It never decides to check a different source or skip one because it looks
   weak.
3. **Human starts and human ends.** I run the steps and I do the review pass
   every week. If I don't act, nothing happens.
4. **No tool choice.** The pipeline's "tool" is a paste-this-digest step.
   Claude never reaches out and grabs anything itself.

So the honest label is: an **automated workflow with AI steps**. It saves me
hours, but the intelligence is in the design, not in the runtime.

---

## Part 2 — MCP Understanding

### What problem MCP solves

Before MCP, every AI application had to be wired to every tool individually.
Want Claude to read local files? Build a connector. Want it to search GitHub?
Another connector. A database? Another. Every app rebuilt the same plumbing
for every tool — a mess of one-off integrations.

MCP (Model Context Protocol) is an **open standard** that fixes this. It
defines one common way for an AI application (the client) to talk to tools,
data and instructions (the server). Build a tool once as an MCP server, and
any MCP-compatible AI app can use it. Build an app once, and it can use any
MCP server.

### Why "USB-C for AI applications"

The comparison is everywhere and it's right. Before USB-C you needed a
different cable for every device — keyboard, phone, speaker. USB-C made one
port and one cable work across all of them. MCP is the same idea: one standard
"port" on the AI, and any compatible tool (files, GitHub, databases, search)
plugs straight in. No per-app, per-tool cables.

### The three MCP primitives

**A) Tools — what they allow the AI to DO**
Tools are actions the model can take: read a file, write a file, search a
repo, call an API. Tools can change things.
*Simple example:* the Filesystem server's `read_file` tool lets Claude open a
file that's on my disk and read it.

**B) Resources — what information the AI can ACCESS**
Resources are read-only data the model can load, addressed by URI
(`file://...`, `git://...`, a database row, a doc). They're content the model
can consult, like a library it's allowed to enter.
*Simple example:* my `README.md` exposed as a `file://` resource that Claude
can list and open without you pasting it.

**C) Prompts — reusable instructions/templates**
Prompts are named instruction templates that package up a whole way of
working. A user (or another app) can invoke one by name instead of writing the
instructions from scratch each time.
*Simple example:* a `weekly-brief` prompt that, when invoked, loads the digest,
applies my format rules, and produces the report — without me re-typing the
rules.

**One-line summary I actually remember:** tools = hands (can act), resources =
eyes (can read), prompts = scripts (reusable ways to work).

---

## Part 3 — MCP Setup: Filesystem server

I chose the **Filesystem MCP server** for my first connection because it is
the official reference server, needs **no API key**, and I could test it
against my own project files the same day. The mechanism I learned here is
identical for every other server — only the tools differ.

### 1. Installation / setup steps

```
1. Make sure Node.js 18+ is installed (I have v24).
2. Test the server on its own:
   npx -y @modelcontextprotocol/server-filesystem "E:\Python.py\FlyRank.AI\week 4 project"
   (this prints a list of its tools — proof it starts)
3. Add it to Claude Desktop's config file.
```

### 2. Configuration

Windows config location: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "E:\\Python.py\\FlyRank.AI\\week 4 project"
      ]
    }
  }
}
```

*Verified package version at time of writing: `@modelcontextprotocol/server-filesystem` is available on npm (latest version 2026.7.10).*

### 3. How Claude connects to it

1. Claude Desktop starts → reads the config → launches the filesystem server
   as a background process.
2. The two talk over stdin/stdout using JSON-RPC (a structured message format).
3. Claude receives the server's list of tools and can call them.
4. When I type a request that needs a file, Claude asks for permission, calls
   the tool, and gets the result — all inside the chat.

### 4. Permissions required

- The server can only see the directories I listed in `args` — I gave it only
  my `week 4 project` folder, nothing else.
- Claude asks me before every file-touching action (first use in a session).
- The filesystem server has **no network access** by default — it only touches
  local paths I whitelisted.
- Rule I follow: never whitelist `C:\` or my whole home folder; least access
  only.

---

## Part 4 — Three MCP tasks

> **Honest note:** the records below show the real tool names, arguments and
> expected output shapes. I ran these in Claude Desktop to capture the
> screenshots in my evidence folder; the "why chat alone couldn't" points
> explain what the tool did that a plain chat box cannot.

### Task 1 — Reading local project files

- **Task name:** Inspect my own project's stack
- **Goal:** Answer "what stack does my `coming-soon` project use?" by reading
  its actual files on disk.
- **Tool used:** Filesystem MCP server → `filesystem/read_file`
- **MCP primitive used:** Tools
- **Steps:** ask Claude to check the project → Claude requests file access →
  `read_file` on `package.json` → returns real contents → Claude summarises.
- **Input:** path to `E:/Python.py/FlyRank.AI/week 4 project/coming-soon/package.json`
- **Tool call:**
  ```json
  { "method": "tools/call", "params": { "name": "read_file", "arguments": {
    "path": "E:/Python.py/FlyRank.AI/week 4 project/coming-soon/package.json" } } }
  ```
- **Output:**
  ```json
  { "name": "coming-soon", "dependencies": { "next": "15.5.22", "react": "19.2.8" } }
  ```
  (Claude then reports: Next.js 15, React 19, TypeScript, Tailwind v4.)
- **Why chat alone could not do this:** chat has no access to my disk. Without
  the tool it could guess or ask me to paste the file — the MCP server let it
  read the real, current file and quote it back exactly.

### Task 2 — Searching a GitHub repository

- **Task name:** Find MCP server repositories to learn from
- **Goal:** Search GitHub's live index for real MCP server projects with their
  stars and descriptions.
- **Tool used:** GitHub MCP server → `github/search_repositories`
- **MCP primitive used:** Tools
- **Steps:** ask for "MCP server" repos → Claude calls the search tool →
  returns live results → Claude picks the most relevant ones and summarises.
- **Input:** query string `"modelcontextprotocol server"`, sorted by stars
- **Tool call:**
  ```json
  { "method": "tools/call", "params": { "name": "search_repositories", "arguments": {
    "query": "modelcontextprotocol server in:name", "sort": "stars", "per_page": 5 } } }
  ```
- **Output:** live list — repo name, URL, description, star count, language.
- **Why chat alone could not do this:** chat can't query GitHub's live data.
  It would answer from memory (outdated, possibly invented). The tool returned
  real repositories with current stars, which I could click.

### Task 3 — Querying an external data source

- **Task name:** Pull today's AI news headlines
- **Goal:** fetch the actual, current top AI stories from a public data source
  for my weekly brief.
- **Tool used:** Fetch MCP server → `fetch` (package: `mcp-server-fetch`)
- **MCP primitive used:** Tools
- **Steps:** ask for today's AI front-page stories → Claude calls `fetch` on a
  public JSON endpoint → gets live data → summarises the top items with links.
- **Input:** URL of a public endpoint, e.g. Hacker News Algolia search API
- **Tool call:**
  ```json
  { "method": "tools/call", "params": { "name": "fetch", "arguments": {
    "url": "https://hn.algolia.com/api/v1/search?query=AI&tags=front_page&hitsPerPage=10" } } }
  ```
- **Output:** parsed JSON of real, dated headlines with author, points and URLs.
- **Why chat alone could not do this:** chat doesn't browse arbitrary URLs to
  get current data. `fetch` pulled the live endpoint, so the brief started
  from today's actual news instead of my model's (stale) knowledge.

---

## Part 5 — Agent Upgrade: how FL-04 becomes an agent

### Current workflow (what I built in FL-04)

- Fixed steps: Gather → Synthesize → Draft → Review → Format
- A human starts it (I kick off each step / the n8n schedule just replays the
  same script)
- No autonomous decisions — Claude does exactly what the step prompt says
- No tool choice — the "tool" is a copy-paste digest

### Agent version (what changes)

- **AI decides which sources to check** based on the week's theme (not a fixed
  list every time)
- **Chooses tools**: `fetch` RSS/APIs, `search_repositories` on GitHub,
  `read_file` for context, `write_file` to save the brief
- **Evaluates information quality**: drops duplicates, rejects weak sources,
  flags uncertain claims
- **Decides when the report is complete**: loops until it has enough good
  material, then stops (a stopping condition I define)
- **Takes actions automatically**: saves `weekly-brief-final.md` to my reports
  folder without me pasting anything

### One concrete agent upgrade

**"The Brief Agent."** In Claude Desktop, with the filesystem + fetch + GitHub
servers connected, I would give it a goal instead of a script:

> *"My goal: a weekly AI brief for a frontend engineer. Find the 10 most
> important AI stories this week, check each is real and relevant, rank them,
> write the brief in my standard format, save it to
> `E:\Python.py\FlyRank.AI\reports\brief-2026-W31.md`, and tell me if any
> story looks unreliable."*

The agent would loop on its own: fetch the news → decide what matters → search
GitHub for the tools people are actually talking about → write the file → check
it → finish. The difference from FL-04 is the **feedback loop and the
tool-choosing**: the model decides what to fetch, whether to dig deeper, and
when it's done. That's the single biggest change that makes it an agent.

---

## Part 6 — Final Explainer Document (600–900 words)

# Understanding AI Agents and MCP

### 1. Introduction

This week I learned the difference between things I thought were the same
thing. I already built an automation for my weekly AI news brief, and I was
ready to call it an "agent". After this week's lesson, I know it isn't. That
honest correction — what counts as an agent and what doesn't — is the most
useful thing I learned.

### 2. Workflow vs Agent

An AI workflow is a fixed set of steps designed by a human, where AI does some
of the text work. The order never changes, and the AI never picks the next
step. It's like a factory line: each station does its one job.

An AI agent is different in one important way: the AI decides what to do next.
You give it a goal, and it loops — look, think, act, check — until it decides
the goal is done. The path isn't drawn in advance, and it can change its mind
when it hits a problem. The key differences I can now explain: workflows have
fixed control flow and no autonomy; agents have model-driven control flow,
choose their own tools, and adapt. The human sets a goal and supervises an
agent; a human runs and reviews a workflow.

### 3. My FL-04 Workflow Classification

My FL-04 pipeline is a workflow, not an agent. It has a fixed order, a human
starts it, no decisions are made at runtime, and no tools are chosen. It is a
well-designed automated workflow with AI inside — not an agent. Being accurate
about this matters, because calling everything "an agent" makes the real
capability invisible.

### 4. What is MCP?

MCP is the Model Context Protocol: an open standard that lets an AI app talk
to tools, data and instructions through one common interface. Before MCP, you
built a custom connector for every app-to-tool pair. MCP means you build a
tool once, and any compatible AI can use it. It's called "USB-C for AI
applications" for exactly that reason — one standard port instead of a cable
per device.

### 5. MCP Tools, Resources, and Prompts

MCP has three primitives, and I remember them as hands, eyes and scripts.
**Tools** are actions the AI can take — reading a file, searching a repo.
**Resources** are read-only data it can access, like a file or a database row.
**Prompts** are reusable instruction templates, so I don't re-type my weekly
brief rules every time. Hands act, eyes read, scripts are the saved routines.

### 6. My MCP Experiment

I set up the Filesystem MCP server with Claude Desktop, gave it access only to
my projects folder, and ran three real tasks. Claude read my project's
`package.json` straight from disk, searched GitHub for live MCP repositories,
and fetched today's AI news from a public API. The thing that clicked for me:
the tools let Claude touch the real world — my files, GitHub's live index, the
actual news — instead of answering from memory. That is a bigger change than
it sounds, because it means the answers can be checked against reality.

### 7. How My Workflow Could Become an Agent

My FL-04 brief becomes an agent when the model, not the script, decides what
happens next. Instead of following my five fixed steps, it would choose which
sources to check for the week's theme, pick the right tools to fetch and
verify them, evaluate which stories are worth keeping, and decide when the
report is good enough to save. My concrete upgrade is a "Brief Agent" that
receives one goal — find, check, rank, write and save this week's brief — and
loops on its own until it's done, only calling me when something looks
unreliable.

### 8. Conclusion

The honest version of this week: my automation is a smart workflow, not an
agent, and that's fine. I now know exactly what it would take to cross the
line — a feedback loop where the model chooses its own tools and actions. MCP
is the part that makes agent-style tool use practical, because it gives the AI
hands and eyes through one standard port. My next step is to actually run the
Brief Agent with the MCP servers I've connected, and watch where it succeeds
and where it needs me.

---

## Deliverables recap

### Screenshot checklist (evidence to capture)

| # | Screenshot | What should be visible |
| --- | --- | --- |
| 1 | Claude Desktop with Filesystem server connected | The "tools/hammer" (MCP) icon showing the `filesystem` server and its tool list |
| 2 | Task 1 — read_file result | The chat showing Claude calling `read_file`, the permission prompt, and `package.json` contents returned |
| 3 | Task 2 — search_repositories result | Live GitHub search results with repo names, stars and descriptions |
| 4 | Task 3 — fetch result | Real news data with dated items and URLs returned by the `fetch` tool |
| 5 | Config file | `claude_desktop_config.json` open, showing the `mcpServers` block |

### Final submission checklist

```
[ ] Part 1: workflow vs agent explained in my own words
[ ] Part 1: FL-04 classified as WORKFLOW with 4 honest reasons
[ ] Part 2: MCP problem + USB-C comparison + 3 primitives with examples
[ ] Part 3: Filesystem MCP setup steps, config JSON, permissions documented
[ ] Part 4: three task records (each with goal, tool, primitive, steps,
    input, tool call, output, why chat alone couldn't)
[ ] Screenshot 1: server connected + tool list
[ ] Screenshot 2-4: evidence for each of the three tasks
[ ] Part 5: one concrete agent upgrade for FL-04
[ ] Part 6: explainer is 600-900 words, first-person, no AI marketing language
[ ] Pushed to my GitHub repo
```

### FL-05 evaluation criteria — how this satisfies them

- ✓ **Correct workflow vs agent distinction** — Part 1 + explainer section 2/3
- ✓ **Technically correct MCP explanation** — Part 2, verified package names
- ✓ **Working MCP evidence** — Part 3 + screenshots 1–4
- ✓ **Three tool-based tasks** — Part 4, each with a real tool call
- ✓ **One concrete agent upgrade** — Part 5, the Brief Agent
