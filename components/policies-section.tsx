"use client"

import { FileText, CreditCard, Clock, Users, RefreshCw, Monitor, MessageSquare } from "lucide-react"

const policies = [
  {
    icon: FileText,
    title: "Signed Agreement Required",
    description:
      "A signed agreement is required before project commencement. This protects both you and our team and ensures all terms are clearly understood before work begins.",
  },
  {
    icon: CreditCard,
    title: "Payment via PayPal Only",
    description:
      "Payment is accepted via PayPal only. A 50% non-refundable deposit is required to begin work. The remaining balance is paid in two installments: 25% mid-project and 25% prior to launch.",
  },
  {
    icon: Clock,
    title: "Materials Submitted Before Work Begins",
    description:
      "All required content, assets, and materials must be submitted before your project can begin. Delays in submission may impact your project timeline.",
  },
  {
    icon: Users,
    title: "Client Responsibility for Accuracy",
    description:
      "Clients are responsible for providing accurate and complete materials, including text, images, video links, and branding elements.",
  },
  {
    icon: RefreshCw,
    title: "Revisions Are Package-Based",
    description:
      "Revisions are limited to the terms of the selected package. Additional revisions beyond what is included may require an additional fee.",
  },
  {
    icon: Monitor,
    title: "Consulting Calls on Desktop Only",
    description:
      "Consulting calls must be attended on a desktop or laptop using a web browser. Mobile devices and tablets are not supported for screen sharing sessions.",
  },
  {
    icon: MessageSquare,
    title: "72-Hour Response Window",
    description:
      "All communication and approvals must be completed within 72 hours to keep the project on schedule. Delays in response may result in adjustments to the project timeline.",
  },
]

export function PoliciesSection() {
  return (
    <section 
      className="py-24 lg:py-32 relative bg-surface-2 msc-section msc-surface-2"
      data-divi-section="policies"
      data-divi-modules="blurb"
    >
      <div id="msc-policies" className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium uppercase tracking-wider text-accent">
              Policies
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Policies &amp; Requirements
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            To begin your Studio Channel project, please review the following policies. 
            Understanding these ensures a smooth, on-schedule build from start to launch.
          </p>
        </div>

        {/* Policies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {policies.slice(0, 6).map((policy) => (
            <div
              key={policy.title}
              className="bento-card group rounded-2xl border border-border/50 bg-card/30 hover:bg-card/50 p-6 lg:p-8 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center mb-5 group-hover:bg-accent/10 group-hover:border-accent/20 transition-all duration-300">
                <policy.icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground mb-3 leading-snug">
                {policy.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {policy.description}
              </p>
            </div>
          ))}
        </div>

        {/* 7th policy - full-width highlighted card */}
        {(() => {
          const lastPolicy = policies[6]
          const LastIcon = lastPolicy.icon
          return (
            <div className="mt-4 lg:mt-6">
              <div className="bento-card glass-card rounded-2xl border border-accent/20 bg-accent/5 p-6 lg:p-8">
                <div className="flex items-start gap-5">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <LastIcon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{lastPolicy.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                      {lastPolicy.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </section>
  )
}
