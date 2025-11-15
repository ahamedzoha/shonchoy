import type { Metadata } from "next";

import { Pricing } from "@/components/marketing/pricing";

export const metadata: Metadata = {
  title: "Pricing | Shonchoy",
  description:
    "Simple plans in BDT. Standard ৳99, AI Limited ৳250, AI Max custom.",
};

export default function PricingPage(): React.ReactNode {
  return <Pricing />;
}
