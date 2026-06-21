import { getLLM } from "./llm";
import { tavilySearch } from "./tavily";
import {
  planSchema,
  analysisSchema,
  decisionSchema,
  type Analysis,
  type Decision,
} from "./schema";
import type { AgentStateType, ResearchGroup, Source } from "./state";

/*
  The 4 nodes of the agent. Each takes the current state and returns only the
  slice of state it produces. graph.ts runs them in order:
    plan → research → analyze → decide
  The console.log lines give live progress in the terminal (and server logs);
  the UI later gets the same progress over SSE.
*/

// 1) PLAN — normalize the company name + generate targeted search queries.
export async function planNode(
  state: AgentStateType,
): Promise<Partial<AgentStateType>> {
  console.log(`🧭 [plan] planning research for "${state.company}"…`);
  const planner = getLLM().withStructuredOutput(planSchema);

  const plan = await planner.invoke([
    {
      role: "system",
      content:
        "You are an equity-research planner. Given a company name, return its " +
        "canonical name and 3-4 focused, search-engine-friendly queries that together " +
        "cover: (1) financial performance, (2) recent news, (3) business model & " +
        "competitive moat, and (4) key risks.",
    },
    { role: "user", content: `Company: ${state.company}` },
  ]);

  console.log(`   → ${plan.queries.length} queries for "${plan.normalizedName}"`);
  return { company: plan.normalizedName, queries: plan.queries };
}

// 2) RESEARCH — run every query against Tavily in parallel; keep unique sources.
export async function researchNode(
  state: AgentStateType,
): Promise<Partial<AgentStateType>> {
  const queries = state.queries.slice(0, 4); // hard cap on outbound web calls
  console.log(`🌐 [research] searching the web (${queries.length} queries)…`);

  const research: ResearchGroup[] = await Promise.all(
    queries.map(async (query) => ({
      query,
      results: await tavilySearch(query, 5),
    })),
  );

  // De-duplicate sources by URL so the UI shows each link only once.
  const seen = new Set<string>();
  const sources: Source[] = [];
  for (const group of research) {
    for (const r of group.results) {
      if (!seen.has(r.url)) {
        seen.add(r.url);
        sources.push({ title: r.title, url: r.url });
      }
    }
  }

  console.log(`   → ${sources.length} unique sources`);
  return { findings: research, sources };
}

// 3) ANALYZE — turn the raw research into a balanced bull/bear/risks breakdown.
export async function analyzeNode(
  state: AgentStateType,
): Promise<Partial<AgentStateType>> {
  console.log(`🧠 [analyze] building bull / bear / risks…`);
  const analyst = getLLM().withStructuredOutput(analysisSchema);

  const analysis = await analyst.invoke([
    {
      role: "system",
      content:
        "You are a balanced equity analyst. Using ONLY the web research provided, " +
        "extract a bull case, a bear case, and the key risks. Keep each point concise, " +
        "specific, and grounded in the research. Be even-handed — do not cheerlead.",
    },
    {
      role: "user",
      content: `Company: ${state.company}\n\nWeb research:\n${formatResearch(
        state.findings,
      )}`,
    },
  ]);

  // withStructuredOutput already validated this against analysisSchema at
  // runtime; cast to the inferred type (LangChain widens it to Record).
  return { analysis: analysis as Analysis };
}

// 4) DECIDE — weigh bull vs bear and emit the structured verdict.
export async function decideNode(
  state: AgentStateType,
): Promise<Partial<AgentStateType>> {
  console.log(`⚖️  [decide] weighing the verdict…`);
  const decider = getLLM().withStructuredOutput(decisionSchema);

  const a = state.analysis!; // analyze always runs before decide
  const decision = await decider.invoke([
    {
      role: "system",
      content:
        "You are a decisive investment-committee member. Weigh the bull case against the " +
        "bear case and risks, then decide INVEST or PASS with a confidence score (0-100) " +
        "and a short reasoning paragraph. Be honest: PASS when risks outweigh the upside.",
    },
    {
      role: "user",
      content:
        `Company: ${state.company}\n\n` +
        `Bull case:\n- ${a.bullCase.join("\n- ")}\n\n` +
        `Bear case:\n- ${a.bearCase.join("\n- ")}\n\n` +
        `Key risks:\n- ${a.risks.join("\n- ")}`,
    },
  ]);

  const verdict = decision as Decision;
  console.log(`   → ${verdict.decision} (confidence ${verdict.confidence}/100)`);
  return { decision: verdict };
}

// Helper: render the research groups into a compact text block for the LLM.
function formatResearch(research: ResearchGroup[]): string {
  return research
    .map((group) => {
      const items =
        group.results
          .map(
            (r, i) =>
              `  [${i + 1}] ${r.title}\n      ${r.url}\n      ${r.content
                .replace(/\s+/g, " ")
                .slice(0, 600)}`,
          )
          .join("\n") || "  (no results)";
      return `Query: ${group.query}\n${items}`;
    })
    .join("\n\n");
}
