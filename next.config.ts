import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep LangChain/LangGraph as runtime Node deps instead of bundling them —
  // they use dynamic requires that don't bundle cleanly into the server output.
  serverExternalPackages: [
    "@langchain/langgraph",
    "@langchain/core",
    "@langchain/google-genai",
  ],
};

export default nextConfig;
