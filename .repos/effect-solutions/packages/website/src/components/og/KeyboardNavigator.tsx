"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import type { OgSpec } from "@/lib/og-specs"

interface KeyboardNavigatorProps {
  specs: OgSpec[]
}

export function KeyboardNavigator({ specs }: KeyboardNavigatorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return
      }

      // Prevent default scrolling behavior
      event.preventDefault()

      // Get current slug from URL params or determine from current params
      const currentSlug = searchParams.get("slug")

      // If no slug in URL, try to match current params to a spec
      let currentIndex = -1
      if (currentSlug) {
        currentIndex = specs.findIndex((spec) => spec.slug === currentSlug)
      }

      // If still not found, try to match by title
      if (currentIndex === -1) {
        const currentTitle = searchParams.get("title")
        if (currentTitle) {
          // Decode URL-encoded title for comparison
          const decodedTitle = decodeURIComponent(currentTitle)
          currentIndex = specs.findIndex((spec) => spec.title === decodedTitle || spec.title === currentTitle)
        }
      }

      // Default to first if not found
      if (currentIndex === -1) {
        currentIndex = 0
      }

      let targetIndex: number
      if (event.key === "ArrowRight") {
        targetIndex = (currentIndex + 1) % specs.length
      } else {
        targetIndex = currentIndex === 0 ? specs.length - 1 : currentIndex - 1
      }

      const targetSpec = specs[targetIndex]
      if (!targetSpec) return

      // Build new URL with target spec params
      // Exclude eyebrow and tag since they're hardcoded in the template
      const params = new URLSearchParams()
      Object.entries(targetSpec).forEach(([key, value]) => {
        if (key !== "slug" && key !== "eyebrow" && key !== "tag" && value) {
          params.set(key, String(value))
        }
      })
      params.set("slug", targetSpec.slug)

      router.replace(`/og/template?${params.toString()}`)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router, searchParams, specs])

  return null
}
