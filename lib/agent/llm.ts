import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

/**
 * Returns the chat model based on environment variables, so swapping models is
 * a config change, not a code change:
 *   LLM_PROVIDER  -> "google" (default) | "openai"
 *   LLM_MODEL     -> e.g. "gemini-3.1-flash-lite" | "gpt-4o-mini"
 *
 * Default is Google Gemini (free tier). To use OpenAI instead:
 *   1) npm i @langchain/openai
 *   2) uncomment the OpenAI block below
 *   3) set LLM_PROVIDER=openai and LLM_MODEL=gpt-4o-mini in .env
 * (We keep @langchain/openai out of the dependency tree until it's actually
 *  used, so there are fewer moving parts to install and defend.)
 */
export function getLLM(): BaseChatModel {
  const provider = (process.env.LLM_PROVIDER ?? "google").toLowerCase();
  const model = process.env.LLM_MODEL ?? "gemini-2.0-flash";
  const temperature = 0.2; // low temp -> steadier, more reproducible verdicts

  if (provider === "google") {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error(
        "GOOGLE_API_KEY is missing. Add it to .env (see .env.example).",
      );
    }
    return new ChatGoogleGenerativeAI({
      model,
      temperature,
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  // --- OpenAI (optional) ---------------------------------------------------
  // if (provider === "openai") {
  //   const { ChatOpenAI } = require("@langchain/openai");
  //   if (!process.env.OPENAI_API_KEY) {
  //     throw new Error("OPENAI_API_KEY is missing. Add it to .env.");
  //   }
  //   return new ChatOpenAI({ model, temperature, apiKey: process.env.OPENAI_API_KEY });
  // }

  throw new Error(
    `Unsupported LLM_PROVIDER "${provider}". Use "google", or enable the ` +
      `OpenAI block in lib/agent/llm.ts.`,
  );
}
