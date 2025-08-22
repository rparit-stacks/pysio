import Hero from "./components/hero";
import HeroSlider from "./components/HeroSlider";
import Features from "./components/feature";
import Network from "./components/network";
import Stats from "./components/stats";
import Testimonials from "./components/testimonials";
import CTA from "./components/cta";
import Footer from "./components/footer";
import BlogsSection from "./components/blogs";
import IrelandPhysiotherapistMap from "./components/map";
import TherapistCTA from "./components/therapist-cta";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <HeroSlider />
        <Hero />
        <IrelandPhysiotherapistMap />
        <Features />
        <Network />
        <Stats />
        <BlogsSection />
        <Testimonials />
        <TherapistCTA />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}
