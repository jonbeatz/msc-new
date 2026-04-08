import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import { getPayload } from "payload"
import { RichText } from "@payloadcms/richtext-lexical/react"
import config from "@payload-config"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageJumpLinks } from "@/components/blocks/PageJumpLinks"
import { SectionsRenderer } from "@/components/blocks/SectionsRenderer"
import { getHeaderNavItems } from "@/lib/cms/header"
import { getSiteSettingsCms } from "@/lib/cms/site-settings"

type PageDoc = {
  title?: string | null
  slug?: string | null
  description?: string | null
  meta?: {
    title?: string | null
    description?: string | null
  } | null
  content?: unknown
  featuredImage?: {
    url: string
    alt: string
  } | null
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

    const record = raw as Record<string, unknown>
    const rawMeta =
      record.meta && typeof record.meta === "object"
        ? (record.meta as Record<string, unknown>)
        : null
    const rawFeaturedImage =
      record.featuredImage && typeof record.featuredImage === "object"
        ? (record.featuredImage as Record<string, unknown>)
        : null
    const rawSections = Array.isArray(record.sections) ? record.sections : []

    const featuredImageUrl =
      rawFeaturedImage && typeof rawFeaturedImage.url === "string"
        ? rawFeaturedImage.url
        : null
    const featuredImageAlt =
      rawFeaturedImage && typeof rawFeaturedImage.alt === "string"
        ? rawFeaturedImage.alt
        : "Page hero image"

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
      featuredImage: featuredImageUrl
        ? {
            url: featuredImageUrl.startsWith("/")
              ? featuredImageUrl
              : `/${featuredImageUrl}`,
            alt: featuredImageAlt,
          }
        : null,
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
  const ogImage = settings?.ogImage || undefined

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

  return (
    <main className="min-h-screen bg-background">
      <Header
        navItems={navItems}
        logoSrc={settings?.siteLogo}
        siteName={settings?.siteName || "My Studio Channel"}
      />

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
          {doc.featuredImage ? (
            <div className="mt-8 overflow-hidden rounded-2xl border border-[#D4AF37]/50 bg-[#0f1014] p-2">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                <Image
                  src={doc.featuredImage.url}
                  alt={doc.featuredImage.alt}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 lg:px-8 py-16">
        {Array.isArray(doc.sections) && doc.sections.length > 0 ? (
          <PageJumpLinks sections={doc.sections as never} />
        ) : null}

        {Array.isArray(doc.sections) && doc.sections.length > 0 ? (
          <SectionsRenderer sections={doc.sections as never} />
        ) : null}

        {richContent ? (
          <article className="mt-10 rounded-2xl border border-[#D4AF37]/25 bg-[#0f1014] p-8 sm:p-10">
            <RichText
              className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-[#D4AF37] prose-a:no-underline hover:prose-a:text-[#e4c46b]"
              data={richContent as never}
            />
          </article>
        ) : (
          <div className="mt-10 rounded-2xl border border-[#D4AF37]/25 bg-[#0f1014] p-8 sm:p-10">
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
    </main>
  )
}

