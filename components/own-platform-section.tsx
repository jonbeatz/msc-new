"use client"

import Image from "next/image"
import { Shield, Users, Rocket, MessageSquare, BookOpen, Layers, Video, Mic, Layout, Lock, FolderKanban, GraduationCap } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "No Platform Lock-in",
    description: "Your platform is built for you to own and operate independently. No monthly subscriptions, no per-subscriber fees."
  },
  {
    icon: Users,
    title: "You Control Everything",
    description: "You control the content. You control your audience. You control how it grows."
  },
  {
    icon: Rocket,
    title: "Built With You",
    description: "Every project is built with you involved in the process. You will meet with us, see the progress, and understand how your platform works before it launches."
  }
]

const supportItems = [
  { icon: MessageSquare, label: "Live virtual consulting sessions during development" },
  { icon: Users, label: "Direct communication with the people building your site" },
  { icon: Layers, label: "Custom plugin development for your platform" }
]

const tutorialItems = [
  { icon: BookOpen, label: "Built-in tutorials inside your website" },
  { icon: GraduationCap, label: "Guided walkthrough after launch" },
  { icon: Shield, label: "Revision rounds during development" }
]

const ecosystemItems = [
  { icon: Video, label: "Video libraries" },
  { icon: Mic, label: "Podcast or talk show episodes" },
  { icon: Layout, label: "Streaming-style layouts" },
  { icon: Lock, label: "Membership access if needed" },
  { icon: FolderKanban, label: "Content categories and collections" }
]

export function OwnPlatformSection() {
  return (
    <section 
      className="py-32 relative overflow-hidden bg-surface-2 msc-section msc-surface-2"
      data-divi-section="own-platform"
      data-divi-modules="text,blurb,image"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[100px]" />
      </div>

      <div id="msc-own-platform" className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        {/* Section Header with Image */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-accent/30 mb-6">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">True Ownership</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Own Your Platform
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
              A professional streaming-style website built for you one time. No platform lock-in, no monthly subscriptions, and no per-subscriber fees.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Unlike many creator platforms that charge monthly fees and additional costs for every subscriber, your platform is built for you to own and operate independently.
            </p>
          </div>
          
          {/* Image - section-My-Studio-Channel-.png */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden border border-border/50 relative aspect-[4/3]">
              <Image
                src="/media/own-platform.jpg"
                alt="Professional film crew with camera and clapperboard"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="glass rounded-xl p-4">
                  <p className="text-sm font-medium text-foreground">Once complete, the platform belongs to you</p>
                  <p className="text-xs text-muted-foreground mt-1">No hidden fees or platform restrictions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group glass-card rounded-2xl p-8 border border-border/50 hover:border-accent/30 transition-all duration-500 hover:glow-accent-sm"
            >
              <div className="h-14 w-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Bento Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Support Card */}
          <div className="glass-card rounded-2xl p-8 border border-border/50 hover:border-accent/30 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Our Support</h3>
            </div>
            <div className="space-y-4">
              {supportItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tutorials Card */}
          <div className="glass-card rounded-2xl p-8 border border-border/50 hover:border-accent/30 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Built-in Tutorials</h3>
            </div>
            <div className="space-y-4">
              {tutorialItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ecosystem Card */}
          <div className="glass-card rounded-2xl p-8 border border-border/50 hover:border-accent/30 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Layers className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Your Own Ecosystem</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Your website is built so your content can grow without platform restrictions:</p>
            <div className="space-y-3">
              {ecosystemItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-secondary/50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Community Banner */}
        <div className="mt-12 glass-card rounded-2xl p-6 sm:p-8 md:p-10 border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Ongoing Learning Community</h3>
                <p className="text-muted-foreground">As your audience grows, your platform grows with you. Every My Studio Channel client receives free access to our creator community.</p>
              </div>
            </div>
            <div className="flex-shrink-0 flex justify-center md:justify-end">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-sm font-medium text-accent">Free Access Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
