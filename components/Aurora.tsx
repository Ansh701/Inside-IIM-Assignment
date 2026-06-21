"use client";

export type Tone = "neutral" | "invest" | "pass";

/*
  Fixed, full-screen animated background. Three blurred gradient blobs drift via
  pure CSS keyframes (GPU transforms — cheap), plus a faint grain overlay. The
  `tone` prop recolours the aurora and the change is eased over ~1.2s, so the
  whole screen warms to emerald (INVEST) or rose (PASS) when the verdict lands.
*/
export function Aurora({ tone = "neutral" }: { tone?: Tone }) {
  return (
    <div aria-hidden className={`aurora aurora--${tone}`}>
      <div className="aurora__blob aurora__blob--1" />
      <div className="aurora__blob aurora__blob--2" />
      <div className="aurora__blob aurora__blob--3" />
      <div className="aurora__grain" />
    </div>
  );
}
