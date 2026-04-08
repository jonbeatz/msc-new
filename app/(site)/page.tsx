import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { getHomepageCmsData } from "@/lib/cms/homepage"
import { getHeaderNavItems } from "@/lib/cms/header"
import { getDemoProjects } from "@/lib/cms/projects"
import { AboutSection } from "@/components/about-section"
import { ServicesSection } from "@/components/services-section"
import { OwnPlatformSection } from "@/components/own-platform-section"
import { PackagesSection } from "@/components/packages-section"
import { RequirementsSection } from "@/components/requirements-section"
import { DemosSection } from "@/components/demos-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { BuiltForCreatorsSection } from "@/components/built-for-creators-section"
import { WhatYouGetSection } from "@/components/what-you-get-section"
import { AddonsSection } from "@/components/addons-section"
import { ProcessSection } from "@/components/process-section"
import { FAQSection } from "@/components/faq-section"
import { PoliciesSection } from "@/components/policies-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default async function HomePage() {
  const { heroSlides, heroStats } = await getHomepageCmsData()
  const navItems = await getHeaderNavItems()
  const demoProjects = await getDemoProjects()

  return (
    <main className="min-h-screen bg-background">
      <Header navItems={navItems} />
      <HeroSection cmsSlides={heroSlides} cmsStats={heroStats} />
      <AboutSection />
      <ServicesSection />
      <OwnPlatformSection />
      <PackagesSection />
      <RequirementsSection />
      <DemosSection demos={demoProjects} />
      <TestimonialsSection />
      <BuiltForCreatorsSection />
      <WhatYouGetSection />
      <AddonsSection />
      <ProcessSection />
      <FAQSection />
      <PoliciesSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
