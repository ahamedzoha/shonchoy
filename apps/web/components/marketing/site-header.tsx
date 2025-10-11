"use client";

import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";

import { ThemeToggle } from "@/components/marketing/theme-toggle";

export function SiteHeader(): React.ReactNode {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-base font-semibold text-primary-foreground shadow-sm">
            ৳
          </span>
          <div className="hidden flex-col sm:flex">
            <span className="text-base font-semibold leading-tight">
              Shonchoy
            </span>
            <span className="text-muted-foreground text-xs leading-tight">
              Manual-first finance for emerging markets
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link
            href="/features"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Product
          </Link>
          <Link
            href="/pricing"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Story
          </Link>
          <Link
            href="/contact"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Separator
            orientation="vertical"
            className="hidden h-5 bg-border sm:block"
          />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="http://localhost:3001/login" prefetch={false}>
              Log in
            </Link>
          </Button>
          <Button asChild className="whitespace-nowrap">
            <Link href="http://localhost:3001/register" prefetch={false}>
              Start tracking
            </Link>
          </Button>
        </div>
      </div>
      <Separator className="opacity-0" />
    </header>
  );
}
