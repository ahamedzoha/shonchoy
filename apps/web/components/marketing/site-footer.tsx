import Link from "next/link";

import { Separator } from "@workspace/ui/components/separator";

export function SiteFooter(): React.ReactNode {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-sm space-y-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-xs font-semibold text-primary-foreground">
                ৳
              </span>
              Shonchoy
            </span>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Manual-first budgeting, inflation-aware planning, and joint
              household accounts built for emerging markets. Works offline and
              respects your data.
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground">Product</p>
            <nav className="grid gap-2 text-muted-foreground">
              <Link href="/features" className="hover:text-foreground">
                Product overview
              </Link>
              <Link href="/pricing" className="hover:text-foreground">
                Pricing & plans
              </Link>
              <Link href="/contact" className="hover:text-foreground">
                Book a walkthrough
              </Link>
            </nav>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground">Company</p>
            <nav className="grid gap-2 text-muted-foreground">
              <Link href="/about" className="hover:text-foreground">
                Our story
              </Link>
              <Link href="/contact" className="hover:text-foreground">
                Support
              </Link>
              <Link
                href="mailto:hello@shonchoy.finance"
                className="hover:text-foreground"
              >
                hello@shonchoy.finance
              </Link>
            </nav>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col gap-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Shonchoy. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
