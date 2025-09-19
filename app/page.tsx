import Header from "@/components/header";
import { NewHeroSection } from "@/components/sections/home-page/new-hero-section";
import { WhySection } from "@/components/sections/home-page/why-section";
import { ProgramSection } from "@/components/sections/home-page/program-section";
import { ValuesSection } from "@/components/sections/home-page/values-section";
import { SupportSection } from "@/components/sections/home-page/support-section";
import { ResultsSection } from "@/components/sections/home-page/results-section";
import { TuitionSection } from "@/components/sections/home-page/tuition-section";
import { CtaSection } from "@/components/sections/home-page/cta-section";
import { NewFooterSection } from "@/components/sections/home-page/new-footer-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showNavbar />
      <main className="flex-1">
        <NewHeroSection />
        <WhySection />
        <ProgramSection />
        <ValuesSection />
        <SupportSection />
        <ResultsSection />
        <TuitionSection />
        <CtaSection />
      </main>
      <NewFooterSection />
    </div>
  );
}
