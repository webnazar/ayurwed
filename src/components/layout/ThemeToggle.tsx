"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => setMounted(true), []);

  const handleToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof document !== "undefined") {
      document.cookie = `theme=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  if (!mounted) {
    return (
      <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-green/10 text-brand-green dark:text-brand-gold transition-colors" aria-label="Toggle theme">
        <div className="w-5 h-5 opacity-0" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-green/10 dark:hover:bg-brand-gold/10 text-brand-green dark:text-brand-gold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green/20"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
      <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
    </button>
  );
}
