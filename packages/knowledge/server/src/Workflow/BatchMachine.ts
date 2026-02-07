import { $KnowledgeServerId } from "@beep/identity/packages"
import {
  BatchMachineEvent,
  BatchMachineGuards,
  BatchMachineState,
} from "@beep/knowledge-domain/value-objects"
import { Machine, Slot } from "@beep/machine"
import * as A from "effect/Array"
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"

const _$I = $KnowledgeServerId.create("Workflow/BatchMachine")

// ---------------------------------------------------------------------------
// NonNegativeInt helper
// ---------------------------------------------------------------------------

type NonNegInt = S.Schema.Type<typeof S.NonNegativeInt>
const asNonNeg = (n: number): NonNegInt => n as NonNegInt

// ---------------------------------------------------------------------------
// Effects slot
// ---------------------------------------------------------------------------

export const BatchMachineEffects = Slot.Effects({
  emitBatchEvent: { event: S.Unknown },
  notifyProgress: {
    batchId: S.String,
    completedCount: S.Number,
    totalDocuments: S.Number,
  },
})

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export const makeBatchMachine = (params: {
  readonly batchId: S.Schema.Type<typeof BatchMachineState._definition.Pending.batchId>
  readonly documentIds: ReadonlyArray<string>
  readonly config: S.Schema.Type<typeof BatchMachineState._definition.Pending.config>
}) =>
  Machine.make({
    state: BatchMachineState,
    event: BatchMachineEvent,
    guards: BatchMachineGuards,
    effects: BatchMachineEffects,
    initial: BatchMachineState.Pending({
      batchId: params.batchId,
      documentIds: A.fromIterable(params.documentIds),
      config: params.config,
    }),
  })

    // -----------------------------------------------------------------------
    // 1. Pending + StartExtraction -> Extracting
    // -----------------------------------------------------------------------
    .on(BatchMachineState.Pending, BatchMachineEvent.StartExtraction, ({ state }) =>
      BatchMachineState.Extracting({
        batchId: state.batchId,
        documentIds: state.documentIds,
        config: state.config,
        completedCount: asNonNeg(0),
        failedCount: asNonNeg(0),
        totalDocuments: asNonNeg(A.length(state.documentIds)),
        entityCount: asNonNeg(0),
        relationCount: asNonNeg(0),
        progress: 0,
      })
    )

    // -----------------------------------------------------------------------
    // 2. Extracting + DocumentCompleted -> Extracting (reenter)
    // -----------------------------------------------------------------------
    .reenter(
      BatchMachineState.Extracting,
      BatchMachineEvent.DocumentCompleted,
      ({ state, event, effects }) =>
        Effect.gen(function* () {
          const newCompleted = asNonNeg(state.completedCount + 1)
          const newEntityCount = asNonNeg(state.entityCount + event.entityCount)
          const newRelationCount = asNonNeg(state.relationCount + event.relationCount)
          const processed = newCompleted + state.failedCount
          const progress = state.totalDocuments > 0 ? processed / state.totalDocuments : 0

          yield* effects.notifyProgress({
            batchId: state.batchId,
            completedCount: newCompleted,
            totalDocuments: state.totalDocuments,
          })

          return BatchMachineState.Extracting({
            batchId: state.batchId,
            documentIds: state.documentIds,
            config: state.config,
            completedCount: newCompleted,
            failedCount: state.failedCount,
            totalDocuments: state.totalDocuments,
            entityCount: newEntityCount,
            relationCount: newRelationCount,
            progress,
          })
        })
    )

    // -----------------------------------------------------------------------
    // 3. Extracting + DocumentFailed -> Extracting (reenter)
    // -----------------------------------------------------------------------
    .reenter(
      BatchMachineState.Extracting,
      BatchMachineEvent.DocumentFailed,
      ({ state }) => {
        const newFailed = asNonNeg(state.failedCount + 1)
        const processed = state.completedCount + newFailed
        const progress = state.totalDocuments > 0 ? processed / state.totalDocuments : 0

        return BatchMachineState.Extracting({
          batchId: state.batchId,
          documentIds: state.documentIds,
          config: state.config,
          completedCount: state.completedCount,
          failedCount: newFailed,
          totalDocuments: state.totalDocuments,
          entityCount: state.entityCount,
          relationCount: state.relationCount,
          progress,
        })
      }
    )

    // -----------------------------------------------------------------------
    // 4. Extracting + ExtractionComplete -> Resolving | Completed
    // -----------------------------------------------------------------------
    .on(
      BatchMachineState.Extracting,
      BatchMachineEvent.ExtractionComplete,
      ({ state, event, guards }) =>
        Effect.gen(function* () {
          const shouldResolve = yield* guards.isResolutionEnabled({})

          if (shouldResolve) {
            return BatchMachineState.Resolving({
              batchId: state.batchId,
              config: state.config,
              totalDocuments: state.totalDocuments,
              entityCount: asNonNeg(event.totalEntityCount),
              relationCount: asNonNeg(event.totalRelationCount),
              progress: 0,
            })
          }

          return BatchMachineState.Completed({
            batchId: state.batchId,
            totalDocuments: state.totalDocuments,
            entityCount: asNonNeg(event.totalEntityCount),
            relationCount: asNonNeg(event.totalRelationCount),
          })
        })
    )

    // -----------------------------------------------------------------------
    // 5. Extracting + Cancel -> Cancelled
    // -----------------------------------------------------------------------
    .on(BatchMachineState.Extracting, BatchMachineEvent.Cancel, ({ state }) =>
      BatchMachineState.Cancelled({
        batchId: state.batchId,
        completedCount: state.completedCount,
        totalDocuments: state.totalDocuments,
      })
    )

    // -----------------------------------------------------------------------
    // 6. Extracting + Fail -> Failed
    // -----------------------------------------------------------------------
    .on(BatchMachineState.Extracting, BatchMachineEvent.Fail, ({ state, event }) =>
      BatchMachineState.Failed({
        batchId: state.batchId,
        documentIds: state.documentIds,
        config: state.config,
        failedCount: state.failedCount,
        error: event.error,
      })
    )

    // -----------------------------------------------------------------------
    // 7. Resolving + ResolutionComplete -> Completed
    // -----------------------------------------------------------------------
    .on(BatchMachineState.Resolving, BatchMachineEvent.ResolutionComplete, ({ state }) =>
      BatchMachineState.Completed({
        batchId: state.batchId,
        totalDocuments: state.totalDocuments,
        entityCount: state.entityCount,
        relationCount: state.relationCount,
      })
    )

    // -----------------------------------------------------------------------
    // 8. Resolving + Cancel -> Cancelled
    // -----------------------------------------------------------------------
    .on(BatchMachineState.Resolving, BatchMachineEvent.Cancel, ({ state }) =>
      BatchMachineState.Cancelled({
        batchId: state.batchId,
        completedCount: state.totalDocuments,
        totalDocuments: state.totalDocuments,
      })
    )

    // -----------------------------------------------------------------------
    // 9. Resolving + Fail -> Failed
    // -----------------------------------------------------------------------
    .on(BatchMachineState.Resolving, BatchMachineEvent.Fail, ({ state, event }) =>
      BatchMachineState.Failed({
        batchId: state.batchId,
        documentIds: [],
        config: state.config,
        failedCount: asNonNeg(0),
        error: event.error,
      })
    )

    // -----------------------------------------------------------------------
    // 10. Failed + Retry -> Pending (guarded)
    // -----------------------------------------------------------------------
    .on(BatchMachineState.Failed, BatchMachineEvent.Retry, ({ state, guards }) =>
      Effect.gen(function* () {
        const allowed = yield* guards.canRetry({ maxRetries: state.config.maxRetries })

        if (allowed) {
          return BatchMachineState.Pending({
            batchId: state.batchId,
            documentIds: state.documentIds,
            config: state.config,
          })
        }

        return state
      })
    )

    // -----------------------------------------------------------------------
    // 11. onAny + Cancel -> Cancelled (fallback)
    // -----------------------------------------------------------------------
    .onAny(BatchMachineEvent.Cancel, ({ state }) => {
      const batchId = state.batchId
      return BatchMachineState.Cancelled({
        batchId,
        completedCount: asNonNeg(0),
        totalDocuments: asNonNeg(0),
      })
    })

    // -----------------------------------------------------------------------
    // Final states
    // -----------------------------------------------------------------------
    .final(BatchMachineState.Completed)
    .final(BatchMachineState.Cancelled)

    // -----------------------------------------------------------------------
    // Build with handler implementations
    // -----------------------------------------------------------------------
    .build({
      canRetry: ({ maxRetries }, { state }) =>
        BatchMachineState.$is("Failed")(state) && state.failedCount < maxRetries,

      isResolutionEnabled: (_params, { state }) =>
        Effect.succeed(
          BatchMachineState.$match(state, {
            Extracting: (s) => s.config.enableEntityResolution,
            Resolving: () => true,
            Pending: () => false,
            Completed: () => false,
            Failed: () => false,
            Cancelled: () => false,
          })
        ),

      emitBatchEvent: ({ event }) =>
        Effect.logDebug("BatchMachine: event emitted").pipe(Effect.annotateLogs({ event })),

      notifyProgress: ({ batchId, completedCount, totalDocuments }) =>
        Effect.logInfo("BatchMachine: progress").pipe(
          Effect.annotateLogs({ batchId, completedCount, totalDocuments })
        ),
    })

export type BatchMachine = ReturnType<typeof makeBatchMachine>
