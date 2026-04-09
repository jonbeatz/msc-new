import { RichText } from "@payloadcms/richtext-lexical/react"

type RichTextSection = {
  blockType: "richText"
  id?: string | number | null
  rowInstanceUid?: string | null
  sectionId?: string | null
  title?: string | null
  content?: unknown
}

type FeatureGridSection = {
  blockType: "featureGrid"
  id?: string | number | null
  rowInstanceUid?: string | null
  sectionId?: string | null
  title?: string | null
  items?: Array<{
    id?: string | number | null
    itemInstanceUid?: string | null
    icon?: string | null
    text?: string | null
  }> | null
}

type VideoPlayerSection = {
  blockType: "videoPlayer"
  id?: string | number | null
  rowInstanceUid?: string | null
  sectionId?: string | null
  title?: string | null
  videoUrl?: string | null
  videoFile?: {
    url?: string | null
  } | null
}

type PageSection = RichTextSection | FeatureGridSection | VideoPlayerSection

/** Brute-force unique keys: id + index + blockType (survives duplicate numeric ids from CMS). */
function sectionBlockKey(block: PageSection, index: number): string {
  const idPart =
    block.id !== undefined && block.id !== null ? String(block.id) : "noid"
  const t =
    typeof block.blockType === "string" ? block.blockType : "block"
  return `${idPart}-${index}-${JSON.stringify(t)}`
}

function normalizeUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl
  }
  return pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "")
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v")
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0]
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
    return null
  } catch {
    return null
  }
}

export function SectionsRenderer({ sections }: { sections: PageSection[] }) {
  if (!Array.isArray(sections) || sections.length === 0) return null

  return (
    <div className="space-y-8">
      {sections.map((block, index) => {
        const fallbackSectionId = `section-${index + 1}`
        const sectionId =
          typeof block.sectionId === "string" && block.sectionId.trim().length > 0
            ? block.sectionId.trim()
            : fallbackSectionId

        if (block.blockType === "richText") {
          const content = block.content && typeof block.content === "object" ? block.content : null
          if (!content) return null
          return (
            <section
              id={sectionId}
              key={sectionBlockKey(block, index)}
              className="rounded-2xl border border-[#D4AF37]/25 bg-[#0f1014] p-8 sm:p-10"
            >
              {block.title ? (
                <h2 className="mb-5 text-2xl font-semibold tracking-tight text-foreground">
                  {block.title}
                </h2>
              ) : null}
              <RichText
                className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-[#D4AF37] prose-a:no-underline hover:prose-a:text-[#e4c46b]"
                data={content as never}
              />
            </section>
          )
        }

        if (block.blockType === "featureGrid") {
          const items = Array.isArray(block.items) ? block.items : []
          return (
            <section
              id={sectionId}
              key={sectionBlockKey(block, index)}
              className="rounded-2xl border border-[#D4AF37]/25 bg-[#0f1014] p-8 sm:p-10"
            >
              {block.title ? (
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {block.title}
                </h2>
              ) : null}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {items.map((item, itemIndex) => {
                  const itemKey =
                    item.itemInstanceUid &&
                    String(item.itemInstanceUid).length > 0
                      ? `${sectionBlockKey(block, index)}-item-${item.itemInstanceUid}`
                      : item.id !== undefined && item.id !== null
                        ? `${sectionBlockKey(block, index)}-item-${String(item.id)}`
                        : `${sectionBlockKey(block, index)}-item-${itemIndex}`
                  return (
                    <div
                      key={itemKey}
                      className="rounded-xl border border-white/10 bg-black/20 p-4"
                    >
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">
                        {item.icon || "Feature"}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.text || ""}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        }

        if (block.blockType === "videoPlayer") {
          const url = typeof block.videoUrl === "string" ? block.videoUrl.trim() : ""
          const embedUrl = url ? getYouTubeEmbedUrl(url) : null
          const localUrl =
            block.videoFile &&
            typeof block.videoFile === "object" &&
            typeof block.videoFile.url === "string" &&
            block.videoFile.url.length > 0
              ? normalizeUrl(block.videoFile.url)
              : null

          return (
            <section
              id={sectionId}
              key={sectionBlockKey(block, index)}
              className="rounded-2xl border border-[#D4AF37]/25 bg-[#0f1014] p-8 sm:p-10"
            >
              {block.title ? (
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {block.title}
                </h2>
              ) : null}
              <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={block.title || "Embedded video"}
                  />
                ) : localUrl ? (
                  <video className="aspect-video w-full" controls preload="metadata">
                    <source src={localUrl} />
                  </video>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center text-sm text-muted-foreground">
                    Add a YouTube/Vimeo URL or select local media for this block.
                  </div>
                )}
              </div>
            </section>
          )
        }

        return null
      })}
    </div>
  )
}

