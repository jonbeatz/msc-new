"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 0.5
      setVisible(window.scrollY > threshold)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={scrollTop}
      className={cn(
        "fixed bottom-6 right-6 z-90 flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-background/90 text-[#D4AF37] shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-[#D4AF37]/15 hover:border-[#D4AF37]",
        visible ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4",
      )}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
    </button>
  )
}
