import { ReconciliationService, ReconciliationServiceLive } from "@beep/knowledge-server/Service/ReconciliationService";
import { StorageMemoryLive } from "@beep/knowledge-server/Service/Storage";
import {
  WikidataCandidate,
  WikidataClient,
  type WikidataSearchOptions,
} from "@beep/knowledge-server/Service/WikidataClient";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const makeLive = (
  searchEntities: (_query: string, _options?: WikidataSearchOptions) => Effect.Effect<ReadonlyArray<WikidataCandidate>>
) =>
  Layer.provide(
    ReconciliationServiceLive,
    Layer.mergeAll(
      StorageMemoryLive,
      Layer.succeed(WikidataClient, {
        searchEntities,
      })
    )
  );

describe("ReconciliationService", () => {
  effect(
    "auto-links when candidate score exceeds threshold and then skips on subsequent runs",
    Effect.fn(
      function* () {
        const svc = yield* ReconciliationService;

        const first = yield* svc.reconcileEntity("urn:beep:entity:1", "Alice", []);
        strictEqual(first.decision, "auto_linked");
        assertTrue(O.isSome(first.bestMatch));
        strictEqual(first.bestMatch.value.qid, "Q1");

        const second = yield* svc.reconcileEntity("urn:beep:entity:1", "Alice", []);
        strictEqual(second.decision, "skipped");
      },
      Effect.provide(
        makeLive((_query: string, _options?: WikidataSearchOptions) =>
          Effect.succeed([new WikidataCandidate({ qid: "Q1", label: "Alice", score: 95, description: O.none() })])
        )
      )
    )
  );

  effect(
    "queues a verification task when candidate score is in review band",
    Effect.fn(
      function* () {
        const svc = yield* ReconciliationService;

        const result = yield* svc.reconcileEntity("urn:beep:entity:2", "Bob", [], {
          autoLinkThreshold: 90,
          queueThreshold: 50,
          maxCandidates: 5,
          language: "en",
        });

        strictEqual(result.decision, "queued");
        assertTrue(O.isSome(result.verificationTaskId));

        const pending = yield* svc.getPendingTasks();
        strictEqual(pending.length, 1);
        strictEqual(pending[0]!.entityIri, "urn:beep:entity:2");
      },
      Effect.provide(
        makeLive((_query: string, _options?: WikidataSearchOptions) =>
          Effect.succeed([new WikidataCandidate({ qid: "Q2", label: "Bob", score: 80, description: O.none() })])
        )
      )
    )
  );

  effect(
    "getLink returns none before linking and some after auto-linking",
    Effect.fn(
      function* () {
        const svc = yield* ReconciliationService;

        const before = yield* svc.getLink("urn:beep:entity:link-1");
        assertTrue(O.isNone(before));

        yield* svc.reconcileEntity("urn:beep:entity:link-1", "Alice", []);

        const after = yield* svc.getLink("urn:beep:entity:link-1");
        assertTrue(O.isSome(after));
        strictEqual(after.value.qid, "Q1");
      },
      Effect.provide(
        makeLive((_query: string, _options?: WikidataSearchOptions) =>
          Effect.succeed([new WikidataCandidate({ qid: "Q1", label: "Alice", score: 95, description: O.none() })])
        )
      )
    )
  );

  effect(
    "approveTask stores link and removes task from pending list",
    Effect.fn(
      function* () {
        const svc = yield* ReconciliationService;

        const result = yield* svc.reconcileEntity("urn:beep:entity:3", "Bob", [], {
          autoLinkThreshold: 90,
          queueThreshold: 50,
          maxCandidates: 5,
          language: "en",
        });

        strictEqual(result.decision, "queued");
        assertTrue(O.isSome(result.verificationTaskId));

        const taskId = result.verificationTaskId.value;
        yield* svc.approveTask(taskId, "Q2");

        const pending = yield* svc.getPendingTasks();
        strictEqual(pending.length, 0);

        const link = yield* svc.getLink("urn:beep:entity:3");
        assertTrue(O.isSome(link));
        strictEqual(link.value.qid, "Q2");

        const subsequent = yield* svc.reconcileEntity("urn:beep:entity:3", "Bob", []);
        strictEqual(subsequent.decision, "skipped");
      },
      Effect.provide(
        makeLive((_query: string, _options?: WikidataSearchOptions) =>
          Effect.succeed([new WikidataCandidate({ qid: "Q2", label: "Bob", score: 80, description: O.none() })])
        )
      )
    )
  );

  effect(
    "rejectTask removes task from pending list without storing a link",
    Effect.fn(
      function* () {
        const svc = yield* ReconciliationService;

        const result = yield* svc.reconcileEntity("urn:beep:entity:4", "Bob", [], {
          autoLinkThreshold: 90,
          queueThreshold: 50,
          maxCandidates: 5,
          language: "en",
        });

        strictEqual(result.decision, "queued");
        assertTrue(O.isSome(result.verificationTaskId));

        const taskId = result.verificationTaskId.value;
        yield* svc.rejectTask(taskId);

        const pending = yield* svc.getPendingTasks();
        strictEqual(pending.length, 0);

        const link = yield* svc.getLink("urn:beep:entity:4");
        assertTrue(O.isNone(link));
      },
      Effect.provide(
        makeLive((_query: string, _options?: WikidataSearchOptions) =>
          Effect.succeed([new WikidataCandidate({ qid: "Q2", label: "Bob", score: 80, description: O.none() })])
        )
      )
    )
  );

  effect(
    "approveTask and rejectTask fail when task does not exist",
    Effect.fn(
      function* () {
        const svc = yield* ReconciliationService;

        const approveEither = yield* Effect.either(svc.approveTask("does-not-exist", "Qx"));
        assertTrue(Either.isLeft(approveEither));
        strictEqual(approveEither.left._tag, "ReconciliationError");
        strictEqual(approveEither.left.message, "Task not found: does-not-exist");

        const rejectEither = yield* Effect.either(svc.rejectTask("does-not-exist"));
        assertTrue(Either.isLeft(rejectEither));
        strictEqual(rejectEither.left._tag, "ReconciliationError");
        strictEqual(rejectEither.left.message, "Task not found: does-not-exist");
      },
      Effect.provide(makeLive((_query: string, _options?: WikidataSearchOptions) => Effect.succeed([])))
    )
  );

  effect(
    "reconcileBatch reconciles multiple entities sequentially",
    Effect.fn(
      function* () {
        const svc = yield* ReconciliationService;

        const results = yield* svc.reconcileBatch([
          { iri: "urn:beep:entity:batch-1", label: "Alice" },
          { iri: "urn:beep:entity:batch-2", label: "Unknown" },
        ]);

        strictEqual(results.length, 2);
        strictEqual(results[0]!.decision, "auto_linked");
        strictEqual(results[1]!.decision, "no_match");
      },
      Effect.provide(
        makeLive((query: string, _options?: WikidataSearchOptions) =>
          query === "Alice"
            ? Effect.succeed([new WikidataCandidate({ qid: "Q1", label: "Alice", score: 95, description: O.none() })])
            : Effect.succeed([])
        )
      )
    )
  );
});
