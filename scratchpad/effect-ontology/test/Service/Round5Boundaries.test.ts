import { Confidence } from "@beep/epistemic-domain/values/EvidenceSpan";
import * as BunCrypto from "@effect/platform-bun/BunCrypto";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import { IsoDateTimeString } from "../../Contract/ProgressStreaming.ts";
import { ExtractionRunId, UUID } from "../../Domain/Identity.ts";
import { EventId as CoreEventId } from "../../Domain/Model/CoreOntology.ts";
import { EventId as KnowledgeEventId } from "../../Domain/Schema/KnowledgeModel.ts";
import { getRunIdFromText } from "../../Service/ExtractionRun.ts";
import {
  createChunkProcessingComplete,
  createEntityFound,
  createExtractionFailed,
  createExtractionStarted,
  createRelationFound,
  makeProgressBuilder,
} from "../../Service/ProgressStreaming.ts";

const PosInt = S.Int.check(S.isGreaterThan(0, { message: "Expected a positive integer" }));

const decodePosIntResult = S.decodeResult(PosInt);
const isIsoDateTimeString = S.is(IsoDateTimeString);
const isUUID = S.is(UUID);
const isUUIDv4 = S.is(S.String.check(S.isUUID(4)));

describe("Round 5 canonical boundaries", () => {
  it("rejects invalid progress counts before the service boundary", () => {
    assert.isTrue(Result.isFailure(decodePosIntResult(0)));
  });

  it.layer(BunCrypto.layer)("with platform cryptography", (it) => {
    it.effect(
      "constructs progress event identity and time through canonical schemas",
      Effect.fnUntraced(function* () {
        const runId = ExtractionRunId.make("doc-deadbeefcafe");
        const builder = yield* makeProgressBuilder(runId, PosInt.make(2));
        const event = yield* createExtractionStarted(builder, {
          characterCount: PosInt.make(20),
          estimatedAvgChunkSize: PosInt.make(10),
        });

        assert.isTrue(isUUID(event.eventId));
        assert.isTrue(isUUIDv4(event.eventId));
        assert.isTrue(isIsoDateTimeString(event.timestamp));
        assert.strictEqual(event.runId, runId);
      })
    );

    it.effect(
      "dispatches builders with an optional last parameter in both call styles",
      Effect.fnUntraced(function* () {
        const builder = yield* makeProgressBuilder(ExtractionRunId.make("doc-deadbeefcafe"), PosInt.make(2));
        const confidence = Confidence.make(0.9);

        const found = yield* createEntityFound(builder, 0, "e1", "Ada", ["Person"]);
        const foundCurried = yield* pipe(builder, createEntityFound(0, "e1", "Ada", ["Person"], confidence));
        const related = yield* createRelationFound(builder, 0, "e1", "founded", "e2", true);
        const relatedCurried = yield* pipe(builder, createRelationFound(0, "e1", "founded", "e2", true, confidence));
        const complete = yield* createChunkProcessingComplete(builder, 0, 1, 1, PosInt.make(5));
        const completeCurried = yield* pipe(builder, createChunkProcessingComplete(0, 1, 1, PosInt.make(5), []));
        const failed = yield* createExtractionFailed(builder, "Timeout", "Timed out", true);
        const failedCurried = yield* pipe(
          builder,
          createExtractionFailed("Timeout", "Timed out", true, { isTemporary: true })
        );

        assert.strictEqual(found._tag, "entity_found");
        assert.isTrue(O.isNone(found.confidence));
        assert.isTrue(O.isSome(foundCurried.confidence));
        assert.strictEqual(related._tag, "relation_found");
        assert.isTrue(O.isSome(relatedCurried.confidence));
        assert.strictEqual(complete._tag, "chunk_processing_complete");
        assert.isTrue(O.isNone(complete.errors));
        assert.isTrue(O.isSome(completeCurried.errors));
        assert.strictEqual(failed.errorMessage, "Timed out");
        assert.isTrue(O.isNone(failed.retryStrategy));
        assert.isTrue(O.isSome(failedCurried.retryStrategy));
      })
    );

    it.effect(
      "constructs deterministic extraction IDs through the canonical owner",
      Effect.fnUntraced(function* () {
        const first = yield* getRunIdFromText("canonical content");
        const second = yield* getRunIdFromText("canonical content");

        assert.isTrue(S.is(ExtractionRunId)(first));
        assert.strictEqual(first, second);
      })
    );
  });

  it("shares one EventId schema identity across both domain surfaces", () => {
    assert.strictEqual(KnowledgeEventId, CoreEventId);
  });
});
