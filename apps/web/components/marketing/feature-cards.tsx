import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { ActivitySquare, Coins, Handshake, LineChart } from "lucide-react";

const features = [
  {
    title: "Manual-first, frictionless",
    description:
      "Keyboard shortcuts, CSV import, and envelope-style inputs make manual entry effortless, even on low bandwidth.",
    icon: ActivitySquare,
  },
  {
    title: "Inflation-aware planning",
    description:
      "Simulate rising costs and salary hikes to see the real value of your money over the next 5–10 years.",
    icon: LineChart,
  },
  {
    title: "Joint accounts & permissions",
    description:
      "Invite a partner or sibling, choose read-only or edit access, and keep everyone aligned on shared goals.",
    icon: Handshake,
  },
  {
    title: "BDT-first with multi-currency",
    description:
      "Work in taka by default, track USD/GBP savings, and record your own conversion rates whenever you need.",
    icon: Coins,
  },
] as const;

export function FeatureCards(): React.ReactNode {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-20">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-primary">
          Why households pick Shonchoy
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Built for emerging market realities, not Silicon Valley assumptions.
        </h2>
        <p className="text-muted-foreground max-w-3xl text-lg">
          Every feature helps you stretch every taka: handle cash income, manage
          surokkha funds, and plan confidently around unpredictable expenses.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {features.map(({ title, description, icon: Icon }) => (
          <Card
            key={title}
            className="relative h-full overflow-hidden border-border/80 bg-gradient-to-br from-background via-background to-primary/5"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="text-lg">{title}</CardTitle>
              </div>
            </CardHeader>
            <Separator className="opacity-10" />
            <CardContent className="text-muted-foreground pt-6 text-sm leading-relaxed">
              {description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
