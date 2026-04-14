import { unstable_noStore as noStore } from "next/cache"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { getHomepageCmsData } from "@/lib/cms/homepage"
import { getPublicOrigin } from "@/lib/public-origin"
import { getHeaderNavItems } from "@/lib/cms/header"
import { getDemoProjects } from "@/lib/cms/projects"
import { getSiteSettingsCms } from "@/lib/cms/site-settings"
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
  noStore()
  const {
    heroSlides,
    heroStats,
    isStylesVisible,
    programmingStyles,
    servicesGallery,
  } = await getHomepageCmsData()
  const servicesGalleryPublicOrigin = getPublicOrigin()
  const navItems = await getHeaderNavItems()
  const demoProjects = await getDemoProjects()
  const settings = await getSiteSettingsCms()
  const stickyHeaderEnabled = settings?.stickyHeader !== false

  return (
    <>
      <Header
        navItems={navItems}
        logoSrc={settings?.siteLogo}
        siteName={settings?.siteName || "My Studio Channel"}
        stickyHeader={stickyHeaderEnabled}
      />
      <main className="min-h-screen bg-background">
        {/* Horizontal clipping only below the header so it never breaks sticky/fixed stacking */}
        <div className="overflow-x-clip">
        <HeroSection
          cmsSlides={heroSlides}
          cmsStats={heroStats}
          stickyHeaderEnabled={stickyHeaderEnabled}
        />
        <AboutSection />
        <ServicesSection
          programmingStylesVisible={isStylesVisible}
          cmsProgrammingStyles={programmingStyles}
          cmsGallery={servicesGallery}
          servicesGalleryPublicOrigin={servicesGalleryPublicOrigin}
        />
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
        <Footer
          logoSrc={settings?.siteLogo}
          siteName={settings?.siteName || "My Studio Channel"}
        />
        </div>
      </main>
    </>
  )
}
