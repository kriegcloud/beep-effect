import type {
  ContextPruningInput,
  ContextPruningMessage,
  ContextPruningOutput,
  ContextPruningStrategy
} from "@template/domain/ports"
import { DateTime, Effect } from "effect"

export interface ContextPruningTemplates {
  readonly summaryBlockTemplate: string
  readonly artifactRefsBlockTemplate: string
  readonly toolRefsBlockTemplate: string
  readonly keptContextBlockTemplate: string
}

const uniq = (items: ReadonlyArray<string>): ReadonlyArray<string> =>
  [...new Set(items)]

const appendDecision = (
  input: ContextPruningInput,
  strategyId: string,
  note: string,
  patch: Partial<Omit<ContextPruningOutput, "sessionId" | "messages" | "artifactRefs" | "toolRefs" | "policy">>
): ContextPruningOutput => ({
  ...input,
  ...patch,
  decisions: [...input.decisions, { strategyId, note }]
})

const countReferenceItems = (blocks: ReadonlyArray<string>): number =>
  blocks.reduce(
    (acc, block) =>
      acc + block.split("\n").filter((line) => line.trimStart().startsWith("- ")).length,
    0
  )

const toMessageLine = (message: ContextPruningMessage): string =>
  `[${message.role}] ${message.text}`.trim()

const limitChars = (value: string, max: number): string => {
  const safeMax = Math.max(0, Math.floor(max))
  if (value.length <= safeMax) {
    return value
  }
  return `${value.slice(0, safeMax)}...`
}

const renderTemplate = (
  template: string,
  vars: Record<string, string>
): string =>
  template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, rawName: string) =>
    vars[rawName] ?? ""
  )

const collectMessageTurns = (
  messages: ReadonlyArray<ContextPruningMessage>
): ReadonlyArray<ReadonlyArray<string>> => {
  const turns: Array<Array<string>> = []
  let currentTurn: Array<string> = []

  for (const message of messages) {
    if (message.role === "system") {
      continue
    }

    if (message.role === "user") {
      if (currentTurn.length > 0) {
        turns.push(currentTurn)
      }
      currentTurn = [message.messageId]
      continue
    }

    if (currentTurn.length === 0) {
      currentTurn = [message.messageId]
    } else {
      currentTurn.push(message.messageId)
    }
  }

  if (currentTurn.length > 0) {
    turns.push(currentTurn)
  }

  return turns
}

