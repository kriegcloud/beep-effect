"use client"

import { CheckIcon, CopyIcon } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"
import { type MouseEvent, useState } from "react"
import { cn } from "@/lib/cn"
import { useLessonSfxHandlers } from "@/lib/useLessonNavSfx"
import { useTonePlayer } from "@/lib/useTonePlayer"
import { CTA_BUTTON_BASE_CLASSES } from "./ctaButtonClass"

interface LLMInstructionsButtonProps {
  instructions: string
}

export function LLMInstructionsButton({ instructions }: LLMInstructionsButtonProps) {
  const [copied, setCopied] = useState(false)
  const { handleHover, handleFocusVisible } = useLessonSfxHandlers()
  const { playTone } = useTonePlayer()

  async function handleCopy(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault()
    event?.stopPropagation()

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(instructions)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = instructions
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }
      setCopied(true)
      playTone({
        frequency: 640,
        duration: 0.09,
        volume: 0.05,
        type: "triangle",
      })
      playTone({
        frequency: 860,
        duration: 0.08,
        delay: 0.08,
        volume: 0.045,
        type: "triangle",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy instructions", error)
    }
  }

  return (
    <motion.button
      layout
      type="button"
      className={cn(CTA_BUTTON_BASE_CLASSES, copied && "text-emerald-300 border-emerald-400/70 bg-emerald-950/30")}
      aria-label="Copy Agent Instructions"
      onClick={handleCopy}
      onMouseEnter={handleHover}
      onFocus={handleFocusVisible}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? "copied" : "copy"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          {copied ? <CheckIcon size={16} weight="bold" /> : <CopyIcon size={16} weight="bold" />}
          <span aria-live="polite">{copied ? "Copied to clipboard!" : "Copy Agent Instructions"}</span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
