"use client"

import { animate, motion, useMotionValue, useTransform } from "motion/react"
import { useEffect } from "react"
import { animationTokens } from "@/animationTokens"

interface FailureBubbleProps {
  error: unknown
}

export function FailureBubble({ error }: FailureBubbleProps) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const shakeX = useMotionValue(0)
  const shakeY = useMotionValue(0)
  const rotation = useMotionValue(0)

  // Shake animation when bubble appears
  useEffect(() => {
    let cancelled = false
    const shakeSequence = async () => {
      if (cancelled) return

      // Shake animation - similar to error node but gentler
      const shakeIntensity = animationTokens.shake.bubble.intensity
      const shakeDuration = animationTokens.shake.bubble.duration
      const shakeCount = animationTokens.shake.bubble.count

      for (let i = 0; i < shakeCount; i++) {
        if (cancelled) break

        const xOffset = (Math.random() - 0.5) * shakeIntensity
        const yOffset =
          (Math.random() - 0.5) * shakeIntensity + animationTokens.shake.bubble.yOffset
        const rotOffset = (Math.random() - 0.5) * animationTokens.shake.bubble.rotationRange

        await Promise.all([
          animate(shakeX, xOffset, {
            duration: shakeDuration,
            ease: "easeInOut",
          }).finished,
          animate(shakeY, yOffset, {
            duration: shakeDuration,
            ease: "easeInOut",
          }).finished,
          animate(rotation, rotOffset, {
            duration: shakeDuration,
            ease: "easeInOut",
          }).finished,
        ])

        if (cancelled) break
      }

      // Return to rest position
      if (!cancelled) {
        await Promise.all([
          animate(shakeX, 0, {
            duration: animationTokens.shake.bubble.returnDuration,
            ease: "easeOut",
          }).finished,
          animate(shakeY, animationTokens.shake.bubble.yOffset, {
            duration: animationTokens.shake.bubble.returnDuration,
            ease: "easeOut",
          }).finished,
          animate(rotation, 0, {
            duration: animationTokens.shake.bubble.returnDuration,
            ease: "easeOut",
          }).finished,
        ])
      }
    }

    // Start shake after a brief delay to let the bubble appear first
    const timer = setTimeout(shakeSequence, animationTokens.shake.bubble.delay)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [shakeX, shakeY, rotation])

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
        y: 20,
        filter: "blur(5px)",
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: -5,
        filter: "blur(0px)",
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
        y: 20,
        filter: "blur(5px)",
      }}
      transition={animationTokens.springs.failureBubble}
      style={{
        position: "absolute",
        bottom: "100%",
        left: "50%",
        marginBottom: "8px",
        x: useTransform([shakeX], ([x]) => `calc(-50% + ${x}px)`),
        y: shakeY,
        zIndex: 10,
        rotate: rotation,
      }}
    >
      <div
        className={`text-sm p-1 px-2 ${animationTokens.colors.failureBubble.text} font-bold`}
        style={{
          background: animationTokens.colors.failureBubble.background,
          borderRadius: animationTokens.dimensions.failureBubble.borderRadius,
          whiteSpace: "nowrap",
          maxWidth: animationTokens.dimensions.failureBubble.maxWidth,
          boxShadow: animationTokens.colors.failureBubble.shadow,
        }}
      >
        {errorMessage}
      </div>
      {/* Arrow pointing down */}
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: `${animationTokens.dimensions.failureBubble.arrowSize} solid transparent`,
          borderRight: `${animationTokens.dimensions.failureBubble.arrowSize} solid transparent`,
          borderTop: `${animationTokens.dimensions.failureBubble.arrowSize} solid ${animationTokens.colors.failureBubble.background}`,
        }}
      />
    </motion.div>
  )
}
