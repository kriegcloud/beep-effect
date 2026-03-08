import type {
  ContextPruningError,
  ContextPruningInput,
  ContextPruningOutput,
  ContextPruningStrategy
} from "@template/domain/ports"
import { Effect } from "effect"

export const makeInitialContextPruningInput = (params: {
  readonly sessionId: ContextPruningInput["sessionId"]
  readonly messages: ContextPruningInput["messages"]
  readonly artifactRefs: ContextPruningInput["artifactRefs"]
  readonly toolRefs: ContextPruningInput["toolRefs"]
  readonly policy: ContextPruningInput["policy"]
  readonly pinnedMessageIds?: ContextPruningInput["pinnedMessageIds"]
}): ContextPruningInput => ({
  sessionId: params.sessionId,
  messages: params.messages,
  artifactRefs: params.artifactRefs,
  toolRefs: params.toolRefs,
  policy: params.policy,
  pinnedMessageIds: params.pinnedMessageIds ?? [],
  keptMessageIds: [],
  droppedMessageIds: [],
  insertedBlocks: [],
  summary: null,
  compactedPrompt: "",
  decisions: []
})

export const failContextPruning = (
  strategyId: string,
  message: string
): Effect.Effect<never, ContextPruningError> =>
  Effect.fail({
    _tag: "ContextPruningError" as const,
    strategyId,
    message
  })

export const runContextPruningPipeline = (
  strategies: ReadonlyArray<ContextPruningStrategy>,
  initial: ContextPruningInput
): Effect.Effect<ContextPruningOutput, ContextPruningError> =>
  Effect.gen(function*() {
    let state: ContextPruningOutput = initial

    for (const strategy of strategies) {
      state = yield* strategy.apply(state).pipe(
        Effect.catch((error) =>
          failContextPruning(
            error.strategyId || strategy.strategyId,
            error.message
          )
        )
      )
    }

    return state
  })
