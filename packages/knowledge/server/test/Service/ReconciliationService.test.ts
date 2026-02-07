import { ReconciliationService, ReconciliationServiceLive } from "@beep/knowledge-server/Service/ReconciliationService";
import { StorageMemoryLive } from "@beep/knowledge-server/Service/Storage";
import {
  WikidataCandidate,
  WikidataClient,
  type WikidataSearchOptions,
} from "@beep/knowledge-server/Service/WikidataClient";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

describe("ReconciliationService", () => {
  effect(
    "auto-links when candidate score exceeds threshold and then skips on subsequent runs",
    Effect.fn(
      function* () {
        const svc = yield* ReconciliationService;

        const first = yield* svc.reconcileEntity("urn:beep:entity:1", "Alice", [], {});
        strictEqual(first.decision, "auto_linked");
        assertTrue(O.isSome(first.bestMatch));
        strictEqual(first.bestMatch.value.qid, "Q1");

        const second = yield* svc.reconcileEntity("urn:beep:entity:1", "Alice", [], {});
        strictEqual(second.decision, "skipped");
      },
      Effect.provide(
        Layer.provide(
          ReconciliationServiceLive,
          Layer.mergeAll(
            StorageMemoryLive,
            Layer.succeed(WikidataClient, {
              searchEntities: (_query: string, _options?: WikidataSearchOptions) =>
                Effect.succeed([
                  new WikidataCandidate({ qid: "Q1", label: "Alice", score: 95, description: O.none() }),
                ]),
            })
          )
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
        Layer.provide(
          ReconciliationServiceLive,
          Layer.mergeAll(
            StorageMemoryLive,
            Layer.succeed(WikidataClient, {
              searchEntities: (_query: string, _options?: WikidataSearchOptions) =>
                Effect.succeed([new WikidataCandidate({ qid: "Q2", label: "Bob", score: 80, description: O.none() })]),
            })
          )
        )
      )
    )
  );
});
