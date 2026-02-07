import { BatchConfig, BatchMachineEvent, type BatchMachineState } from "@beep/knowledge-domain/value-objects";
import { makeBatchMachine } from "@beep/knowledge-server/Workflow";
import { assertNeverReaches, assertPath, assertReaches, createTestHarness, simulate } from "@beep/machine";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import type * as S from "effect/Schema";
import * as SubscriptionRef from "effect/SubscriptionRef";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type NonNegInt = S.Schema.Type<typeof S.NonNegativeInt>;
const asNonNeg = (n: number): NonNegInt => n as NonNegInt;

const defaultBatchId = () => KnowledgeEntityIds.BatchExecutionId.create();

const defaultDocIds = ["doc-1", "doc-2", "doc-3"];

const makeConfig = (
  overrides: Partial<{
    concurrency: number;
    failurePolicy: "continue-on-failure" | "abort-all" | "retry-failed";
    maxRetries: number;
    enableEntityResolution: boolean;
  }> = {}
) => new BatchConfig(overrides);

const makeMachine = (opts?: {
  batchId?: KnowledgeEntityIds.BatchExecutionId.Type;
  documentIds?: ReadonlyArray<string>;
  config?: BatchConfig;
}) =>
  makeBatchMachine({
    batchId: opts?.batchId ?? defaultBatchId(),
    documentIds: opts?.documentIds ?? defaultDocIds,
    config: opts?.config ?? makeConfig(),
  });

// ---------------------------------------------------------------------------
// Events helpers (with NonNegativeInt casts)
// ---------------------------------------------------------------------------

// Empty-field events are plain tagged values (not callable constructors).
// Non-empty field events are constructor functions requiring args.
type Evt = typeof BatchMachineEvent.Type;
const startExtraction = (): Evt => BatchMachineEvent.StartExtraction;

const documentCompleted = (documentId: string, entityCount: number, relationCount: number): Evt =>
  BatchMachineEvent.DocumentCompleted({
    documentId,
    entityCount: asNonNeg(entityCount),
    relationCount: asNonNeg(relationCount),
  });

const documentFailed = (documentId: string, error: string): Evt =>
  BatchMachineEvent.DocumentFailed({ documentId, error });

const extractionComplete = (opts: {
  successCount: number;
  failureCount: number;
  totalEntityCount: number;
  totalRelationCount: number;
}): Evt =>
  BatchMachineEvent.ExtractionComplete({
    successCount: asNonNeg(opts.successCount),
    failureCount: asNonNeg(opts.failureCount),
    totalEntityCount: asNonNeg(opts.totalEntityCount),
    totalRelationCount: asNonNeg(opts.totalRelationCount),
  });

const resolutionComplete = (mergeCount: number): Evt =>
  BatchMachineEvent.ResolutionComplete({ mergeCount: asNonNeg(mergeCount) });

const cancel = (): Evt => BatchMachineEvent.Cancel;
const retry = (): Evt => BatchMachineEvent.Retry;
const fail = (error: string): Evt => BatchMachineEvent.Fail({ error });

// ===========================================================================
// Tests
// ===========================================================================

