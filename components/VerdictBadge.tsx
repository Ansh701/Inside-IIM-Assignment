"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

/* The headline verdict — springs in, glows in the verdict colour. */
export function VerdictBadge({ decision }: { decision: "INVEST" | "PASS" }) {
  const invest = decision === "INVEST";
  const color = invest ? "var(--color-invest)" : "var(--color-pass)";
  const Icon = invest ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ scale: 0.82, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 15 }}
      className="inline-flex items-center gap-3 rounded-2xl px-6 py-4"
      style={{
        border: `1px solid color-mix(in oklab, ${color} 60%, transparent)`,
        background: `color-mix(in oklab, ${color} 13%, transparent)`,
        boxShadow: `0 0 44px color-mix(in oklab, ${color} 32%, transparent)`,
      }}
    >
      <Icon size={36} strokeWidth={2.5} style={{ color }} aria-hidden />
      <span
        className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl"
        style={{ color }}
      >
        {decision}
      </span>
    </motion.div>
  );
}
