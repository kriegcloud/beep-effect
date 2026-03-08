import type { AgentPromptBindings } from "@template/domain/config"
import { Effect, FileSystem, Layer, Path, Schema, ServiceMap } from "effect"
import { AgentConfig } from "./AgentConfig.js"

const TEMPLATE_VARIABLE_PATTERN = /{{\s*([a-zA-Z0-9_]+)\s*}}/g

export class PromptNotFound extends Schema.ErrorClass<PromptNotFound>(
  "PromptNotFound"
)({
  _tag: Schema.tag("PromptNotFound"),
  ref: Schema.String
}) {}

export class PromptFileReadError extends Schema.ErrorClass<PromptFileReadError>(
  "PromptFileReadError"
)({
  _tag: Schema.tag("PromptFileReadError"),
  ref: Schema.String,
  filePath: Schema.String
}) {}

export class PromptBindingError extends Schema.ErrorClass<PromptBindingError>(
  "PromptBindingError"
)({
  _tag: Schema.tag("PromptBindingError"),
  agentId: Schema.String,
  bindingPath: Schema.String,
  missingRef: Schema.String
}) {}

export class PromptRenderError extends Schema.ErrorClass<PromptRenderError>(
  "PromptRenderError"
)({
  _tag: Schema.tag("PromptRenderError"),
  ref: Schema.String,
  variable: Schema.String,
  message: Schema.String
}) {}

export interface PromptCatalogService {
  readonly get: (ref: string) => Effect.Effect<string, PromptNotFound | PromptFileReadError>
  readonly getAgentBindings: (
    agentId: string
  ) => Effect.Effect<AgentPromptBindings, PromptBindingError>
  readonly render: (
    ref: string,
    vars: Record<string, string>
  ) => Effect.Effect<string, PromptNotFound | PromptFileReadError | PromptRenderError>
}

const extractTemplateVariables = (template: string): ReadonlyArray<string> => {
  const vars = new Set<string>()
  const regex = new RegExp(TEMPLATE_VARIABLE_PATTERN)
  let match = regex.exec(template)
  while (match !== null) {
    vars.add(match[1]!)
    match = regex.exec(template)
  }
  return [...vars]
}

const resolveBindingRefs = (bindings: AgentPromptBindings): ReadonlyArray<{
  readonly bindingPath: string
  readonly ref: string
}> => [
  {
    bindingPath: "promptBindings.turn.systemPromptRef",
    ref: bindings.turn.systemPromptRef
  },
  {
    bindingPath: "promptBindings.turn.replayContinuationRef",
    ref: bindings.turn.replayContinuationRef
  },
  {
    bindingPath: "promptBindings.memory.triggerEnvelopeRef",
    ref: bindings.memory.triggerEnvelopeRef
  },
  {
    bindingPath: "promptBindings.memory.tierInstructionRefs.WorkingMemory",
    ref: bindings.memory.tierInstructionRefs.WorkingMemory
  },
  {
    bindingPath: "promptBindings.memory.tierInstructionRefs.EpisodicMemory",
    ref: bindings.memory.tierInstructionRefs.EpisodicMemory
  },
  {
    bindingPath: "promptBindings.memory.tierInstructionRefs.SemanticMemory",
    ref: bindings.memory.tierInstructionRefs.SemanticMemory
  },
  {
    bindingPath: "promptBindings.memory.tierInstructionRefs.ProceduralMemory",
    ref: bindings.memory.tierInstructionRefs.ProceduralMemory
  },
  {
    bindingPath: "promptBindings.compaction.summaryBlockRef",
    ref: bindings.compaction.summaryBlockRef
  },
  {
    bindingPath: "promptBindings.compaction.artifactRefsBlockRef",
    ref: bindings.compaction.artifactRefsBlockRef
  },
  {
    bindingPath: "promptBindings.compaction.toolRefsBlockRef",
    ref: bindings.compaction.toolRefsBlockRef
  },
  {
    bindingPath: "promptBindings.compaction.keptContextBlockRef",
    ref: bindings.compaction.keptContextBlockRef
  }
]

