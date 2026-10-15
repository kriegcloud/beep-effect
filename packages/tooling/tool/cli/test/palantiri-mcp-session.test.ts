import {
  AccountHeadroomSource,
  AdmissionSlotsInput,
  HostMemoryInput,
  HostPressureInput,
  HostPressureSource,
  InboxRowInput,
  LaneCheckoutInput,
  LaneRedsInput,
  LaneRedsSource,
  PalantiriClient,
  PressureFile,
  PressureSourceInput,
  parcelSpecs,
  SinceLastCheckSource,
  SourceFailed,
} from "@beep/palantiri";
import {
  HOT_PARCELS_FILE,
  HOT_PARCELS_TIMEOUT,
  HotParcelLine,
  HotParcelsJson,
  hotParcels,
  layerPalantiriRuntime,
  layerPalantiriToolHandlers,
  PalantiriToolkit,
  ParcelCatalog,
  parcelToolName,
  printHotParcels,
  printParcel,
  renderHotBlock,
  servePalantiriMcp,
  stageHotParcels,
} from "@beep/repo-cli/test/Palantiri";
import * as MemoryFileSystem from "@beep/test-utils/MemoryFileSystem";
import { describe, expect, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Console from "effect/Console";
import * as DateTime from "effect/DateTime";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as FileSystem from "effect/FileSystem";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import * as TestClock from "effect/testing/TestClock";
import type { ParcelId } from "@beep/palantiri";

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

const noFiles = Layer.mergeAll(FileSystem.layerNoop({}), Path.layer);

const memoryFiles = Layer.mergeAll(MemoryFileSystem.layer, Path.layer);

const offline = (parcel: "account-headroom" | "lane-reds" | "host-pressure" | "since-last-check") =>
  Effect.fail(SourceFailed.make({ parcel, detail: "not wired in this test" }));

const CPU = "some avg10=2.13 avg60=1.05 avg300=0.48 total=987654321\nfull avg10=0.00 avg60=0.00 avg300=0.00 total=0\n";

const pressureAt = (readAt: DateTime.Utc) =>
  HostPressureInput.make({
    readAt,
    pressure: PressureSourceInput.cases.Read.make({
      files: [
        PressureFile.make({ resource: "cpu", text: CPU }),
        PressureFile.make({ resource: "memory", text: CPU }),
        PressureFile.make({ resource: "io", text: CPU }),
      ],
    }),
    memory: O.some(HostMemoryInput.make({ availableGib: 40, totalGib: 62.5 })),
    admission: O.some(
      AdmissionSlotsInput.make({ capacityTokens: 3, activeTokens: 1, queued: 0, dead: 0, hardFloorEngaged: false })
    ),
  });

const lanesAt = (now: DateTime.Utc) =>
  LaneRedsInput.make({
    checkouts: [
      LaneCheckoutInput.make({
        lane: "lane-a",
        branch: O.some("feat/lane-a"),
        inboxReadable: true,
        skippedLines: 0,
        rows: [
          InboxRowInput.make({
            kind: "check-failed",
            severity: "P0",
            prNumber: O.some(1817),
            summary: "Check / Coverage failure",
            observedAt: O.some(now),
            acked: false,
            superseded: false,
          }),
        ],
        jobs: O.some([]),
      }),
    ],
  });

const sinceLastCheckOffline = Layer.succeed(SinceLastCheckSource, {
  read: Effect.fn("SinceLastCheckSource.stub.read")(() => offline("since-last-check")),
  advance: Effect.fn("SinceLastCheckSource.stub.advance")(() => offline("since-last-check")),
});

// Account headroom offline, lane reds and host pressure fresh at the clock's now.
const workingSources = Layer.mergeAll(
  Layer.succeed(AccountHeadroomSource, { snapshot: offline("account-headroom") }),
  Layer.succeed(LaneRedsSource, { snapshot: Effect.map(DateTime.now, lanesAt) }),
  Layer.succeed(HostPressureSource, { snapshot: Effect.map(DateTime.now, pressureAt) }),
  sinceLastCheckOffline
);

// Lane reds never answers.
const hangingSources = Layer.mergeAll(
  Layer.succeed(AccountHeadroomSource, { snapshot: offline("account-headroom") }),
  Layer.succeed(LaneRedsSource, { snapshot: Effect.never }),
  Layer.succeed(HostPressureSource, { snapshot: Effect.map(DateTime.now, pressureAt) }),
  sinceLastCheckOffline
);

const runtimeOver = <E>(
  sources: Layer.Layer<AccountHeadroomSource | LaneRedsSource | HostPressureSource | SinceLastCheckSource, E>
) => sources.pipe(layerPalantiriRuntime(Layer.empty), Layer.provide(noFiles));

const NOON = DateTime.makeUnsafe("2026-10-15T12:00:00.000Z");

const atNoon = NOON.pipe(DateTime.toEpochMillis, TestClock.setTime);

const toolText = Effect.fnUntraced(function* (name: keyof typeof PalantiriToolkit.tools) {
  const toolkit = yield* PalantiriToolkit;
  const results = yield* toolkit.handle(name, {}).pipe(Effect.flatMap(Stream.runCollect));
  const final = A.findLast(results, (result) => !result.preliminary);
  expect(O.isSome(final)).toBe(true);
  // The text content the MCP server sends: the encoded result as JSON.
  return O.match(final, { onNone: () => "", onSome: (result) => JSON.stringify(result.encodedResult) });
});

const toolHandlers = layerPalantiriToolHandlers.pipe(Layer.provideMerge(runtimeOver(workingSources)));

describe("beep palantiri mcp", () => {
  it.layer(toolHandlers, { timeout: "30 seconds" })("over stub sources", (it) => {
    it.effect("serves byte-identical JSON to `parcel <id> --json`", () =>
      Effect.gen(function* () {
        yield* atNoon;
        const parcels: ReadonlyArray<readonly [ParcelId, keyof typeof PalantiriToolkit.tools]> = [
          ["lane-reds", "palantiri_lane_reds"],
          ["host-pressure", "palantiri_host_pressure"],
          ["app-error-classes", "palantiri_app_error_classes"],
          ["account-headroom", "palantiri_account_headroom"],
        ];
        yield* Effect.forEach(
          parcels,
          Effect.fnUntraced(function* ([id, tool]) {
            const cli = yield* captureOutput(printParcel(id, true));
            const mcp = yield* toolText(tool);
            expect(mcp).toBe(cli);
            expect(pipe(mcp, Str.includes("@"))).toBe(false);
          }),
          { discard: true }
        );
      })
    );

    it.effect("lists every parcel with the tool that reads it", () =>
      Effect.gen(function* () {
        const listing = yield* toolText("palantiri_parcels");
        const catalog = yield* S.decodeEffect(S.fromJsonString(ParcelCatalog))(listing);
        expect(A.map(catalog.parcels, (parcel) => parcel.id)).toEqual(A.map(parcelSpecs, (spec) => spec.id));
        A.forEach(catalog.parcels, (parcel) => {
          expect(parcel.tool).toBe(parcelToolName(parcel.id));
          expect(Object.keys(PalantiriToolkit.tools)).toContain(parcel.tool);
        });
      })
    );
  });

  it.effect("pins log output to stderr while it serves", () =>
    Effect.gen(function* () {
      const seen = yield* Deferred.make<boolean>();
      const probe = Layer.effectDiscard(
        Effect.gen(function* () {
          yield* Deferred.succeed(seen, yield* Logger.LogToStderr);
        })
      );
      const fiber = yield* probe.pipe(servePalantiriMcp, Effect.forkChild);
      expect(yield* Deferred.await(seen)).toBe(true);
      yield* Fiber.interrupt(fiber);
      // Outside the host the default stays stdout.
      expect(yield* Logger.LogToStderr).toBe(false);
    })
  );
});

describe("beep session open hot parcels", () => {
  it.effect("prints one line per hot parcel with its freshness", () =>
    Effect.gen(function* () {
      yield* atNoon;
      const result = yield* workingSources.pipe(runtimeOver, hotParcels(HOT_PARCELS_TIMEOUT));
      const lines = renderHotBlock(result);
      expect(lines).toEqual([
        "[palantiri] hot parcels (bun run beep palantiri parcel <id>):",
        "- account-headroom: account headroom unavailable: not wired in this test (unknown (unreachable): not wired in this test)",
        expect.stringMatching(/^- lane-reds: .+ \(fresh as of 2026-10-15T12:00:00\.000Z\)$/),
        expect.stringMatching(/^- host-pressure: .+ \(fresh as of 2026-10-15T12:00:00\.000Z\)$/),
      ]);
    })
  );

  it.effect("prints Unknown for a parcel that overruns the bound", () =>
    Effect.gen(function* () {
      yield* atNoon;
      const fiber = yield* hangingSources.pipe(runtimeOver, hotParcels(HOT_PARCELS_TIMEOUT), Effect.forkChild);
      yield* TestClock.adjust("3 seconds");
      const lines = renderHotBlock(yield* Fiber.join(fiber));
      expect(lines).toHaveLength(4);
      expect(lines[2]).toBe("- lane-reds: Unknown (timed out after 2s)");
      expect(lines[3]).toMatch(/^- host-pressure: .+ \(fresh as of /);
    })
  );

  it.effect("prints one Unknown line when the block as a whole overruns or fails", () =>
    Effect.gen(function* () {
      const stuck = Layer.effect(PalantiriClient, Effect.never);
      const fiber = yield* stuck.pipe(hotParcels(HOT_PARCELS_TIMEOUT), Effect.forkChild);
      yield* TestClock.adjust("3 seconds");
      expect(renderHotBlock(yield* Fiber.join(fiber))).toEqual([
        "[palantiri] hot parcels: Unknown (timed out after 2s)",
      ]);
      const broken = Layer.effect(PalantiriClient, Effect.die("no client"));
      expect(renderHotBlock(yield* hotParcels(broken, HOT_PARCELS_TIMEOUT))).toEqual([
        "[palantiri] hot parcels: Unknown (read failed)",
      ]);
    })
  );

  it.layer(memoryFiles, { timeout: "30 seconds" })("on a memory filesystem", (it) => {
    it.effect("stages the hot file owner-only, and only after a finished read", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const root = "/state/palantiri";
        const file = path.join(root, HOT_PARCELS_FILE);
        yield* atNoon;
        const broken = Layer.effect(PalantiriClient, Effect.die("no client"));
        expect(yield* broken.pipe(printHotParcels(HOT_PARCELS_TIMEOUT), captureOutput)).toBe(
          "[palantiri] hot parcels: Unknown (read failed)"
        );
        expect(yield* fs.exists(file)).toBe(false);
        const printed = yield* workingSources.pipe(runtimeOver, printHotParcels(HOT_PARCELS_TIMEOUT), captureOutput);
        expect(A.length(Str.split("\n")(printed))).toBe(4);
        expect(((yield* fs.stat(file)).mode & 0o777).toString(8)).toBe("600");
        expect(((yield* fs.stat(root)).mode & 0o777).toString(8)).toBe("700");
        const staged = yield* S.decodeEffect(HotParcelsJson)(yield* fs.readFileString(file));
        expect(A.map(staged.lines, (line) => line.parcel)).toEqual(["account-headroom", "lane-reds", "host-pressure"]);
        expect(DateTime.formatIso(staged.writtenAt)).toBe("2026-10-15T12:00:00.000Z");
        // A parcel that times out keeps its last read line, which carries its own freshness time.
        const laneReds = A.findFirst(staged.lines, (line) => line.parcel === "lane-reds");
        yield* stageHotParcels(
          A.map(staged.lines, (line) =>
            line.parcel === "lane-reds"
              ? HotParcelLine.make({ parcel: "lane-reds", state: "timed-out", text: "Unknown (timed out after 2s)" })
              : line
          )
        );
        const restaged = yield* S.decodeEffect(HotParcelsJson)(yield* fs.readFileString(file));
        expect(A.findFirst(restaged.lines, (line) => line.parcel === "lane-reds")).toEqual(laneReds);
        // The rewrite leaves no temporary file behind.
        expect(yield* fs.readDirectory(root)).toEqual([HOT_PARCELS_FILE]);
      }).pipe(withEnv({ BEEP_PALANTIRI_STATE_ROOT: "/state/palantiri", HOME: "/home/nobody" }))
    );
  });
});
