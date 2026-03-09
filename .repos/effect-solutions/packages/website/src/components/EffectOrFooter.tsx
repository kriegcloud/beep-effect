"use client"

import { SkullIcon } from "@phosphor-icons/react"
import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { useLessonSfxHandlers } from "@/lib/useLessonNavSfx"

export function EffectOrFooter() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, margin: "-100px" })
  const { handleHover, handleClick, handleFocusVisible } = useLessonSfxHandlers()

  const navSfxProps = {
    onMouseEnter: handleHover,
    onClick: handleClick,
    onFocus: handleFocusVisible,
  } as const

  const words = ["EFFECT", "OR"]

  return (
    <motion.div
      ref={ref}
      className="flex items-center justify-center gap-2 py-8 text-xs font-bold tracking-[0.16em] uppercase text-neutral-500"
      initial={{ filter: "brightness(1)" }}
      animate={
        isInView
          ? {
              filter: ["brightness(1)", "brightness(2)", "brightness(1)"],
            }
          : { filter: "brightness(1)" }
      }
      transition={{
        times: [0, 0.05, 1],
        duration: 2,
        ease: ["easeOut", "linear"],
      }}
    >
      <div className="flex items-center gap-2">
        {words.map((word, index) => (
          <span key={word}>
            {index === 0 ? (
              <a
                href="https://effect.website"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-400 transition-colors"
                {...navSfxProps}
              >
                {word}
              </a>
            ) : (
              word
            )}
          </span>
        ))}
      </div>
      <a
        href="https://effect.website/docs/error-management/unexpected-errors/#ordie"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-neutral-400 transition-colors"
        {...navSfxProps}
      >
        <SkullIcon className="h-4 w-4" weight="fill" />
      </a>
    </motion.div>
  )
}