const renderTemplate = (
  template: string,
  vars: Record<string, string>
): Effect.Effect<string, PromptRenderError> =>
  Effect.gen(function*() {
    for (const variable of extractTemplateVariables(template)) {
      if (!Object.hasOwn(vars, variable)) {
        return yield* new PromptRenderError({
          ref: "unknown",
          variable,
          message: `Missing template variable '${variable}'`
        })
      }
    }

    return template.replace(TEMPLATE_VARIABLE_PATTERN, (_match, rawName: string) =>
      vars[rawName]!
    )
  })

export class PromptCatalog extends ServiceMap.Service<PromptCatalog>()(
  "server/ai/PromptCatalog",
  {
    make: Effect.gen(function*() {
      const agentConfig = yield* AgentConfig
      const fs = yield* FileSystem.FileSystem
      const pathService = yield* Path.Path
      const configPath = process.env.PA_CONFIG_PATH ?? "agent.yaml"
      const configDir = pathService.dirname(pathService.resolve(configPath))
      const promptRoot = pathService.resolve(configDir, agentConfig.prompts.rootDir)
      const promptTextByRef = new Map<string, string>()
      const filePathByRef = new Map<string, string>()

      for (const [ref, entry] of Object.entries(agentConfig.prompts.entries)) {
        const promptPath = pathService.resolve(promptRoot, entry.file)
        const content = yield* fs.readFileString(promptPath).pipe(
          Effect.mapError(() =>
            new PromptFileReadError({
              ref,
              filePath: promptPath
            })),
          Effect.orDie
        )
        promptTextByRef.set(ref, content)
        filePathByRef.set(ref, promptPath)
      }

      const assertRefExists = (
        agentId: string,
        bindingPath: string,
        ref: string
      ): Effect.Effect<void, PromptBindingError> =>
        promptTextByRef.has(ref)
          ? Effect.void
          : Effect.fail(
            new PromptBindingError({
              agentId,
              bindingPath,
              missingRef: ref
            })
          )

      for (const [agentId, profile] of agentConfig.agents) {
        for (const binding of resolveBindingRefs(profile.promptBindings)) {
          yield* assertRefExists(agentId, binding.bindingPath, binding.ref).pipe(
            Effect.orDie
          )
        }

        for (const subroutine of profile.memoryRoutines?.subroutines ?? []) {
          yield* assertRefExists(
            agentId,
            `memoryRoutines.subroutines[${subroutine.id}].promptRef`,
            subroutine.promptRef
          ).pipe(Effect.orDie)
        }
      }

      const get: PromptCatalogService["get"] = (ref) => {
        const text = promptTextByRef.get(ref)
        if (text === undefined) {
          return Effect.fail(new PromptNotFound({ ref }))
        }
        const filePath = filePathByRef.get(ref)
        if (filePath === undefined) {
          return Effect.fail(new PromptFileReadError({ ref, filePath: "unknown" }))
        }
        return Effect.succeed(text)
      }

      const getAgentBindings: PromptCatalogService["getAgentBindings"] = (agentId) => {
        const profile = agentConfig.agents.get(agentId) ?? agentConfig.defaultAgent
        if (profile === undefined) {
          return Effect.fail(
            new PromptBindingError({
              agentId,
              bindingPath: "agent",
              missingRef: "default"
            })
          )
        }
        return Effect.succeed(profile.promptBindings)
      }

      const render: PromptCatalogService["render"] = (ref, vars) =>
        get(ref).pipe(
          Effect.flatMap((template) =>
            renderTemplate(template, vars).pipe(
              Effect.mapError((error) =>
                new PromptRenderError({
                  ref,
                  variable: error.variable,
                  message: error.message
                }))
            )
          )
        )

      return {
        get,
        getAgentBindings,
        render
      } satisfies PromptCatalogService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

export const _extractTemplateVariables = extractTemplateVariables
