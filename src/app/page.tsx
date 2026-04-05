import Accommodation from "@/components/public/Accommodation";
import DateBanner from "@/components/public/DateBanner";
import Details from "@/components/public/Details";
import Footer from "@/components/public/Footer";
import GoldDivider from "@/components/public/GoldDivider";
import Hero from "@/components/public/Hero";
import RSVPSection from "@/components/public/RSVPSection";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <DateBanner />
      <RSVPSection />
      <GoldDivider />
      <Details />
      <GoldDivider />
      <Accommodation />
      <GoldDivider />
      <Footer />
    </main>
  );
}
