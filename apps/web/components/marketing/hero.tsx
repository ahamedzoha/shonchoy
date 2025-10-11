import Link from "next/link";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";

export function Hero(): React.ReactNode {
  return (
    <section className="container mx-auto grid gap-12 px-4 pb-20 pt-24 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-6">
        <Badge
          variant="outline"
          className="w-fit rounded-full border-primary/30 bg-primary/5 text-primary"
        >
          Built in Bangladesh, for the world
        </Badge>
        <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Manual-first money management that works where banks don’t.
        </h1>
        <p className="text-muted-foreground text-balance max-w-xl text-lg leading-relaxed">
          Shonchoy helps households in emerging markets stay ahead of inflation,
          variable income, and shared expenses. Track every taka, project your
          goals, and invite family members — all without broken bank connects.
        </p>
        <div className="flex flex-col items-start gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="http://localhost:3001/login" prefetch={false}>
              Log in to your finances
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="http://localhost:3001/register" prefetch={false}>
              Start a free month
            </Link>
          </Button>
        </div>
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <div>
            <p className="text-foreground text-base font-semibold">
              Inflation-aware
            </p>
            <p>Project real buying power with custom inflation assumptions.</p>
          </div>
          <div>
            <p className="text-foreground text-base font-semibold">
              Joint households
            </p>
            <p>
              Invite a partner or family member with role-based permissions.
            </p>
          </div>
          <div>
            <p className="text-foreground text-base font-semibold">
              Offline-ready PWA
            </p>
            <p>Track on the go — sync when you’re back online.</p>
          </div>
        </div>
      </div>
      <Card className="border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 shadow-xl">
        <CardContent className="space-y-5 px-6 py-8">
          <div>
            <p className="text-sm text-muted-foreground">
              Why teams switch to Shonchoy
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Designed for taka-first budgeting
            </h2>
          </div>
          <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="font-medium text-primary">
                “We removed 22% waste in two months.”
              </p>
              <p className="text-muted-foreground mt-2">
                Couples in Dhaka use Shonchoy to visualize envelopes and
                re-assign taka during high inflation months.
              </p>
            </div>
            <div className="rounded-lg border border-foreground/10 p-4">
              <p className="font-medium text-foreground">
                Plan ahead, even with variable income.
              </p>
              <p className="text-muted-foreground mt-2">
                Scenario builders simulate seasonal income dips, extra tuition,
                or a new EMIs before you commit.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-foreground/10 bg-background/80 p-4 text-sm">
            <p className="text-muted-foreground">
              “We tried US apps — the bank imports broke every week. Shonchoy
              finally respects how we budget here.”
            </p>
            <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
              Early adopter cohort · Chattogram, Bangladesh
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
