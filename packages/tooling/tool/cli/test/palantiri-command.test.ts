import {
  AccountHeadroomInput,
  AccountHeadroomSource,
  AccountsReportInputJson,
  AccountsWindowRemaining,
  ParcelEnvelope,
  ParcelsReadSpan,
  reduceAccountHeadroom,
  SourceFailed,
} from "@beep/palantiri";
import {
  AccountRef,
  AccountsError,
  AccountsStatusReport,
  AccountsStatusReportJson,
  AccountsUsage,
  AccountUsage,
  AccountUsageOutcome,
  loadAccountsReport,
  UsageWindow,
} from "@beep/repo-cli/test/Accounts";
import {
  layerPalantiriRuntime,
  makeAccountHeadroomSourceLive,
  palantiriCommand,
  printParcel,
} from "@beep/repo-cli/test/Palantiri";
import { fcRuns } from "@beep/test-utils";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { assertSome } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Console from "effect/Console";
import { Command } from "effect/cli";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { pipe } from "effect/Function";
import * as HttpClient from "effect/http/HttpClient";
import * as Layer from "effect/Layer";
import * as Metric from "effect/Metric";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Tracer from "effect/Tracer";

const TRACE_ID = "4bf92f3577b34da6a3ce929d0e0e4736";
const TRACEPARENT = `00-${TRACE_ID}-00f067aa0ca902c7-01`;

const account = (provider: string, label: string) =>
  AccountRef.make({ provider, label, source: `/auth/${provider}-${label}.json` });

const okUsage = (ref: AccountRef, usedPercent: number) =>
  AccountUsage.make({
    account: ref,
    outcome: AccountUsageOutcome.cases.Ok.make({
      identity: O.some(ref.label),
      plan: O.some("max"),
      windows: [UsageWindow.make({ kind: "weekly", scope: O.none(), usedPercent, resetsAt: O.none() })],
      credits: [],
      limitResets: O.none(),
      asOf: O.none(),
    }),
  });

const stubAccountsUsage = (polls: Ref.Ref<number>) =>
  AccountsUsage.of({
    accounts: Effect.succeed([account("claude", "me@example.com"), account("codex", "work@example.com")]),
    poll: (ref) => Ref.update(polls, (count) => count + 1).pipe(Effect.as(okUsage(ref, 25))),
    signedIn: Effect.succeed([]),
    snapshots: Effect.succeed([]),
  });

// The CLI's own report, encoded and decoded by the library's input schema, so
// a drift between `accounts-status/v2` and the parcel input fails here.
const reportSource = Effect.gen(function* () {
  const polls = yield* Ref.make(0);
  const report = yield* loadAccountsReport(O.none()).pipe(
    Effect.provideService(AccountsUsage, stubAccountsUsage(polls))
  );
  const text = yield* AccountsStatusReportJson.encode(report);
  return AccountHeadroomInput.make({
    report: yield* S.decodeEffect(AccountsReportInputJson)(text),
    expectedProviders: ["claude", "codex"],
  });
}).pipe(Effect.orDie);

const captureOutput = Effect.fnUntraced(function* <A, E, R>(effect: Effect.Effect<A, E, R>) {
  const current = yield* Console.Console;
  let output = A.empty<string>();
  yield* effect.pipe(
    Effect.provideService(Console.Console, {
      ...current,
      log: (...values: ReadonlyArray<unknown>) => {
        output = A.appendAll(
          output,
          A.map(values, (value) => `${value}`)
        );
      },
    })
  );
  return A.join(output, "\n");
});

const withEnv = (env: Record<string, string>) =>
  Effect.provideService(ConfigProvider.ConfigProvider, ConfigProvider.fromEnv({ env }));

// Parcels never serve files, so file-response support gets a no-op filesystem.
const noFiles = Layer.mergeAll(FileSystem.layerNoop({}), Path.layer);

