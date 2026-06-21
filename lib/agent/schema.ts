import { z } from "zod";

/*
  Zod schemas = the agent's typed contracts. We hand these to the LLM via
  `.withStructuredOutput(schema)`, which forces the model to return JSON that
  matches the shape. LangChain validates the response against the schema, so by
  the time a value reaches our code it is already parsed and type-safe.
*/

/** plan node output: canonical name + targeted search queries. */
export const planSchema = z.object({
  normalizedName: z
    .string()
    .describe("The official / canonical company name, e.g. 'Apple Inc.'"),
  queries: z
    .array(z.string())
    .min(3)
    .max(4)
    .describe(
      "3-4 web-search queries that together cover: financial performance, " +
        "recent news, business model & competitive moat, and key risks.",
    ),
});
export type Plan = z.infer<typeof planSchema>;

/** analyze node output: a balanced read of the research. */
export const analysisSchema = z.object({
  bullCase: z
    .array(z.string())
    .min(1)
    .describe("Concrete reasons to invest (bull case)."),
  bearCase: z
    .array(z.string())
    .min(1)
    .describe("Concrete reasons to avoid (bear case)."),
  risks: z.array(z.string()).min(1).describe("Key risks to the thesis."),
});
export type Analysis = z.infer<typeof analysisSchema>;

/** decide node output: the structured verdict the whole app is built around. */
export const decisionSchema = z.object({
  decision: z.enum(["INVEST", "PASS"]).describe("Final verdict."),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence in the verdict, 0-100."),
  reasoning: z
    .string()
    .describe(
      "A short paragraph weighing the bull case against the bear case and risks.",
    ),
});
export type Decision = z.infer<typeof decisionSchema>;
