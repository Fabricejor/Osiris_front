import { Navbar } from "@/components/layout/Navbar";
import HeroBanner from "@/components/layout/Hero-banner";
import Features from "@/components/layout/Features";
import HowItWork from "@/components/layout/HowItWork";
import DataSecure from "@/components/layout/DataSecure";
import Advantages from "@/components/layout/Advantages";
import LauchPlateformBanner from "@/components/layout/LauchPlateformBanner";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--hero-background)] text-white selection:bg-[#7BC148] selection:text-white flex flex-col">
      <Navbar />
      <HeroBanner />
      <Features />
      <HowItWork />
      <DataSecure />
      <Advantages />
      <LauchPlateformBanner />
      <Footer />
    </main>
  );
}

