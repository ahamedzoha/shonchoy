import type { Metadata } from "next";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: {
    default: "Shonchoy — Personal Finance Co‑pilot",
    template: "%s | Shonchoy",
  },
  description:
    "Track spending, plan budgets, and grow savings—no spreadsheets, no stress.",
  openGraph: {
    title: "Shonchoy — Personal Finance Co‑pilot",
    description:
      "Track spending, plan budgets, and grow savings—no spreadsheets, no stress.",
    url: "http://localhost:3000/",
    siteName: "Shonchoy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shonchoy — Personal Finance Co‑pilot",
    description:
      "Track spending, plan budgets, and grow savings—no spreadsheets, no stress.",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
