import { motion } from "motion/react"
import { theme } from "../../theme"
import type { AnimationValues } from "./useEffectAnimations"

interface EffectOverlayProps {
  isRunning: boolean
  animations: Pick<
    AnimationValues,
    "borderRadius" | "borderOpacity" | "flashOpacity" | "flashColor"
  >
}

function RunningOverlay() {
  return (
    <>
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((delay, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "200%",
            background:
              "linear-gradient(90deg, transparent 0%, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.1) 55%, transparent 60%, transparent 100%)",
            filter: "blur(4px)",
            mixBlendMode: "lighten",
          }}
          animate={{
            x: ["-66.0%", "50%"],
          }}
          transition={{
            duration: 0.8,
            delay,
            repeat: Infinity,
            ease: [0.5, 0, 0.1, 1],
          }}
        />
      ))}
    </>
  )
}

export function EffectOverlay({ animations, isRunning }: EffectOverlayProps) {
  return (
    <>
      {/* Animated border overlay for running state */}
      {isRunning && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: animations.borderRadius,
            boxShadow: "inset 0 0 0 1px rgba(100, 200, 255, 0.8)",
            opacity: animations.borderOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Running animation overlay */}
      {isRunning && <RunningOverlay />}

      {/* Flash effect overlay */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: theme.radius.md,
          background: animations.flashColor,
          mixBlendMode: "overlay",
          opacity: animations.flashOpacity,
          pointerEvents: "none",
        }}
      />
    </>
  )
}