describe("BatchMachine", () => {
  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------

  describe("initial state", () => {
    effect(
      "starts in Pending state",
      Effect.fn(function* () {
        const batchId = defaultBatchId();
        const machine = makeMachine({ batchId });
        strictEqual(machine.initial._tag, "Pending");
        strictEqual(machine.initial.batchId, batchId);
      })
    );

    effect(
      "preserves documentIds and config in initial state",
      Effect.fn(function* () {
        const config = makeConfig({ concurrency: 5, maxRetries: 3 });
        const machine = makeMachine({ documentIds: ["a", "b"], config });
        strictEqual(machine.initial._tag, "Pending");
        const pending = machine.initial as typeof BatchMachineState.Type & { _tag: "Pending" };
        strictEqual(pending.documentIds.length, 2);
        strictEqual(pending.config.concurrency, 5);
        strictEqual(pending.config.maxRetries, 3);
      })
    );
  });

  // -------------------------------------------------------------------------
  // Happy path transitions
  // -------------------------------------------------------------------------

  describe("happy path", () => {
    effect(
      "Pending -> StartExtraction -> Extracting",
      Effect.fn(function* () {
        const machine = makeMachine();
        const result = yield* simulate(machine, [startExtraction()]);
        strictEqual(result.finalState._tag, "Extracting");
      })
    );

    effect(
      "Extracting initializes counts to zero",
      Effect.fn(function* () {
        const machine = makeMachine({ documentIds: ["d1", "d2"] });
        const result = yield* simulate(machine, [startExtraction()]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Extracting" };
        strictEqual(s.completedCount, 0);
        strictEqual(s.failedCount, 0);
        strictEqual(s.totalDocuments, 2);
        strictEqual(s.entityCount, 0);
        strictEqual(s.relationCount, 0);
        strictEqual(s.progress, 0);
      })
    );

    effect(
      "full path with resolution disabled: Pending -> Extracting -> Completed",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: false }),
        });
        yield* assertPath(
          machine,
          [
            startExtraction(),
            documentCompleted("d1", 5, 3),
            extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 5, totalRelationCount: 3 }),
          ],
          ["Pending", "Extracting", "Extracting", "Completed"]
        );
      })
    );

    effect(
      "full path with resolution enabled: Pending -> Extracting -> Resolving -> Completed",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: true }),
        });
        yield* assertPath(
          machine,
          [
            startExtraction(),
            documentCompleted("d1", 5, 3),
            extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 5, totalRelationCount: 3 }),
            resolutionComplete(2),
          ],
          ["Pending", "Extracting", "Extracting", "Resolving", "Completed"]
        );
      })
    );
  });

  // -------------------------------------------------------------------------
  // Document processing
  // -------------------------------------------------------------------------

  describe("document processing", () => {
    effect(
      "DocumentCompleted increments completedCount, entityCount, relationCount",
      Effect.fn(function* () {
        const machine = makeMachine({ documentIds: ["d1", "d2", "d3"] });
        const result = yield* simulate(machine, [startExtraction(), documentCompleted("d1", 3, 2)]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Extracting" };
        strictEqual(s.completedCount, 1);
        strictEqual(s.entityCount, 3);
        strictEqual(s.relationCount, 2);
      })
    );

    effect(
      "DocumentCompleted updates progress correctly",
      Effect.fn(function* () {
        const machine = makeMachine({ documentIds: ["d1", "d2"] });
        const result = yield* simulate(machine, [startExtraction(), documentCompleted("d1", 1, 0)]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Extracting" };
        // 1 completed + 0 failed = 1 processed / 2 total = 0.5
        strictEqual(s.progress, 0.5);
      })
    );

    effect(
      "DocumentFailed increments failedCount and updates progress",
      Effect.fn(function* () {
        const machine = makeMachine({ documentIds: ["d1", "d2", "d3"] });
        const result = yield* simulate(machine, [startExtraction(), documentFailed("d1", "parse error")]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Extracting" };
        strictEqual(s.failedCount, 1);
        strictEqual(s.completedCount, 0);
        strictEqual(s.entityCount, 0);
        strictEqual(s.relationCount, 0);
        // 0 completed + 1 failed = 1 processed / 3 total
        const expectedProgress = 1 / 3;
        strictEqual(s.progress, expectedProgress);
      })
    );

    effect(
      "multiple document events accumulate correctly",
      Effect.fn(function* () {
        const machine = makeMachine({ documentIds: ["d1", "d2", "d3", "d4"] });
        const result = yield* simulate(machine, [
          startExtraction(),
          documentCompleted("d1", 3, 1),
          documentCompleted("d2", 5, 2),
          documentFailed("d3", "timeout"),
          documentCompleted("d4", 2, 0),
        ]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Extracting" };
        strictEqual(s.completedCount, 3);
        strictEqual(s.failedCount, 1);
        strictEqual(s.entityCount, 10); // 3 + 5 + 2
        strictEqual(s.relationCount, 3); // 1 + 2 + 0
        strictEqual(s.progress, 1); // 4 processed / 4 total
      })
    );

    effect(
      "reenter transitions produce Extracting states in path",
      Effect.fn(function* () {
        const machine = makeMachine({ documentIds: ["d1", "d2"] });
        yield* assertPath(
          machine,
          [startExtraction(), documentCompleted("d1", 1, 0), documentFailed("d2", "err")],
          ["Pending", "Extracting", "Extracting", "Extracting"]
        );
      })
    );
  });

  // -------------------------------------------------------------------------
  // Guard: isResolutionEnabled
  // -------------------------------------------------------------------------

  describe("isResolutionEnabled guard", () => {
    effect(
      "routes to Resolving when enableEntityResolution is true",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: true }),
        });
        const result = yield* simulate(machine, [
          startExtraction(),
          extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 5, totalRelationCount: 3 }),
        ]);
        strictEqual(result.finalState._tag, "Resolving");
      })
    );

    effect(
      "routes to Completed when enableEntityResolution is false",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: false }),
        });
        const result = yield* simulate(machine, [
          startExtraction(),
          extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 5, totalRelationCount: 3 }),
        ]);
        strictEqual(result.finalState._tag, "Completed");
      })
    );

    effect(
      "Resolving state preserves entity/relation counts from ExtractionComplete event",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: true }),
        });
        const result = yield* simulate(machine, [
          startExtraction(),
          extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 42, totalRelationCount: 17 }),
        ]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Resolving" };
        strictEqual(s.entityCount, 42);
        strictEqual(s.relationCount, 17);
        strictEqual(s.progress, 0);
      })
    );
  });

  // -------------------------------------------------------------------------
  // Guard: canRetry
  // -------------------------------------------------------------------------

  describe("canRetry guard", () => {
    effect(
      "allows retry when failedCount < maxRetries",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ maxRetries: 2 }),
        });
        // Get to Failed with failedCount=1 (< maxRetries=2)
        const result = yield* simulate(machine, [
          startExtraction(),
          documentFailed("d1", "err"),
          fail("batch error"),
          retry(),
        ]);
        strictEqual(result.finalState._tag, "Pending");
      })
    );

    effect(
      "blocks retry when failedCount >= maxRetries",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1", "d2"],
          config: makeConfig({ maxRetries: 1 }),
        });
        // Get to Failed with failedCount=2 (>= maxRetries=1)
        const result = yield* simulate(machine, [
          startExtraction(),
          documentFailed("d1", "err1"),
          documentFailed("d2", "err2"),
          fail("batch error"),
          retry(),
        ]);
        // Guard returns false, handler returns current state -> transitioned=true
        // but state remains Failed (same instance returned)
        strictEqual(result.finalState._tag, "Failed");
      })
    );

    effect(
      "allows retry when failedCount equals zero",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ maxRetries: 2 }),
        });
        // Fail from Extracting without any DocumentFailed events
        const result = yield* simulate(machine, [startExtraction(), fail("unexpected error"), retry()]);
        // failedCount=0 < maxRetries=2 -> retry allowed
        strictEqual(result.finalState._tag, "Pending");
      })
    );

    effect(
      "blocks retry when maxRetries is zero and failedCount is zero",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ maxRetries: 0 }),
        });
        const result = yield* simulate(machine, [startExtraction(), fail("unexpected error"), retry()]);
        // failedCount=0 is NOT < maxRetries=0, so guard blocks
        strictEqual(result.finalState._tag, "Failed");
      })
    );
  });

  // -------------------------------------------------------------------------
  // Cancellation
  // -------------------------------------------------------------------------

  describe("cancellation", () => {
    effect(
      "Extracting + Cancel -> Cancelled",
      Effect.fn(function* () {
        const machine = makeMachine();
        yield* assertReaches(machine, [startExtraction(), cancel()], "Cancelled");
      })
    );

    effect(
      "Cancelled from Extracting preserves completedCount and totalDocuments",
      Effect.fn(function* () {
        const machine = makeMachine({ documentIds: ["d1", "d2", "d3"] });
        const result = yield* simulate(machine, [startExtraction(), documentCompleted("d1", 2, 1), cancel()]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Cancelled" };
        strictEqual(s.completedCount, 1);
        strictEqual(s.totalDocuments, 3);
      })
    );

    effect(
      "Resolving + Cancel -> Cancelled",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: true }),
        });
        yield* assertReaches(
          machine,
          [
            startExtraction(),
            extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 5, totalRelationCount: 3 }),
            cancel(),
          ],
          "Cancelled"
        );
      })
    );

    effect(
      "Cancelled from Resolving sets completedCount to totalDocuments",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1", "d2"],
          config: makeConfig({ enableEntityResolution: true }),
        });
        const result = yield* simulate(machine, [
          startExtraction(),
          extractionComplete({ successCount: 2, failureCount: 0, totalEntityCount: 10, totalRelationCount: 5 }),
          cancel(),
        ]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Cancelled" };
        strictEqual(s.completedCount, 2);
        strictEqual(s.totalDocuments, 2);
      })
    );

    effect(
      "Pending + Cancel -> Cancelled (via onAny fallback)",
      Effect.fn(function* () {
        const machine = makeMachine();
        yield* assertReaches(machine, [cancel()], "Cancelled");
      })
    );

    effect(
      "Cancelled from Pending via onAny has zero counts",
      Effect.fn(function* () {
        const machine = makeMachine();
        const result = yield* simulate(machine, [cancel()]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Cancelled" };
        strictEqual(s.completedCount, 0);
        strictEqual(s.totalDocuments, 0);
      })
    );
  });

  // -------------------------------------------------------------------------
  // Failure
  // -------------------------------------------------------------------------

  describe("failure", () => {
    effect(
      "Extracting + Fail -> Failed",
      Effect.fn(function* () {
        const machine = makeMachine();
        yield* assertReaches(machine, [startExtraction(), fail("extraction crashed")], "Failed");
      })
    );

    effect(
      "Failed from Extracting preserves failedCount and error",
      Effect.fn(function* () {
        const machine = makeMachine({ documentIds: ["d1", "d2"] });
        const result = yield* simulate(machine, [
          startExtraction(),
          documentFailed("d1", "parse error"),
          fail("batch crashed"),
        ]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Failed" };
        strictEqual(s.failedCount, 1);
        strictEqual(s.error, "batch crashed");
      })
    );

    effect(
      "Resolving + Fail -> Failed",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: true }),
        });
        yield* assertReaches(
          machine,
          [
            startExtraction(),
            extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 5, totalRelationCount: 3 }),
            fail("resolution crashed"),
          ],
          "Failed"
        );
      })
    );

    effect(
      "Failed from Resolving has empty documentIds and zero failedCount",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: true }),
        });
        const result = yield* simulate(machine, [
          startExtraction(),
          extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 5, totalRelationCount: 3 }),
          fail("resolution crashed"),
        ]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Failed" };
        strictEqual(s.failedCount, 0);
        strictEqual(s.error, "resolution crashed");
        strictEqual(s.documentIds.length, 0);
      })
    );
  });

  // -------------------------------------------------------------------------
  // Terminal states
  // -------------------------------------------------------------------------

  describe("terminal states", () => {
    effect(
      "Completed is final - simulation stops at Completed",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: false }),
        });
        const result = yield* simulate(machine, [
          startExtraction(),
          extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 5, totalRelationCount: 3 }),
          // These events should be ignored because Completed is final
          startExtraction(),
          cancel(),
        ]);
        strictEqual(result.finalState._tag, "Completed");
        // Simulation breaks at final state, so only Pending -> Extracting -> Completed
        strictEqual(result.states.length, 3);
      })
    );

    effect(
      "Cancelled is final - simulation stops at Cancelled",
      Effect.fn(function* () {
        const machine = makeMachine();
        const result = yield* simulate(machine, [
          startExtraction(),
          cancel(),
          // These events should be ignored because Cancelled is final
          retry(),
          startExtraction(),
        ]);
        strictEqual(result.finalState._tag, "Cancelled");
        strictEqual(result.states.length, 3);
      })
    );
  });

  // -------------------------------------------------------------------------
  // Invalid transitions
  // -------------------------------------------------------------------------

  describe("invalid transitions", () => {
    effect(
      "Pending ignores DocumentCompleted (no transition defined)",
      Effect.fn(function* () {
        const machine = makeMachine();
        const result = yield* simulate(machine, [documentCompleted("d1", 5, 3)]);
        // No transition matched, stays in Pending
        strictEqual(result.finalState._tag, "Pending");
        strictEqual(result.states.length, 1); // Only initial state
      })
    );

    effect(
      "Pending ignores Retry (no transition defined)",
      Effect.fn(function* () {
        const machine = makeMachine();
        const result = yield* simulate(machine, [retry()]);
        strictEqual(result.finalState._tag, "Pending");
      })
    );

    effect(
      "Pending ignores ExtractionComplete (no transition defined)",
      Effect.fn(function* () {
        const machine = makeMachine();
        const result = yield* simulate(machine, [
          extractionComplete({ successCount: 0, failureCount: 0, totalEntityCount: 0, totalRelationCount: 0 }),
        ]);
        strictEqual(result.finalState._tag, "Pending");
      })
    );
  });

  // -------------------------------------------------------------------------
  // Retry flow
  // -------------------------------------------------------------------------

  describe("retry flow", () => {
    effect(
      "full cycle: Pending -> Extracting -> Failed -> Retry -> Pending",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ maxRetries: 3 }),
        });
        yield* assertPath(
          machine,
          [startExtraction(), fail("error"), retry()],
          ["Pending", "Extracting", "Failed", "Pending"]
        );
      })
    );

    effect(
      "retry preserves original config and documentIds",
      Effect.fn(function* () {
        const config = makeConfig({ maxRetries: 5, concurrency: 10 });
        const machine = makeMachine({
          documentIds: ["x", "y"],
          config,
        });
        const result = yield* simulate(machine, [startExtraction(), fail("error"), retry()]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Pending" };
        strictEqual(s.documentIds.length, 2);
        strictEqual(s.config.concurrency, 10);
        strictEqual(s.config.maxRetries, 5);
      })
    );

    effect(
      "multiple retries until maxRetries exhausted",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ maxRetries: 1 }),
        });
        // First attempt: Pending -> Extracting -> Failed (failedCount=0 from Fail)
        // Retry #1: Failed -> Pending (0 < 1, allowed)
        // Second attempt: Pending -> Extracting -> Failed (failedCount=1 from DocumentFailed + Fail)
        // Retry #2: should be blocked since failedCount=1 >= maxRetries=1
        const result = yield* simulate(machine, [
          startExtraction(),
          fail("error1"),
          retry(), // Allowed: failedCount=0 < maxRetries=1
          startExtraction(),
          documentFailed("d1", "err"),
          fail("error2"),
          retry(), // Blocked: failedCount=1 >= maxRetries=1
        ]);
        strictEqual(result.finalState._tag, "Failed");
      })
    );
  });

  // -------------------------------------------------------------------------
  // assertReaches / assertNeverReaches
  // -------------------------------------------------------------------------

  describe("assertion helpers", () => {
    effect(
      "assertReaches validates final state",
      Effect.fn(function* () {
        const machine = makeMachine();
        yield* assertReaches(machine, [startExtraction()], "Extracting");
      })
    );

    effect(
      "assertNeverReaches validates forbidden state is never visited",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: false }),
        });
        yield* assertNeverReaches(
          machine,
          [
            startExtraction(),
            extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 5, totalRelationCount: 3 }),
          ],
          "Resolving"
        );
      })
    );

    effect(
      "assertNeverReaches: happy path never reaches Failed",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: true }),
        });
        yield* assertNeverReaches(
          machine,
          [
            startExtraction(),
            documentCompleted("d1", 5, 3),
            extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 5, totalRelationCount: 3 }),
            resolutionComplete(2),
          ],
          "Failed"
        );
      })
    );
  });

  // -------------------------------------------------------------------------
  // createTestHarness
  // -------------------------------------------------------------------------

  describe("createTestHarness", () => {
    effect(
      "step-by-step state verification",
      Effect.fn(function* () {
        const machine = makeMachine({ documentIds: ["d1", "d2"] });
        const harness = yield* createTestHarness(machine);

        // Initial state
        const initial = yield* harness.getState;
        strictEqual(initial._tag, "Pending");

        // Start extraction
        yield* harness.send(startExtraction());
        const extracting = yield* harness.getState;
        strictEqual(extracting._tag, "Extracting");

        // Complete first document
        yield* harness.send(documentCompleted("d1", 3, 1));
        const afterDoc1 = yield* harness.getState;
        strictEqual(afterDoc1._tag, "Extracting");
        const e1 = afterDoc1 as typeof BatchMachineState.Type & { _tag: "Extracting" };
        strictEqual(e1.completedCount, 1);
        strictEqual(e1.entityCount, 3);

        // Complete second document
        yield* harness.send(documentCompleted("d2", 2, 4));
        const afterDoc2 = yield* harness.getState;
        const e2 = afterDoc2 as typeof BatchMachineState.Type & { _tag: "Extracting" };
        strictEqual(e2.completedCount, 2);
        strictEqual(e2.entityCount, 5);
        strictEqual(e2.relationCount, 5);
        strictEqual(e2.progress, 1); // 2/2 = 100%
      })
    );

    effect(
      "transition observer records transitions",
      Effect.fn(function* () {
        const machine = makeMachine({ documentIds: ["d1"] });
        const transitions: Array<{ from: string; event: string; to: string }> = [];

        const harness = yield* createTestHarness(machine, {
          onTransition: (from, event, to) => transitions.push({ from: from._tag, event: event._tag, to: to._tag }),
        });

        yield* harness.send(startExtraction());
        yield* harness.send(documentCompleted("d1", 1, 0));
        yield* harness.send(cancel());

        strictEqual(transitions.length, 3);
        strictEqual(transitions[0]!.from, "Pending");
        strictEqual(transitions[0]!.event, "StartExtraction");
        strictEqual(transitions[0]!.to, "Extracting");

        strictEqual(transitions[1]!.from, "Extracting");
        strictEqual(transitions[1]!.event, "DocumentCompleted");
        strictEqual(transitions[1]!.to, "Extracting"); // reenter

        strictEqual(transitions[2]!.from, "Extracting");
        strictEqual(transitions[2]!.event, "Cancel");
        strictEqual(transitions[2]!.to, "Cancelled");
      })
    );

    effect(
      "send returns current state when no transition matches",
      Effect.fn(function* () {
        const machine = makeMachine();
        const harness = yield* createTestHarness(machine);

        // Retry is not handled in Pending state
        const result = yield* harness.send(retry());
        strictEqual(result._tag, "Pending");
      })
    );

    effect(
      "harness state is accessible via SubscriptionRef",
      Effect.fn(function* () {
        const machine = makeMachine();
        const harness = yield* createTestHarness(machine);

        const state = yield* SubscriptionRef.get(harness.state);
        strictEqual(state._tag, "Pending");

        yield* harness.send(startExtraction());

        const updatedState = yield* SubscriptionRef.get(harness.state);
        strictEqual(updatedState._tag, "Extracting");
      })
    );
  });

  // -------------------------------------------------------------------------
  // Resolution complete
  // -------------------------------------------------------------------------

  describe("resolution complete", () => {
    effect(
      "Resolving + ResolutionComplete -> Completed",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: true }),
        });
        yield* assertReaches(
          machine,
          [
            startExtraction(),
            extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 10, totalRelationCount: 5 }),
            resolutionComplete(3),
          ],
          "Completed"
        );
      })
    );

    effect(
      "Completed state preserves counts from Resolving",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1", "d2"],
          config: makeConfig({ enableEntityResolution: true }),
        });
        const result = yield* simulate(machine, [
          startExtraction(),
          extractionComplete({ successCount: 2, failureCount: 0, totalEntityCount: 15, totalRelationCount: 7 }),
          resolutionComplete(4),
        ]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Completed" };
        strictEqual(s.totalDocuments, 2);
        strictEqual(s.entityCount, 15);
        strictEqual(s.relationCount, 7);
      })
    );
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  describe("edge cases", () => {
    effect(
      "empty document list produces zero totalDocuments in Extracting",
      Effect.fn(function* () {
        const machine = makeMachine({ documentIds: [] });
        const result = yield* simulate(machine, [startExtraction()]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Extracting" };
        strictEqual(s.totalDocuments, 0);
        strictEqual(s.progress, 0);
      })
    );

    effect(
      "progress calculation with zero totalDocuments does not divide by zero",
      Effect.fn(function* () {
        const machine = makeMachine({ documentIds: [] });
        const result = yield* simulate(machine, [startExtraction(), documentCompleted("ghost", 1, 0)]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Extracting" };
        // totalDocuments=0 -> progress=0 (guarded division)
        strictEqual(s.progress, 0);
      })
    );

    effect(
      "config defaults are applied correctly",
      Effect.fn(function* () {
        const config = makeConfig();
        strictEqual(config.concurrency, 3);
        strictEqual(config.failurePolicy, "continue-on-failure");
        strictEqual(config.maxRetries, 2);
        strictEqual(config.enableEntityResolution, true);
      })
    );

    effect(
      "Failed from Resolving allows retry (failedCount=0 < maxRetries)",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: true, maxRetries: 1 }),
        });
        const result = yield* simulate(machine, [
          startExtraction(),
          extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 5, totalRelationCount: 3 }),
          fail("resolution error"),
          retry(),
        ]);
        // Failed from Resolving has failedCount=0, maxRetries=1 -> 0 < 1 -> allowed
        strictEqual(result.finalState._tag, "Pending");
      })
    );

    effect(
      "Completed state entity/relation counts come from ExtractionComplete event (not Extracting state)",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: false }),
        });
        // DocumentCompleted sets entityCount=3, relationCount=2 on Extracting
        // But ExtractionComplete event specifies totalEntityCount=99, totalRelationCount=88
        // Completed should use the event values, not the accumulated state values
        const result = yield* simulate(machine, [
          startExtraction(),
          documentCompleted("d1", 3, 2),
          extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 99, totalRelationCount: 88 }),
        ]);
        const s = result.finalState as typeof BatchMachineState.Type & { _tag: "Completed" };
        strictEqual(s.entityCount, 99);
        strictEqual(s.relationCount, 88);
      })
    );
  });

  // -------------------------------------------------------------------------
  // simulate results structure
  // -------------------------------------------------------------------------

  describe("simulate results", () => {
    effect(
      "states array includes initial state as first element",
      Effect.fn(function* () {
        const machine = makeMachine();
        const result = yield* simulate(machine, [startExtraction()]);
        strictEqual(result.states[0]!._tag, "Pending");
        strictEqual(result.states[1]!._tag, "Extracting");
        strictEqual(result.states.length, 2);
      })
    );

    effect(
      "states array contains all intermediate states",
      Effect.fn(function* () {
        const machine = makeMachine({
          documentIds: ["d1"],
          config: makeConfig({ enableEntityResolution: true }),
        });
        const result = yield* simulate(machine, [
          startExtraction(),
          documentCompleted("d1", 1, 0),
          extractionComplete({ successCount: 1, failureCount: 0, totalEntityCount: 1, totalRelationCount: 0 }),
          resolutionComplete(0),
        ]);
        const tags = result.states.map((s) => s._tag);
        strictEqual(tags[0], "Pending");
        strictEqual(tags[1], "Extracting");
        strictEqual(tags[2], "Extracting"); // reenter from DocumentCompleted
        strictEqual(tags[3], "Resolving");
        strictEqual(tags[4], "Completed");
        strictEqual(result.states.length, 5);
      })
    );

    effect(
      "finalState matches last element of states array",
      Effect.fn(function* () {
        const machine = makeMachine();
        const result = yield* simulate(machine, [startExtraction(), cancel()]);
        const lastState = result.states[result.states.length - 1];
        strictEqual(result.finalState._tag, lastState!._tag);
        strictEqual(result.finalState, lastState);
      })
    );
  });
});
