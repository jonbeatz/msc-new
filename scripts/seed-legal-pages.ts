/**
 * Upserts Payload `pages` entries for Privacy Policy and Terms of Service
 * (slugs: privacy-policy, terms-of-service) with MSC1-style hero + Sections Builder rich text.
 *
 * Run from repo root:
 *   npm run seed:legal-pages
 *
 * Requires: page `msc1` exists (for hero image clone) OR any Media row as fallback.
 */

import path from "node:path"
import { fileURLToPath } from "node:url"
import { createJiti } from "jiti"
import { getPayload } from "payload"

const jiti = createJiti(import.meta.url)
const config = jiti(
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../payload.config.ts",
  ),
).default

type LexicalNode = Record<string, unknown>

function textNode(text: string): LexicalNode {
  return {
    type: "text",
    version: 1,
    text,
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
  }
}

function paragraph(text: string): LexicalNode {
  return {
    type: "paragraph",
    version: 1,
    indent: 0,
    format: "" as const,
    direction: "ltr" as const,
    children: [textNode(text)],
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
    children: [textNode(text)],
  }
}

function bulletList(items: string[]): LexicalNode {
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
      children: [textNode(item)],
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

function privacyPolicyLexical() {
  return richTextDocument([
    paragraph(
      "Last updated: see the date posted at the top of this page. My Studio Channel (“we,” “us,” or “our”) respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains what information we collect, how we use it, and the choices you have regarding your information.",
    ),
    heading("Information We Collect", "h2"),
    paragraph(
      "We may collect the following types of information when you visit our website or work with us:",
    ),
    heading("Personal Information You Provide", "h3"),
    bulletList([
      "Name",
      "Email address",
      "Phone number",
      "Business name",
      "Billing information (processed through PayPal — we do not store full card numbers on our servers)",
      "Files, links, images, videos, audio, and other assets you submit for your project",
    ]),
    heading("Automatically Collected Information", "h3"),
    bulletList([
      "IP address",
      "Browser type and device information",
      "Pages visited and time spent on the site",
      "Referring URLs",
    ]),
    paragraph(
      "This information is collected through standard analytics and website tools.",
    ),
    heading("How We Use Your Information", "h2"),
    bulletList([
      "Communicate with you about inquiries, projects, and services",
      "Deliver and manage Studio Channel services",
      "Process payments and invoices",
      "Schedule consulting calls and meetings",
      "Improve our website and services",
      "Maintain internal records and documentation",
    ]),
    paragraph("We do not sell, rent, or trade your personal information."),
    heading("Payments (PayPal)", "h2"),
    paragraph(
      "All payments are processed securely through PayPal. We do not store or have access to your full payment card details. PayPal’s own privacy policy and terms govern how your payment information is handled when you check out.",
    ),
    heading("File Uploads & Client Asset Ownership", "h2"),
    paragraph(
      "Any files, links, or materials you provide (including images, videos, audio, thumbnails, and written content) are used solely for the purpose of completing your project.",
    ),
    paragraph(
      "You retain ownership of your content. We do not reuse, distribute, or publish client assets without written permission.",
    ),
    heading("Cookies & Analytics", "h2"),
    paragraph("Our website may use cookies or similar technologies to:"),
    bulletList([
      "Understand how visitors use the site",
      "Improve functionality and performance",
    ]),
    paragraph(
      "You can disable cookies through your browser settings if you choose.",
    ),
    heading("Third-Party Services", "h2"),
    paragraph("We may use trusted third-party tools for:"),
    bulletList([
      "Scheduling (calendar tools)",
      "File storage and sharing",
      "Website hosting",
      "Analytics",
    ]),
    paragraph(
      "These providers only receive the information necessary to perform their services and are expected to handle data responsibly.",
    ),
    heading("Data Security", "h2"),
    paragraph(
      "We take reasonable steps to protect your information. However, no method of transmission over the internet or electronic storage is 100% secure. By using our site, you acknowledge this risk.",
    ),
    heading("Your Rights", "h2"),
    paragraph("You may request to:"),
    bulletList([
      "Access the personal information we have about you",
      "Correct or update your information",
      "Request deletion of your information (subject to legal and contractual obligations)",
    ]),
    paragraph(
      "Requests can be made by contacting us directly. For EU residents, you may request access, deletion, or corrections to your personal information.",
    ),
    heading("Children’s Privacy", "h2"),
    paragraph(
      "Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.",
    ),
    heading("Changes to This Policy", "h2"),
    paragraph(
      "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.",
    ),
    heading("Contact Us", "h2"),
    paragraph(
      "If you have questions about this Privacy Policy or how your information is handled, please contact us at:",
    ),
    paragraph("My Studio Channel"),
    paragraph("Email: Admin@MyStudioChannel.com"),
    paragraph("Phone: (336) 303-1658"),
  ])
}

function termsOfServiceLexical() {
  return richTextDocument([
    paragraph(
      "Last updated: see the date posted at the top of this page. By purchasing services, scheduling a call, or submitting payment, you agree to these Terms of Service.",
    ),
    heading("Governing Law", "h2"),
    paragraph(
      "This Agreement shall be governed by the laws of North Carolina for the Client and California for the Contractor (Jon), without regard to conflict of law provisions.",
    ),
    heading("Payment Schedule & PayPal", "h2"),
    paragraph("Payments are processed through PayPal only, as follows:"),
    bulletList([
      "50% non-refundable deposit to begin work",
      "25% due at the mid-project milestone",
      "25% due at launch / project completion",
    ]),
    paragraph(
      "Deposits are non-refundable. The remaining balance may be due if a project is terminated after work has begun, as described below.",
    ),
    heading("Revisions", "h2"),
    paragraph("Revision rounds are limited by package:"),
    bulletList([
      "Package 1 (Creator Launch): 2 revision rounds included",
      "Package 2 (Studio Pro and above in your proposal): 4 revision rounds included",
    ]),
    paragraph(
      "Additional revisions beyond the included rounds may be quoted and billed separately.",
    ),
    heading("Client Assets & Deliverables", "h2"),
    paragraph(
      "You agree to submit required materials in a timely manner, including images, thumbnails, video/audio links, written copy, branding assets, domain and hosting access, and other items specified in your proposal or onboarding checklist.",
    ),
    heading("Consulting Calls", "h2"),
    paragraph(
      "Consulting calls must be attended on a desktop or laptop browser for technical compatibility. A signed agreement may be required before certain work proceeds.",
    ),
    heading("Queue, Deadlines & Missed Assets", "h2"),
    paragraph(
      "Missed assets or missed deadlines may move your project to the back of the production queue. Meeting deadlines is important to protect your launch timeline.",
    ),
    heading("Termination & Kill Fee", "h2"),
    paragraph(
      "Deposits are non-refundable. If you terminate the project after work has begun, the remaining balance may be due in accordance with your signed agreement and the stage of work completed.",
    ),
    heading("Intellectual Property", "h2"),
    paragraph(
      "Clients own their content (e.g., media and copy they provide). Proprietary tools, frameworks, and internal workflows developed by My Studio Channel remain our property unless otherwise agreed in writing.",
    ),
    heading("Limitations", "h2"),
    paragraph(
      "We do not guarantee specific revenue, views, or third-party platform performance. We are not liable for outages or issues caused by third-party hosting, payment processors, or platforms outside our reasonable control.",
    ),
    heading("Third-Party Links", "h2"),
    paragraph(
      "Our site may contain links to third-party websites. We are not responsible for the content, policies, or practices of those sites.",
    ),
    heading("Changes to These Terms", "h2"),
    paragraph(
      "We may update these Terms from time to time. Revised Terms will be posted on this page. Continued use of the site or services after changes constitutes acceptance of the revised Terms.",
    ),
    heading("Contact", "h2"),
    paragraph(
      "For questions about these Terms, contact us at Admin@MyStudioChannel.com or (336) 303-1658.",
    ),
  ])
}

function resolveRelationId(
  val: number | { id?: number } | null | undefined,
): number | null {
  if (typeof val === "number") return val
  if (val && typeof val === "object" && typeof val.id === "number") return val.id
  return null
}

async function resolveHeroImageId(payload: Awaited<ReturnType<typeof getPayload>>): Promise<number | null> {
  const msc1 = await payload.find({
    collection: "pages",
    where: { slug: { equals: "msc1" } },
    limit: 1,
    depth: 1,
  })
  const hero = msc1.docs?.[0]?.pageHero
  if (hero && typeof hero === "object" && "image" in hero) {
    const id = resolveRelationId(
      hero.image as number | { id?: number } | null | undefined,
    )
    if (id != null) return id
  }

  const anyMedia = await payload.find({
    collection: "media",
    limit: 1,
    depth: 0,
    sort: "createdAt",
  })
  const mid = anyMedia.docs?.[0]?.id
  return typeof mid === "number" ? mid : null
}

function basePageHero(args: {
  imageId: number
  eyebrow: string
  line1: string
  line2: string
  line3: string
  sub: string
}) {
  return {
    enabled: true,
    image: args.imageId,
    eyebrow: args.eyebrow,
    headlineLine1: args.line1,
    headlineLine2: args.line2,
    headlineLine3: args.line3,
    sub: args.sub,
    buttons: {
      showPrimaryButton: false,
      primaryButtonAction: "lightbox" as const,
      primaryButtonLink: "",
      showSecondaryButton: false,
      secondaryButtonLabel: "View Demos",
      secondaryButtonLink: "/#msc-demos",
    },
  }
}

async function upsertLegalPage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  args: {
    slug: string
    title: string
    description: string
    metaTitle: string
    metaDescription: string
    pageHero: ReturnType<typeof basePageHero>
    sectionsLexical: ReturnType<typeof richTextDocument>
  },
) {
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: args.slug } },
    limit: 1,
    depth: 0,
  })

  const data = {
    title: args.title,
    slug: args.slug,
    description: args.description,
    meta: {
      title: args.metaTitle,
      description: args.metaDescription,
    },
    pageHero: args.pageHero,
    sections: [
      {
        blockType: "richText" as const,
        sectionId: "legal-body",
        title: "",
        content: args.sectionsLexical,
      },
    ],
    content: null,
  }

  const doc = existing.docs?.[0]
  if (doc?.id) {
    await payload.update({
      collection: "pages",
      id: doc.id,
      data: data as never,
      overrideAccess: true,
    })
    console.log(`[seed-legal-pages] Updated pages/${args.slug} (id=${doc.id})`)
  } else {
    const created = await payload.create({
      collection: "pages",
      data: data as never,
      overrideAccess: true,
    })
    console.log(
      `[seed-legal-pages] Created pages/${args.slug} (id=${created.id})`,
    )
  }
}

