"use client";

import { motion } from "framer-motion";
import { Compass, Globe, Brain, Scale, Check, Loader2 } from "lucide-react";

/*
  The agent's 4 nodes, shown as a live stepper. `activeStep` is the index of the
  node currently running (4 = all done). Steps before it show a check; the active
  one pulses with a spinner. These mirror the real graph order — in non-streamed
  mode the timing is illustrative; with SSE it tracks the real node events.
*/
const STEPS = [
  { label: "Planning", desc: "Crafting targeted search queries", Icon: Compass },
  { label: "Researching", desc: "Scanning the live web with Tavily", Icon: Globe },
  { label: "Analyzing", desc: "Building the bull & bear case", Icon: Brain },
  { label: "Deciding", desc: "Weighing the final verdict", Icon: Scale },
];

export function AgentSteps({ activeStep }: { activeStep: number }) {
  return (
    <ol className="flex flex-col gap-3">
      {STEPS.map((step, i) => {
        const state = i < activeStep ? "done" : i === activeStep ? "active" : "pending";
        const Icon = step.Icon;
        return (
          <motion.li
            key={step.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass flex items-center gap-4 rounded-2xl p-4"
            style={{
              borderColor:
                state === "active"
                  ? "color-mix(in oklab, var(--color-cyan) 45%, transparent)"
                  : undefined,
              opacity: state === "pending" ? 0.55 : 1,
            }}
          >
            <div
              className="grid size-11 shrink-0 place-items-center rounded-xl"
              style={{
                background:
                  state === "done"
                    ? "color-mix(in oklab, var(--color-invest) 16%, transparent)"
                    : state === "active"
                      ? "color-mix(in oklab, var(--color-cyan) 16%, transparent)"
                      : "rgba(255,255,255,0.04)",
                color:
                  state === "done"
                    ? "var(--color-invest)"
                    : state === "active"
                      ? "var(--color-cyan)"
                      : "var(--color-faint)",
              }}
            >
              {state === "done" ? (
                <Check size={20} strokeWidth={3} />
              ) : (
                <Icon size={20} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="font-medium"
                  style={{ color: state === "pending" ? "var(--color-muted)" : undefined }}
                >
                  {step.label}
                </span>
                {state === "active" && (
                  <Loader2 size={14} className="animate-spin text-cyan" />
                )}
              </div>
              <p className="truncate text-sm text-muted">{step.desc}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
