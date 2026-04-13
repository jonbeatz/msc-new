import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPayload } from "payload"
import { RichText } from "@payloadcms/richtext-lexical/react"
import config from "@payload-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageJumpLinks } from "@/components/blocks/PageJumpLinks"
import { SectionsRenderer } from "@/components/blocks/SectionsRenderer"
import {
  PageHeroBanner,
  type PageHeroPrimary,
  type PageHeroSecondary,
} from "@/components/page-hero-banner"
import { getHeaderNavItems } from "@/lib/cms/header"
import { getSiteSettingsCms } from "@/lib/cms/site-settings"

function normalizeMediaSrc(pathOrUrl: string): string {
  if (
    pathOrUrl.startsWith("http://") ||
    pathOrUrl.startsWith("https://")
  ) {
    return pathOrUrl
  }
  return pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`
}

/** `pageHero` is a blocks field (0–1 rows); supports legacy group object shape during DB migration. */
function resolvePageHeroBlock(
  record: Record<string, unknown>,
): Record<string, unknown> | null {
  const ph = record.pageHero
  if (Array.isArray(ph) && ph.length > 0) {
    const first = ph[0]
    if (first && typeof first === "object") {
      return first as Record<string, unknown>
    }
    return null
  }
  if (ph && typeof ph === "object" && !Array.isArray(ph)) {
    return ph as Record<string, unknown>
  }
  return null
}

type PageHeroDoc = {
  enabled: boolean
  image: { url: string; alt: string } | null
  /** @deprecated legacy field; prefer buttons group */
  ctaLink?: string | null
  primary: PageHeroPrimary
  secondary: PageHeroSecondary
  eyebrow?: string | null
  headlineLine1?: string | null
  headlineLine2?: string | null
  headlineLine3?: string | null
  sub?: string | null
  seo?: {
    title?: string | null
    description?: string | null
    image?: { url: string } | null
  } | null
}

type PageDoc = {
  title?: string | null
  slug?: string | null
  description?: string | null
  meta?: {
    title?: string | null
    description?: string | null
  } | null
  content?: unknown
  pageHero?: PageHeroDoc | null
  sections?: unknown[]
}

type RouteProps = {
  params: Promise<{
    slug: string
  }>
}

async function getPageBySlug(slug: string): Promise<PageDoc | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: "pages",
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      depth: 2,
    })
    const raw = result.docs?.[0]
    if (!raw || typeof raw !== "object") return null

    const record = raw as unknown as Record<string, unknown>
    const rawMeta =
      record.meta && typeof record.meta === "object"
        ? (record.meta as Record<string, unknown>)
        : null
    const rawSections = Array.isArray(record.sections) ? record.sections : []

    let pageHero: PageHeroDoc | null = null
    const rawHero = resolvePageHeroBlock(record)
    if (rawHero) {
      const enabled = rawHero.enabled !== false
      let image: { url: string; alt: string } | null = null
      const rawHeroImg = rawHero.image
      if (rawHeroImg && typeof rawHeroImg === "object") {
        const urlVal = (rawHeroImg as { url?: string }).url
        if (typeof urlVal === "string" && urlVal.length > 0) {
          image = {
            url: normalizeMediaSrc(urlVal),
            alt:
              typeof (rawHeroImg as { alt?: string }).alt === "string"
                ? (rawHeroImg as { alt: string }).alt
                : "Hero image",
          }
        }
      }
      let seo: PageHeroDoc["seo"] = null
      const rawSeo =
        rawHero.seo && typeof rawHero.seo === "object"
          ? (rawHero.seo as Record<string, unknown>)
          : null
      if (rawSeo) {
        let seoImage: { url: string } | null = null
        const rawSeoImg = rawSeo.image
        if (rawSeoImg && typeof rawSeoImg === "object" && "url" in rawSeoImg) {
          const u = (rawSeoImg as { url?: string }).url
          if (typeof u === "string" && u.length > 0) {
            seoImage = { url: normalizeMediaSrc(u) }
          }
        }
        seo = {
          title:
            typeof rawSeo.title === "string" ? rawSeo.title : null,
          description:
            typeof rawSeo.description === "string"
              ? rawSeo.description
              : null,
          image: seoImage,
        }
      }
      const rawButtons =
        rawHero.buttons && typeof rawHero.buttons === "object"
          ? (rawHero.buttons as Record<string, unknown>)
          : null

      const legacyCta =
        typeof rawHero.ctaLink === "string" ? rawHero.ctaLink.trim() : ""

      const showPrimary =
        rawButtons == null || rawButtons.showPrimaryButton !== false
      const primaryAction: "lightbox" | "link" =
        rawButtons?.primaryButtonAction === "link" ? "link" : "lightbox"
      const primaryLinkRaw =
        typeof rawButtons?.primaryButtonLink === "string"
          ? rawButtons.primaryButtonLink.trim()
          : ""
      const primaryLink =
        primaryLinkRaw.length > 0
          ? primaryLinkRaw
          : legacyCta.length > 0
            ? legacyCta
            : "#msc-contact"

      const showSecondary =
        rawButtons == null || rawButtons.showSecondaryButton !== false
      const secondaryLabel =
        typeof rawButtons?.secondaryButtonLabel === "string" &&
        rawButtons.secondaryButtonLabel.trim().length > 0
          ? rawButtons.secondaryButtonLabel.trim()
          : "View Demos"
      const secondaryHref =
        typeof rawButtons?.secondaryButtonLink === "string" &&
        rawButtons.secondaryButtonLink.trim().length > 0
          ? rawButtons.secondaryButtonLink.trim()
          : "/#msc-demos"

      pageHero = {
        enabled,
        image,
        ctaLink:
          typeof rawHero.ctaLink === "string" ? rawHero.ctaLink : null,
        primary: {
          show: showPrimary,
          action: primaryAction,
          link: primaryLink,
        },
        secondary: {
          show: showSecondary,
          label: secondaryLabel,
          href: secondaryHref,
        },
        eyebrow:
          typeof rawHero.eyebrow === "string" ? rawHero.eyebrow : null,
        headlineLine1:
          typeof rawHero.headlineLine1 === "string"
            ? rawHero.headlineLine1
            : null,
        headlineLine2:
          typeof rawHero.headlineLine2 === "string"
            ? rawHero.headlineLine2
            : null,
        headlineLine3:
          typeof rawHero.headlineLine3 === "string"
            ? rawHero.headlineLine3
            : null,
        sub: typeof rawHero.sub === "string" ? rawHero.sub : null,
        seo,
      }
    }

    return {
      title: typeof record.title === "string" ? record.title : null,
      slug: typeof record.slug === "string" ? record.slug : null,
      description:
        typeof record.description === "string" ? record.description : null,
      meta: rawMeta
        ? {
            title: typeof rawMeta.title === "string" ? rawMeta.title : null,
            description:
              typeof rawMeta.description === "string"
                ? rawMeta.description
                : null,
          }
        : null,
      content: record.content,
      pageHero,
      sections: rawSections,
    }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params
  const [doc, settings] = await Promise.all([
    getPageBySlug(slug),
    getSiteSettingsCms(),
  ])

  if (!doc) {
    return {}
  }

  const siteName = settings?.siteName || "My Studio Channel"
  const titleSuffix =
    settings?.siteTitleSuffix && settings.siteTitleSuffix.trim().length > 0
      ? settings.siteTitleSuffix.trim()
      : `| ${siteName}`

  const seoTitle =
    (typeof doc.meta?.title === "string" && doc.meta.title.trim()) ||
    (typeof doc.title === "string" && doc.title.trim()) ||
    siteName
  const seoDescription =
    (typeof doc.meta?.description === "string" && doc.meta.description.trim()) ||
    (typeof doc.description === "string" && doc.description.trim()) ||
    settings?.tagline ||
    "My Studio Channel"

  const title = `${seoTitle} ${titleSuffix}`.trim()
  const hero = doc.pageHero
  const heroOg =
    hero?.seo?.image?.url != null &&
    typeof hero.seo.image.url === "string" &&
    hero.seo.image.url.length > 0
      ? normalizeMediaSrc(hero.seo.image.url)
      : null
  const ogImage = heroOg || settings?.ogImage || undefined

  return {
    title,
    description: seoDescription,
    icons: settings?.favicon
      ? {
          icon: settings.favicon,
          shortcut: settings.favicon,
          apple: settings.favicon,
        }
      : undefined,
    openGraph: {
      title,
      description: seoDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seoDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function DynamicPage({ params }: RouteProps) {
  const { slug } = await params
  const [doc, navItems, settings] = await Promise.all([
    getPageBySlug(slug),
    getHeaderNavItems(),
    getSiteSettingsCms(),
  ])

  if (!doc) {
    notFound()
  }

  const title = typeof doc.title === "string" && doc.title.trim().length > 0
    ? doc.title.trim()
    : "Untitled Page"
  const description =
    typeof doc.description === "string" && doc.description.trim().length > 0
      ? doc.description.trim()
      : settings?.tagline || "Professional creator platform content."
  const richContent = doc.content && typeof doc.content === "object" ? doc.content : null

  const ph = doc.pageHero
  const heroImage =
    ph?.enabled !== false && ph?.image?.url ? ph.image : null

  const headlineFallback1 =
    (ph?.headlineLine1 && ph.headlineLine1.trim()) || title
  const headline2 = ph?.headlineLine2?.trim() || ""
  const headline3 = ph?.headlineLine3?.trim() || ""
  const eyebrow =
    (ph?.eyebrow && ph.eyebrow.trim()) || "For Creators Who Want More"
  const heroSub = (ph?.sub && ph.sub.trim()) || description
  const stickyHeaderEnabled = settings?.stickyHeader !== false
  const pagePath = `/${slug}`

  return (
    <>
      <Header
        navItems={navItems}
        logoSrc={settings?.siteLogo}
        siteName={settings?.siteName || "My Studio Channel"}
        stickyHeader={stickyHeaderEnabled}
      />
      <main className="min-h-screen bg-background">
        <div className="overflow-x-clip">
      {heroImage ? (
        <PageHeroBanner
          image={heroImage}
          eyebrow={eyebrow}
          headline={[headlineFallback1, headline2, headline3]}
          sub={heroSub}
          currentPath={pagePath}
          primary={ph?.primary ?? { show: true, action: "lightbox", link: "#msc-contact" }}
          secondary={
            ph?.secondary ?? {
              show: true,
              label: "View Demos",
              href: "/#msc-demos",
            }
          }
          overline="My Studio Channel"
        />
      ) : (
        <section className="relative overflow-hidden border-b border-white/10 pt-32 pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.14),transparent_55%)]" />
          <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
              My Studio Channel
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-6 lg:px-8 py-16">
        {Array.isArray(doc.sections) && doc.sections.length > 0 ? (
          <PageJumpLinks sections={doc.sections as never} />
        ) : null}

        {Array.isArray(doc.sections) && doc.sections.length > 0 ? (
          <SectionsRenderer sections={doc.sections as never} />
        ) : null}

        {richContent ? (
          <article className="mt-8 rounded-2xl border border-[#D4AF37]/25 bg-[#0f1014] p-8 sm:p-10">
            <RichText
              className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-[#D4AF37] prose-a:no-underline hover:prose-a:text-[#e4c46b]"
              data={richContent as never}
            />
          </article>
        ) : Array.isArray(doc.sections) && doc.sections.length > 0 ? null : (
          <div className="mt-8 rounded-2xl border border-[#D4AF37]/25 bg-[#0f1014] p-8 sm:p-10">
            <h2 className="text-xl font-semibold text-foreground">Page Content Coming Soon</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Add content in the Pages collection Rich Text editor for
              <code className="ml-1 text-[#D4AF37]">/{slug}</code> to render full body content
              here.
            </p>
          </div>
        )}
      </section>

        <Footer
          logoSrc={settings?.siteLogo}
          siteName={settings?.siteName || "My Studio Channel"}
        />
        </div>
      </main>
    </>
  )
}
