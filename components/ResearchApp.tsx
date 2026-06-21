"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  Search,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Diamond,
} from "lucide-react";
import { Aurora, type Tone } from "./Aurora";
import { AgentSteps } from "./AgentSteps";
import { ResultView } from "./ResultView";
import type { ResearchResult } from "@/lib/types";

type Status = "idle" | "working" | "done" | "error";

const EXAMPLES = ["Apple", "Nvidia", "Rivian", "Coca-Cola"];
// When each node becomes "active" (ms). Illustrative pacing for the non-streamed
// API; the order matches the real graph (plan → research → analyze → decide).
const STEP_DELAYS = [0, 1600, 7000, 12000];

export function ResearchApp() {
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  const tone: Tone =
    status === "done" && result
      ? result.decision === "INVEST"
        ? "invest"
        : "pass"
      : "neutral";

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  async function research(name: string) {
    const q = name.trim();
    if (!q) return;

    setCompany(q);
    setStatus("working");
    setError(null);
    setResult(null);
    setActiveStep(0);
    clearTimers();
    STEP_DELAYS.forEach((d, i) =>
      timers.current.push(window.setTimeout(() => setActiveStep(i), d)),
    );

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      clearTimers();
      setActiveStep(4);
      setResult(data as ResearchResult);
      setStatus("done");
    } catch (e) {
      clearTimers();
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const reset = () => {
    clearTimers();
    setStatus("idle");
    setResult(null);
    setError(null);
    setCompany("");
  };

  return (
    <MotionConfig reducedMotion="user">
      <Aurora tone={tone} />
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 py-7 sm:px-8">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <button onClick={reset} className="flex items-center gap-2" aria-label="Home">
            <span className="grid size-7 place-items-center rounded-md bg-linear-to-br from-cyan to-indigo text-bg">
              <Diamond size={15} strokeWidth={2.5} />
            </span>
            <span className="font-display text-sm font-semibold tracking-tight">
              Research Agent
            </span>
          </button>
          {status !== "idle" && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:border-white/20 hover:text-foreground"
            >
              <RotateCcw size={13} /> New search
            </button>
          )}
        </header>

        {/* Body */}
        <div className="flex flex-1 flex-col justify-center py-10">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <Idle
                key="idle"
                company={company}
                setCompany={setCompany}
                onSubmit={research}
              />
            )}
            {status === "working" && (
              <Working key="working" company={company} activeStep={activeStep} />
            )}
            {status === "error" && (
              <ErrorView
                key="error"
                message={error ?? ""}
                onRetry={() => research(company)}
                onReset={reset}
              />
            )}
            {status === "done" && result && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ResultView result={result} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="flex flex-col items-center gap-1 pt-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
            LangGraph · Gemini · Tavily
          </p>
          <p className="text-xs text-faint">
            For demonstration only — not financial advice.
          </p>
        </footer>
      </main>
    </MotionConfig>
  );
}

/* ── Idle hero ───────────────────────────────────────────────────────────── */
function Idle({
  company,
  setCompany,
  onSubmit,
}: {
  company: string;
  setCompany: (v: string) => void;
  onSubmit: (v: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto w-full max-w-2xl text-center"
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        <Sparkles size={12} className="text-cyan" /> AI agent · live web research
      </span>

      <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
        Should you invest in <span className="text-gradient">anything?</span>
      </h1>

      <p className="mx-auto mt-5 max-w-lg text-balance text-muted">
        Type a company. The agent researches the live web and returns an{" "}
        <span className="font-medium text-invest">INVEST</span> or{" "}
        <span className="font-medium text-pass">PASS</span> verdict — with the
        reasoning, confidence, and sources behind it.
      </p>

      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(company);
        }}
        className="glass-strong mx-auto mt-8 flex items-center gap-2 rounded-2xl p-2 pl-4 sm:gap-3"
      >
        <Search size={20} className="shrink-0 text-muted" aria-hidden />
        <input
          autoFocus
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Apple, Nvidia, Rivian…"
          aria-label="Company name"
          className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-faint"
        />
        <button
          type="submit"
          disabled={!company.trim()}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-linear-to-br from-cyan to-indigo px-5 py-3 font-medium text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Research <ArrowRight size={17} />
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-faint">Try:</span>
        {EXAMPLES.map((name) => (
          <button
            key={name}
            onClick={() => onSubmit(name)}
            className="rounded-full border border-border bg-white/[0.02] px-3 py-1 text-sm text-muted transition hover:border-white/20 hover:text-foreground"
          >
            {name}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Working state ───────────────────────────────────────────────────────── */
function Working({
  company,
  activeStep,
}: {
  company: string;
  activeStep: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-xl"
      aria-live="polite"
    >
      <div className="mb-6 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          Researching
        </span>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
          {company}
        </h2>
      </div>
      <AgentSteps activeStep={activeStep} />
    </motion.div>
  );
}

/* ── Error state ─────────────────────────────────────────────────────────── */
function ErrorView({
  message,
  onRetry,
  onReset,
}: {
  message: string;
  onRetry: () => void;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto w-full max-w-md"
    >
      <div
        className="glass rounded-2xl p-6 text-center"
        style={{ borderColor: "color-mix(in oklab, var(--color-pass) 40%, transparent)" }}
      >
        <span
          className="mx-auto grid size-12 place-items-center rounded-xl"
          style={{
            background: "color-mix(in oklab, var(--color-pass) 14%, transparent)",
            color: "var(--color-pass)",
          }}
        >
          <AlertCircle size={24} />
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold">Research failed</h2>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={onRetry}
            className="rounded-xl bg-linear-to-br from-cyan to-indigo px-4 py-2 text-sm font-medium text-bg transition hover:opacity-90"
          >
            Try again
          </button>
          <button
            onClick={onReset}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
          >
            Start over
          </button>
        </div>
      </div>
    </motion.div>
  );
}
