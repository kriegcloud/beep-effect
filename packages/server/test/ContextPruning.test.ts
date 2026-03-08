import { describe, expect, it } from "@effect/vitest"
import type {
  ArtifactId,
  SessionId,
  ToolInvocationId,
  ToolName,
  TurnId
} from "@template/domain/ids"
import type { ContextPruningStrategy } from "@template/domain/ports"
import { DateTime, Effect } from "effect"
import {
  makeInitialContextPruningInput,
  runContextPruningPipeline
} from "../src/memory/compaction/ContextPruning.js"
import { createDefaultContextPruningPipeline } from "../src/memory/compaction/ContextPruningBuiltins.js"

const instant = (iso: string) => DateTime.fromDateUnsafe(new Date(iso))

const makeInput = () =>
  makeInitialContextPruningInput({
    sessionId: "session:compaction" as SessionId,
    messages: [
      { messageId: "msg:0", role: "system", text: "system instructions" },
      { messageId: "msg:1", role: "user", text: "old user message" },
      { messageId: "msg:2", role: "assistant", text: "old assistant message" },
      { messageId: "msg:3", role: "user", text: "recent user message" },
      { messageId: "msg:4", role: "assistant", text: "recent assistant message" }
    ],
    artifactRefs: [
      {
        artifactId: "artifact:1" as ArtifactId,
        sha256: "sha-1",
        mediaType: "application/json",
        bytes: 100,
        purpose: "ToolResult",
        turnId: "turn:1" as TurnId,
        toolInvocationId: null,
        runId: null,
        previewText: "artifact-one",
        createdAt: instant("2026-03-03T10:00:00.000Z")
      },
      {
        artifactId: "artifact:2" as ArtifactId,
        sha256: "sha-2",
        mediaType: "text/plain",
        bytes: 200,
        purpose: "CompactionDetail",
        turnId: "turn:2" as TurnId,
        toolInvocationId: null,
        runId: "run:2",
        previewText: "artifact-two",
        createdAt: instant("2026-03-03T11:00:00.000Z")
      }
    ],
    toolRefs: [
      {
        toolInvocationId: "toolinv:1" as ToolInvocationId,
        toolName: "file_read" as ToolName,
        turnId: "turn:3" as TurnId,
        previewText: "file read output",
        invokedAt: instant("2026-03-03T09:00:00.000Z")
      },
      {
        toolInvocationId: "toolinv:2" as ToolInvocationId,
        toolName: "shell_execute" as ToolName,
        turnId: "turn:4" as TurnId,
        previewText: "shell output",
        invokedAt: instant("2026-03-03T12:00:00.000Z")
      }
    ],
    policy: {
      keepRecentTurns: 1,
      includeArtifactRefs: true,
      includeToolRefs: true,
      maxReferenceItems: 6,
      summaryEnabled: true,
      summaryMaxChars: 1_000
    }
  })

const defaultContextPruningPipeline = createDefaultContextPruningPipeline({
  summaryBlockTemplate: "### Compaction Summary\n{{summary}}",
  artifactRefsBlockTemplate: "### Artifact References\n{{items_markdown}}",
  toolRefsBlockTemplate: "### Tool References\n{{items_markdown}}",
  keptContextBlockTemplate: "### Kept Context\n{{kept_context_markdown}}"
})

describe("ContextPruning pipeline", () => {
  it.effect("applies built-in strategies in deterministic order", () =>
    Effect.gen(function*() {
      const first = yield* runContextPruningPipeline(
        defaultContextPruningPipeline,
        makeInput()
      )
      const second = yield* runContextPruningPipeline(
        defaultContextPruningPipeline,
        makeInput()
      )

      expect(first.decisions.map((decision) => decision.strategyId)).toEqual([
        "keep-system",
        "keep-recent",
        "keep-pinned",
        "collect-artifact-refs",
        "collect-tool-refs",
        "summarize-dropped",
        "insert-reference-blocks"
      ])
      expect(first).toEqual(second)
      expect(first.keptMessageIds).toEqual(["msg:0", "msg:3", "msg:4"])
      expect(first.droppedMessageIds).toEqual(["msg:1", "msg:2"])
      expect(first.insertedBlocks[0]).toContain("### Compaction Summary")
      expect(first.insertedBlocks.some((block) => block.includes("### Artifact References"))).toBe(true)
      expect(first.insertedBlocks.some((block) => block.includes("### Tool References"))).toBe(true)
      expect(first.compactedPrompt.length).toBeGreaterThan(0)
    }))

  it.effect("supports custom strategy composition without changing coordinator", () =>
    Effect.gen(function*() {
      const customStrategy: ContextPruningStrategy = {
        strategyId: "keep-first-user",
        apply: (input) =>
          Effect.succeed({
            ...input,
            keptMessageIds: [...input.keptMessageIds, "msg:1"],
            decisions: [...input.decisions, {
              strategyId: "keep-first-user",
              note: "kept first user message"
            }]
          })
      }

      const output = yield* runContextPruningPipeline(
        [customStrategy, ...defaultContextPruningPipeline],
        makeInput()
      )

      expect(output.decisions[0]?.strategyId).toBe("keep-first-user")
      expect(output.keptMessageIds).toContain("msg:1")
      expect(output.droppedMessageIds).not.toContain("msg:1")
    }))
})
