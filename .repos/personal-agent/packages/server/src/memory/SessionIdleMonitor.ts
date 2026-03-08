import { DEFAULT_IDLE_CHECK_INTERVAL_SECONDS } from "@template/domain/system-defaults"
import type { AgentId, ConversationId, SessionId, TurnId } from "@template/domain/ids"
import type { Instant } from "@template/domain/ports"
import { DateTime, Duration, Effect, Layer, Ref, Schedule, ServiceMap } from "effect"
import { AgentConfig } from "../ai/AgentConfig.js"
import { ChannelPortTag } from "../PortTags.js"
import { RuntimeSupervisor } from "../runtime/RuntimeSupervisor.js"
import { SubroutineCatalog } from "./SubroutineCatalog.js"
import { SubroutineControlPlane } from "./SubroutineControlPlane.js"

export class SessionIdleMonitor extends ServiceMap.Service<SessionIdleMonitor>()(
  "server/memory/SessionIdleMonitor",
  {
    make: Effect.gen(function*() {
      const channelPort = yield* ChannelPortTag
      const controlPlane = yield* SubroutineControlPlane
      const catalog = yield* SubroutineCatalog
      const agentConfig = yield* AgentConfig
      const runtimeSupervisor = yield* RuntimeSupervisor

      // Track sessionId::subroutineId -> lastFiredAt to prevent repeated firing
      const lastFiredRef = yield* Ref.make(new Map<string, Instant>())

      const tick = Effect.gen(function*() {
        const now = yield* DateTime.now

        for (const [agentId] of agentConfig.agents) {
          const postSessionSubs = yield* catalog.getByTrigger(agentId, "PostSession")
          if (postSessionSubs.length === 0) continue

          const channels = yield* channelPort.list({ agentId: agentId as AgentId })

          for (const channel of channels) {
            if (channel.lastTurnAt === null) continue

            const elapsedMs = DateTime.toEpochMillis(now) - DateTime.toEpochMillis(channel.lastTurnAt)
            const elapsedSeconds = elapsedMs / 1000

            for (const sub of postSessionSubs) {
              if (sub.config.trigger.type !== "PostSession") continue

              const idleTimeout = sub.config.trigger.idleTimeoutSeconds
              if (elapsedSeconds < idleTimeout) continue

              const guardKey = `${channel.activeSessionId}::${sub.config.id}`
              const lastFiredMap = yield* Ref.get(lastFiredRef)
              const lastFired = lastFiredMap.get(guardKey)

              // If already fired and no new activity since, skip
              if (lastFired && DateTime.toEpochMillis(channel.lastTurnAt) <= DateTime.toEpochMillis(lastFired)) {
                continue
              }

              const result = yield* controlPlane.enqueue({
                agentId: agentId as AgentId,
                sessionId: channel.activeSessionId as SessionId,
                conversationId: channel.activeConversationId as ConversationId,
                subroutineId: sub.config.id,
                turnId: null as TurnId | null,
                triggerType: "PostSession",
                triggerReason: `Session idle for ${Math.round(elapsedSeconds)}s (threshold ${idleTimeout}s)`,
                enqueuedAt: now
              })

              // Only update lastFired when enqueue was accepted
              if (result.accepted) {
                yield* Ref.update(lastFiredRef, (map) => {
                  const next = new Map(map)
                  next.set(guardKey, channel.lastTurnAt!)
                  return next
                })
              }
            }
          }
        }
      }).pipe(
        Effect.catchCause((cause) =>
          Effect.log("SessionIdleMonitor tick failed", { cause }).pipe(
            Effect.annotateLogs("level", "error")
          )
        )
      )

      const loop = Effect.repeat(tick, Schedule.spaced(Duration.seconds(DEFAULT_IDLE_CHECK_INTERVAL_SECONDS)))
      const started = yield* runtimeSupervisor.start("runtime.session.idle-monitor", loop, { required: true })
      if (!started) {
        return yield* Effect.die(
          new Error("required runtime loop already registered: runtime.session.idle-monitor")
        )
      }

      return {} as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
