"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type SectionLike = {
  sectionId?: string | null
  title?: string | null
}

type JumpLinkItem = {
  id: string
  title: string
}

export function PageJumpLinks({ sections }: { sections: SectionLike[] }) {
  const navListRef = useRef<HTMLUListElement | null>(null)
  const links = useMemo<JumpLinkItem[]>(() => {
    if (!Array.isArray(sections)) return []

    return sections
      .map((section) => {
        const id =
          typeof section.sectionId === "string" ? section.sectionId.trim() : ""
        const title =
          typeof section.title === "string" ? section.title.trim() : ""
        if (!id || !title) return null
        return { id, title }
      })
      .filter((item): item is JumpLinkItem => item !== null)
  }, [sections])

  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    if (links.length === 0) return

    const sectionElements = links
      .map((link) => document.getElementById(link.id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (sectionElements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0.2, 0.4, 0.6],
      },
    )

    sectionElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [links])

  useEffect(() => {
    if (!activeId || !navListRef.current) return
    const container = navListRef.current
    const activeLink = container.querySelector<HTMLAnchorElement>(
      `a[data-anchor-id="${activeId}"]`,
    )
    if (!activeLink) return

    const containerRect = container.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()
    const delta =
      linkRect.left -
      containerRect.left -
      containerRect.width / 2 +
      linkRect.width / 2

    container.scrollBy({
      left: delta,
      behavior: "smooth",
    })
  }, [activeId])

  if (links.length === 0) return null

  return (
    <nav className="mb-8 rounded-xl border border-[#D4AF37]/25 bg-[#0f1014]/95 px-3 py-3 sm:px-4 backdrop-blur-md">
      <ul
        ref={navListRef}
        className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm sm:gap-3"
      >
        {links.map((link, linkIndex) => {
          const isActive = activeId === link.id
          return (
            <li key={`${link.id}-${linkIndex}`}>
              <a
                href={`#${link.id}`}
                data-anchor-id={link.id}
                onClick={(event) => {
                  event.preventDefault()
                  const target = document.getElementById(link.id)
                  target?.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:text-sm ${
                  isActive
                    ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.2)]"
                    : "border-[#D4AF37]/30 text-[#D4AF37]/80 hover:border-[#D4AF37]/55 hover:bg-[#D4AF37]/8 hover:text-[#e3c66b]"
                }`}
              >
                {link.title}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

