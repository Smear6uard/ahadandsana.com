import Accommodation from "@/components/public/Accommodation";
import Events from "@/components/public/Events";
import Footer from "@/components/public/Footer";
import GoldDivider from "@/components/public/GoldDivider";
import Hero from "@/components/public/Hero";
import RSVPSection from "@/components/public/RSVPSection";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <GoldDivider />
      <Events />
      <GoldDivider />
      <RSVPSection />
      <GoldDivider />
      <Accommodation />
      <GoldDivider />
      <Footer />
    </main>
  );
}
