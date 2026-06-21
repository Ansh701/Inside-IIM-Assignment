import { runResearch } from "../lib/agent/graph";

/*
  Standalone runner so we can prove the agent works in the terminal BEFORE any
  UI exists:  npm run agent -- "Apple"
*/

// The standalone runner loads .env itself (Next loads it automatically in the app).
type ProcWithEnvFile = NodeJS.Process & { loadEnvFile?: (path?: string) => void };
try {
  (process as ProcWithEnvFile).loadEnvFile?.(".env");
} catch {
  /* .env is optional — the vars may already be set in the shell */
}

async function main() {
  const company = process.argv.slice(2).join(" ").trim();
  if (!company) {
    console.error('Usage: npm run agent -- "Company Name"');
    process.exit(1);
  }

  console.log(`\n🔎 Researching: ${company}\n`);
  const startedAt = Date.now();
  const result = await runResearch(company);
  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);

  console.log("\n──────────────── RESULT ────────────────");
  console.log(`Company:   ${result.company}`);
  console.log(
    `Verdict:   ${result.decision?.decision}  (confidence ${result.decision?.confidence}/100)`,
  );
  console.log(`\nReasoning:\n${result.decision?.reasoning}`);

  console.log(`\nBull case:`);
  result.analysis?.bullCase.forEach((b) => console.log("  • " + b));
  console.log(`\nBear case:`);
  result.analysis?.bearCase.forEach((b) => console.log("  • " + b));
  console.log(`\nRisks:`);
  result.analysis?.risks.forEach((r) => console.log("  • " + r));

  console.log(`\nSources (${result.sources.length}):`);
  result.sources.forEach((s) => console.log("  - " + s.title + " — " + s.url));

  console.log(`\n⏱  Done in ${seconds}s\n`);
}

main().catch((err) => {
  console.error("\n❌ Agent failed:\n", err);
  process.exit(1);
});
