import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

const tiers = [
  {
    name: "Standard",
    price: "৳99",
    cadence: "/month",
    description: "Manual-first budgeting essentials.",
    features: [
      "Unlimited categories & envelopes",
      "Surplus dashboard & habit insights",
      "CSV import/export",
      "Offline PWA support",
    ],
    cta: "Choose Standard",
    href: "http://localhost:3001/login",
    highlight: false,
    outline: false,
  },
  {
    name: "AI Limited",
    price: "৳250",
    cadence: "/month",
    description: "AI assist, still human-in-control.",
    features: [
      "Everything in Standard",
      "AI categorisation suggestions",
      "Natural-language summaries",
      "Goal nudges & savings opportunities",
    ],
    cta: "Choose AI Limited",
    href: "http://localhost:3001/login",
    highlight: true,
    outline: false,
  },
  {
    name: "AI Max",
    price: "Custom",
    cadence: "",
    description: "For families and advisors who need more.",
    features: [
      "Everything in AI Limited",
      "Automated scenario planners",
      "Joint family dashboards",
      "Priority onboarding & support",
    ],
    cta: "Talk to us",
    href: "/contact",
    highlight: false,
    outline: true,
  },
] as const;

export function Pricing(): React.ReactNode {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-20">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-sm font-semibold text-primary">
          Straightforward pricing
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Local pricing that respects your wallet.
        </h2>
        <p className="text-muted-foreground max-w-2xl text-lg">
          One price for solo budgeters, flexible plans for households, and AI
          that guides without taking over.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={
              tier.highlight
                ? "border-primary/30 bg-primary/5 shadow-lg"
                : "border-border/70"
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                {tier.name}
                {tier.highlight ? (
                  <span className="rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </span>
                ) : null}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {tier.description}
              </CardDescription>
            </CardHeader>
            <Separator className="opacity-20" />
            <CardContent className="space-y-6 pt-6">
              <div>
                <span className="text-3xl font-semibold">{tier.price}</span>
                <span className="text-muted-foreground ml-1 text-base font-normal">
                  {tier.cadence}
                </span>
              </div>
              <ul className="grid gap-2 text-sm leading-relaxed">
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Button
                asChild
                className="w-full"
                variant={
                  tier.outline
                    ? "outline"
                    : tier.highlight
                      ? "default"
                      : "secondary"
                }
              >
                <Link href={tier.href} prefetch={false}>
                  {tier.cta}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-muted-foreground mt-8 text-center text-xs">
        Prices shown in BDT (৳). Global pricing starts at $3. Taxes may apply.
      </p>
    </section>
  );
}