const spans = MutableHashMap.empty<string, Tracer.NativeSpan>();
const recordingTracer = Tracer.make({
  span(options) {
    const span = new Tracer.NativeSpan(options);
    MutableHashMap.set(spans, options.name, span);
    return span;
  },
});

const stubRuntime = layerPalantiriRuntime(
  Layer.effect(AccountHeadroomSource, Effect.succeed({ snapshot: reportSource })),
  Layer.succeed(Tracer.Tracer, recordingTracer)
).pipe(Layer.provide(noFiles));

describe("printParcel over a stub source", () => {
  it.layer(stubRuntime, { timeout: "30 seconds" })((it) => {
    it.effect("prints the envelope as JSON, nested under TRACEPARENT, and sets the gauge", () =>
      Effect.gen(function* () {
        const json = yield* captureOutput(printParcel("account-headroom", true)).pipe(withEnv({ TRACEPARENT }));
        const envelope = yield* S.decodeEffect(S.fromJsonString(ParcelEnvelope))(json);
        expect(envelope.parcel).toBe("account-headroom");
        expect(envelope.freshness._tag).toBe("Fresh");
        expect(A.map(envelope.items, (item) => [item.provider, item.account])).toEqual([
          ["claude", 1],
          ["codex", 1],
        ]);
        expect(pipe(json, Str.includes("@"))).toBe(false);
        assertSome(
          O.map(MutableHashMap.get(spans, ParcelsReadSpan.name), (span) => span.traceId),
          TRACE_ID
        );
        const gauges = A.filter(yield* Metric.snapshot, (metric) => metric.id === AccountsWindowRemaining.name);
        expect(A.map(gauges, (metric) => metric.attributes?.["beep.provider"])).toContain("openai");
        const text = yield* captureOutput(printParcel("account-headroom", false)).pipe(withEnv({}));
        expect(text).toContain("account-headroom: 2 of 2 accounts fresh");
        expect(text).toContain("claude #1  ok  weekly 75% left");
      })
    );
  });
});

const failingRuntime = layerPalantiriRuntime(
  Layer.succeed(AccountHeadroomSource, {
    snapshot: Effect.fail(SourceFailed.make({ parcel: "account-headroom", detail: "offline" })),
  }),
  Layer.empty
).pipe(Layer.provide(noFiles));

describe("printParcel over a failing source", () => {
  it.layer(failingRuntime, { timeout: "30 seconds" })((it) => {
    it.effect("serves Unknown{unreachable}", () =>
      Effect.gen(function* () {
        const json = yield* captureOutput(printParcel("account-headroom", true)).pipe(withEnv({}));
        const envelope = yield* S.decodeEffect(S.fromJsonString(ParcelEnvelope))(json);
        expect(envelope.freshness._tag === "Unknown" ? envelope.freshness.reason : "fresh").toBe("unreachable");
      })
    );
  });
});

