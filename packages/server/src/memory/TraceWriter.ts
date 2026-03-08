import { DateTime, Effect, FileSystem, Layer, Path, ServiceMap } from "effect"
import type * as Response from "effect/unstable/ai/Response"
import { AgentConfig } from "../ai/AgentConfig.js"
import {
  ArtifactStorePortTag,
  SessionArtifactPortTag,
  SessionMetricsPortTag
} from "../PortTags.js"
import type { LoadedSubroutine } from "./SubroutineCatalog.js"
import type { SubroutineContext, SubroutineResult } from "./SubroutineRunner.js"

const textEncoder = new TextEncoder()

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RunTraceParams {
  readonly subroutine: LoadedSubroutine
  readonly context: SubroutineContext
  readonly contentParts: ReadonlyArray<Response.Part<any>>
  readonly result: SubroutineResult
  readonly usage: Response.Usage | null
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface TraceWriterService {
  readonly writeRunTrace: (params: RunTraceParams) => Effect.Effect<void>
}

export class TraceWriter extends ServiceMap.Service<TraceWriter>()(
  "server/memory/TraceWriter",
  {
    make: Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const pathService = yield* Path.Path
      const agentConfig = yield* AgentConfig
      const artifactStore = yield* ArtifactStorePortTag
      const sessionArtifactPort = yield* SessionArtifactPortTag
      const sessionMetricsPort = yield* SessionMetricsPortTag
      const configPath = process.env.PA_CONFIG_PATH ?? "agent.yaml"
      const configDir = pathService.dirname(pathService.resolve(configPath))

      const writeRunTrace: TraceWriterService["writeRunTrace"] = (params) =>
        Effect.gen(function*() {
          const profile = yield* agentConfig.getAgent(params.context.agentId)
          const traceConfig = profile.memoryRoutines?.traces
          if (!traceConfig?.enabled) return

          const content = renderTrace(params)

          // Keep explicit trace files for local debugging and parity with existing behavior.
          const traceDir = pathService.resolve(configDir, traceConfig.directory)
          const datePart = DateTime.formatIso(params.context.now).slice(0, 10)
          const filePath = pathService.join(
            traceDir,
            params.subroutine.config.id,
            datePart,
            `${params.context.runId}.trace.txt`
          )
          yield* writeFileWithDirs(fs, pathService, filePath, content)

          const artifact = yield* artifactStore.putBytes(
            params.context.sessionId,
            "SubroutineTrace",
            textEncoder.encode(content),
            {
              mediaType: "text/plain; charset=utf-8",
              previewText: content.slice(0, 512)
            }
          )
          yield* sessionArtifactPort.link(
            params.context.sessionId,
            artifact,
            "SubroutineTrace",
            {
              turnId: params.context.turnId,
              runId: params.context.runId
            }
          )
          yield* sessionMetricsPort.increment(params.context.sessionId, {
            artifactBytes: artifact.bytes,
            fileTouches: 1
          })
        }).pipe(Effect.catch(() => Effect.void))

      return { writeRunTrace } satisfies TraceWriterService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const writeFileWithDirs = (
  fs: FileSystem.FileSystem,
  pathService: Path.Path,
  filePath: string,
  content: string
) =>
  Effect.gen(function*() {
    yield* fs.makeDirectory(pathService.dirname(filePath), { recursive: true })
    yield* fs.writeFileString(filePath, content)
  })

// ---------------------------------------------------------------------------
// Renderer (pure)
// ---------------------------------------------------------------------------

const renderTrace = (params: RunTraceParams): string => {
  const { subroutine, context, contentParts, result } = params
  const lines: string[] = []

  lines.push("=== Subroutine Run Trace ===")
  lines.push(`Subroutine: ${subroutine.config.id} (${subroutine.config.name})`)
  lines.push(`Tier: ${subroutine.config.tier}`)
  lines.push(`Trigger: ${context.triggerType}`)
  lines.push(`Run ID: ${context.runId}`)
  lines.push(`Agent: ${context.agentId}`)
  lines.push(`Session: ${context.sessionId}`)
  lines.push(`Started: ${DateTime.formatIso(context.now)}`)
  lines.push("")

  lines.push("--- System Prompt ---")
  lines.push(subroutine.prompt)
  lines.push("")

  // Count tool calls in content parts
  const toolCallCount = contentParts.filter((p) => p.type === "tool-call").length

  lines.push(`--- Execution (${result.iterationsUsed} iterations, ${toolCallCount} tool calls) ---`)
  lines.push("")

  for (const part of contentParts) {
    switch (part.type) {
      case "text": {
        const textPart = part as { readonly text: string }
        lines.push(`[text] ${textPart.text}`)
        lines.push("")
        break
      }
      case "tool-call": {
        const toolCallPart = part as {
          readonly name: string
          readonly params: unknown
        }
        lines.push(`[tool_call] ${toolCallPart.name}`)
        lines.push(`  ${JSON.stringify(toolCallPart.params)}`)
        lines.push("")
        break
      }
      case "tool-result": {
        const toolResultPart = part as {
          readonly name: string
          readonly result: unknown
        }
        lines.push(`[tool_result] ${toolResultPart.name}`)
        const resultStr = typeof toolResultPart.result === "string"
          ? toolResultPart.result
          : JSON.stringify(toolResultPart.result)
        lines.push(`  ${resultStr}`)
        lines.push("")
        break
      }
    }
  }

  lines.push("--- Result ---")
  lines.push(`Status: ${result.success ? "Success" : "Failed"}`)
  lines.push(`Iterations: ${result.iterationsUsed}`)
  lines.push(`Tool Calls: ${result.toolCallsTotal}`)
  if (result.error) {
    lines.push(`Error: ${result.error.tag}: ${result.error.message}`)
  }
  lines.push("")

  return lines.join("\n")
}

export { renderTrace as _renderTrace }
