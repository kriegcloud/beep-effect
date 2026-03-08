import { SandboxViolation } from "@template/domain/errors"
import type { AgentId } from "@template/domain/ids"
import { Effect, Layer, Ref, ServiceMap } from "effect"
import type { CommandInvocationContext } from "../tools/command/CommandTypes.js"

const sensitiveSources = new Set<CommandInvocationContext["source"]>([
  "tool",
  "checkpoint_replay",
  "schedule",
  "integration"
])

export interface SandboxRuntimeService {
  readonly enter: <A, E, R>(
    agentId: AgentId,
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E, R>
  readonly require: (
    context: CommandInvocationContext
  ) => Effect.Effect<void, SandboxViolation>
}

export class SandboxRuntime extends ServiceMap.Service<SandboxRuntime>()(
  "server/safety/SandboxRuntime",
  {
    make: Effect.gen(function*() {
      const activeByFiber = yield* Ref.make(new Map<number, ReadonlyArray<AgentId>>())

      const enter: SandboxRuntimeService["enter"] = (agentId, effect) =>
        Effect.withFiber((fiber) =>
          Effect.gen(function*() {
            yield* Ref.update(activeByFiber, (state) => {
              const next = new Map(state)
              const stack = next.get(fiber.id) ?? []
              next.set(fiber.id, [...stack, agentId])
              return next
            })

            return yield* effect.pipe(
              Effect.ensuring(
                Ref.update(activeByFiber, (state) => {
                  const next = new Map(state)
                  const stack = next.get(fiber.id) ?? []
                  if (stack.length <= 1) {
                    next.delete(fiber.id)
                  } else {
                    next.set(fiber.id, stack.slice(0, stack.length - 1))
                  }
                  return next
                })
              )
            )
          })
        )

      const require: SandboxRuntimeService["require"] = (context) =>
        !sensitiveSources.has(context.source)
          ? Effect.void
          : Effect.gen(function*() {
              if (context.agentId === undefined) {
                return yield* new SandboxViolation({
                  agentId: "agent:unknown" as AgentId,
                  reason: `sandbox requires context.agentId for source=${context.source}`
                })
              }

              const activeAgent = yield* Effect.withFiber((fiber) =>
                Ref.get(activeByFiber).pipe(
                  Effect.map((state) => {
                    const stack = state.get(fiber.id)
                    return stack === undefined ? null : stack[stack.length - 1] ?? null
                  })
                )
              )

              if (activeAgent === null) {
                return yield* new SandboxViolation({
                  agentId: context.agentId,
                  reason: `missing sandbox context for source=${context.source}`
                })
              }

              if (activeAgent !== context.agentId) {
                return yield* new SandboxViolation({
                  agentId: context.agentId,
                  reason: `sandbox context mismatch for source=${context.source}`
                })
              }
            })

      return {
        enter,
        require
      } satisfies SandboxRuntimeService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
