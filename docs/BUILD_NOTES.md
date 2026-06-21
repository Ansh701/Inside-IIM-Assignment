# Build Notes

A concise, honest log of how this project was built — the key decisions, prompts,
and problems solved. (The assignment offers bonus points for the build process.)

## What we're building

An AI Investment Research Agent: type a company → it researches the web and
returns an **INVEST / PASS** verdict with a confidence score, a bull case, a bear
case, key risks, reasoning, and the sources it used.

## Stack & why (kept deliberately small — every piece is defensible)

- **Next.js (App Router) + TypeScript** — one app for the UI _and_ the API route
  handlers; one repo, one Render deploy. Matches the company's production stack.
- **LangGraph.js** — the agent is an explicit 4-node state graph: easy to reason
  about, to stream node-by-node, and to extend later.
- **Gemini `gemini-3.1-flash-lite` via `@langchain/google-genai`** — free tier;
  provider + model are env-driven, so swapping is a config change, not a rewrite.
- **Tavily** via a ~30-line `fetch` client (no SDK, no `@langchain/community`) —
  the agent's only external data source.
- **zod** — a strict schema on the verdict so the LLM output is reliably parseable.
- **Tailwind v4 + Framer Motion + lucide-react** — the UI layer.

## Milestone log

### 0 — Clarifying questions (no silent assumptions)

Asked one batched set up front: LLM provider (→ Google Gemini, free), Tavily key
(→ to be created), deployment (→ Render via API key). Then proposed the plan +
the exact dependency list for approval before installing anything.

### 1 — Foundation

- Scaffolded with `create-next-app` → **Next 16, React 19, Tailwind v4**. The
  folder already contained a `.claude/` dir (which `create-next-app` refuses to
  scaffold into), so we scaffolded into a temp dir and copied the files in.
- **Security fix:** real API keys first landed in `.env.example` (the _committed_
  template). Moved them into `.env` (gitignored) and restored `.env.example` to
  placeholders, with a `!.env.example` gitignore exception so only the template is
  ever committed. (Reminder: rotate both keys before sharing the build transcript,
  since they appeared in it.)
- Dark theme + fonts (Space Grotesk + Inter) base. `npm run build` is green.

### 2 — The agent (proven before any UI)

- Files: `lib/agent/{schema,llm,tavily,state,nodes,graph}.ts` + a standalone
  runner `scripts/run-agent.ts` (`npm run agent -- "Apple"`).
- **Model gotcha:** the originally chosen `gemini-3.1-flash` doesn't exist on the
  key (only `-lite` / `-image` / `-tts` variants do). Verified via Google's
  ListModels API and switched to `gemini-3.1-flash-lite`.
- **LangGraph gotcha:** node names and state channels share one namespace, so a
  `research` node couldn't coexist with a `research` channel. Renamed the channel
  to `findings` (kept the 4 node names intact).
- **Proven with real runs:**
  - `Apple` → **INVEST**, confidence 85/100 (11.5s, 20 sources)
  - `Rivian` → **PASS**, confidence 75/100 (26.6s, 18 sources)

### 3 — API route

- `app/api/research/route.ts` — `POST { company }` → structured JSON. Node runtime, `force-dynamic`.
- `next.config.ts`: `serverExternalPackages` for the LangChain packages so they aren't bundled.
- Verified: `POST {company:"Microsoft"}` → INVEST 85 with 20 sources.

### 4 — Frontend ("Terminal Luxe")

- Dark premium UI: an animated cyan→indigo→magenta aurora that **shifts to emerald/rose at the
  verdict moment**, single-layer glassmorphism, Bricolage Grotesque + Geist + Geist Mono.
  (Picked Bricolage over the suggested Space Grotesk — the design guidance flags it as overused.)
- Components: Aurora, ResearchApp (state machine), AgentSteps, VerdictBadge, animated ConfidenceGauge,
  ResultView. Idle / working / done / error states; fully responsive; `prefers-reduced-motion` respected.
- Fixed two v4 / Framer gotchas: `bg-gradient-*` → `bg-linear-*`; raw bezier `ease` arrays → named easings.
- Fixed a type issue: LangChain v1 widens `withStructuredOutput` to `Record<string, any>`, so we cast
  the (already runtime-validated) result to the inferred zod type.
- Verified visually (desktop + mobile) by driving headless Edge with a throwaway `puppeteer-core`
  script, then removed the script + dependency. Screenshots live in `docs/screenshots/`.

### 5 — Decision: no SSE (kept it simple)

- Stuck with the single-POST design. The stepper already shows the real node order; live streaming
  adds a second code path and long-lived streams are flaky on free hosting. Documented as a trade-off.

### 6 — Docs + deploy prep

- README: overview, run steps, architecture + mermaid, trade-offs, **real** example runs, improvements.
- `render.yaml` + `.node-version` for a smooth Render deploy.
- Real runs captured for the README:
  - `Coca-Cola` → **INVEST** 75/100 (blue-chip)
  - `Beyond Meat` → **PASS** 85/100 (speculative)
