"use client"

import { Quote, Star } from "lucide-react"

const testimonials = [
  {
    quote: "I am thrilled to share my experience working with Yolando Brown. Her passion for her work shines through in everything she does. Her extensive knowledge and expertise in web development were invaluable, ensuring that our websites were not only visually stunning but also highly functional and user-friendly.",
    author: "Tige",
    role: "Non-Profit Founder",
    initials: "T",
    rating: 5,
  },
  {
    quote: "I am incredibly grateful for the invaluable assistance in creating and developing my website. Their expertise not only helped me build a stunning online presence but also provided exceptional business coaching. The insightful tips and practical tools shared were instrumental in launching my beauty business successfully.",
    author: "Melanie",
    role: "Makeup Artist/Stylist",
    initials: "M",
    rating: 5,
  },
  {
    quote: "My experience has been nothing but extraordinary. I needed help with my website that I couldn't put the finishing touches on. She was ready to take on the job, and fix my mess that I had created. She made my website and logo exactly how I imagined them. 5 stars isn't enough.",
    author: "Mrs. Hart",
    role: "Laundry Services Founder",
    initials: "H",
    rating: 5,
  },
  {
    quote: "The team was very professional and personable. The business is top-tier and she's a superstar. A very dedicated individual. I will continue to use her services for many years to come and will continue recommending the business to many friends and family!",
    author: "Kristina",
    role: "Client",
    initials: "K",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section 
      className="py-24 lg:py-32 relative bg-surface-0 msc-section msc-surface-0"
      data-divi-section="testimonials"
      data-divi-modules="testimonial-slider"
    >
      <div id="msc-testimonials" className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium uppercase tracking-wider text-accent">
              Testimonials
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            What Creators Are Saying
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Real results from creators we&apos;ve worked with.
          </p>
        </div>

        {/* Testimonials Bento Grid */}
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className={`bento-card relative rounded-3xl border border-border/50 p-6 lg:p-8 ${
                index === 0 ? "glass-card" : "bg-card/30"
              }`}
            >
              {/* Quote Icon - hidden on mobile to allow better centering */}
              <div className="hidden lg:block absolute top-6 right-6 lg:top-8 lg:right-8">
                <Quote className="h-8 w-8 text-accent/20" />
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center sm:justify-start gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Quote Text */}
              <blockquote className="text-muted-foreground leading-relaxed text-center text-sm sm:text-base">
                &quot;{testimonial.quote}&quot;
              </blockquote>

              {/* Author */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-border/50">
                <div className="h-12 w-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <span className="text-lg font-semibold text-accent">
                    {testimonial.initials}
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-semibold text-foreground">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
