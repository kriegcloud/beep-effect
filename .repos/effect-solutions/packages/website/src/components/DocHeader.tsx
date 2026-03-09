"use client"

import {
  ArrowLeftIcon,
  BriefcaseIcon,
  GithubLogoIcon,
  SpeakerSimpleHighIcon,
  SpeakerSimpleSlashIcon,
} from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type FocusEvent, useCallback, useEffect, useState } from "react"
import { normalizeDocSlug } from "@/lib/normalizeDocSlug"
import { useLessonSfxHandlers } from "@/lib/useLessonNavSfx"
import { useSoundSettings } from "@/lib/useSoundSettings"
import { useTonePlayer } from "@/lib/useTonePlayer"
import { NavTitleCycler } from "./NavTitleCycler"

interface DocHeaderProps {
  docTitles: Record<string, string>
}

const iconAnimationConfig = {
  initial: {
    opacity: 0,
    x: 20,
    scale: 0.5,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.5,
    filter: "blur(4px)",
  },
  transition: {
    type: "spring" as const,
    visualDuration: 0.2,
    bounce: 0,
    filter: { type: "tween" as const, duration: 0.2, ease: "easeOut" },
  },
}

export function DocHeader({ docTitles }: DocHeaderProps) {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)
  const [hoverAnimationId, setHoverAnimationId] = useState(0)
  const { handleHover: playHoverSfx, handleClick: playClickSfx, handleFocusVisible } = useLessonSfxHandlers()
  const { isMuted, toggleMute } = useSoundSettings()
  const { playTone } = useTonePlayer()

  const updateHoverState = useCallback((nextHovered: boolean) => {
    setIsHovered((previous) => {
      if (previous === nextHovered) {
        return previous
      }
      setHoverAnimationId((id) => id + 1)
      return nextHovered
    })
  }, [])

  const handleMouseEnter = useCallback(() => {
    updateHoverState(true)
    playHoverSfx()
  }, [playHoverSfx, updateHoverState])

  const handleMouseLeave = useCallback(() => {
    updateHoverState(false)
  }, [updateHoverState])

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLAnchorElement>) => {
      updateHoverState(true)
      if (event.currentTarget.matches(":focus-visible")) {
        handleFocusVisible()
      }
    },
    [handleFocusVisible, updateHoverState],
  )

  const handleBlur = useCallback(() => {
    updateHoverState(false)
  }, [updateHoverState])

  const handleClick = useCallback(() => {
    playClickSfx()
  }, [playClickSfx])

  const handleMuteButtonHover = useCallback(() => {
    playHoverSfx()
  }, [playHoverSfx])

  const navSfxProps = {
    onMouseEnter: playHoverSfx,
    onClick: playClickSfx,
    onFocus: handleFocusVisible,
  } as const

  const playToggleSfx = useCallback(
    (nextMuted: boolean) => {
      if (nextMuted) {
        playTone({
          frequency: 320,
          duration: 0.12,
          volume: 0.05,
          type: "sine",
          force: true,
        })
      } else {
        playTone({
          frequency: 640,
          duration: 0.09,
          volume: 0.05,
          type: "triangle",
          force: true,
        })
        playTone({
          frequency: 860,
          duration: 0.09,
          delay: 0.08,
          volume: 0.045,
          type: "triangle",
          force: true,
        })
      }
    },
    [playTone],
  )

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted
    playToggleSfx(nextMuted)
    toggleMute()
  }, [isMuted, playToggleSfx, toggleMute])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isToggleKey = event.key === "m" || event.key === "M"

      if (isToggleKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null
        const isTypingElement =
          target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable
        if (isTypingElement) return
        event.preventDefault()
        handleToggleMute()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleToggleMute])

  let displayTitle = "EFFECT SOLUTIONS"

  const isDocsListPage = pathname === "/"

  // Check if we're on a specific doc page
  if (pathname !== "/" && !pathname.startsWith("/_")) {
    const slug = pathname.slice(1)
    const docTitle = docTitles[normalizeDocSlug(slug)]
    if (docTitle) {
      displayTitle = docTitle
    }
  }

  const iconKey = isHovered && !isDocsListPage ? `arrow-${hoverAnimationId}` : "book"

  return (
    <header className="relative h-16 sm:sticky sm:top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur bottom-0 border-b border-neutral-800">
      {/* <div
        className="absolute bottom-0 border-b border-neutral-800"
        style={{
          left: "calc(-50vw + 50%)",
          right: "calc(-50vw + 50%)",
          width: "100vw",
        }}
      /> */}
      <div className="max-w-screen-md mx-auto border-x border-neutral-800 flex items-center justify-between h-full">
        <Link
          href="/"
          className="group flex-1 h-full"
          onBlur={handleBlur}
          onClick={handleClick}
          onFocus={handleFocus}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center px-6 h-full hover:bg-neutral-900/50">
            <div className="flex items-center text-sm font-normal uppercase tracking-wider">
              <div className="relative w-5 h-5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {isHovered && !isDocsListPage ? (
                    <motion.div
                      key={iconKey}
                      className="absolute inset-0"
                      style={{ willChange: "transform, opacity, filter" }}
                      {...iconAnimationConfig}
                    >
                      <ArrowLeftIcon aria-hidden="true" className="h-5 w-5" weight="bold" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={iconKey}
                      className="absolute inset-0"
                      style={{ willChange: "transform, opacity, filter" }}
                      {...iconAnimationConfig}
                    >
                      <BriefcaseIcon
                        aria-hidden="true"
                        className="h-5 w-5"
                        // weight="fill"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="ml-1.5 flex-1 leading-tight">
                <NavTitleCycler title={displayTitle} />
              </div>
            </div>
          </div>
        </Link>
        <a
          href="https://github.com/kitlangton/effect-solutions"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center h-16 w-16 py-6 border-l border-neutral-800 hover:bg-neutral-900/50"
          aria-label="View on GitHub"
          {...navSfxProps}
        >
          <GithubLogoIcon className="h-4 w-4" weight="regular" />
        </a>
        <button
          type="button"
          onClick={handleToggleMute}
          onMouseEnter={handleMuteButtonHover}
          className="flex items-center justify-center h-16 w-16 py-6 border-l border-neutral-800 hover:bg-neutral-900/50 cursor-pointer"
          aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
        >
          {isMuted ? (
            <SpeakerSimpleSlashIcon className="h-4 w-4" weight="regular" />
          ) : (
            <SpeakerSimpleHighIcon className="h-4 w-4" weight="regular" />
          )}
        </button>
      </div>
    </header>
  )
}
