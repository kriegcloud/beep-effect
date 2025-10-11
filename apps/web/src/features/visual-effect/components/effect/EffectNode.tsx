import { AnimatePresence, motion } from "motion/react"
import { memo, useCallback, useState } from "react"
import { DeathBubble, FailureBubble, NotificationBubble } from "@/components/feedback"
import {
  useVisualEffectNotification,
  useVisualEffectState,
  type VisualEffect,
} from "@/VisualEffect"
import { EffectContainer } from "./EffectContainer"
import { EffectContent } from "./EffectContent"
import { EffectLabel } from "./EffectLabel"
import { EffectOverlay } from "./EffectOverlay"
import {
  useEffectAnimations,
  useRunningAnimation,
  useStateAnimations,
  useTaskAnimations,
} from "./useEffectAnimations"

function EffectNodeComponent<A, E>({
  style = {},
  effect,
  labelEffect,
}: {
  effect: VisualEffect<A, E>
  style?: React.CSSProperties
  labelEffect?: VisualEffect<unknown, unknown>
}) {
  const notification = useVisualEffectNotification(effect)
  const state = useVisualEffectState(effect)
  const animations = useTaskAnimations()
  const isRunning = state.type === "running"
  const isFailedOrDeath = state.type === "failed" || state.type === "death"

  // State for error bubble visibility
  const [showErrorBubble, setShowErrorBubble] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Apply all animations
  useRunningAnimation(isRunning, animations)
  useStateAnimations(state, animations)
  useEffectAnimations(state, animations, isHovering, setShowErrorBubble)

  // Stable mouse handlers to avoid creating new functions on every render
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    if (isFailedOrDeath) setShowErrorBubble(true)
  }, [isFailedOrDeath])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
  }, [])

  return (
    <div style={{ ...style, position: "relative" }}>
      {/* Error bubble positioned outside container */}
      <AnimatePresence>
        {isFailedOrDeath &&
          showErrorBubble &&
          (state.type === "failed" ? (
            <FailureBubble error={state.error} />
          ) : (
            <DeathBubble error={state.error} />
          ))}
      </AnimatePresence>

      {/* Notification bubbles - hidden when error bubbles are shown */}
      <AnimatePresence>
        {!isFailedOrDeath && notification && (
          <NotificationBubble key={notification.id} notification={notification} />
        )}
      </AnimatePresence>

      <motion.div
        style={{
          width: animations.nodeWidth,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <EffectContainer
          state={state}
          animations={animations}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <EffectOverlay isRunning={isRunning} animations={animations} />
          <EffectContent state={state} animations={animations} />
        </EffectContainer>
      </motion.div>
      <EffectLabel effect={labelEffect ?? effect} />
    </div>
  )
}

export const EffectNode = memo(EffectNodeComponent) as typeof EffectNodeComponent
