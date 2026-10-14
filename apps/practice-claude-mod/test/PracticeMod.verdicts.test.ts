import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import { assertSome } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import { ModHost } from "@/PracticeMod.host";
import { KgAnswerItem, VerdictRow } from "@/PracticeMod.values";
import { VerdictInput, VerdictLog, verdictLogLayer } from "@/PracticeMod.verdicts";

// What the fake host stored, so a test can seed and inspect it.
class FakeHostState extends Context.Service<
  FakeHostState,
  { readonly store: MutableHashMap.MutableHashMap<string, unknown> }
>()("@beep/practice-claude-mod/test/PracticeMod.verdicts.test/FakeHostState") {}

const fakeHost = Layer.effect(ModHost)(
  Effect.map(FakeHostState, ({ store }) =>
    ModHost.of({
      // Yield after each read so concurrent records interleave between read and write.
      storeGet: Effect.fn("FakeHost.storeGet")((key: string) =>
        Effect.sync(() => O.getOrUndefined(MutableHashMap.get(store, key))).pipe(Effect.tap(() => Effect.yieldNow))
      ),
      storeSet: Effect.fn("FakeHost.storeSet")((key: string, value: unknown) =>
        Effect.sync(() => void MutableHashMap.set(store, key, value))
      ),
      toast: Effect.fn("FakeHost.toast")((_text: string) => Effect.void),
      sessionId: Effect.succeed("s-1"),
      now: Effect.succeed(DateTime.makeUnsafe(1_000)),
    })
  )
);

const testLayer = () => {
  const state = Layer.sync(FakeHostState)(() => ({ store: MutableHashMap.empty<string, unknown>() }));
  return verdictLogLayer.pipe(Layer.provide(fakeHost), Layer.provideMerge(state));
};

const item = KgAnswerItem.make({
  itemId: "kg-answer:s-1:t-1",
  sessionId: "s-1",
  turnId: "t-1",
  question: "Which matter is 10008US01?",
  matter: O.none(),
});

const verdict = (value: O.Option<"right" | "wrong" | "partly">, note: O.Option<string> = O.none()) =>
  VerdictInput.make({ item, verdict: value, note });

const VerdictRows = S.Array(VerdictRow);

describe("VerdictLog", () => {
  it.layer(testLayer(), { timeout: "5 seconds" })("revisions", (it) => {
    it.effect(
      "appends revisions and reads the latest",
      Effect.fnUntraced(function* () {
        const log = yield* VerdictLog;
        const first = yield* log.record(verdict(O.some("wrong"), O.some("Missed the continuation.")));
        const second = yield* log.record(verdict(O.none()));
        const latest = yield* log.current(item.itemId);

        expect(first.revision).toBe(0);
        expect(second.revision).toBe(1);
        assertSome(
          O.map(latest, (row) => O.isNone(row.verdict)),
          true
        );
      })
    );
  });

  it.layer(testLayer(), { timeout: "5 seconds" })("locks", (it) => {
    it.effect(
      "refuses a verdict on a locked item",
      Effect.fnUntraced(function* () {
        const { store } = yield* FakeHostState;
        const locked = VerdictRow.make({
          schemaVersion: "practice-verdict/v1",
          itemId: item.itemId,
          verdict: O.some("right"),
          note: O.none(),
          revision: S.Natural.make(0),
          recordedAt: DateTime.makeUnsafe(0),
          lockedAt: O.some(DateTime.makeUnsafe(0)),
        });
        MutableHashMap.set(store, "verdict-rows", yield* S.encodeEffect(VerdictRows)([locked]));

        const log = yield* VerdictLog;
        const error = yield* Effect.flip(log.record(verdict(O.some("wrong"))));
        expect(error._tag).toBe("VerdictLocked");
      })
    );
  });

  it.layer(testLayer(), { timeout: "5 seconds" })("export", (it) => {
    it.effect(
      "exports one JSON line per revision",
      Effect.fnUntraced(function* () {
        const log = yield* VerdictLog;
        yield* log.record(verdict(O.some("right")));
        yield* log.record(verdict(O.some("partly"), O.some("Right family, wrong docket.")));
        const jsonl = yield* log.exportJsonl;

        expect(jsonl.trim().split("\n").length).toBe(2);
        expect(jsonl.includes('"verdict":"partly"')).toBe(true);
      })
    );
  });

  it.layer(testLayer(), { timeout: "5 seconds" })("concurrency", (it) => {
    it.effect(
      "keeps both revisions when two records overlap",
      Effect.fnUntraced(function* () {
        const log = yield* VerdictLog;
        const rows = yield* Effect.all([log.record(verdict(O.some("wrong"))), log.record(verdict(O.some("right")))], {
          concurrency: 2,
        });

        expect(
          A.sort(
            A.map(rows, (row) => row.revision),
            Order.Number
          )
        ).toEqual([0, 1]);
        const { store } = yield* FakeHostState;
        const stored = yield* store.pipe(
          MutableHashMap.get("verdict-rows"),
          O.getOrUndefined,
          S.decodeUnknownEffect(VerdictRows)
        );
        expect(stored).toHaveLength(2);
      })
    );
  });
});
