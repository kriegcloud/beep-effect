import { BatchConfig, BatchMachineState } from "@beep/knowledge-domain/value-objects";
import { mapActorStateToBatchState } from "@beep/knowledge-server/Workflow";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { deepStrictEqual, describe, effect } from "@beep/testkit";
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

        deepStrictEqual(result, {
          _tag: "BatchState.Pending",
          batchId,
        });
      })
    );
  });

  describe("Extracting", () => {
    effect(
      "maps Extracting to BatchState.Extracting renaming completedCount to completedDocuments",
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

        deepStrictEqual(result, {
          _tag: "BatchState.Extracting",
          batchId,
          completedDocuments: asNonNeg(2),
          totalDocuments: asNonNeg(3),
          progress: 0.67,
        });
      })
    );

    effect(
      "maps zero progress at start of extraction",
      Effect.fn(function* () {
        const state = BatchMachineState.Extracting({
          batchId,
          documentIds: ["doc-1"],
          config,
          completedCount: asNonNeg(0),
          failedCount: asNonNeg(0),
          totalDocuments: asNonNeg(10),
          entityCount: asNonNeg(0),
          relationCount: asNonNeg(0),
          progress: 0,
        });

        const result = mapActorStateToBatchState(state);

        deepStrictEqual(result, {
          _tag: "BatchState.Extracting",
          batchId,
          completedDocuments: asNonNeg(0),
          totalDocuments: asNonNeg(10),
          progress: 0,
        });
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

        deepStrictEqual(result, {
          _tag: "BatchState.Resolving",
          batchId,
          progress: 0.5,
        });
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

        deepStrictEqual(result, {
          _tag: "BatchState.Completed",
          batchId,
          totalDocuments: asNonNeg(10),
          entityCount: asNonNeg(42),
          relationCount: asNonNeg(18),
        });
      })
    );
  });

  describe("Failed", () => {
    effect(
      "maps Failed to BatchState.Failed renaming failedCount to failedDocuments",
      Effect.fn(function* () {
        const state = BatchMachineState.Failed({
          batchId,
          documentIds: ["doc-1"],
          config,
          failedCount: asNonNeg(3),
          error: "LLM rate limit exceeded",
        });

        const result = mapActorStateToBatchState(state);

        deepStrictEqual(result, {
          _tag: "BatchState.Failed",
          batchId,
          failedDocuments: asNonNeg(3),
          error: "LLM rate limit exceeded",
        });
      })
    );

    effect(
      "preserves error message verbatim",
      Effect.fn(function* () {
        const state = BatchMachineState.Failed({
          batchId,
          documentIds: [],
          config,
          failedCount: asNonNeg(0),
          error: "unexpected error: connection reset",
        });

        const result = mapActorStateToBatchState(state);

        deepStrictEqual(result, {
          _tag: "BatchState.Failed",
          batchId,
          failedDocuments: asNonNeg(0),
          error: "unexpected error: connection reset",
        });
      })
    );
  });

  describe("Cancelled", () => {
    effect(
      "maps Cancelled to BatchState.Cancelled renaming completedCount to completedDocuments",
      Effect.fn(function* () {
        const state = BatchMachineState.Cancelled({
          batchId,
          completedCount: asNonNeg(4),
          totalDocuments: asNonNeg(8),
        });

        const result = mapActorStateToBatchState(state);

        deepStrictEqual(result, {
          _tag: "BatchState.Cancelled",
          batchId,
          completedDocuments: asNonNeg(4),
          totalDocuments: asNonNeg(8),
        });
      })
    );

    effect(
      "handles zero completed documents on immediate cancellation",
      Effect.fn(function* () {
        const state = BatchMachineState.Cancelled({
          batchId,
          completedCount: asNonNeg(0),
          totalDocuments: asNonNeg(5),
        });

        const result = mapActorStateToBatchState(state);

        deepStrictEqual(result, {
          _tag: "BatchState.Cancelled",
          batchId,
          completedDocuments: asNonNeg(0),
          totalDocuments: asNonNeg(5),
        });
      })
    );
  });
});
