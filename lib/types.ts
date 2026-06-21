/**
 * The flat, UI-friendly shape returned by POST /api/research.
 * Shared by the route handler and the frontend so they can't drift apart.
 */
export interface ResearchResult {
  company: string;
  queries: string[];
  decision: "INVEST" | "PASS";
  confidence: number;
  reasoning: string;
  bullCase: string[];
  bearCase: string[];
  risks: string[];
  sources: { title: string; url: string }[];
}
