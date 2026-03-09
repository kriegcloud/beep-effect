"use client"

import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react"

type MarginNoteKind = "footnote" | "aside"

interface MarginNote {
  id: string
  kind: MarginNoteKind
  content: string
  anchorId: string
  offsetY: number
  label: string | undefined
}

interface FootnoteContextValue {
  registerArticle: (element: HTMLElement | null) => void
  registerReference: (id: string, element: HTMLElement | null) => void
  registerDefinition: (id: string, content: string) => void
  resetDefinitions: () => void
  registerAside: (config: RegisterAsidePayload) => void
  /**
   * The article element used for positioning footnotes and other margin content.
   * Exposed so other client components (e.g. table of contents) can read headings.
   */
  article: HTMLElement | null
  notes: MarginNote[]
}

const FootnoteContext = createContext<FootnoteContextValue | null>(null)

interface AsideEntry {
  element: HTMLElement
  content: string
  anchorId: string | undefined
  label: string | undefined
}

interface RegisterAsidePayload {
  id: string
  element: HTMLElement | null
  content: string | undefined
  anchorId: string | undefined
  label: string | undefined
}

export function FootnoteProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<MarginNote[]>([])
  const [, setArticleVersion] = useState(0)
  const referencesRef = useRef<Map<string, HTMLElement>>(new Map())
  const definitionsRef = useRef<Map<string, string>>(new Map())
  const asidesRef = useRef<Map<string, AsideEntry>>(new Map())
  const articleRef = useRef<HTMLElement | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const updateFrameRef = useRef<number | undefined>(undefined)

  const computeNotes = useCallback(() => {
    const article = articleRef.current
    if (!article) {
      setNotes([])
      return
    }

    const articleRect = article.getBoundingClientRect()
    const next: MarginNote[] = []

    for (const [id, content] of definitionsRef.current.entries()) {
      const reference = referencesRef.current.get(id)
      if (!reference) {
        continue
      }

      const referenceRect = reference.getBoundingClientRect()
      next.push({
        id,
        kind: "footnote",
        content,
        anchorId: reference.id || `fnref-${id}`,
        offsetY: referenceRect.top - articleRect.top,
        label: undefined,
      })
    }

    for (const [id, aside] of asidesRef.current.entries()) {
      const { element, content, anchorId, label } = aside
      const asideRect = element.getBoundingClientRect()
      next.push({
        id,
        kind: "aside",
        content,
        anchorId: anchorId ?? element.id ?? id,
        offsetY: asideRect.top - articleRect.top,
        label,
      })
    }

    next.sort((a, b) => a.offsetY - b.offsetY)
    setNotes(next)
  }, [])

  const scheduleUpdate = useCallback(() => {
    if (typeof window === "undefined") {
      return
    }
    if (updateFrameRef.current !== undefined) {
      window.cancelAnimationFrame(updateFrameRef.current)
    }
    updateFrameRef.current = window.requestAnimationFrame(() => {
      computeNotes()
    })
  }, [computeNotes])

  const registerArticle = useCallback(
    (element: HTMLElement | null) => {
      if (articleRef.current === element) {
        return
      }

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }

      articleRef.current = element
      setArticleVersion((version) => version + 1)

      if (element && typeof ResizeObserver !== "undefined") {
        resizeObserverRef.current = new ResizeObserver(() => {
          scheduleUpdate()
        })
        resizeObserverRef.current.observe(element)
      }

      scheduleUpdate()
    },
    [scheduleUpdate],
  )

  const registerReference = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        referencesRef.current.set(id, element)
      } else {
        referencesRef.current.delete(id)
      }
      scheduleUpdate()
    },
    [scheduleUpdate],
  )

  const registerDefinition = useCallback(
    (id: string, content: string) => {
      definitionsRef.current.set(id, content)
      scheduleUpdate()
    },
    [scheduleUpdate],
  )

  const resetDefinitions = useCallback(() => {
    definitionsRef.current.clear()
    scheduleUpdate()
  }, [scheduleUpdate])

  const registerAside = useCallback(
    ({ id, element, content, anchorId, label }: RegisterAsidePayload) => {
      if (element) {
        const existing = asidesRef.current.get(id)
        asidesRef.current.set(id, {
          element,
          content: content ?? existing?.content ?? "",
          anchorId: anchorId ?? existing?.anchorId ?? element.id ?? id,
          label,
        })
      } else {
        asidesRef.current.delete(id)
      }
      scheduleUpdate()
    },
    [scheduleUpdate],
  )

  useEffect(() => {
    scheduleUpdate()

    const handleResize = () => scheduleUpdate()
    window.addEventListener("resize", handleResize)

    if (typeof document !== "undefined" && "fonts" in document) {
      const fonts = (document as Document & { fonts: FontFaceSet }).fonts
      if ("ready" in fonts) {
        void fonts.ready.then(() => {
          scheduleUpdate()
        })
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [scheduleUpdate])

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && updateFrameRef.current !== undefined) {
        window.cancelAnimationFrame(updateFrameRef.current)
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [])

  return (
    <FootnoteContext.Provider
      value={{
        registerArticle,
        registerReference,
        registerDefinition,
        resetDefinitions,
        registerAside,
        article: articleRef.current,
        notes,
      }}
    >
      {children}
    </FootnoteContext.Provider>
  )
}

export function useFootnoteContext() {
  const context = useContext(FootnoteContext)
  if (!context) {
    throw new Error("useFootnoteContext must be used within FootnoteProvider")
  }
  return context
}
