import {
  compileGraduationPlan,
  exploreCommand,
  GraduationReceipt,
  GraduationRequest,
  parseGraduationGoal,
  readExplorationSnapshot,
  writeGraduationPlan,
} from "@beep/repo-cli/test/Explore";
import {
  foldPacketEvents,
  PacketEvent,
  PacketEventStore,
  PacketEventStoreLive,
  PacketStreamLocator,
} from "@beep/repo-cli/test/Goals";
import { it } from "@beep/test-runner";
import { NodeServices } from "@effect/platform-node";
import { describe, expect } from "@effect/vitest";
import { assertTrue, strictEqual } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import { Command } from "effect/cli";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as TestConsole from "effect/testing/TestConsole";
import {
  expectReportedExit,
  readProjectFile,
  temporaryWorkingDirectory,
  writeProjectFile,
} from "./support/CommandTest.ts";

const EXPLORATION = "graduation-fixture";
const PROVENANCE = `explorations/${EXPLORATION}`;
const MANIFEST_PATH = `${PROVENANCE}/ops/manifest.json`;
const TODAY = "2026-10-14";
const AT = "2026-10-14T12:00:00.000Z";

const decodeReceiptJson = S.decodeUnknownEffect(S.fromJsonString(GraduationReceipt));
const decodeManifestJson = S.decodeUnknownEffect(
  S.fromJsonString(
    S.Struct({
      extension: S.String,
      exploration: S.Struct({
        status: S.String,
        stage: S.String,
        updated: S.String,
        links: S.Struct({ goals: S.Array(S.String) }),
      }),
    })
  )
);
const runExploreCommand = Command.runWith(exploreCommand, { version: "0.0.0" });
const layer = Layer.provideMerge(PacketEventStoreLive, NodeServices.layer);

const manifestText = `${JSON.stringify(
  {
    schemaVersion: "exploration-manifest/v1",
    extension: "kept",
    exploration: {
      slug: EXPLORATION,
      title: "Graduation Fixture",
      status: "active",
      stage: "decompose",
      openQuestions: [],
      links: { goals: ["goals/earlier-child"], docs: [], supersededBy: null },
      created: "2026-10-01",
      updated: "2026-10-01",
    },
  },
  null,
  2
)}\n`;

const seedFixture = Effect.gen(function* () {
  yield* writeProjectFile(MANIFEST_PATH, manifestText);
  yield* writeProjectFile("goals/.keep", "");
});

const lastLogLine = Effect.gen(function* () {
  return O.getOrElse(A.last(A.filter(yield* TestConsole.logLines, P.isString)), () => "");
});

const planFor = Effect.fn(function* (goals: ReadonlyArray<string>) {
  const children = yield* Effect.forEach(goals, parseGraduationGoal);
  const snapshot = yield* readExplorationSnapshot(EXPLORATION);
  return yield* compileGraduationPlan(snapshot, GraduationRequest.make({ children, today: TODAY }));
});

const graduateArgs = (goals: ReadonlyArray<string>, mode: ReadonlyArray<string>) => [
  "graduate",
  EXPLORATION,
  ...A.flatMap(goals, (goal) => ["--goal", goal]),
  "--today",
  TODAY,
  ...mode,
];

const exists = Effect.fn(function* (relativePath: string) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.exists(relativePath);
});

