import type { MemorySubroutineConfig, SubroutineToolScope } from "@template/domain/memory"
import type { SubroutineTriggerType } from "@template/domain/status"
import { DEFAULT_SUBROUTINE_TOOL_SCOPE } from "@template/domain/system-defaults"
import { Effect, Layer, Schema, ServiceMap } from "effect"
import { AgentConfig } from "../ai/AgentConfig.js"
import { PromptCatalog } from "../ai/PromptCatalog.js"

export interface LoadedSubroutine {
  readonly config: MemorySubroutineConfig
  readonly prompt: string
  readonly resolvedToolScope: SubroutineToolScope
}

export class SubroutineNotFound extends Schema.ErrorClass<SubroutineNotFound>(
  "SubroutineNotFound"
)({
  _tag: Schema.tag("SubroutineNotFound"),
  subroutineId: Schema.String
}) {}

const resolveToolScope = (scope: SubroutineToolScope | undefined): SubroutineToolScope =>
  scope ?? DEFAULT_SUBROUTINE_TOOL_SCOPE

export interface SubroutineCatalogService {
  readonly getByTrigger: (
    agentId: string,
    triggerType: SubroutineTriggerType
  ) => Effect.Effect<ReadonlyArray<LoadedSubroutine>>

  readonly getById: (
    subroutineId: string
  ) => Effect.Effect<LoadedSubroutine, SubroutineNotFound>
}

export class SubroutineCatalog extends ServiceMap.Service<SubroutineCatalog>()(
  "server/memory/SubroutineCatalog",
  {
    make: Effect.gen(function*() {
      const agentConfig = yield* AgentConfig
      const promptCatalog = yield* PromptCatalog

      const byId = new Map<string, LoadedSubroutine>()
      const byTrigger = new Map<string, Map<string, ReadonlyArray<LoadedSubroutine>>>()

      for (const [agentId, profile] of agentConfig.agents) {
        const routinesConfig = profile.memoryRoutines
        if (!routinesConfig) continue

        const triggerIndex = new Map<string, LoadedSubroutine[]>()

        for (const sub of routinesConfig.subroutines) {
          if (byId.has(sub.id)) {
            return yield* Effect.die(
              new Error(
                `Duplicate subroutine ID '${sub.id}' — subroutine IDs must be globally unique across all agent profiles. Found duplicate in agent '${agentId}'.`
              )
            )
          }

          const prompt = yield* promptCatalog.get(sub.promptRef).pipe(
            Effect.mapError((error) =>
              new Error(
                `Missing subroutine prompt for '${sub.id}' (promptRef='${sub.promptRef}'): ${error.message}`
              )),
            Effect.orDie
          )

          const loaded: LoadedSubroutine = {
            config: sub,
            prompt,
            resolvedToolScope: resolveToolScope(sub.toolScope)
          }

          byId.set(sub.id, loaded)

          const triggerType = sub.trigger.type
          const existing = triggerIndex.get(triggerType) ?? []
          existing.push(loaded)
          triggerIndex.set(triggerType, existing)
        }

        const agentTriggerMap = new Map<string, ReadonlyArray<LoadedSubroutine>>()
        for (const [trigger, subs] of triggerIndex) {
          agentTriggerMap.set(trigger, subs)
        }
        byTrigger.set(agentId, agentTriggerMap)
      }

      const getByTrigger: SubroutineCatalogService["getByTrigger"] = (agentId, triggerType) =>
        Effect.succeed(
          byTrigger.get(agentId)?.get(triggerType) ?? []
        )

      const getById: SubroutineCatalogService["getById"] = (subroutineId) => {
        const loaded = byId.get(subroutineId)
        if (!loaded) {
          return Effect.fail(new SubroutineNotFound({ subroutineId }))
        }
        return Effect.succeed(loaded)
      }

      return { getByTrigger, getById } satisfies SubroutineCatalogService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
