import { Annotation } from "@langchain/langgraph";
import type { Analysis, Decision } from "./schema";
import type { TavilyResult } from "./tavily";

/** A single de-duplicated source link surfaced to the user. */
export interface Source {
  title: string;
  url: string;
}

/** The Tavily results for one search query. */
export interface ResearchGroup {
  query: string;
  results: TavilyResult[];
}

/*
  The shared state that flows through the graph. Each node reads what it needs
  and returns a partial update; LangGraph merges those updates into this object.
    plan     -> company (normalized), queries
    research -> findings, sources
    analyze  -> analysis
    decide   -> decision
  (Each field is written by exactly one node, so the default "replace" reducer
   is all we need. Note: the raw-research channel is called `findings`, not
   `research`, because LangGraph keeps node names and channel names in the same
   namespace — a `research` node and a `research` channel would collide.)
*/
export const AgentState = Annotation.Root({
  company: Annotation<string>(),
  queries: Annotation<string[]>(),
  findings: Annotation<ResearchGroup[]>(),
  sources: Annotation<Source[]>(),
  analysis: Annotation<Analysis | null>(),
  decision: Annotation<Decision | null>(),
});

export type AgentStateType = typeof AgentState.State;
