"use client"

import { useEffect, useRef } from "react"
import { useFootnoteContext } from "@/lib/footnote-context"

interface FootnoteReferenceProps {
  footnoteId: string
  anchorId?: string
  href: string
  ariaDescribedBy?: string
  children: React.ReactNode
}

export function FootnoteReference({ footnoteId, anchorId, href, ariaDescribedBy, children }: FootnoteReferenceProps) {
  const { registerReference } = useFootnoteContext()
  const ref = useRef<HTMLAnchorElement>(null)
  const describedBy = [ariaDescribedBy, `fn-${footnoteId}`].filter(Boolean).join(" ") || undefined

  useEffect(() => {
    registerReference(footnoteId, ref.current)
    return () => registerReference(footnoteId, null)
  }, [footnoteId, registerReference])

  return (
    <sup className="relative top-[-0.5em] text-[0.75em]">
      <a
        ref={ref}
        href={href}
        id={anchorId ?? `fnref-${footnoteId}`}
        data-footnote-ref
        aria-describedby={describedBy}
        className="text-blue-400 hover:text-blue-300 no-underline font-medium"
      >
        [{children}]
      </a>
    </sup>
  )
}
