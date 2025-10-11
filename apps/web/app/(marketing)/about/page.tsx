import type { Metadata } from "next";

import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export const metadata: Metadata = {
  title: "About | Shonchoy",
  description:
    "Manual-first personal finance built for emerging markets where bank APIs fall short.",
};

const timeline = [
  {
    year: "2023",
    headline: "Frustration sparks Shonchoy",
    description:
      "We realised every imported budgeting app broke on Bangladeshi bank feeds or misaligned with cash flows.",
  },
  {
    year: "2024",
    headline: "MVP with student & NGO pilots",
    description:
      "Ran closed betas with university students and community finance groups. Manual-first approach proved sticky.",
  },
  {
    year: "2025",
    headline: "AI Limited & joint households",
    description:
      "Launched assisted insights, joint roles, and scenario builders tuned for inflation-heavy economies.",
  },
] as const;

export default function AboutPage(): React.ReactNode {
  return (
    <section className="container mx-auto max-w-5xl px-4 py-20">
      <div className="space-y-4">
        <Badge variant="secondary" className="rounded-full">
          Built for everyday Bangladeshis first
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Why we started Shonchoy
        </h1>
        <p className="text-muted-foreground max-w-3xl text-lg leading-relaxed">
          Money management apps built for Silicon Valley assume stable incomes,
          card-first spending, and perfect bank APIs. Shonchoy is different:
          manual-first, taka-first, and designed for families navigating
          inflation, side-gigs, and cash envelopes.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Our product principles</CardTitle>
            <CardDescription>
              Everything we ship follows four rules inspired by our users’
              realities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div>
              <p className="text-foreground font-medium">
                Manual-first, delightful
              </p>
              <p className="text-muted-foreground">
                Optimised for quick keyboard entry, offline PWA usage, and error
                forgiveness. No bank integrations needed.
              </p>
            </div>
            <div>
              <p className="text-foreground font-medium">
                Inflation-aware by default
              </p>
              <p className="text-muted-foreground">
                Every projection can adjust for custom inflation and salary
                growth assumptions so plans stay realistic.
              </p>
            </div>
            <div>
              <p className="text-foreground font-medium">Joint-friendly</p>
              <p className="text-muted-foreground">
                Respect family structures: invite parents, partners, or siblings
                with the right permissions.
              </p>
            </div>
            <div>
              <p className="text-foreground font-medium">Privacy-first</p>
              <p className="text-muted-foreground">
                Your financial data never gets sold. Encryption, local-first
                calculations, and transparent pricing.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-muted/30">
          <CardHeader>
            <CardTitle>Who we build for</CardTitle>
            <CardDescription>
              Emerging market households juggling variable incomes and rising
              living costs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-foreground font-medium">
                Mid-career professionals
              </p>
              <p className="text-muted-foreground">
                Balance salaried income with freelance gigs, tuition fees, and
                long-term goals like home upgrades.
              </p>
            </div>
            <div>
              <p className="text-foreground font-medium">Joint households</p>
              <p className="text-muted-foreground">
                Manage parents’ medical funds, siblings’ education budgets, and
                shared emergency savings in one place.
              </p>
            </div>
            <div>
              <p className="text-foreground font-medium">Students & NGOs</p>
              <p className="text-muted-foreground">
                Teach financial literacy with affordable pricing, offline
                access, and templates tailored for local realities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {timeline.map((entry) => (
          <Card key={entry.year} className="border-border/80">
            <CardHeader>
              <Badge variant="secondary" className="w-fit rounded-full">
                {entry.year}
              </Badge>
              <CardTitle className="text-lg">{entry.headline}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              {entry.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
