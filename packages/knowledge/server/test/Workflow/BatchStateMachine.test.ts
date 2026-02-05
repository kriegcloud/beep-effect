import { BatchNotFoundError, InvalidStateTransitionError } from "@beep/knowledge-domain/errors";
import type { BatchState } from "@beep/knowledge-domain/value-objects";
import { BatchStateMachine, BatchStateMachineLive } from "@beep/knowledge-server/Workflow";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import type * as S from "effect/Schema";

type NonNegInt = S.Schema.Type<typeof S.NonNegativeInt>;
const asNonNeg = (n: number): NonNegInt => n as NonNegInt;

const extractingState = (batchId: KnowledgeEntityIds.BatchExecutionId.Type): BatchState =>
  ({
    _tag: "BatchState.Extracting",
    batchId,
    completedDocuments: asNonNeg(0),
    totalDocuments: asNonNeg(5),
    progress: 0,
  }) as BatchState;

const completedState = (batchId: KnowledgeEntityIds.BatchExecutionId.Type): BatchState =>
  ({
    _tag: "BatchState.Completed",
    batchId,
    totalDocuments: asNonNeg(5),
    entityCount: asNonNeg(10),
    relationCount: asNonNeg(3),
  }) as BatchState;

const failedState = (batchId: KnowledgeEntityIds.BatchExecutionId.Type): BatchState =>
  ({
    _tag: "BatchState.Failed",
    batchId,
    failedDocuments: asNonNeg(2),
    error: "test error",
  }) as BatchState;

const pendingState = (batchId: KnowledgeEntityIds.BatchExecutionId.Type): BatchState =>
  ({
    _tag: "BatchState.Pending",
    batchId,
  }) as BatchState;

const resolvingState = (batchId: KnowledgeEntityIds.BatchExecutionId.Type): BatchState =>
  ({
    _tag: "BatchState.Resolving",
    batchId,
    progress: 0,
  }) as BatchState;

