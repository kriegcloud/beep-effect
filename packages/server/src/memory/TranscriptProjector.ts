import type { AgentId, SessionId } from "@template/domain/ids"
import type { TurnRecord } from "@template/domain/ports"
import { DateTime, Effect, Layer, ServiceMap } from "effect"
import { AgentConfig } from "../ai/AgentConfig.js"
import { SessionTurnPortTag } from "../PortTags.js"
import { SessionFileStore } from "../storage/SessionFileStore.js"

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface TranscriptProjectorService {
  readonly appendTurn: (
    agentId: AgentId,
    sessionId: SessionId,
    turn: TurnRecord
  ) => Effect.Effect<void>

  readonly projectSession: (
    agentId: AgentId,
    sessionId: SessionId,
    turns: ReadonlyArray<TurnRecord>
  ) => Effect.Effect<void>

  readonly projectFromStore: (
    agentId: AgentId,
    sessionId: SessionId
  ) => Effect.Effect<void>
}

export class TranscriptProjector extends ServiceMap.Service<TranscriptProjector>()(
  "server/memory/TranscriptProjector",
  {
    make: Effect.gen(function*() {
      const agentConfig = yield* AgentConfig
      const sessionTurnPort = yield* SessionTurnPortTag
      const sessionFileStore = yield* SessionFileStore

      const shouldProject = (agentId: AgentId): Effect.Effect<boolean> =>
        agentConfig.getAgent(agentId).pipe(
          Effect.map((profile) => profile.memoryRoutines?.transcripts?.enabled === true),
          Effect.orDie
        )

      const appendTurn: TranscriptProjectorService["appendTurn"] = (agentId, sessionId, turn) =>
        Effect.gen(function*() {
          const enabled = yield* shouldProject(agentId)
          if (!enabled) return

          yield* sessionFileStore.appendTranscript(sessionId, renderTurn(turn))
          yield* sessionFileStore.appendEventLine(sessionId, renderTurnEvent(turn))
        })

      const projectSession: TranscriptProjectorService["projectSession"] = (agentId, sessionId, turns) =>
        Effect.gen(function*() {
          const enabled = yield* shouldProject(agentId)
          if (!enabled) return

          yield* sessionFileStore.writeTranscript(sessionId, renderTranscript(turns))
          yield* sessionFileStore.writeEventLines(
            sessionId,
            turns.map(renderTurnEvent)
          )
        })

      const projectFromStore: TranscriptProjectorService["projectFromStore"] = (agentId, sessionId) =>
        Effect.gen(function*() {
          const turns = yield* sessionTurnPort.listTurns(sessionId)
          yield* projectSession(agentId, sessionId, turns)
        })

      return { appendTurn, projectSession, projectFromStore } satisfies TranscriptProjectorService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

// ---------------------------------------------------------------------------
// Renderers (pure)
// ---------------------------------------------------------------------------

const renderTranscript = (turns: ReadonlyArray<TurnRecord>): string => {
  const lines: string[] = []
  lines.push("# Session Transcript")
  lines.push("")

  for (const turn of turns) {
    lines.push(renderTurn(turn))
  }

  return lines.join("\n")
}

const renderTurn = (turn: TurnRecord): string => {
  const lines: string[] = []
  const role = turn.participantRole === "UserRole" ? "user" : "assistant"
  const createdAt = DateTime.formatIso(turn.createdAt)

  lines.push(`## Turn ${turn.turnIndex} (${role}) — ${createdAt}`)
  lines.push("")

  for (const block of turn.message.contentBlocks) {
    switch (block.contentBlockType) {
      case "TextBlock":
        lines.push(block.text)
        lines.push("")
        break
      case "ToolUseBlock":
        lines.push(`[Tool: ${block.toolName}]`)
        lines.push(`Input: ${block.inputJson}`)
        lines.push("")
        break
      case "ToolResultBlock":
        lines.push(`Result (${block.toolName}): ${block.outputJson}`)
        lines.push("")
        break
      case "ImageBlock":
        lines.push(`[Image: ${block.altText ?? "no alt text"}]`)
        lines.push("")
        break
    }
  }

  return lines.join("\n")
}

const renderTurnEvent = (turn: TurnRecord): string =>
  JSON.stringify({
    type: "turn",
    turnId: turn.turnId,
    turnIndex: turn.turnIndex,
    role: turn.participantRole,
    messageId: turn.message.messageId,
    createdAt: DateTime.formatIso(turn.createdAt),
    contentBlocks: turn.message.contentBlocks
  })

export { renderTurn as _renderTurn, renderTranscript as _renderTranscript, renderTurnEvent as _renderTurnEvent }
