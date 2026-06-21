import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState, type AgentStateType } from "./state";
import { planNode, researchNode, analyzeNode, decideNode } from "./nodes";

/*
  The agent as an explicit state graph. It's deliberately linear and simple so
  it's easy to explain and reason about:

      START → plan → research → analyze → decide → END

  Making it a LangGraph (rather than a plain function chain) gives us typed
  shared state, a structure we can stream node-by-node to the UI, and an easy
  place to add branching/retries later.
*/
export function buildGraph() {
  return new StateGraph(AgentState)
    .addNode("plan", planNode)
    .addNode("research", researchNode)
    .addNode("analyze", analyzeNode)
    .addNode("decide", decideNode)
    .addEdge(START, "plan")
    .addEdge("plan", "research")
    .addEdge("research", "analyze")
    .addEdge("analyze", "decide")
    .addEdge("decide", END)
    .compile();
}

// Compile once and reuse across calls.
export const graph = buildGraph();

/** Run the full agent for a company and return the final state. */
export async function runResearch(company: string): Promise<AgentStateType> {
  return graph.invoke({ company });
}
