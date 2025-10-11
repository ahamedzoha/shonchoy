"use client";

import { useEffect, useState } from "react";

import { useTheme } from "next-themes";

import { Button } from "@workspace/ui/components/button";
import { MoonStar, SunMedium } from "lucide-react";

export function ThemeToggle(): React.ReactNode {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      aria-pressed={isDark}
    >
      {isDark ? (
        <SunMedium className="size-4" />
      ) : (
        <MoonStar className="size-4" />
      )}
    </Button>
  );
}
