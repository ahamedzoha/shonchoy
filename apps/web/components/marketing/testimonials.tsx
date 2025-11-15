import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

const testimonials = [
  {
    quote:
      "Shonchoy finally respects how we budget in Dhaka—cash, bkash, and shared envelopes. Our surplus grew 18%.",
    name: "Raisa & Imran",
    role: "Dual-income household, Dhaka",
    initials: "RI",
  },
  {
    quote:
      "As a freelancer, my income swings wildly. The scenario tools help me plan fees, taxes, and tuition in one view.",
    name: "Tanvir",
    role: "Independent consultant, Sylhet",
    initials: "T",
  },
  {
    quote:
      "We track our parents’ medical fund and our own emergency savings in the same place without losing context.",
    name: "Sadia & Farhan",
    role: "Siblings managing a joint household, Chattogram",
    initials: "SF",
  },
];

export function Testimonials(): React.ReactNode {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-20">
      <div className="mb-10 flex flex-col gap-3">
        <span className="text-sm font-semibold text-primary">
          What early cohorts say
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Proof that manual-first can be delightful.
        </h2>
        <p className="text-muted-foreground max-w-3xl">
          From mid-career couples to multi-generational families, Shonchoy helps
          users stay disciplined without wrestling with foreign banking APIs.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.name} className="border-border/80 bg-background/80">
            <CardHeader className="flex flex-row items-center gap-3">
              <Avatar>
                <AvatarFallback>{t.initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{t.name}</CardTitle>
                <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground/80">
                  {t.role}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <blockquote className="text-sm leading-relaxed text-foreground">
                “{t.quote}”
              </blockquote>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
