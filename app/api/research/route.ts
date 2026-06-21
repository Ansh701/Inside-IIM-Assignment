import { NextResponse } from "next/server";
import { runResearch } from "@/lib/agent/graph";
import type { ResearchResult } from "@/lib/types";

/*
  POST /api/research   body: { "company": "Apple" }
  Runs the LangGraph agent and returns the structured verdict as JSON.
*/

// The agent uses Node APIs (fetch to Tavily, LangChain) — force the Node runtime,
// not Edge. Disable caching so every research call is fresh.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds — generous budget for the LLM + searches

export async function POST(req: Request) {
  // 1) Parse + validate the input.
  let company: string | undefined;
  try {
    const body = await req.json();
    company =
      typeof body?.company === "string" ? body.company.trim() : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!company) {
    return NextResponse.json(
      { error: 'Provide a company name, e.g. { "company": "Apple" }.' },
      { status: 400 },
    );
  }

  // 2) Run the agent and shape the result for the UI.
  try {
    const state = await runResearch(company);
    if (!state.decision || !state.analysis) {
      throw new Error("Agent finished without a decision.");
    }

    const result: ResearchResult = {
      company: state.company,
      queries: state.queries,
      decision: state.decision.decision,
      confidence: state.decision.confidence,
      reasoning: state.decision.reasoning,
      bullCase: state.analysis.bullCase,
      bearCase: state.analysis.bearCase,
      risks: state.analysis.risks,
      sources: state.sources,
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error("Research failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Research failed: ${message}` },
      { status: 500 },
    );
  }
}
