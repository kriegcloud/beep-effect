"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/cn"

interface NavTitleCyclerProps {
  title: string
  className?: string
}

const TITLE_VARIANTS = {
  initial: {
    y: -24,
    opacity: 0.8,
  },
  animate: {
    y: 0,
    opacity: 1,
  },
  exit: {
    y: 24,
    opacity: 0.8,
  },
} as const

export function NavTitleCycler({ title, className }: NavTitleCyclerProps) {
  const [renderedTitle, setRenderedTitle] = useState(title)
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (title === renderedTitle) {
      return
    }

    setRenderedTitle(title)
    setAnimationKey((key) => key + 1)
  }, [title, renderedTitle])

  return (
    <div className={cn("relative flex-1 min-w-0", className)}>
      <div
        className="relative grid px-1.5 py-1"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 4px, black calc(100% - 4px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 4px, black calc(100% - 4px), transparent 100%)",
        }}
      >
        <AnimatePresence initial={false}>
          <motion.span
            key={animationKey}
            variants={TITLE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: "spring",
              visualDuration: 0.5,
              bounce: 0.3,
            }}
            className="block leading-tight will-change-transform whitespace-nowrap col-start-1 row-start-1"
          >
            {renderedTitle}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}
