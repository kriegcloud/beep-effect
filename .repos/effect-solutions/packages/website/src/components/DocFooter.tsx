"use client"

import { ArrowLeftIcon, ArrowRightIcon, HeartIcon } from "@phosphor-icons/react"
import { motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { KIT_TWITTER_URL } from "@/constants/urls"
import { normalizeDocSlug } from "@/lib/normalizeDocSlug"
import { useLessonSfxHandlers } from "@/lib/useLessonNavSfx"

interface DocFooterProps {
  docTitles: Record<string, string>
  orderedSlugs: string[]
}

export function DocFooter({ docTitles, orderedSlugs }: DocFooterProps) {
  const pathname = usePathname()
  const currentSlug = pathname.replace(/^\//, "")
  const isDocPage = pathname !== "/" && !pathname.startsWith("/_")
  const { handleHover: playHoverSfx, handleClick: playClickSfx } = useLessonSfxHandlers()
  const [isKitHovered, setIsKitHovered] = useState(false)

  if (!isDocPage) {
    return (
      <footer className="relative no-prose h-16 sm:sticky sm:bottom-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-t border-neutral-800">
        <div className="max-w-screen-md mx-auto flex items-center justify-end w-full px-6 border-x border-neutral-800 h-full">
          <Link
            href={KIT_TWITTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-normal uppercase tracking-wider text-neutral-500 hover:text-neutral-300 no-underline !select-none"
            onMouseEnter={() => {
              setIsKitHovered(true)
              playHoverSfx()
            }}
            onMouseLeave={() => setIsKitHovered(false)}
            onClick={playClickSfx}
          >
            <motion.div
              animate={{ scale: isKitHovered ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <HeartIcon aria-hidden="true" className="h-4 w-4 text-red-500" weight="fill" />
            </motion.div>
            <span className="font-weight-animated !select-none">Kit</span>
          </Link>
        </div>
      </footer>
    )
  }

  const normalizedSlug = normalizeDocSlug(currentSlug)
  const currentIndex = orderedSlugs.indexOf(normalizedSlug)
  const prevSlug = currentIndex !== -1 && currentIndex > 0 ? orderedSlugs[currentIndex - 1] : null
  const prevTitle = prevSlug ? docTitles[prevSlug] : null
  const nextSlug = currentIndex !== -1 && currentIndex < orderedSlugs.length - 1 ? orderedSlugs[currentIndex + 1] : null
  const nextTitle = nextSlug ? docTitles[nextSlug] : null

  return (
    <footer className="relative no-prose h-16 sm:sticky sm:bottom-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
      <div
        className="absolute top-0 border-t border-neutral-800"
        style={{
          left: "calc(-50vw + 50%)",
          right: "calc(-50vw + 50%)",
          width: "100vw",
        }}
      />
      <div className="max-w-screen-md mx-auto flex items-center justify-between w-full px-6 border-x border-neutral-800 h-full">
        {isDocPage ? (
          prevSlug && prevTitle ? (
            <Link
              href={`/${prevSlug}`}
              className="flex items-center gap-3 text-sm font-normal uppercase tracking-wider text-neutral-500 hover:text-neutral-300 no-underline !select-none"
              onMouseEnter={playHoverSfx}
              onClick={playClickSfx}
            >
              <ArrowLeftIcon aria-hidden="true" className="h-5 w-5" />
              <span className="!select-none">{prevTitle}</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-3 text-sm font-normal uppercase tracking-wider text-neutral-500 hover:text-neutral-300 no-underline !select-none"
              onMouseEnter={playHoverSfx}
              onClick={playClickSfx}
            >
              <ArrowLeftIcon aria-hidden="true" className="h-5 w-5" />
              <span className="!select-none">Back to Docs</span>
            </Link>
          )
        ) : (
          <div />
        )}
        {nextSlug && nextTitle ? (
          <Link
            href={`/${nextSlug}`}
            className="flex items-center gap-3 text-sm font-normal uppercase tracking-wider text-neutral-500 hover:text-neutral-300 no-underline !select-none"
            onMouseEnter={playHoverSfx}
            onClick={playClickSfx}
          >
            <span className="!select-none">{nextTitle}</span>
            <ArrowRightIcon aria-hidden="true" className="h-5 w-5" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </footer>
  )
}
