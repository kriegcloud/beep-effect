"use client"

import { useCallback } from "react"
import { useTonePlayer } from "./useTonePlayer"

const LESSON_SFX = {
  hover: {
    frequency: 1320,
    duration: 0.055,
    type: "triangle" as OscillatorType,
    volume: 0.012,
  },
  tap: {
    frequency: 520,
    duration: 0.04,
    type: "sine" as OscillatorType,
    volume: 0.025,
  },
} as const

export type LessonSfxName = keyof typeof LESSON_SFX

export function useLessonNavSfx() {
  const { playTone } = useTonePlayer()

  const playSfx = useCallback(
    (effect: LessonSfxName) => {
      playTone(LESSON_SFX[effect])
    },
    [playTone],
  )

  const playHoverTone = useCallback(() => {
    playSfx("hover")
  }, [playSfx])

  const playTapTone = useCallback(() => {
    playSfx("tap")
  }, [playSfx])

  const wrapSfx = useCallback(
    <E>(effect: LessonSfxName | null, handler?: (event: E) => void) => {
      if (!effect) {
        return handler
      }

      return (event: E) => {
        handler?.(event)
        playSfx(effect)
      }
    },
    [playSfx],
  )

  return { playHoverTone, playTapTone, playSfx, wrapSfx }
}

interface LessonSfxHandlersOptions {
  hover?: LessonSfxName | null
  click?: LessonSfxName | null
  focusVisible?: LessonSfxName | null
}

export function useLessonSfxHandlers(options?: LessonSfxHandlersOptions) {
  const { playSfx } = useLessonNavSfx()

  const hoverSfx = options?.hover ?? "hover"
  const clickSfx = options?.click ?? "tap"
  const focusVisibleSfx = options?.focusVisible ?? (hoverSfx === null ? null : hoverSfx)

  const handleHover = useCallback(() => {
    if (hoverSfx) {
      playSfx(hoverSfx)
    }
  }, [hoverSfx, playSfx])

  const handleClick = useCallback(() => {
    if (clickSfx) {
      playSfx(clickSfx)
    }
  }, [clickSfx, playSfx])

  const handleFocusVisible = useCallback(() => {
    if (focusVisibleSfx) {
      playSfx(focusVisibleSfx)
    }
  }, [focusVisibleSfx, playSfx])

  return {
    handleHover,
    handleClick,
    handleFocusVisible,
    play: playSfx,
  }
}
