"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Why does pricing start at $5,800?",
    answer: "This includes professional video setup, custom plugin installation, consulting, and studio-style layout work. Each platform is built with care to ensure it meets professional network standards.",
  },
  {
    question: "Do I own my website and content?",
    answer: "Yes. You fully own your site and all content. Unlike platforms that charge monthly fees and hold your content hostage, your platform is built for you to own and operate independently forever.",
  },
  {
    question: "Do you provide hosting or domains?",
    answer: "No, but we assist with setup and provide recommendations for reliable hosting providers. This keeps you in control of your infrastructure and costs.",
  },
  {
    question: "Do you host videos?",
    answer: "No, we connect your videos using professional players or platforms like Bunny.net. This gives you flexibility and control over your video hosting costs and performance.",
  },
  {
    question: "What if I don't have thumbnails or artwork?",
    answer: "Thumbnail and artwork creation is available as an add-on service. We can create professional thumbnails, show artwork, and promotional graphics that match your brand.",
  },
  {
    question: "What do I need for consulting calls?",
    answer: "Consulting calls must be attended on a desktop or laptop browser for optimal screen sharing. Mobile devices and tablets are not supported for these sessions.",
  },
]

export function FAQSection() {
  return (
    <section 
      className="py-24 lg:py-32 relative bg-surface-0 msc-section msc-surface-0"
      data-divi-section="faq"
      data-divi-modules="accordion"
    >
      <div id="msc-faq" className="relative mx-auto max-w-4xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium uppercase tracking-wider text-accent">
              FAQ
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Common Inquiries
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Find answers to the most frequently asked questions about our services and processes.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="bento-card glass-card rounded-3xl border border-border/50 p-6 lg:p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="border-border/50 last:border-b-0"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-accent hover:no-underline py-5 text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
