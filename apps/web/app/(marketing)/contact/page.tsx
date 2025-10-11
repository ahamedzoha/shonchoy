import type { Metadata } from "next";

import {
  ContactDetailsCard,
  ContactFormCard,
  ContactIntro,
} from "@/components/marketing/contact-touchpoints";

export const metadata: Metadata = {
  title: "Contact | Shonchoy",
  description:
    "Questions about pricing, NGO partnerships, or product demos? Reach our team.",
};

export default function ContactPage(): React.ReactNode {
  return (
    <section className="container mx-auto max-w-5xl px-4 py-20">
      <div className="mb-10">
        <ContactIntro />
      </div>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <ContactFormCard />
        <ContactDetailsCard />
      </div>
    </section>
  );
}
