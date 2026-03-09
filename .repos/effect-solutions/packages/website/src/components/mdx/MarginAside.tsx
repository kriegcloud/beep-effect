"use client"

import { type HTMLAttributes, type ReactNode, useEffect, useId, useMemo, useRef } from "react"
import { cn } from "@/lib/cn"
import { useFootnoteContext } from "@/lib/footnote-context"

interface MarginAsideProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  label?: string
}

export function MarginAside({ children, className, label, ...props }: MarginAsideProps) {
  const generatedId = useId()
  const noteId = useMemo(() => `aside-${generatedId.replace(/[:]/g, "")}`, [generatedId])
  const markerRef = useRef<HTMLSpanElement | null>(null)
  const contentRef = useRef<HTMLSpanElement | null>(null)
  const { registerAside } = useFootnoteContext()

  useEffect(() => {
    const marker = markerRef.current
    const content = contentRef.current
    if (!marker || !content) {
      return
    }

    const update = () => {
      registerAside({
        id: noteId,
        element: marker,
        content: content.innerHTML.trim(),
        anchorId: marker.id,
        label,
      })
    }

    update()

    const observer = typeof MutationObserver !== "undefined" ? new MutationObserver(update) : null
    observer?.observe(content, {
      subtree: true,
      childList: true,
      characterData: true,
    })

    return () => {
      observer?.disconnect()
      registerAside({
        id: noteId,
        element: null,
        content: undefined,
        anchorId: undefined,
        label: undefined,
      })
    }
  }, [noteId, registerAside, label])

  return (
    <>
      <span ref={markerRef} id={noteId} aria-hidden="true" className="relative inline-block h-0 w-0 align-top">
        <span
          ref={contentRef}
          aria-hidden="true"
          className="pointer-events-none select-none opacity-0 text-sm font-"
          style={{ position: "absolute", inset: 0 }}
        >
          <span className={className}>{children}</span>
        </span>
      </span>
      <aside
        className={cn(
          "mt-6 border-t border-neutral-800/70 pt-3 text-xs text-neutral-300 lg:hidden [&_*]:text-xs [&_*]:leading-relaxed [&_*]:mx-0",
          className,
        )}
        role="note"
        aria-label={label}
        {...props}
      >
        {label ? (
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</span>
        ) : null}
        {children}
      </aside>
    </>
  )
}
