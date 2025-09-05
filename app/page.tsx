import Header from "@/components/header";
import { HeroSection } from "@/components/sections/home-page/hero-section";
import { FooterSection } from "@/components/sections/home-page/footer-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showNavbar />
      <main className="flex-1">
        <HeroSection />
      </main>
      <FooterSection />
    </div>
  );
}
