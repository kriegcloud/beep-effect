import { BatchConfig, BatchMachineState } from "@beep/knowledge-domain/value-objects";
import { mapActorStateToBatchState } from "@beep/knowledge-server/Workflow";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import type * as S from "effect/Schema";

type NonNegInt = S.Schema.Type<typeof S.NonNegativeInt>;
const asNonNeg = (n: number): NonNegInt => n as NonNegInt;

const batchId = KnowledgeEntityIds.BatchExecutionId.create();
const config = new BatchConfig({});

describe("mapActorStateToBatchState", () => {
  describe("Pending", () => {
    effect(
      "maps Pending to BatchState.Pending preserving batchId",
      Effect.fn(function* () {
        const state = BatchMachineState.Pending({
          batchId,
          documentIds: ["doc-1", "doc-2"],
          config,
        });

        const result = mapActorStateToBatchState(state);

        strictEqual(result._tag, "BatchState.Pending");
        strictEqual(result.batchId, batchId);
      })
    );
  });

  describe("Extracting", () => {
    effect(
      "maps Extracting to BatchState.Extracting with field renames",
      Effect.fn(function* () {
        const state = BatchMachineState.Extracting({
          batchId,
          documentIds: ["doc-1", "doc-2", "doc-3"],
          config,
          completedCount: asNonNeg(2),
          failedCount: asNonNeg(0),
          totalDocuments: asNonNeg(3),
          entityCount: asNonNeg(10),
          relationCount: asNonNeg(5),
          progress: 0.67,
        });

        const result = mapActorStateToBatchState(state);

        strictEqual(result._tag, "BatchState.Extracting");
        strictEqual(result.batchId, batchId);
        if (result._tag === "BatchState.Extracting") {
          strictEqual(result.completedDocuments, asNonNeg(2));
          strictEqual(result.totalDocuments, asNonNeg(3));
          strictEqual(result.progress, 0.67);
        }
      })
    );

    effect(
      "maps completedCount to completedDocuments",
      Effect.fn(function* () {
        const state = BatchMachineState.Extracting({
          batchId,
          documentIds: [],
          config,
          completedCount: asNonNeg(7),
          failedCount: asNonNeg(1),
          totalDocuments: asNonNeg(10),
          entityCount: asNonNeg(0),
          relationCount: asNonNeg(0),
          progress: 0.7,
        });

        const result = mapActorStateToBatchState(state);

        if (result._tag === "BatchState.Extracting") {
          strictEqual(result.completedDocuments, asNonNeg(7));
        }
      })
    );
  });

  describe("Resolving", () => {
    effect(
      "maps Resolving to BatchState.Resolving preserving batchId and progress",
      Effect.fn(function* () {
        const state = BatchMachineState.Resolving({
          batchId,
          config,
          totalDocuments: asNonNeg(5),
          entityCount: asNonNeg(20),
          relationCount: asNonNeg(10),
          progress: 0.5,
        });

        const result = mapActorStateToBatchState(state);

        strictEqual(result._tag, "BatchState.Resolving");
        strictEqual(result.batchId, batchId);
        if (result._tag === "BatchState.Resolving") {
          strictEqual(result.progress, 0.5);
        }
      })
    );
  });

  describe("Completed", () => {
    effect(
      "maps Completed to BatchState.Completed with all counts",
      Effect.fn(function* () {
        const state = BatchMachineState.Completed({
          batchId,
          totalDocuments: asNonNeg(10),
          entityCount: asNonNeg(42),
          relationCount: asNonNeg(18),
        });

        const result = mapActorStateToBatchState(state);

        strictEqual(result._tag, "BatchState.Completed");
        strictEqual(result.batchId, batchId);
        if (result._tag === "BatchState.Completed") {
          strictEqual(result.totalDocuments, asNonNeg(10));
          strictEqual(result.entityCount, asNonNeg(42));
          strictEqual(result.relationCount, asNonNeg(18));
        }
      })
    );
  });

  describe("Failed", () => {
    effect(
      "maps Failed to BatchState.Failed with field renames",
      Effect.fn(function* () {
        const state = BatchMachineState.Failed({
          batchId,
          documentIds: ["doc-1"],
          config,
          failedCount: asNonNeg(3),
          error: "LLM rate limit exceeded",
        });

        const result = mapActorStateToBatchState(state);

        strictEqual(result._tag, "BatchState.Failed");
        strictEqual(result.batchId, batchId);
        if (result._tag === "BatchState.Failed") {
          strictEqual(result.failedDocuments, asNonNeg(3));
          strictEqual(result.error, "LLM rate limit exceeded");
        }
      })
    );

    effect(
      "maps failedCount to failedDocuments",
      Effect.fn(function* () {
        const state = BatchMachineState.Failed({
          batchId,
          documentIds: [],
          config,
          failedCount: asNonNeg(0),
          error: "unexpected error",
        });

        const result = mapActorStateToBatchState(state);

        if (result._tag === "BatchState.Failed") {
          strictEqual(result.failedDocuments, asNonNeg(0));
        }
      })
    );
  });

  describe("Cancelled", () => {
    effect(
      "maps Cancelled to BatchState.Cancelled with field renames",
      Effect.fn(function* () {
        const state = BatchMachineState.Cancelled({
          batchId,
          completedCount: asNonNeg(4),
          totalDocuments: asNonNeg(8),
        });

        const result = mapActorStateToBatchState(state);

        strictEqual(result._tag, "BatchState.Cancelled");
        strictEqual(result.batchId, batchId);
        if (result._tag === "BatchState.Cancelled") {
          strictEqual(result.completedDocuments, asNonNeg(4));
          strictEqual(result.totalDocuments, asNonNeg(8));
        }
      })
    );

    effect(
      "maps completedCount to completedDocuments",
      Effect.fn(function* () {
        const state = BatchMachineState.Cancelled({
          batchId,
          completedCount: asNonNeg(0),
          totalDocuments: asNonNeg(5),
        });

        const result = mapActorStateToBatchState(state);

        if (result._tag === "BatchState.Cancelled") {
          strictEqual(result.completedDocuments, asNonNeg(0));
          strictEqual(result.totalDocuments, asNonNeg(5));
        }
      })
    );
  });
});
