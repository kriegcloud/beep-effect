/**
 * The review hub's questions from the poll cycle: with the hub configured,
 * every needs-review message in the ledger becomes one stored question, and
 * a repeated cycle stores nothing new. The data directory is a temporary
 * directory on the tests' in-memory file system; every message is synthetic.
 */
import { makeReviewFilesLayer, ReviewFilesConfig } from "@beep/law-practice-server/ReviewFiles";
import {
  DocketIntakeState,
  DocketLedgerRecord,
  DocketNeedsReview,
  DocketWrittenEntry,
} from "@beep/law-practice-use-cases/DocketIntake";
import { ReviewItemStore } from "@beep/law-practice-use-cases/ReviewItemStore";
import { LocalDate } from "@beep/schema/LocalDate";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import * as Str from "effect/String";
import { pollCycle } from "@/Cycle";
import { makeDocketQuestionPublisherLayer } from "@/Questions";
import { fixtureConfig } from "./support/Config.ts";
import { CryptoLayer, FilesLayer, PipelineHarness, PipelineLayer } from "./support/Pipeline.ts";

const needsReview = DocketLedgerRecord.make({
  attempts: 1,
  outcome: DocketNeedsReview.make({
    entry: DocketWrittenEntry.make({ eventId: "evt-needs-review" }),
    flags: ["dates-differ"],
    messageId: "m-review",
    reason: "agents-disagree",
  }),
  processedOn: LocalDate.make({ year: 1969, month: 12, day: 31 }),
  receivedAt: "2030-01-09T09:00:00.000Z",
});

const lineCount = (text: string) => A.length(A.filter(Str.split(text, "\n"), Str.isNonEmpty));

describe("@beep/docket-intake review hub questions", () => {
  it.layer(Layer.merge(PipelineLayer, FilesLayer), { timeout: "10 seconds" })((it) => {
    it.effect(
      "stores one question per needs-review message, and nothing new on the next cycle",
      Effect.fnUntraced(function* () {
        const fs = yield* FileSystem.FileSystem;
        const harness = yield* PipelineHarness;
        const directory = yield* fs.makeTempDirectoryScoped({ prefix: "review-hub-" });
        yield* Ref.update(harness.state, (state) =>
          DocketIntakeState.make({ ...state, ledger: { ...state.ledger, "m-review": needsReview } })
        );
        const publisher = yield* Layer.build(
          makeDocketQuestionPublisherLayer(directory).pipe(Layer.provide(CryptoLayer))
        );
        const store = Context.get(
          yield* Layer.build(makeReviewFilesLayer(ReviewFilesConfig.make({ dataDirectory: directory }))),
          ReviewItemStore
        );

        const first = yield* pollCycle(fixtureConfig).pipe(Effect.provideContext(publisher));
        const once = yield* fs.readFileString(`${directory}/items.jsonl`);
        yield* pollCycle(fixtureConfig).pipe(Effect.provideContext(publisher));
        const items = yield* store.list;

        expect([first.entered, first.needsReview]).toStrictEqual([1, 0]);
        expect(A.map(items, ({ itemId, kind }) => [kind, Str.replace(/:[0-9a-f]{32}$/u, "")(itemId)])).toStrictEqual([
          ["question", "docket-intake:agents-disagree"],
        ]);
        expect(lineCount(once)).toBe(1);
        expect(yield* fs.readFileString(`${directory}/items.jsonl`)).toBe(once);
      })
    );
  });
});