describe("BatchStateMachine", () => {
  describe("create", () => {
    effect(
      "creates a batch in Pending state",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;
        const batchId = KnowledgeEntityIds.BatchExecutionId.create();

        const state = yield* sm.create(batchId);

        strictEqual(state._tag, "BatchState.Pending");
      }, Effect.provide(BatchStateMachineLive))
    );

    effect(
      "returns the batch id in state",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;
        const batchId = KnowledgeEntityIds.BatchExecutionId.create();

        const state = yield* sm.create(batchId);

        strictEqual(state.batchId, batchId);
      }, Effect.provide(BatchStateMachineLive))
    );
  });

  describe("getState", () => {
    effect(
      "returns current state for existing batch",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;
        const batchId = KnowledgeEntityIds.BatchExecutionId.create();

        yield* sm.create(batchId);
        const state = yield* sm.getState(batchId);

        strictEqual(state._tag, "BatchState.Pending");
        strictEqual(state.batchId, batchId);
      }, Effect.provide(BatchStateMachineLive))
    );

    effect(
      "fails with BatchNotFoundError for unknown batch",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;
        const batchId = KnowledgeEntityIds.BatchExecutionId.create();

        const result = yield* Effect.either(sm.getState(batchId));

        assertTrue(Either.isLeft(result));
        assertTrue(result.left instanceof BatchNotFoundError);
      }, Effect.provide(BatchStateMachineLive))
    );
  });

  describe("transition", () => {
    effect(
      "transitions from Pending to Extracting",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;
        const batchId = KnowledgeEntityIds.BatchExecutionId.create();

        yield* sm.create(batchId);
        const state = yield* sm.transition(batchId, extractingState(batchId));

        strictEqual(state._tag, "BatchState.Extracting");
        strictEqual(state.batchId, batchId);
      }, Effect.provide(BatchStateMachineLive))
    );

    effect(
      "transitions from Extracting to Completed",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;
        const batchId = KnowledgeEntityIds.BatchExecutionId.create();

        yield* sm.create(batchId);
        yield* sm.transition(batchId, extractingState(batchId));
        const state = yield* sm.transition(batchId, completedState(batchId));

        strictEqual(state._tag, "BatchState.Completed");
      }, Effect.provide(BatchStateMachineLive))
    );

    effect(
      "transitions from Extracting to Failed",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;
        const batchId = KnowledgeEntityIds.BatchExecutionId.create();

        yield* sm.create(batchId);
        yield* sm.transition(batchId, extractingState(batchId));
        const state = yield* sm.transition(batchId, failedState(batchId));

        strictEqual(state._tag, "BatchState.Failed");
      }, Effect.provide(BatchStateMachineLive))
    );

    effect(
      "transitions from Extracting to Resolving",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;
        const batchId = KnowledgeEntityIds.BatchExecutionId.create();

        yield* sm.create(batchId);
        yield* sm.transition(batchId, extractingState(batchId));
        const state = yield* sm.transition(batchId, resolvingState(batchId));

        strictEqual(state._tag, "BatchState.Resolving");
      }, Effect.provide(BatchStateMachineLive))
    );

    effect(
      "transitions from Failed to Pending (retry)",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;
        const batchId = KnowledgeEntityIds.BatchExecutionId.create();

        yield* sm.create(batchId);
        yield* sm.transition(batchId, extractingState(batchId));
        yield* sm.transition(batchId, failedState(batchId));
        const state = yield* sm.transition(batchId, pendingState(batchId));

        strictEqual(state._tag, "BatchState.Pending");
      }, Effect.provide(BatchStateMachineLive))
    );

    effect(
      "rejects invalid transition from Pending to Completed",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;
        const batchId = KnowledgeEntityIds.BatchExecutionId.create();

        yield* sm.create(batchId);
        const result = yield* Effect.either(sm.transition(batchId, completedState(batchId)));

        assertTrue(Either.isLeft(result));
        assertTrue(result.left instanceof InvalidStateTransitionError);
      }, Effect.provide(BatchStateMachineLive))
    );

    effect(
      "rejects invalid transition from Completed to Extracting",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;
        const batchId = KnowledgeEntityIds.BatchExecutionId.create();

        yield* sm.create(batchId);
        yield* sm.transition(batchId, extractingState(batchId));
        yield* sm.transition(batchId, completedState(batchId));

        const result = yield* Effect.either(sm.transition(batchId, extractingState(batchId)));

        assertTrue(Either.isLeft(result));
        assertTrue(result.left instanceof InvalidStateTransitionError);
      }, Effect.provide(BatchStateMachineLive))
    );

    effect(
      "fails with BatchNotFoundError when transitioning unknown batch",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;
        const batchId = KnowledgeEntityIds.BatchExecutionId.create();

        const result = yield* Effect.either(sm.transition(batchId, extractingState(batchId)));

        assertTrue(Either.isLeft(result));
        assertTrue(result.left instanceof BatchNotFoundError);
      }, Effect.provide(BatchStateMachineLive))
    );
  });

  describe("canTransition", () => {
    effect(
      "returns true for valid transitions",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;

        assertTrue(sm.canTransition("BatchState.Pending", "BatchState.Extracting"));
        assertTrue(sm.canTransition("BatchState.Extracting", "BatchState.Completed"));
        assertTrue(sm.canTransition("BatchState.Extracting", "BatchState.Failed"));
        assertTrue(sm.canTransition("BatchState.Extracting", "BatchState.Resolving"));
        assertTrue(sm.canTransition("BatchState.Resolving", "BatchState.Completed"));
        assertTrue(sm.canTransition("BatchState.Failed", "BatchState.Pending"));
      }, Effect.provide(BatchStateMachineLive))
    );

    effect(
      "returns false for invalid transitions",
      Effect.fn(function* () {
        const sm = yield* BatchStateMachine;

        strictEqual(sm.canTransition("BatchState.Pending", "BatchState.Completed"), false);
        strictEqual(sm.canTransition("BatchState.Completed", "BatchState.Extracting"), false);
        strictEqual(sm.canTransition("BatchState.Completed", "BatchState.Pending"), false);
        strictEqual(sm.canTransition("BatchState.Cancelled", "BatchState.Pending"), false);
      }, Effect.provide(BatchStateMachineLive))
    );
  });
});
