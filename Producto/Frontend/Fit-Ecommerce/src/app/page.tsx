import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import ModelsSection from '../components/ModelsSection'
import FeaturesSection from '../components/FeaturesSection'
import ContactSection from '../components/ContactSection'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <ModelsSection />
      <FeaturesSection />
      <ContactSection />
      <Footer />
    </>
  )
}