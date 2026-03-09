"use client"

import { type CSSProperties, useLayoutEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/cn"
import { useFootnoteContext } from "@/lib/footnote-context"

interface FootnoteSidebarProps {
  className?: string
  style?: CSSProperties
}

interface PositionedNote {
  id: string
  top: number
}

export function FootnoteSidebar({ className, style }: FootnoteSidebarProps) {
  const { notes } = useFootnoteContext()
  const noteRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [positions, setPositions] = useState<Record<string, number>>({})

  const sortedNotes = useMemo(() => [...notes].sort((a, b) => a.offsetY - b.offsetY), [notes])

  useLayoutEffect(() => {
    if (sortedNotes.length === 0) {
      setPositions({})
      return
    }

    const gap = 28
    let lastBottom = 0
    const nextPositions: PositionedNote[] = []

    sortedNotes.forEach((footnote) => {
      const noteElement = noteRefs.current.get(footnote.id)
      const noteHeight = noteElement?.offsetHeight ?? 0
      const unclampedTop = footnote.offsetY
      const top = Math.max(unclampedTop, lastBottom)

      nextPositions.push({ id: footnote.id, top })
      lastBottom = top + noteHeight + gap
    })

    const mapped: Record<string, number> = {}
    nextPositions.forEach(({ id, top }) => {
      mapped[id] = top
    })

    setPositions(mapped)
  }, [sortedNotes])

  const setNoteRef = (id: string) => (element: HTMLDivElement | null) => {
    if (element) {
      noteRefs.current.set(id, element)
    } else {
      noteRefs.current.delete(id)
    }
  }

  if (notes.length === 0) {
    return <div className={cn("hidden lg:block", className)} style={style} aria-hidden="true" />
  }

  return (
    <aside
      className={cn("hidden lg:block pointer-events-none text-sm text-neutral-300", className)}
      style={style}
      aria-label="Margin notes"
    >
      <div className="relative w-full pointer-events-auto">
        {sortedNotes.map((note) => (
          <div
            key={note.id}
            ref={setNoteRef(note.id)}
            style={{ top: positions[note.id] ?? note.offsetY }}
            className="absolute right-0 w-full"
          >
            <aside
              id={note.kind === "footnote" ? `fn-${note.id}` : `${note.id}-note`}
              aria-label={note.kind === "footnote" ? `Footnote ${note.id}` : (note.label ?? "Margin note")}
              className="mb-6 border-t border-neutral-800 pt-3 leading-relaxed text-neutral-300"
            >
              {note.kind === "footnote" ? (
                <div className="space-y-2">
                  <a href={`#${note.anchorId}`} className="text-blue-400 hover:text-blue-300 no-underline font-medium">
                    [{note.id}]
                  </a>
                  <div
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: nope
                    dangerouslySetInnerHTML={{ __html: note.content }}
                    className="text-neutral-300"
                  />
                </div>
              ) : (
                <div className="space-y-2 text-neutral-300">
                  {note.label ? (
                    <span className="block font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      {note.label}
                    </span>
                  ) : null}
                  <div
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: nope
                    dangerouslySetInnerHTML={{ __html: note.content }}
                    className="text-neutral-300 [&_*]:text-base [&_*]:mx-0"
                  />
                </div>
              )}
            </aside>
          </div>
        ))}
      </div>
    </aside>
  )
}