export const createDefaultContextPruningPipeline = (
  templates: ContextPruningTemplates
): ReadonlyArray<ContextPruningStrategy> => {
  const keepSystemStrategy: ContextPruningStrategy = {
    strategyId: "keep-system",
    apply: (input) =>
      Effect.sync(() => {
        const systemIds = input.messages
          .filter((message) => message.role === "system")
          .map((message) => message.messageId)

        return appendDecision(
          input,
          "keep-system",
          `kept ${systemIds.length} system messages`,
          {
            keptMessageIds: uniq([...input.keptMessageIds, ...systemIds])
          }
        )
      })
  }

  const keepRecentStrategy: ContextPruningStrategy = {
    strategyId: "keep-recent",
    apply: (input) =>
      Effect.sync(() => {
        const keepCount = Math.max(0, Math.floor(input.policy.keepRecentTurns))
        const turns = collectMessageTurns(input.messages)
        const recentIds = turns
          .slice(-keepCount)
          .flat()

        return appendDecision(
          input,
          "keep-recent",
          `kept ${recentIds.length} messages across ${Math.min(keepCount, turns.length)} recent turns`,
          {
            keptMessageIds: uniq([...input.keptMessageIds, ...recentIds])
          }
        )
      })
  }

  const keepPinnedStrategy: ContextPruningStrategy = {
    strategyId: "keep-pinned",
    apply: (input) =>
      Effect.sync(() => {
        const pinned = input.pinnedMessageIds.filter((messageId) =>
          input.messages.some((message) => message.messageId === messageId)
        )

        return appendDecision(
          input,
          "keep-pinned",
          `kept ${pinned.length} pinned messages`,
          {
            keptMessageIds: uniq([...input.keptMessageIds, ...pinned])
          }
        )
      })
  }

  const collectArtifactRefsStrategy: ContextPruningStrategy = {
    strategyId: "collect-artifact-refs",
    apply: (input) =>
      Effect.sync(() => {
        if (!input.policy.includeArtifactRefs) {
          return appendDecision(input, "collect-artifact-refs", "artifact references disabled", {})
        }

        const maxReferences = Math.max(0, Math.floor(input.policy.maxReferenceItems))
        const remaining = maxReferences - countReferenceItems(input.insertedBlocks)
        if (remaining <= 0) {
          return appendDecision(input, "collect-artifact-refs", "reference budget exhausted", {})
        }

        const selected = [...input.artifactRefs]
          .sort(
            (left, right) =>
              DateTime.toEpochMillis(right.createdAt) - DateTime.toEpochMillis(left.createdAt)
          )
          .slice(0, remaining)

        if (selected.length === 0) {
          return appendDecision(input, "collect-artifact-refs", "no artifact references available", {})
        }

        const lines = selected.map((artifact) =>
          `- \`${artifact.artifactId}\` (${artifact.purpose}, ${artifact.mediaType}, ${artifact.bytes} bytes)`
        )
        const block = renderTemplate(templates.artifactRefsBlockTemplate, {
          summary: "",
          items_markdown: lines.join("\n"),
          kept_context_markdown: ""
        })

        return appendDecision(
          input,
          "collect-artifact-refs",
          `inserted ${selected.length} artifact references`,
          {
            insertedBlocks: [...input.insertedBlocks, block]
          }
        )
      })
  }

  const collectToolRefsStrategy: ContextPruningStrategy = {
    strategyId: "collect-tool-refs",
    apply: (input) =>
      Effect.sync(() => {
        if (!input.policy.includeToolRefs) {
          return appendDecision(input, "collect-tool-refs", "tool references disabled", {})
        }

        const maxReferences = Math.max(0, Math.floor(input.policy.maxReferenceItems))
        const remaining = maxReferences - countReferenceItems(input.insertedBlocks)
        if (remaining <= 0) {
          return appendDecision(input, "collect-tool-refs", "reference budget exhausted", {})
        }

        const selected = [...input.toolRefs]
          .sort(
            (left, right) =>
              DateTime.toEpochMillis(right.invokedAt) - DateTime.toEpochMillis(left.invokedAt)
          )
          .slice(0, remaining)

        if (selected.length === 0) {
          return appendDecision(input, "collect-tool-refs", "no tool references available", {})
        }

        const lines = selected.map((toolRef) =>
          `- \`${toolRef.toolName}\` (\`${toolRef.toolInvocationId}\`): ${limitChars(toolRef.previewText, 140)}`
        )
        const block = renderTemplate(templates.toolRefsBlockTemplate, {
          summary: "",
          items_markdown: lines.join("\n"),
          kept_context_markdown: ""
        })

        return appendDecision(
          input,
          "collect-tool-refs",
          `inserted ${selected.length} tool references`,
          {
            insertedBlocks: [...input.insertedBlocks, block]
          }
        )
      })
  }

  const summarizeDroppedStrategy: ContextPruningStrategy = {
    strategyId: "summarize-dropped",
    apply: (input) =>
      Effect.sync(() => {
        const keptSet = new Set(input.keptMessageIds)
        const dropped = input.messages.filter((message) => !keptSet.has(message.messageId))
        const droppedMessageIds = dropped.map((message) => message.messageId)

        if (!input.policy.summaryEnabled || dropped.length === 0) {
          return appendDecision(
            input,
            "summarize-dropped",
            dropped.length === 0
              ? "no dropped messages"
              : "summary disabled",
            {
              droppedMessageIds
            }
          )
        }

        const rawSummary = dropped
          .map((message) => toMessageLine(message))
          .join("\n")
        const summary = limitChars(rawSummary, input.policy.summaryMaxChars)

        return appendDecision(
          input,
          "summarize-dropped",
          `summarized ${dropped.length} dropped messages`,
          {
            droppedMessageIds,
            summary
          }
        )
      })
  }

  const insertReferenceBlocksStrategy: ContextPruningStrategy = {
    strategyId: "insert-reference-blocks",
    apply: (input) =>
      Effect.sync(() => {
        const insertedBlocks = input.summary === null
          ? input.insertedBlocks
          : [
            renderTemplate(templates.summaryBlockTemplate, {
              summary: input.summary,
              items_markdown: "",
              kept_context_markdown: ""
            }),
            ...input.insertedBlocks
          ]

        const keptSet = new Set(input.keptMessageIds)
        const keptLines = input.messages
          .filter((message) => keptSet.has(message.messageId))
          .map((message) => toMessageLine(message))

        const sections: Array<string> = []
        if (insertedBlocks.length > 0) {
          sections.push(insertedBlocks.join("\n\n"))
        }
        if (keptLines.length > 0) {
          sections.push(
            renderTemplate(templates.keptContextBlockTemplate, {
              summary: "",
              items_markdown: "",
              kept_context_markdown: keptLines.join("\n")
            })
          )
        }

        return appendDecision(
          input,
          "insert-reference-blocks",
          `inserted ${insertedBlocks.length} reference blocks`,
          {
            insertedBlocks,
            compactedPrompt: sections.join("\n\n").trim()
          }
        )
      })
  }

  return [
    keepSystemStrategy,
    keepRecentStrategy,
    keepPinnedStrategy,
    collectArtifactRefsStrategy,
    collectToolRefsStrategy,
    summarizeDroppedStrategy,
    insertReferenceBlocksStrategy
  ]
}