it.layer(layer, { concurrent: false, timeout: "60 seconds" })((it) => {
  describe("explore graduate --write", { concurrent: false }, () => {
    it.effect(
      "publishes the child, then flips the manifest, and prints the receipt",
      () =>
        Effect.andThen(
          temporaryWorkingDirectory,
          Effect.gen(function* () {
            yield* seedFixture;
            const goals = ["first-child=First Child"];
            const plan = yield* planFor(goals);

            const unexpected = yield* Effect.exit(runExploreCommand(graduateArgs(goals, ["--write"])));
            expectReportedExit(unexpected);
            const wrong = yield* Effect.exit(
              runExploreCommand(graduateArgs(goals, ["--write", "--expect", `graduation-plan/v1:${"0".repeat(64)}`]))
            );
            expectReportedExit(wrong);
            strictEqual(yield* exists("goals/first-child"), false);

            const written = yield* Effect.exit(
              runExploreCommand(graduateArgs(goals, ["--write", "--expect", plan.planId]))
            );
            written.pipe(Exit.isSuccess, assertTrue);
            const receipt = yield* decodeReceiptJson(yield* lastLogLine);
            strictEqual(receipt.planId, plan.planId);
            expect(A.map(receipt.children, (row) => [row.slug, row.outcome])).toEqual([["first-child", "published"]]);
            strictEqual(receipt.manifestBeforeDigest, plan.explorationEdit?.preImageDigest);
            strictEqual(receipt.eventsAppended, 0);

            expect(yield* readProjectFile("goals/first-child/ops/manifest.json")).toContain(PROVENANCE);
            const manifest = yield* decodeManifestJson(yield* readProjectFile(MANIFEST_PATH));
            expect(manifest).toMatchObject({
              extension: "kept",
              exploration: {
                status: "graduated",
                stage: "graduate",
                updated: TODAY,
                links: { goals: ["goals/earlier-child", "goals/first-child"] },
              },
            });
            strictEqual(yield* exists(`${PROVENANCE}/ops/events`), false);
            strictEqual(
              yield* exists(`${MANIFEST_PATH}.staging-${Str.slice(0, 16)(receipt.manifestBeforeDigest)}`),
              false
            );

            const again = yield* Effect.exit(
              runExploreCommand(graduateArgs(goals, ["--write", "--expect", plan.planId]))
            );
            expectReportedExit(again);
          })
        ).pipe(Effect.provideServiceEffect(Console.Console, TestConsole.make)),
      30_000
    );

    it.effect(
      "resumes after a crash between children and keeps a foreign same-slug packet a hard conflict",
      () =>
        Effect.andThen(
          temporaryWorkingDirectory,
          Effect.gen(function* () {
            yield* seedFixture;
            const goals = ["first-child=First Child", "second-child=Second Child"];
            const plan = yield* planFor(goals);

            // A packet that appears after review blocks the second publish, so the
            // write fails after the first child landed: the crash state E15 covers.
            yield* writeProjectFile("goals/second-child/stray.txt", "blocker\n");
            const crashed = yield* Effect.exit(writeGraduationPlan(plan, O.some(plan.planId), AT));
            crashed.pipe(Exit.isFailure, assertTrue);
            strictEqual(yield* exists("goals/first-child/ops/manifest.json"), true);
            strictEqual(yield* readProjectFile(MANIFEST_PATH), manifestText);

            // The blocker is a foreign packet (no provenance): the replay refuses.
            const foreign = yield* planFor(goals);
            expect(A.map(foreign.conflicts, (conflict) => [conflict.reason, conflict.child])).toEqual([
              ["foreign-slug", "second-child"],
            ]);
            const refused = yield* Effect.exit(writeGraduationPlan(foreign, O.some(foreign.planId), AT));
            refused.pipe(Exit.isFailure, assertTrue);
            strictEqual(yield* readProjectFile(MANIFEST_PATH), manifestText);

            const fs = yield* FileSystem.FileSystem;
            yield* fs.remove("goals/second-child", { recursive: true });
            const resumed = yield* planFor(goals);
            expect(A.map(resumed.alreadyPublished, (child) => child.slug)).toEqual(["first-child"]);
            expect(A.map(resumed.children, (child) => child.slug)).toEqual(["second-child"]);

            const written = yield* Effect.exit(
              runExploreCommand(graduateArgs(goals, ["--write", "--expect", resumed.planId]))
            );
            written.pipe(Exit.isSuccess, assertTrue);
            const receipt = yield* decodeReceiptJson(yield* lastLogLine);
            expect(A.map(receipt.children, (row) => [row.slug, row.outcome])).toEqual([
              ["first-child", "already-published"],
              ["second-child", "published"],
            ]);
            const manifest = yield* decodeManifestJson(yield* readProjectFile(MANIFEST_PATH));
            expect(manifest.exploration.links.goals).toEqual([
              "goals/earlier-child",
              "goals/first-child",
              "goals/second-child",
            ]);
          })
        ).pipe(Effect.provideServiceEffect(Console.Console, TestConsole.make)),
      30_000
    );

    it.effect(
      "appends stage-entered and status-set to an opted-in exploration stream",
      () =>
        Effect.andThen(
          temporaryWorkingDirectory,
          Effect.gen(function* () {
            yield* seedFixture;
            const fs = yield* FileSystem.FileSystem;
            yield* fs.makeDirectory(`${PROVENANCE}/ops/events`, { recursive: true });
            const store = yield* PacketEventStore;
            const locator = PacketStreamLocator.make({
              packet: EXPLORATION,
              root: "explorations",
              packetPath: PROVENANCE,
            });
            yield* store.append(
              locator,
              PacketEvent.make({
                schemaVersion: "packet-event/v1",
                packet: EXPLORATION,
                root: "explorations",
                seq: 1,
                expectedRevision: 0,
                at: "2026-10-01T00:00:00.000Z",
                actor: "fixture",
                body: { type: "packet-created", status: "active", stage: "decompose", ordinal: 5 },
              })
            );

            const plan = yield* planFor(["first-child=First Child"]);
            const receipt = yield* writeGraduationPlan(plan, O.some(plan.planId), AT);
            strictEqual(receipt.eventsAppended, 2);

            const listing = yield* store.list(locator);
            expect(A.map(listing.events, (stored) => stored.event.body.type)).toEqual([
              "packet-created",
              "stage-entered",
              "status-set",
            ]);
            const derived = foldPacketEvents({ packet: EXPLORATION, root: "explorations", events: listing.events });
            strictEqual(derived.status, "graduated");
            strictEqual(derived.resumeStage, "graduate");
            strictEqual(derived.furthestOrdinal, 6);
            expect(yield* readProjectFile(`${PROVENANCE}/ops/trace.json`)).toContain(
              O.getOrElse(
                O.map(O.fromUndefinedOr(derived.tip), (tip) => tip.id),
                () => "missing-tip"
              )
            );
          })
        ).pipe(Effect.provideServiceEffect(Console.Console, TestConsole.make)),
      30_000
    );
  });
});
