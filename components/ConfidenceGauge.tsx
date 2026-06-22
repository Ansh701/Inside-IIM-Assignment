"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/*
  Radial confidence gauge. The arc sweeps from 0 to `value` and the centred
  number counts up in lockstep (both driven by one MotionValue, so they stay in
  sync). Coloured by the verdict.
*/
export function ConfidenceGauge({
  value,
  tone,
}: {
  value: number;
  tone: "invest" | "pass";
}) {
  const size = 168;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = Math.max(0, Math.min(100, value));
  const color = tone === "invest" ? "var(--color-invest)" : "var(--color-pass)";

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const dashoffset = useTransform(count, (v) => circumference * (1 - v / 100));

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 1.3,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [target, count]);

  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--gauge-track)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: dashoffset,
            filter: `drop-shadow(0 0 10px color-mix(in oklab, ${color} 60%, transparent))`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="font-mono text-5xl font-semibold tabular-nums"
          style={{ color }}
        >
          {rounded}
        </motion.span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          confidence
        </span>
      </div>
    </div>
  );
}
