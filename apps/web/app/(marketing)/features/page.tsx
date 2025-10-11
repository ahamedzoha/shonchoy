import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { FeatureCards } from "@/components/marketing/feature-cards";

export const metadata: Metadata = {
  title: "Features | Shonchoy",
  description:
    "Manual-first budgeting, inflation-aware planning, and joint household tools for emerging markets.",
};

const valueProps = [
  {
    title: "Envelope budgeting without spreadsheets",
    description:
      "Allocate every taka with keyboard-friendly inputs, quick edits, and envelope rollovers that mimic how you budget in real life.",
  },
  {
    title: "Scenario planning for what-ifs",
    description:
      "Model salary dips, rising fuel costs, or tuition hikes. See the impact on surplus, goals, and net worth across timelines.",
  },
  {
    title: "Inflation and currency aware",
    description:
      "Track in BDT by default, add USD/GBP savings when needed, and set custom inflation to keep projections realistic.",
  },
  {
    title: "Offline-first PWA",
    description:
      "Open the app on low connectivity, record cash expenses, and sync when you’re back online — perfect for remote trips.",
  },
] as const;

export default function FeaturesPage(): React.ReactNode {
  return (
    <>
      <section className="container mx-auto max-w-4xl px-4 py-20">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to stay financially resilient.
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
          Shonchoy is engineered for families and professionals who manage money
          manually, share budgets, and plan around inflation.
        </p>
      </section>
      <FeatureCards />
      <section className="container mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {valueProps.map((item) => (
            <Card key={item.title} className="border-border/80">
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-foreground">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
