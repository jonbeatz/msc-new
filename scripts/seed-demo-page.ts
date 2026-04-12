import { getPayload } from "payload"
import config from "@payload-config"

type LexicalNode = Record<string, unknown>

function paragraph(text: string): LexicalNode {
  return {
    type: "paragraph",
    version: 1,
    indent: 0,
    format: "" as const,
    direction: "ltr" as const,
    children: [
      {
        type: "text",
        version: 1,
        text,
        detail: 0,
        format: 0,
        mode: "normal",
        style: "",
      },
    ],
  }
}

function heading(text: string, tag: "h2" | "h3"): LexicalNode {
  return {
    type: "heading",
    version: 1,
    indent: 0,
    format: "" as const,
    direction: "ltr" as const,
    tag,
    children: [
      {
        type: "text",
        version: 1,
        text,
        detail: 0,
        format: 0,
        mode: "normal",
        style: "",
      },
    ],
  }
}

function list(items: string[]): LexicalNode {
  return {
    type: "list",
    version: 1,
    listType: "bullet",
    start: 1,
    tag: "ul",
    children: items.map((item) => ({
      type: "listitem",
      version: 1,
      value: 1,
      indent: 0,
      format: "" as const,
      direction: "ltr" as const,
      children: [
        {
          type: "text",
          version: 1,
          text: item,
          detail: 0,
          format: 0,
          mode: "normal",
          style: "color:#D4AF37;",
        },
      ],
    })),
  }
}

function richTextDocument(nodes: LexicalNode[]) {
  return {
    root: {
      type: "root",
      version: 1,
      format: "" as const,
      indent: 0,
      direction: "ltr" as const,
      children: nodes,
    },
  }
}

async function run() {
  const payload = await getPayload({ config })

  const pageResult = await payload.find({
    collection: "pages",
    where: {
      slug: {
        equals: "msc1",
      },
    },
    limit: 1,
    depth: 0,
    pagination: false,
  })

  const page = pageResult.docs?.[0]
  if (!page) {
    throw new Error('Could not find page with slug "msc1".')
  }

  await payload.update({
    collection: "pages",
    id: page.id,
    data: {
      sections: [
        {
          blockType: "richText",
          sectionId: "studio",
          title: "The Studio",
          content: richTextDocument([
            heading("Welcome to the MSC Studio Experience", "h2"),
            paragraph(
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam, in vehicula eros tincidunt quis."
            ),
            paragraph(
              "Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus."
            ),
            list([
              "Deliver studio-grade creator platforms with premium visual standards.",
              "Design resilient media workflows that scale with audience demand.",
              "Unify production, brand storytelling, and audience growth into one system.",
            ]),
          ]),
        },
        {
          blockType: "videoPlayer",
          sectionId: "tour",
          title: "Virtual Tour",
          videoUrl: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
        },
        {
          blockType: "featureGrid",
          sectionId: "solutions",
          title: "Our Solutions",
          items: [
            { icon: "mic", text: "Podcast Production" },
            { icon: "video", text: "Live Streaming" },
            { icon: "layers", text: "Set Design" },
            { icon: "film", text: "Post-Production" },
            { icon: "sparkles", text: "Brand Strategy" },
            { icon: "users", text: "Audience Growth" },
          ],
        },
        {
          blockType: "videoPlayer",
          sectionId: "case-study",
          title: "Case Study",
          videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        },
        {
          blockType: "richText",
          sectionId: "booking",
          title: "Get Started",
          content: richTextDocument([
            heading("Ready to Launch Your Creator Platform?", "h3"),
            paragraph(
              "Share your vision with our team, outline your goals, and schedule your strategy call. We will map your content workflow, branding direction, and technical stack so you can move from concept to launch with confidence."
            ),
          ]),
        },
      ],
    },
    depth: 0,
  })

  console.log("Successfully seeded MSC1 demo content")
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[seed-demo-page] Failed:", error)
    process.exit(1)
  })

