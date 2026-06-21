"use client";

import { type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ExternalLink,
  FileText,
  Search,
} from "lucide-react";
import type { ResearchResult } from "@/lib/types";
import { VerdictBadge } from "./VerdictBadge";
import { ConfidenceGauge } from "./ConfidenceGauge";

// Staggered reveal so the result assembles itself section by section.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ResultView({ result }: { result: ResearchResult }) {
  const tone = result.decision === "INVEST" ? "invest" : "pass";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5"
    >
      {/* Verdict hero */}
      <motion.section
        variants={item}
        className="glass-strong rounded-3xl p-6 sm:p-8"
      >
        <div className="flex flex-col items-center gap-7 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center gap-4 sm:items-start">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
              Verdict · {result.company}
            </span>
            <VerdictBadge decision={result.decision} />
          </div>
          <ConfidenceGauge value={result.confidence} tone={tone} />
        </div>
      </motion.section>

      {/* Search trail — shows the agent's work */}
      <motion.section variants={item} className="glass rounded-2xl p-5">
        <SectionLabel icon={<Search size={14} />}>Searched the web for</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.queries.map((q) => (
            <span
              key={q}
              className="rounded-full border border-border bg-white/[0.03] px-3 py-1 font-mono text-xs text-muted"
            >
              {q}
            </span>
          ))}
        </div>
      </motion.section>

      {/* Reasoning */}
      <motion.section variants={item} className="glass rounded-2xl p-6">
        <SectionLabel icon={<FileText size={14} />}>Reasoning</SectionLabel>
        <p className="mt-3 leading-relaxed text-foreground/90">
          {result.reasoning}
        </p>
      </motion.section>

      {/* Bull / Bear */}
      <motion.section variants={item} className="grid gap-5 md:grid-cols-2">
        <ListCard
          title="Bull case"
          color="var(--color-invest)"
          icon={<TrendingUp size={16} />}
          items={result.bullCase}
        />
        <ListCard
          title="Bear case"
          color="var(--color-pass)"
          icon={<TrendingDown size={16} />}
          items={result.bearCase}
        />
      </motion.section>

      {/* Risks */}
      <motion.section variants={item}>
        <ListCard
          title="Key risks"
          color="var(--color-warn)"
          icon={<AlertTriangle size={16} />}
          items={result.risks}
        />
      </motion.section>

      {/* Sources */}
      <motion.section variants={item} className="glass rounded-2xl p-6">
        <SectionLabel icon={<ExternalLink size={14} />}>
          Sources <span className="ml-1 text-faint">({result.sources.length})</span>
        </SectionLabel>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {result.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-transparent p-3 transition hover:border-border hover:bg-white/[0.03]"
              >
                <ExternalLink
                  size={15}
                  className="mt-0.5 shrink-0 text-faint transition group-hover:text-cyan"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-foreground/90 group-hover:text-foreground">
                    {s.title}
                  </span>
                  <span className="block truncate font-mono text-xs text-faint">
                    {domainOf(s.url)}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </motion.section>
    </motion.div>
  );
}

function SectionLabel({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
      <span className="text-faint">{icon}</span>
      {children}
    </div>
  );
}

function ListCard({
  title,
  color,
  icon,
  items,
}: {
  title: string;
  color: string;
  icon: ReactNode;
  items: string[];
}) {
  return (
    <div className="glass h-full rounded-2xl p-6">
      <div className="flex items-center gap-2.5">
        <span
          className="grid size-8 place-items-center rounded-lg"
          style={{
            background: `color-mix(in oklab, ${color} 16%, transparent)`,
            color,
          }}
        >
          {icon}
        </span>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((t, i) => (
          <li
            key={i}
            className="flex gap-3 text-sm leading-relaxed text-foreground/85"
          >
            <span
              className="mt-2 size-1.5 shrink-0 rounded-full"
              style={{ background: color }}
            />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
