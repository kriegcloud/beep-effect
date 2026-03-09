"use client"

import type { CSSProperties, MouseEvent } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/cn"
import { useFootnoteContext } from "@/lib/footnote-context"

interface TocItem {
  id: string
  title: string
  level: 2 | 3
  offsetY: number
}

interface DocTocSidebarProps {
  className?: string
  style?: CSSProperties
  title?: string
}

const SIDEBAR_TOP = 64 // px offset from top (matches desired bar height)
const FOOTER_HEIGHT = 64 // sticky footer height
const RAIL_INSET = 24 // px padding above/below the rail

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max)

export function DocTocSidebar({ className, style, title: _title }: DocTocSidebarProps) {
  const { article } = useFootnoteContext()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLElement | null>(null)
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [articleTop, setArticleTop] = useState(0)
  const [articleHeight, setArticleHeight] = useState(1)
  const [sidebarHeight, setSidebarHeight] = useState(0)
  const [viewportRange, setViewportRange] = useState<{
    start: number
    end: number
  }>({
    start: 0,
    end: 0,
  })
  const [isHoveringNearby, setIsHoveringNearby] = useState(false)

  useEffect(() => {
    const measure = () => {
      const top = containerRef.current?.getBoundingClientRect().top ?? SIDEBAR_TOP
      const footerEl = footerRef.current ?? (document.querySelector("footer") as HTMLElement | null)
      footerRef.current = footerEl
      const footerHeight = footerEl?.getBoundingClientRect().height ?? FOOTER_HEIGHT

      const availableHeight = window.innerHeight - top - footerHeight
      setSidebarHeight(Math.max(availableHeight, 0))
    }

    measure()

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null
    if (containerRef.current && resizeObserver) {
      resizeObserver.observe(containerRef.current)
    }
    if (!footerRef.current) {
      footerRef.current = (document.querySelector("footer") as HTMLElement | null) ?? null
    }
    if (footerRef.current && resizeObserver) {
      resizeObserver.observe(footerRef.current)
    }

    window.addEventListener("resize", measure)
    return () => {
      window.removeEventListener("resize", measure)
      resizeObserver?.disconnect()
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const sidebarElement = document.querySelector('[aria-label="On this page"]')
      if (!sidebarElement) {
        setIsHoveringNearby(false)
        return
      }

      const rect = sidebarElement.getBoundingClientRect()
      const mouseX = e.clientX
      const sidebarLeft = rect.left
      const sidebarRight = rect.right
      const hoverDistance = 150

      // Check if mouse is within 150px of the sidebar (left or right side)
      const isNearby =
        (mouseX >= sidebarLeft - hoverDistance && mouseX <= sidebarLeft) ||
        (mouseX >= sidebarLeft && mouseX <= sidebarRight) ||
        (mouseX >= sidebarRight && mouseX <= sidebarRight + hoverDistance)

      setIsHoveringNearby(isNearby)
    }

    const handleMouseLeave = () => {
      setIsHoveringNearby(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (!article) {
      setItems([])
      return
    }

    const articleRect = article.getBoundingClientRect()
    const top = articleRect.top + window.scrollY
    const height = Math.max(article.scrollHeight, 1)
    setArticleTop(top)
    setArticleHeight(height)

    const headingNodes = Array.from(article.querySelectorAll<HTMLElement>("h2, h3"))

    const parsed: TocItem[] = headingNodes
      .map((node) => {
        const text = node.textContent?.trim() ?? ""
        if (!text) return null

        const level = Number.parseInt(node.tagName.replace("H", ""), 10)
        if (level !== 2 && level !== 3) return null

        if (!node.id) {
          node.id = slugify(text)
        }

        const nodeRect = node.getBoundingClientRect()
        const offsetY = nodeRect.top + window.scrollY - top

        return { id: node.id, title: text, level, offsetY }
      })
      .filter((value): value is TocItem => value !== null)

    setItems(parsed)
  }, [article])

  useEffect(() => {
    if (items.length === 0) {
      setActiveId(null)
      return
    }

    const headingElements = items.map((item) => {
      const el = document.getElementById(item.id)
      return el ?? null
    })

    const SNAP_OFFSET = 120

    const update = () => {
      // Active id
      let current: string | null = headingElements[0]?.id ?? null
      for (const element of headingElements) {
        if (!element) continue
        const top = element.getBoundingClientRect().top
        if (top - SNAP_OFFSET <= 0) {
          current = element.id
        } else {
          break
        }
      }
      setActiveId((previous) => (previous === current ? previous : current))

      // Visible window band
      const rawStart = (window.scrollY - articleTop) / articleHeight
      const rawEnd = (window.scrollY + window.innerHeight - articleTop) / articleHeight
      const bandPercent = (rawEnd - rawStart) * 100

      let startPerc = clamp(rawStart * 100)
      let endPerc = startPerc + bandPercent

      // If the end is clamped to the bottom, slide the band up so it keeps
      // a consistent visible size instead of shrinking.
      if (endPerc > 100) {
        const overflow = endPerc - 100
        endPerc = 100
        startPerc = Math.max(startPerc - overflow, 0)
      }

      setViewportRange({
        start: startPerc,
        end: Math.max(endPerc, startPerc + 2),
      })
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)

    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [items, articleTop, articleHeight])

  const railInset = RAIL_INSET // px padding above/below the rail for symmetry
  const rawRailHeight = Math.max(sidebarHeight - railInset * 2, 0)
  const overflow = Math.max(railInset * 2 + rawRailHeight - sidebarHeight, 0)
  const railHeight = Math.max(rawRailHeight - overflow, 0)

  const handleClick = useCallback(
    (id: string) => (event: MouseEvent) => {
      event.preventDefault()
      const target = document.getElementById(id)
      if (!target) return

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

      const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth"

      // Use scroll-margin on headings for consistent offset from the sticky header.
      target.scrollIntoView({ behavior, block: "start" })

      // Always set the hash so headings are linkable/bookmarkable.
      if (history.replaceState) {
        history.replaceState(null, "", `#${id}`)
      } else {
        window.location.hash = id
      }
    },
    [],
  )

  const renderedItems = useMemo(() => {
    const lineInset = railInset
    const lineHeight = railHeight
    const gapHeight = 14 // px gap carved out of the spine
    const minDotPercent = (gapHeight / 2 / lineHeight) * 100
    const maxDotPercent = 100 - minDotPercent
    const minSpacingPx = 20 // minimum pixels between item centers

    const renderItem = (
      id: string,
      itemTitle: string,
      percent: number,
      isActive: boolean,
      onClick: (event: MouseEvent) => void,
      showDot = true,
      showGap = true,
    ) => {
      const y = lineInset + (percent / 100) * lineHeight
      const labelOffset = 20
      return (
        <div key={id}>
          {showGap && (
            <div
              className="absolute left-6 -translate-x-1/2 w-[6px] bg-neutral-950"
              style={{
                top: `${y - gapHeight / 2}px`,
                height: `${gapHeight}px`,
              }}
              aria-hidden
            />
          )}
          <button
            type="button"
            onClick={onClick}
            className="group absolute left-6 -translate-x-1/2 -translate-y-1/2 flex items-center focus:outline-none bg-transparent"
            style={{ top: `${y}px` }}
            aria-label={itemTitle}
          >
            {showDot && (
              <span
                className={cn(
                  "block h-[2px] w-[2px] bg-neutral-50 transition-none",
                  isActive ? "opacity-100" : "opacity-60",
                )}
              />
            )}
            <span
              className={cn(
                "absolute top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-neutral-100 whitespace-nowrap text-left transition-none",
                isHoveringNearby ? "opacity-40 group-hover:opacity-100" : "opacity-0",
              )}
              style={{ left: `${labelOffset}px` }}
            >
              {itemTitle}
            </span>
          </button>
        </div>
      )
    }

    // Calculate raw positions first
    const rawPositions = items.map((item) => ({
      item,
      percent: clamp((item.offsetY / articleHeight) * 100, minDotPercent, maxDotPercent),
    }))

    // Apply collision avoidance: push items down if they're too close
    const adjustedPositions: { item: TocItem; percent: number }[] = []
    const minSpacingPercent = (minSpacingPx / lineHeight) * 100

    for (const pos of rawPositions) {
      let adjustedPercent = pos.percent

      // Check against all previously placed items
      for (const placed of adjustedPositions) {
        const distance = adjustedPercent - placed.percent
        if (distance >= 0 && distance < minSpacingPercent) {
          // Too close below a previous item; push down
          adjustedPercent = placed.percent + minSpacingPercent
        }
      }

      // Clamp to max
      adjustedPercent = Math.min(adjustedPercent, maxDotPercent)

      adjustedPositions.push({ item: pos.item, percent: adjustedPercent })
    }

    const allItems: React.ReactNode[] = []

    for (const { item, percent } of adjustedPositions) {
      const isActive = activeId === item.id
      allItems.push(renderItem(item.id, item.title, percent, isActive, handleClick(item.id)))
    }

    return allItems
  }, [items, activeId, articleHeight, handleClick, isHoveringNearby, railHeight, railInset])

  if (renderedItems.length === 0) {
    return <aside className={cn("hidden 2xl:block pointer-events-none", className)} style={style} aria-hidden="true" />
  }

  return (
    <aside
      className={cn("hidden 2xl:block text-sm text-neutral-300 pointer-events-none group/sidebar", className)}
      style={style}
      aria-label="On this page"
    >
      <div
        ref={containerRef}
        className="pointer-events-auto relative w-full"
        style={{
          height: sidebarHeight > 0 ? `${sidebarHeight}px` : "100vh",
          opacity: isHoveringNearby ? 1 : 0.8,
        }}
      >
        <div
          className="absolute left-6 w-[2px] -translate-x-1/2 bg-neutral-700"
          style={{
            top: sidebarHeight > 0 ? `${railInset}px` : 0,
            height: sidebarHeight > 0 ? `${Math.max(railHeight, 1)}px` : "100%",
          }}
        />
        <div
          className="absolute left-6 -translate-x-1/2 w-[2px] bg-neutral-200/80"
          style={{
            top:
              sidebarHeight > 0
                ? `${railInset + (Math.max(railHeight, 1) * viewportRange.start) / 100}px`
                : `${viewportRange.start}%`,
            height:
              sidebarHeight > 0
                ? `${(Math.max(railHeight, 1) * Math.max(viewportRange.end - viewportRange.start, 2)) / 100}px`
                : `${Math.max(viewportRange.end - viewportRange.start, 2)}%`,
          }}
        />
        <div className="relative h-full w-full">{renderedItems}</div>
      </div>
    </aside>
  )
}
