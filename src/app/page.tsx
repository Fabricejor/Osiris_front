import { Navbar } from "@/components/layout/Navbar";
import HeroBanner from "@/components/layout/Hero-banner";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--hero-background)] text-white selection:bg-[#7BC148] selection:text-white">
      <Navbar />
      <HeroBanner />
    </main>
  );
}
