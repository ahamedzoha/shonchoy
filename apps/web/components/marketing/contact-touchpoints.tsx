import Link from "next/link";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";

export function ContactIntro(): React.ReactNode {
  return (
    <div className="space-y-4">
      <Badge
        variant="outline"
        className="rounded-full border-primary/30 text-primary"
      >
        We reply within 1 business day
      </Badge>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Talk to the Shonchoy team
      </h1>
      <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
        Whether you’re a household exploring AI Max, an NGO planning literacy
        programs, or a creator reviewing the product — we’d love to hear from
        you.
      </p>
    </div>
  );
}

export function ContactFormCard(): React.ReactNode {
  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle>Send us a message</CardTitle>
        <CardDescription>
          Fill out the form and we’ll schedule the right walkthrough or share
          the partnership deck.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input placeholder="Your full name" />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="you@example.com" />
            <FieldDescription>
              We’ll only use this to respond to your enquiry.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Organization (optional)</FieldLabel>
            <Input placeholder="Household, NGO, or company" />
          </Field>
          <Field>
            <FieldLabel>What should we know?</FieldLabel>
            <Textarea
              placeholder="Tell us about your goals, current tools, or partnership ideas."
              rows={4}
            />
          </Field>
          <Button type="submit" disabled>
            Send message
          </Button>
          <p className="text-muted-foreground text-xs">
            Form submissions are coming soon. Email us directly and we’ll
            respond within 24 hours.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export function ContactDetailsCard(): React.ReactNode {
  return (
    <Card className="border-border/80 bg-muted/30">
      <CardHeader>
        <CardTitle>Reach us directly</CardTitle>
        <CardDescription>
          Prefer your own email or messaging workflow? Use the channels below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="text-muted-foreground">Email</p>
          <Link
            href="mailto:hello@shonchoy.finance"
            className="text-foreground underline"
          >
            hello@shonchoy.finance
          </Link>
        </div>
        <div>
          <p className="text-muted-foreground">Community beta</p>
          <Link href="#" className="text-foreground underline">
            Join the WhatsApp group
          </Link>
        </div>
        <div>
          <p className="text-muted-foreground">For NGOs & universities</p>
          <p>
            We run financial literacy programs with ready-made curricula. Ping
            us for session templates and pricing.
          </p>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-xs">
          <p className="font-medium text-primary">Shonchoy HQ</p>
          <p className="text-muted-foreground">
            Remote-first across Bangladesh. We host community meetups in Dhaka
            every quarter — come say hi!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