async function run() {
  const payload = await getPayload({ config })
  const imageId = await resolveHeroImageId(payload)
  if (imageId == null) {
    throw new Error(
      "No Media found and MSC1 has no hero image. Add a Media file or configure MSC1 hero first.",
    )
  }

  await upsertLegalPage(payload, {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description:
      "How My Studio Channel collects, uses, and protects your information — including PayPal payments and client asset ownership.",
    metaTitle: "Privacy Policy",
    metaDescription:
      "Privacy Policy for My Studio Channel: data practices, PayPal processing, cookies, third parties, and your rights.",
    pageHero: basePageHero({
      imageId,
      eyebrow: "Legal",
      line1: "Privacy",
      line2: "Policy",
      line3: "",
      sub: "How we handle your information when you use our website and services.",
    }),
    sectionsLexical: privacyPolicyLexical(),
  })

  await upsertLegalPage(payload, {
    slug: "terms-of-service",
    title: "Terms of Service",
    description:
      "Rules and conditions for using My Studio Channel services — payments (50/25/25), revisions, governing law, and project expectations.",
    metaTitle: "Terms of Service",
    metaDescription:
      "Terms of Service: PayPal payment schedule, revision limits, NC/CA governing law, assets, and limitations.",
    pageHero: basePageHero({
      imageId,
      eyebrow: "Legal",
      line1: "Terms",
      line2: "of Service",
      line3: "",
      sub: "Payment terms, revisions, governing law, and conditions for our creative services.",
    }),
    sectionsLexical: termsOfServiceLexical(),
  })

  console.log("[seed-legal-pages] Done. Open Admin → Pages to edit.")
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("[seed-legal-pages] Failed:", e)
    process.exit(1)
  })
