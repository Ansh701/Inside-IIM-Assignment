"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/*
  Light/dark toggle. The actual theme is the `.dark` class on <html>, applied
  pre-paint by the inline script in layout.tsx (so there's no flash). Here we
  just flip that class and remember the choice in localStorage. We read the
  initial icon after mount to stay in sync with whatever the script applied.
*/
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore unavailable storage */
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-9 place-items-center rounded-full border border-border bg-[var(--tint)] text-muted transition hover:border-[var(--hairline)] hover:text-foreground"
    >
      {/* Render the icon only after mount to avoid a hydration mismatch */}
      {mounted && (dark ? <Sun size={16} /> : <Moon size={16} />)}
    </button>
  );
}
