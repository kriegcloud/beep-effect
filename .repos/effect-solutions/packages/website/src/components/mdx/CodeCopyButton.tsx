"use client"

import { CheckIcon, CopyIcon } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"
import { type MouseEvent, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/cn"
import { useLessonNavSfx } from "@/lib/useLessonNavSfx"
import { useTonePlayer } from "@/lib/useTonePlayer"

const copyButtonSpring = {
  type: "spring" as const,
  stiffness: 180,
  damping: 25,
  mass: 0.8,
  visualDuration: 0.6,
  bounce: 0.3,
}

interface CodeCopyButtonProps {
  value: string
  className?: string
}

export function CodeCopyButton({ value, className }: CodeCopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { playHoverTone } = useLessonNavSfx()
  const { playTone } = useTonePlayer()

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    const parent = button.closest(".group")
    if (!parent) return

    const handleParentMouseEnter = () => {
      setIsVisible(true)
    }

    const handleParentMouseLeave = () => {
      setIsVisible(false)
      setHovered(false)
    }

    parent.addEventListener("mouseenter", handleParentMouseEnter)
    parent.addEventListener("mouseleave", handleParentMouseLeave)

    return () => {
      parent.removeEventListener("mouseenter", handleParentMouseEnter)
      parent.removeEventListener("mouseleave", handleParentMouseLeave)
    }
  }, [])

  const handleButtonMouseEnter = () => {
    if (!hovered) {
      playHoverTone()
      setHovered(true)
    }
  }

  const handleButtonMouseLeave = () => {
    setHovered(false)
  }

  async function handleCopy(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault()
    event?.stopPropagation()

    const text = value.trim()

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = text
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
      console.error("Failed to copy code", error)
    }
  }

  return (
    <motion.button
      layout
      ref={buttonRef}
      type="button"
      className={cn(
        "pointer-events-auto absolute top-3 right-3 flex items-center border border-neutral-700/80 bg-neutral-950/80 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-neutral-400 overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 hover:text-white hover:border-neutral-500 cursor-pointer",
        copied && "text-emerald-300 border-emerald-400/70",
        className,
      )}
      aria-label="Copy code snippet"
      onClick={handleCopy}
      onMouseEnter={handleButtonMouseEnter}
      onMouseLeave={handleButtonMouseLeave}
      initial={{ opacity: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        opacity: { duration: 0 },
        layout: copyButtonSpring,
      }}
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? "copied" : "copy"}
          layout
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="flex items-center gap-1.5 whitespace-nowrap"
        >
          {copied ? <CheckIcon size={14} weight="bold" /> : <CopyIcon size={14} weight="bold" />}
          <span aria-live="polite">{copied ? "COPIED" : "COPY"}</span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
