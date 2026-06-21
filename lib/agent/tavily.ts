/*
  Tiny Tavily web-search client.

  Tavily is the agent's only external data source. Instead of pulling in an SDK
  or @langchain/community, we call Tavily's REST endpoint with the built-in
  fetch — it's ~30 lines, has no extra dependency, and is easy to reason about.
  Docs: https://docs.tavily.com
*/

export interface TavilyResult {
  title: string;
  url: string;
  content: string; // a short relevant snippet Tavily extracts from the page
  score: number; // Tavily's relevance score for the result
}

export async function tavilySearch(
  query: string,
  maxResults = 5,
): Promise<TavilyResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "TAVILY_API_KEY is missing. Add it to .env (see .env.example).",
    );
  }

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "basic", // "basic" is fast + free-tier friendly
      max_results: maxResults,
      include_answer: false, // we let our own LLM synthesize, not Tavily
      include_raw_content: false,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Tavily search failed (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as { results?: TavilyResult[] };
  return (data.results ?? []).map((r) => ({
    title: r.title,
    url: r.url,
    content: r.content,
    score: r.score,
  }));
}
