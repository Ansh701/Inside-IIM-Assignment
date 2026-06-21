import { ResearchApp } from "@/components/ResearchApp";

// The page is a thin shell; ResearchApp ("use client") owns the interactive flow.
export default function Home() {
  return <ResearchApp />;
}
