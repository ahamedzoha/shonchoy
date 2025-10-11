import { FeatureCards } from "@/components/marketing/feature-cards";
import { Hero } from "@/components/marketing/hero";
import { Pricing } from "@/components/marketing/pricing";
import { Testimonials } from "@/components/marketing/testimonials";

export default function LandingPage(): React.ReactNode {
  return (
    <>
      <Hero />
      <FeatureCards />
      <Testimonials />
      <Pricing />
    </>
  );
}