describe("beep palantiri parcel account-headroom", () => {
  it("is registered under palantiri parcel", () => {
    const parcel = A.flatMap(palantiriCommand.subcommands, (group) => group.commands);
    expect(A.map(parcel, (command) => command.name)).toEqual(["parcel"]);
  });

  it.layer(NodeServices.layer, { timeout: "30 seconds" })((it) => {
    it.effect("runs the live command over a collector snapshot", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const root = yield* fs.makeTempDirectoryScoped({ prefix: "palantiri-command-test-" });
        const snapshots = path.join(root, "snapshots");
        yield* fs.makeDirectory(snapshots);
        const now = yield* DateTime.now;
        yield* fs.writeFileString(
          path.join(snapshots, "cursor.json"),
          `{"schemaVersion":"accounts-snapshot/v1","provider":"cursor","label":"me@example.com","capturedAt":"${DateTime.formatIso(now)}","plan":null,"windows":[{"kind":"cycle","scope":null,"usedPercent":14,"resetsAt":null}]}`
        );
        const json = yield* captureOutput(
          Command.runWith(palantiriCommand, { version: "0.0.0" })(["parcel", "account-headroom", "--json"])
        ).pipe(
          Effect.provideService(
            HttpClient.HttpClient,
            HttpClient.make(() => Effect.die("no network in this test"))
          ),
          withEnv({
            BEEP_ACCOUNTS_AUTH_DIR: path.join(root, "auth"),
            BEEP_ACCOUNTS_SNAPSHOT_DIR: snapshots,
            BEEP_PALANTIRI_STATE_ROOT: path.join(root, "palantiri"),
            HOME: root,
          })
        );
        const envelope = yield* S.decodeEffect(S.fromJsonString(ParcelEnvelope))(json);
        expect(A.map(envelope.items, (item) => [item.provider, item.account, item.state])).toEqual([
          ["cursor", 1, "ok"],
        ]);
        expect(pipe(json, Str.includes("@"))).toBe(false);
      })
    );

    it.effect("writes a snapshot, serves it while fresh, and polls again once it is stale", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const root = yield* fs.makeTempDirectoryScoped({ prefix: "palantiri-snapshot-test-" });
        const file = path.join(root, "account-headroom.json");
        const polls = yield* Ref.make(0);
        const source = yield* makeAccountHeadroomSourceLive.pipe(
          Effect.provideService(AccountsUsage, stubAccountsUsage(polls))
        );
        const read = source.snapshot.pipe(withEnv({ BEEP_PALANTIRI_STATE_ROOT: root }));
        const first = yield* read;
        expect(yield* Ref.get(polls)).toBe(2);
        expect(yield* fs.exists(file)).toBe(true);
        const cached = yield* read;
        expect(yield* Ref.get(polls)).toBe(2);
        expect(cached.report.generatedAt).toEqual(first.report.generatedAt);
        expect(first.expectedProviders).toEqual(["claude", "codex"]);
        // Age the snapshot past the five-minute bound.
        const written = yield* fs.readFileString(file).pipe(Effect.flatMap(AccountsStatusReportJson.decode));
        const aged = AccountsStatusReport.make({
          ...written,
          generatedAt: DateTime.subtract(written.generatedAt, { minutes: 6 }),
        });
        yield* AccountsStatusReportJson.encode(aged).pipe(Effect.flatMap((text) => fs.writeFileString(file, text)));
        yield* read;
        expect(yield* Ref.get(polls)).toBe(4);
        // A live poll that fails serves the stale snapshot instead.
        yield* AccountsStatusReportJson.encode(aged).pipe(Effect.flatMap((text) => fs.writeFileString(file, text)));
        const offline = yield* makeAccountHeadroomSourceLive.pipe(
          Effect.provideService(
            AccountsUsage,
            AccountsUsage.of({
              ...stubAccountsUsage(polls),
              accounts: Effect.fail(AccountsError.make({ reason: "io", message: "auth directory unreadable" })),
            })
          )
        );
        const served = yield* offline.snapshot.pipe(withEnv({ BEEP_PALANTIRI_STATE_ROOT: root }));
        expect(served.report.generatedAt).toEqual(aged.generatedAt);
        expect(served.expectedProviders).toEqual([]);
        const parcel = reduceAccountHeadroom(served, yield* DateTime.now, 20);
        expect(parcel.freshness._tag === "Unknown" ? parcel.freshness.reason : "fresh").toBe("stale");
      })
    );
  });
});

describe("accounts report to parcel input", () => {
  it.effect.prop(
    "every accounts-status/v2 report decodes as the parcel input with the same rows",
    [Arbitrary.schema(AccountsStatusReport)],
    Effect.fnUntraced(function* ([report]) {
      const text = yield* AccountsStatusReportJson.encode(report);
      const input = yield* S.decodeEffect(AccountsReportInputJson)(text);
      expect(A.flatMap(input.groups, (group) => group.rows).length).toBe(
        A.flatMap(report.groups, (group) => group.rows).length
      );
    }),
    { arbitrary: fcRuns(24) }
  );
});
